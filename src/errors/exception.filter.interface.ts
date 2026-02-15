import { Request, Response, NextFunction } from 'express'

/**
 * Интерфейс глобального фильтра исключений.
 * Определяет контракт для перехвата и обработки ошибок в приложении.
 */
export interface IExceptionFilter {
	/**
	 * Перехватывает и обрабатывает ошибки, возникшие при обработке запросов.
	 * @param err - Объект ошибки
	 * @param req - Объект входящего HTTP-запроса
	 * @param res - Объект HTTP-ответа
	 * @param next - Функция передачи управления следующему обработчику
	 */
	catch(err: Error, req: Request, res: Response, next: NextFunction): void
}
