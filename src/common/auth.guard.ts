import { Request, Response, NextFunction } from 'express'

import { HttpError } from '../errors/http-error.class'

import { IMiddleware } from './middleware.interface'

/**
 * Middleware-гард авторизации.
 * Проверяет наличие аутентифицированного пользователя в запросе
 * и блокирует доступ неавторизованным пользователям.
 */
export class AuthGuard implements IMiddleware {
	/**
	 * Проверяет, аутентифицирован ли пользователь.
	 * Если пользователь отсутствует в запросе, передаёт ошибку 401.
	 * @param req - Объект входящего HTTP-запроса
	 * @param _res - Объект HTTP-ответа (не используется)
	 * @param next - Функция передачи управления следующему обработчику
	 */
	execute(req: Request, _res: Response, next: NextFunction): void {
		if (!req.user) {
			return next(new HttpError(401, 'Не авторизован', 'AuthGuard'))
		}

		next()
	}
}
