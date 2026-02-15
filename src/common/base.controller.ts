import { Router, Response } from 'express'

import { ILogger } from '../logger/logger.interface'

import { IBaseController } from './base.controller.interface'
import { IControllerRoute } from './route.interface'

/**
 * Абстрактный базовый контроллер.
 * Предоставляет общую функциональность для всех контроллеров:
 * управление роутером, отправку ответов и привязку маршрутов.
 */
export abstract class BaseController implements IBaseController {
	/** Внутренний экземпляр роутера Express */
	private readonly _router: Router

	/**
	 * Создаёт экземпляр базового контроллера.
	 * @param logger - Сервис логирования
	 */
	constructor(private readonly logger: ILogger) {
		this._router = Router()
	}

	/** Возвращает экземпляр роутера Express с зарегистрированными маршрутами */
	get router(): Router {
		return this._router
	}

	/**
	 * Отправляет JSON-ответ с указанным HTTP-статусом.
	 * @param res - Объект HTTP-ответа
	 * @param code - HTTP-статус код
	 * @param message - Тело ответа
	 * @returns Объект HTTP-ответа
	 */
	private send<T>(res: Response, code: number, message: T): Response {
		return res.status(code).json(message)
	}

	/**
	 * Отправляет JSON-ответ с HTTP-статусом 200 (OK).
	 * @param res - Объект HTTP-ответа
	 * @param message - Тело ответа
	 * @returns Объект HTTP-ответа
	 */
	public ok<T>(res: Response, message: T): Response {
		return this.send(res, 200, message)
	}

	/**
	 * Отправляет JSON-ответ с HTTP-статусом 201 (Created).
	 * @param res - Объект HTTP-ответа
	 * @param message - Тело ответа
	 * @returns Объект HTTP-ответа
	 */
	public created<T>(res: Response, message: T): Response {
		return this.send(res, 201, message)
	}

	/**
	 * Привязывает массив маршрутов к роутеру.
	 * Для каждого маршрута формирует pipeline из middleware и обработчика,
	 * регистрирует его в роутере и логирует монтирование маршрута.
	 * @param routes - Массив описаний маршрутов контроллера
	 */
	protected bindRoutes(routes: IControllerRoute[]): void {
		for (const route of routes) {
			const middlewares = route.middlewares?.map((middleware) =>
				middleware.execute.bind(middleware),
			)
			const routeHandler = route.handler.bind(this)
			const pipeline = middlewares ? [...middlewares, routeHandler] : routeHandler

			this.router[route.method](route.path, pipeline)

			this.logger.log(
				`[BaseController] Маршрут смонтирован: ${route.method.toUpperCase()} - ${route.path}`,
			)
		}
	}
}
