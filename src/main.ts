import { Container, ContainerModule } from 'inversify'

import { App } from './app'
import { ConfigService } from './config/config.service'
import { IConfigService } from './config/config.service.interface'
import { PrismaService } from './database/prisma.service'
import { IPrismaService } from './database/prisma.service.interface'
import { ExceptionFilter } from './errors/exception.filter'
import { IExceptionFilter } from './errors/exception.filter.interface'
import { JwtService } from './jwt/jwt.service'
import { IJwtService } from './jwt/jwt.service.interface'
import { ILogger } from './logger/logger.interface'
import { LoggerService } from './logger/logger.service'
import { TYPES } from './types'
import { UserController } from './users/user.controller'
import { IUserController } from './users/user.controller.interface'
import { UserRepository } from './users/user.repository'
import { IUserRepository } from './users/user.repository.interface'
import { UserService } from './users/user.service'
import { IUserService } from './users/user.service.interface'

/**
 * Интерфейс возвращаемого значения функции bootstrap.
 */
interface IBootstrapReturn {
	/** Экземпляр главного приложения */
	app: App
	/** IoC-контейнер с зарегистрированными зависимостями */
	appContainer: Container
}

/**
 * Модуль привязок зависимостей для IoC-контейнера Inversify.
 * Связывает интерфейсы с их конкретными реализациями.
 */
export const appBindings = new ContainerModule(({ bind }) => {
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope()
	bind<IExceptionFilter>(TYPES.IExceptionFilter).to(ExceptionFilter)
	bind<IUserController>(TYPES.IUserController).to(UserController)
	bind<IUserService>(TYPES.IUserService).to(UserService)
	bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope()
	bind<IConfigService>(TYPES.IConfigService).to(ConfigService).inSingletonScope()
	bind<IJwtService>(TYPES.IJwtService).to(JwtService).inSingletonScope()
	bind<IPrismaService>(TYPES.IPrismaService).to(PrismaService)
	bind<App>(TYPES.Application).to(App)
})

/**
 * Точка входа в приложение.
 * Создаёт IoC-контейнер, загружает привязки зависимостей,
 * инициализирует приложение на указанном порту и запускает сервер.
 * @returns Экземпляр приложения и IoC-контейнер
 */
const bootstrap = (): IBootstrapReturn => {
	const appContainer = new Container()
	appContainer.load(appBindings)

	const app = appContainer.get<App>(TYPES.Application)

	app.port = 8000
	app.init()

	return { app, appContainer }
}

/** Экземпляр приложения, полученный при запуске */
/** IoC-контейнер с зарегистрированными зависимостями */
export const { app, appContainer } = bootstrap()
