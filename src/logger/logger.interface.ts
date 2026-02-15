import { ILogObj, Logger } from 'tslog'

/**
 * Интерфейс сервиса логирования.
 * Определяет контракт для логирования сообщений различного уровня.
 */
export interface ILogger {
	/** Экземпляр логгера tslog */
	logger: Logger<ILogObj>

	/**
	 * Логирует информационное сообщение.
	 * @param args - Аргументы для логирования
	 */
	log: (...args: unknown[]) => void

	/**
	 * Логирует предупреждение.
	 * @param args - Аргументы для логирования
	 */
	warn: (...args: unknown[]) => void

	/**
	 * Логирует сообщение об ошибке.
	 * @param args - Аргументы для логирования
	 */
	error: (...args: unknown[]) => void
}
