/**
 * Символьные идентификаторы для IoC-контейнера Inversify.
 * Используются для привязки интерфейсов к реализациям при внедрении зависимостей.
 */
export const TYPES = {
	/** Идентификатор главного класса приложения */
	Application: Symbol.for('Application'),
	/** Идентификатор сервиса логирования */
	ILogger: Symbol.for('ILogger'),
	/** Идентификатор контроллера пользователей */
	IUserController: Symbol.for('IUserController'),
	/** Идентификатор сервиса пользователей */
	IUserService: Symbol.for('IUserService'),
	/** Идентификатор репозитория пользователей */
	IUserRepository: Symbol.for('IUserRepository'),
	/** Идентификатор фильтра исключений */
	IExceptionFilter: Symbol.for('IExceptionFilter'),
	/** Идентификатор сервиса конфигурации */
	IConfigService: Symbol.for('IConfigService'),
	/** Идентификатор сервиса Prisma ORM */
	IPrismaService: Symbol.for('IPrismaService'),
	/** Идентификатор сервиса JWT-токенов */
	IJwtService: Symbol.for('IJwtService'),
}
