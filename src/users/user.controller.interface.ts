import { NextFunction, Request, Response } from 'express'

import { IBaseController } from '../common/base.controller.interface'

/**
 * Интерфейс контроллера пользователей.
 * Определяет контракт для обработки HTTP-запросов, связанных с пользователями.
 */
export interface IUserController extends IBaseController {
	/**
	 * Обрабатывает запрос на аутентификацию пользователя.
	 * @param req - Объект HTTP-запроса с данными для входа
	 * @param res - Объект HTTP-ответа
	 * @param next - Функция передачи управления следующему обработчику
	 */
	login: (req: Request, res: Response, next: NextFunction) => void

	/**
	 * Обрабатывает запрос на регистрацию нового пользователя.
	 * @param req - Объект HTTP-запроса с данными для регистрации
	 * @param res - Объект HTTP-ответа
	 * @param next - Функция передачи управления следующему обработчику
	 */
	register: (req: Request, res: Response, next: NextFunction) => void

	/**
	 * Обрабатывает запрос на получение информации о текущем пользователе.
	 * @param req - Объект HTTP-запроса (должен содержать авторизованного пользователя)
	 * @param res - Объект HTTP-ответа
	 * @param next - Функция передачи управления следующему обработчику
	 */
	info: (req: Request, res: Response, next: NextFunction) => void

	/**
	 * Обрабатывает запрос на обновление пары JWT-токенов.
	 * @param req - Объект HTTP-запроса с refresh-токеном в cookie
	 * @param res - Объект HTTP-ответа
	 * @param next - Функция передачи управления следующему обработчику
	 */
	refresh: (req: Request, res: Response, next: NextFunction) => void

	/**
	 * Обрабатывает запрос на выход из системы.
	 * @param req - Объект HTTP-запроса
	 * @param res - Объект HTTP-ответа
	 * @param next - Функция передачи управления следующему обработчику
	 */
	logout: (req: Request, res: Response, next: NextFunction) => void
}
