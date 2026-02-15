import { Request, Response, NextFunction } from 'express'

/**
 * Интерфейс middleware.
 * Определяет контракт для всех middleware в приложении.
 */
export interface IMiddleware {
	/**
	 * Выполняет логику middleware.
	 * @param req - Объект входящего HTTP-запроса
	 * @param res - Объект HTTP-ответа
	 * @param next - Функция передачи управления следующему обработчику
	 */
	execute: (req: Request, res: Response, next: NextFunction) => void
}
