import { Request, Response, NextFunction } from 'express'

import { IJwtService } from '../jwt/jwt.service.interface'

import { IMiddleware } from './middleware.interface'

/**
 * Middleware аутентификации по JWT-токену.
 * Извлекает Bearer-токен из заголовка Authorization, верифицирует его
 * и записывает email пользователя в объект запроса.
 */
export class AuthMiddleware implements IMiddleware {
	/**
	 * Создаёт экземпляр middleware аутентификации.
	 * @param jwtService - Сервис для работы с JWT-токенами
	 */
	constructor(private readonly jwtService: IJwtService) {}

	/**
	 * Извлекает и верифицирует access-токен из заголовка Authorization.
	 * При успешной верификации записывает email пользователя в req.user.
	 * При отсутствии токена или ошибке верификации просто передаёт управление далее.
	 * @param req - Объект входящего HTTP-запроса
	 * @param _res - Объект HTTP-ответа (не используется)
	 * @param next - Функция передачи управления следующему обработчику
	 */
	execute(req: Request, _res: Response, next: NextFunction): void {
		const authHeader = req.headers.authorization

		if (!authHeader?.startsWith('Bearer ')) {
			return next()
		}

		const token = authHeader.split(' ')[1]

		this.jwtService
			.verifyAccessToken(token)
			.then((payload) => {
				req.user = payload.email
				next()
			})
			.catch(() => {
				next()
			})
	}
}
