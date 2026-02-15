import { NextFunction, Request, Response, Router } from 'express'

import { IMiddleware } from './middleware.interface'

/**
 * Интерфейс описания маршрута контроллера.
 * Определяет структуру маршрута, включая путь, HTTP-метод,
 * обработчик и опциональные middleware.
 */
export interface IControllerRoute {
	/** Путь маршрута (например, '/login') */
	path: string
	/** Функция-обработчик запроса */
	handler: (req: Request, res: Response, next: NextFunction) => void
	/** HTTP-метод маршрута (get, post, put, delete, patch) */
	method: keyof Pick<Router, 'get' | 'post' | 'put' | 'delete' | 'patch'>
	/** Массив middleware, выполняемых перед обработчиком */
	middlewares?: IMiddleware[]
}
