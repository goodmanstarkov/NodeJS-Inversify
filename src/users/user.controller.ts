import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import { AuthGuard } from '../common/auth.guard'
import { BaseController } from '../common/base.controller'
import { ValidateMiddleware } from '../common/validate.middleware'
import { IConfigService } from '../config/config.service.interface'
import { HttpError } from '../errors/http-error.class'
import { IJwtService } from '../jwt/jwt.service.interface'
import { ILogger } from '../logger/logger.interface'
import { IRedisService } from '../redis/redis.service.interface'
import { TYPES } from '../types'

import { UserLoginDTO } from './dto/user-login.dto'
import { UserRegisterDTO } from './dto/user-register.dto'
import { IUserController } from './user.controller.interface'
import { IUserService } from './user.service.interface'

/**
 * Контроллер пользователей.
 * Обрабатывает HTTP-запросы для аутентификации, регистрации,
 * обновления токенов, выхода из системы и получения информации о пользователе.
 */
@injectable()
export class UserController extends BaseController implements IUserController {
	/**
	 * Создаёт экземпляр контроллера пользователей и регистрирует маршруты.
	 * @param configService - Сервис конфигурации
	 * @param loggerService - Сервис логирования
	 * @param userService - Сервис бизнес-логики пользователей
	 * @param jwtService - Сервис JWT-токенов
	 */
	constructor(
		@inject(TYPES.IConfigService) private readonly configService: IConfigService,
		@inject(TYPES.ILogger) loggerService: ILogger,
		@inject(TYPES.IUserService) private readonly userService: IUserService,
		@inject(TYPES.IJwtService) private readonly jwtService: IJwtService,
		@inject(TYPES.IRedisService) private readonly redisService: IRedisService,
	) {
		super(loggerService)

		this.bindRoutes([
			{
				path: '/login',
				method: 'post',
				handler: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDTO)],
			},
			{
				path: '/register',
				method: 'post',
				handler: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDTO)],
			},
			{
				path: '/refresh',
				method: 'post',
				handler: this.refresh,
			},
			{
				path: '/logout',
				method: 'post',
				handler: this.logout,
			},
			{
				path: '/info',
				method: 'get',
				handler: this.info,
				middlewares: [new AuthGuard()],
			},
		])
	}

	/** Возвращает имя cookie для хранения refresh-токена из конфигурации */
	private get jwtRefreshTokenCookieName(): string {
		return this.configService.get('JWT_REFRESH_TOKEN_COOKIE_NAME')
	}

	/** Возвращает максимальное время жизни cookie refresh-токена в миллисекундах */
	private get jwtRefreshTokenMaxAge(): number {
		const days = parseInt(this.configService.get('JWT_REFRESH_EXPIRES_IN'), 10)

		return days * 24 * 60 * 60 * 1000 // 7 дней в миллисекундах.
	}

	/** Возвращает TTL refresh-токена в секундах для хранения в Redis */
	private get refreshTokenTtlSeconds(): number {
		const days = parseInt(this.configService.get('JWT_REFRESH_EXPIRES_IN'), 10)

		return days * 24 * 60 * 60
	}

	/** Формирует Redis-ключ для хранения refresh-токена */
	private refreshTokenKey(token: string): string {
		return `refresh:${token}`
	}

	/**
	 * Обрабатывает вход пользователя в систему.
	 * Валидирует учётные данные и при успехе возвращает access-токен
	 * и устанавливает refresh-токен в httpOnly cookie.
	 * @param req - HTTP-запрос с данными для входа (email, password)
	 * @param res - HTTP-ответ
	 * @param next - Функция передачи управления следующему обработчику
	 */
	public async login(
		req: Request<unknown, unknown, UserLoginDTO>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.validateUser(req.body)

		if (!result) {
			return next(new HttpError(401, 'Неверный email или пароль', 'users/login'))
		}

		await this.redisService.set(
			this.refreshTokenKey(result.refreshToken),
			result.refreshToken,
			this.refreshTokenTtlSeconds,
		)

		this.setRefreshTokenCookie(res, result.refreshToken)
		this.ok(res, { accessToken: result.accessToken })
	}

	/**
	 * Обрабатывает регистрацию нового пользователя.
	 * Создаёт пользователя и при успехе возвращает данные пользователя,
	 * access-токен и устанавливает refresh-токен в httpOnly cookie.
	 * @param req - HTTP-запрос с данными регистрации (email, password, name)
	 * @param res - HTTP-ответ
	 * @param next - Функция передачи управления следующему обработчику
	 */
	public async register(
		{ body }: Request<unknown, unknown, UserRegisterDTO>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.createUser(body)

		if (!result) {
			return next(new HttpError(422, 'Такой пользователь уже существует', 'users/register'))
		}

		await this.redisService.set(
			this.refreshTokenKey(result.tokens.refreshToken),
			result.tokens.refreshToken,
			this.refreshTokenTtlSeconds,
		)

		this.setRefreshTokenCookie(res, result.tokens.refreshToken)
		this.created(res, { user: result.user, accessToken: result.tokens.accessToken })
	}

	/**
	 * Возвращает информацию о текущем аутентифицированном пользователе.
	 * Требует прохождения AuthGuard middleware.
	 * @param req - HTTP-запрос (содержит email пользователя в req.user)
	 * @param res - HTTP-ответ
	 * @param next - Функция передачи управления следующему обработчику
	 */
	public async info(req: Request, res: Response, next: NextFunction): Promise<void> {
		const user = await this.userService.getUserInfo(req.user!)

		if (!user) {
			return next(new HttpError(404, 'Пользователь не найден', 'users/info'))
		}

		this.ok(res, user)
	}

	/**
	 * Обновляет пару JWT-токенов по refresh-токену из cookie.
	 * При успешной верификации генерирует новую пару токенов.
	 * При невалидном токене очищает cookie и возвращает ошибку 401.
	 * @param req - HTTP-запрос с refresh-токеном в cookie
	 * @param res - HTTP-ответ
	 * @param next - Функция передачи управления следующему обработчику
	 */
	public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
		const refreshToken = req.cookies[this.jwtRefreshTokenCookieName] as string | undefined

		if (!refreshToken) {
			return next(new HttpError(401, 'Refresh токен не предоставлен', 'users/refresh'))
		}

		const isWhitelisted = await this.redisService.exists(this.refreshTokenKey(refreshToken))

		if (!isWhitelisted) {
			this.clearRefreshTokenCookie(res)
			return next(new HttpError(401, 'Refresh токен отозван', 'users/refresh'))
		}

		try {
			const payload = await this.jwtService.verifyRefreshToken(refreshToken)

			await this.redisService.del(this.refreshTokenKey(refreshToken))

			const tokens = await this.jwtService.generateTokenPair({ email: payload.email })

			await this.redisService.set(
				this.refreshTokenKey(tokens.refreshToken),
				tokens.refreshToken,
				this.refreshTokenTtlSeconds,
			)

			this.setRefreshTokenCookie(res, tokens.refreshToken)
			this.ok(res, { accessToken: tokens.accessToken })
		} catch {
			this.clearRefreshTokenCookie(res)
			return next(new HttpError(401, 'Невалидный refresh токен', 'users/refresh'))
		}
	}

	/**
	 * Обрабатывает выход пользователя из системы.
	 * Очищает cookie с refresh-токеном.
	 * @param _req - HTTP-запрос (не используется)
	 * @param res - HTTP-ответ
	 * @param _next - Функция next (не используется)
	 */
	public async logout(req: Request, res: Response, _next: NextFunction): Promise<void> {
		const refreshToken = req.cookies[this.jwtRefreshTokenCookieName] as string | undefined

		if (refreshToken) {
			await this.redisService.del(this.refreshTokenKey(refreshToken))
		}

		this.clearRefreshTokenCookie(res)
		this.ok(res, { message: 'Вы вышли из системы' })
	}

	/**
	 * Устанавливает httpOnly cookie с refresh-токеном.
	 * Cookie ограничен путём /api/users и настроен для безопасной передачи.
	 * @param res - HTTP-ответ
	 * @param token - Refresh-токен для сохранения в cookie
	 */
	private setRefreshTokenCookie(res: Response, token: string): void {
		res.cookie(this.jwtRefreshTokenCookieName, token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: this.jwtRefreshTokenMaxAge,
			path: '/api/users',
		})
	}

	/**
	 * Очищает cookie с refresh-токеном.
	 * @param res - HTTP-ответ
	 */
	private clearRefreshTokenCookie(res: Response): void {
		res.clearCookie(this.jwtRefreshTokenCookieName, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			path: '/api/users',
		})
	}
}
