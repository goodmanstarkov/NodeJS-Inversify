import { Server } from 'node:http'

import cookieParser from 'cookie-parser'
import express, { Express, json } from 'express'
import { inject, injectable } from 'inversify'

import { AuthMiddleware } from './common/auth.middleware'
import { IPrismaService } from './database/prisma.service.interface'
import { IExceptionFilter } from './errors/exception.filter.interface'
import { IJwtService } from './jwt/jwt.service.interface'
import { ILogger } from './logger/logger.interface'
import { TYPES } from './types'
import { IUserController } from './users/user.controller.interface'

/**
 * Главный класс приложения.
 * Отвечает за инициализацию Express-сервера, подключение middleware,
 * маршрутов, фильтров исключений и управление жизненным циклом приложения.
 */
@injectable()
export class App {
	/** Экземпляр Express-приложения */
	private app: Express
	/** HTTP-сервер */
	private server: Server
	/** Порт, на котором запускается сервер */
	public port: number

	/**
	 * Создаёт экземпляр приложения с внедрёнными зависимостями.
	 * @param logger - Сервис логирования
	 * @param userController - Контроллер пользователей
	 * @param exceptionFilter - Глобальный фильтр исключений
	 * @param prismaService - Сервис для работы с базой данных через Prisma
	 * @param jwtService - Сервис для работы с JWT-токенами
	 */
	constructor(
		@inject(TYPES.ILogger) private readonly logger: ILogger,
		@inject(TYPES.IUserController)
		private readonly userController: IUserController,
		@inject(TYPES.IExceptionFilter)
		private readonly exceptionFilter: IExceptionFilter,
		@inject(TYPES.IPrismaService)
		private readonly prismaService: IPrismaService,
		@inject(TYPES.IJwtService)
		private readonly jwtService: IJwtService,
	) {
		this.app = express()
	}

	/**
	 * Регистрирует глобальные middleware: парсинг JSON, cookie-parser
	 * и middleware аутентификации по JWT-токену.
	 */
	private useMiddleware(): void {
		this.app.use(json())
		this.app.use(cookieParser())

		const authMiddleware = new AuthMiddleware(this.jwtService)
		this.app.use(authMiddleware.execute.bind(authMiddleware))
	}

	/** Регистрирует маршруты приложения, включая health-check и маршруты пользователей. */
	private useRoutes(): void {
		this.app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }))
		this.app.use('/api/users', this.userController.router)
	}

	/** Подключает глобальный фильтр исключений для обработки ошибок. */
	private useExceptionFilter(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter))
	}

	/**
	 * Настраивает корректное завершение работы приложения.
	 * При получении сигналов SIGINT или SIGTERM закрывает HTTP-сервер
	 * и отключается от базы данных.
	 */
	private useGracefulShutdownDB(): void {
		const shutdown = async (): Promise<void> => {
			this.server.close()
			await this.prismaService.disconnect()
		}

		process.on('SIGINT', shutdown)
		process.on('SIGTERM', shutdown)
	}

	/**
	 * Инициализирует приложение: подключает middleware, маршруты,
	 * фильтр исключений, устанавливает соединение с БД и запускает HTTP-сервер.
	 */
	public async init(): Promise<void> {
		this.useMiddleware()
		this.useRoutes()
		this.useExceptionFilter()
		await this.prismaService.connect()
		this.useGracefulShutdownDB()
		this.server = this.app.listen(this.port)

		this.logger.log(`[App] Сервер запущен на http://localhost:${this.port}`)
	}
}
