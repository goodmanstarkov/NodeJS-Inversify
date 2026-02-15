import { NextFunction, Request, Response } from 'express'
import { inject, injectable } from 'inversify'

import { ILogger } from '../logger/logger.interface'

import { TYPES } from './../types'
import { IExceptionFilter } from './exception.filter.interface'
import { HttpError } from './http-error.class'

/**
 * Глобальный фильтр исключений.
 * Перехватывает все ошибки, возникающие при обработке запросов,
 * логирует их и отправляет клиенту соответствующий HTTP-ответ.
 */
@injectable()
export class ExceptionFilter implements IExceptionFilter {
	/**
	 * Создаёт экземпляр фильтра исключений.
	 * @param logger - Сервис логирования
	 */
	constructor(@inject(TYPES.ILogger) private readonly logger: ILogger) {}

	/**
	 * Обрабатывает перехваченную ошибку.
	 * Для HttpError возвращает ответ с соответствующим статус-кодом и контекстом.
	 * Для прочих ошибок возвращает ответ с HTTP-статусом 500.
	 * @param err - Объект ошибки (стандартная или HttpError)
	 * @param _ - Объект входящего HTTP-запроса (не используется)
	 * @param res - Объект HTTP-ответа
	 * @param __ - Функция next (не используется)
	 */
	catch(err: Error | HttpError, _: Request, res: Response, __: NextFunction): void {
		if (err instanceof HttpError) {
			this.logger.error(`[${err.context}] Ошибка: ${err.statusCode} - ${err.message}`)

			res.status(err.statusCode).json({ message: err.message })
		} else {
			this.logger.error(err.message)

			res.status(500).json({ message: err.message })
		}
	}
}
