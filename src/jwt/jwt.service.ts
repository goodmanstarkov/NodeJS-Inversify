import { inject, injectable } from 'inversify'
import { sign, SignOptions, verify } from 'jsonwebtoken'

import { IConfigService } from '../config/config.service.interface'
import { TYPES } from '../types'

import { IJwtPayload, IJwtService, ITokenPair } from './jwt.service.interface'

/**
 * Сервис для работы с JWT-токенами.
 * Реализует создание, верификацию access- и refresh-токенов
 * на основе секретов и сроков действия из конфигурации.
 */
@injectable()
export class JwtService implements IJwtService {
	/**
	 * Создаёт экземпляр сервиса JWT.
	 * @param configService - Сервис конфигурации для получения секретов и сроков действия токенов
	 */
	constructor(@inject(TYPES.IConfigService) private readonly configService: IConfigService) {}

	/**
	 * Подписывает access-токен с указанной полезной нагрузкой.
	 * @param payload - Полезная нагрузка токена
	 * @returns Подписанный access-токен
	 */
	public signAccessToken(payload: IJwtPayload): Promise<string> {
		return this.signToken(payload, this.accessSecret, this.accessExpiresIn)
	}

	/**
	 * Подписывает refresh-токен с указанной полезной нагрузкой.
	 * @param payload - Полезная нагрузка токена
	 * @returns Подписанный refresh-токен
	 */
	public signRefreshToken(payload: IJwtPayload): Promise<string> {
		return this.signToken(payload, this.refreshSecret, this.refreshExpiresIn)
	}

	/**
	 * Верифицирует access-токен и извлекает полезную нагрузку.
	 * @param token - Access-токен для верификации
	 * @returns Декодированная полезная нагрузка токена
	 */
	public verifyAccessToken(token: string): Promise<IJwtPayload> {
		return this.verifyToken(token, this.accessSecret)
	}

	/**
	 * Верифицирует refresh-токен и извлекает полезную нагрузку.
	 * @param token - Refresh-токен для верификации
	 * @returns Декодированная полезная нагрузка токена
	 */
	public verifyRefreshToken(token: string): Promise<IJwtPayload> {
		return this.verifyToken(token, this.refreshSecret)
	}

	/**
	 * Генерирует пару из access- и refresh-токенов параллельно.
	 * @param payload - Полезная нагрузка для токенов
	 * @returns Объект с access- и refresh-токенами
	 */
	public async generateTokenPair(payload: IJwtPayload): Promise<ITokenPair> {
		const [accessToken, refreshToken] = await Promise.all([
			this.signAccessToken(payload),
			this.signRefreshToken(payload),
		])

		return { accessToken, refreshToken }
	}

	/** Возвращает секрет для подписи access-токенов из конфигурации */
	private get accessSecret(): string {
		return this.configService.get('JWT_ACCESS_SECRET')
	}

	/** Возвращает секрет для подписи refresh-токенов из конфигурации */
	private get refreshSecret(): string {
		return this.configService.get('JWT_REFRESH_SECRET')
	}

	/** Возвращает срок действия access-токена из конфигурации */
	private get accessExpiresIn(): SignOptions['expiresIn'] {
		return this.configService.get('JWT_ACCESS_EXPIRES_IN') as SignOptions['expiresIn']
	}

	/** Возвращает срок действия refresh-токена из конфигурации */
	private get refreshExpiresIn(): SignOptions['expiresIn'] {
		return this.configService.get('JWT_REFRESH_EXPIRES_IN') as SignOptions['expiresIn']
	}

	/**
	 * Подписывает JWT-токен с указанными параметрами.
	 * @param payload - Полезная нагрузка токена
	 * @param secret - Секретный ключ для подписи
	 * @param expiresIn - Срок действия токена
	 * @returns Подписанный JWT-токен
	 */
	private signToken(
		payload: IJwtPayload,
		secret: string,
		expiresIn: SignOptions['expiresIn'],
	): Promise<string> {
		return new Promise((resolve, reject) => {
			sign({ email: payload.email }, secret, { expiresIn }, (err, token) => {
				if (err || !token) {
					reject(err ?? new Error('Не удалось создать токен'))
				} else {
					resolve(token)
				}
			})
		})
	}

	/**
	 * Верифицирует JWT-токен и извлекает полезную нагрузку.
	 * @param token - JWT-токен для верификации
	 * @param secret - Секретный ключ для верификации
	 * @returns Декодированная полезная нагрузка токена
	 */
	private verifyToken(token: string, secret: string): Promise<IJwtPayload> {
		return new Promise((resolve, reject) => {
			verify(token, secret, (err, decoded) => {
				if (err || !decoded) {
					reject(err ?? new Error('Невалидный токен'))
				} else {
					resolve(decoded as IJwtPayload)
				}
			})
		})
	}
}
