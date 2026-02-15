import { PrismaClient } from '@prisma/client'

/**
 * Интерфейс сервиса Prisma ORM.
 * Определяет контракт для управления подключением к базе данных.
 */
export interface IPrismaService {
	/** Экземпляр клиента Prisma для выполнения запросов к базе данных */
	client: PrismaClient

	/**
	 * Устанавливает соединение с базой данных.
	 * @returns Promise, разрешающийся после успешного подключения
	 */
	connect: () => Promise<void>

	/**
	 * Закрывает соединение с базой данных.
	 * @returns Promise, разрешающийся после отключения
	 */
	disconnect: () => Promise<void>
}
