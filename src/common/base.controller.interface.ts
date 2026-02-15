import { Response, Router } from 'express'

/**
 * Интерфейс базового контроллера.
 * Определяет общий контракт для всех контроллеров приложения.
 */
export interface IBaseController {
	/** Экземпляр роутера Express, содержащий зарегистрированные маршруты */
	readonly router: Router

	/**
	 * Отправляет ответ с HTTP-статусом 200 (OK).
	 * @param res - Объект HTTP-ответа
	 * @param message - Тело ответа
	 * @returns Объект HTTP-ответа
	 */
	ok<T>(res: Response, message: T): Response

	/**
	 * Отправляет ответ с HTTP-статусом 201 (Created).
	 * @param res - Объект HTTP-ответа
	 * @param message - Тело ответа
	 * @returns Объект HTTP-ответа
	 */
	created<T>(res: Response, message: T): Response
}
