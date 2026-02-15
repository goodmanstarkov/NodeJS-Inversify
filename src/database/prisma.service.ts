import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { inject, injectable } from 'inversify'

import { IConfigService } from '../config/config.service.interface'
import { ILogger } from '../logger/logger.interface'
import { TYPES } from '../types'

import { IPrismaService } from './prisma.service.interface'

/**
 * Сервис для работы с базой данных через Prisma ORM.
 * Управляет жизненным циклом подключения к PostgreSQL,
 * формируя строку подключения из переменных окружения.
 */
@injectable()
export class PrismaService implements IPrismaService {
	/** Экземпляр клиента Prisma для выполнения запросов к базе данных */
	public readonly client: PrismaClient

	/**
	 * Создаёт экземпляр сервиса Prisma.
	 * Формирует строку подключения к PostgreSQL из конфигурации
	 * и инициализирует Prisma-клиент с адаптером PrismaPg.
	 * @param logger - Сервис логирования
	 * @param configService - Сервис конфигурации для получения параметров подключения к БД
	 */
	constructor(
		@inject(TYPES.ILogger) private readonly logger: ILogger,
		@inject(TYPES.IConfigService) private readonly configService: IConfigService,
	) {
		const POSTGRES_USER = this.configService.get('POSTGRES_USER')
		const POSTGRES_PASSWORD = this.configService.get('POSTGRES_PASSWORD')
		const POSTGRES_HOST = this.configService.get('POSTGRES_HOST')
		const POSTGRES_PORT = this.configService.get('POSTGRES_PORT')
		const POSTGRES_DB = this.configService.get('POSTGRES_DB')

		const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`

		this.client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
	}

	/**
	 * Устанавливает соединение с базой данных.
	 * В случае ошибки логирует сообщение без прерывания работы приложения.
	 */
	public async connect(): Promise<void> {
		try {
			await this.client.$connect()
			this.logger.log('[PrismaService] База данных подключена')
		} catch (e) {
			const mainErrorMessage = '[PrismaService] Ошибка при подключении к базе данных'

			if (e instanceof Error) {
				this.logger.error(`${mainErrorMessage}: ${e.message}`)
			} else {
				this.logger.error(`${mainErrorMessage}: ${e}`)
			}
		}
	}

	/**
	 * Закрывает соединение с базой данных.
	 * В случае ошибки логирует сообщение без прерывания работы приложения.
	 */
	public async disconnect(): Promise<void> {
		try {
			await this.client.$disconnect()
			this.logger.log('[PrismaService] База данных отключена')
		} catch (e) {
			const mainErrorMessage = '[PrismaService] Ошибка при отключении от базы данных'

			if (e instanceof Error) {
				this.logger.error(`${mainErrorMessage}: ${e.message}`)
			} else {
				this.logger.error(`${mainErrorMessage}: ${e}`)
			}
		}
	}
}
