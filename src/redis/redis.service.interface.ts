/**
 * Интерфейс сервиса Redis.
 * Определяет контракт для управления подключением к Redis
 * и выполнения базовых операций с ключами.
 */
export interface IRedisService {
	/**
	 * Устанавливает соединение с Redis.
	 * @returns Promise, разрешающийся после успешного подключения
	 */
	connect: () => Promise<void>

	/**
	 * Закрывает соединение с Redis.
	 * @returns Promise, разрешающийся после отключения
	 */
	disconnect: () => Promise<void>

	/**
	 * Получает значение по ключу.
	 * @param key - Ключ для поиска
	 * @returns Значение или null, если ключ не найден
	 */
	get: (key: string) => Promise<string | null>

	/**
	 * Устанавливает значение по ключу с опциональным TTL.
	 * @param key - Ключ
	 * @param value - Значение для сохранения
	 * @param ttlSeconds - Время жизни в секундах (опционально)
	 */
	set: (key: string, value: string, ttlSeconds?: number) => Promise<void>

	/**
	 * Удаляет ключ из хранилища.
	 * @param key - Ключ для удаления
	 */
	del: (key: string) => Promise<void>

	/**
	 * Проверяет существование ключа.
	 * @param key - Ключ для проверки
	 * @returns true, если ключ существует
	 */
	exists: (key: string) => Promise<boolean>
}
