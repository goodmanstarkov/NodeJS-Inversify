import { injectable } from 'inversify'
import { Logger, ILogObj } from 'tslog'

import { ILogger } from './logger.interface'

/**
 * Сервис логирования на базе tslog.
 * Реализует интерфейс ILogger, предоставляя методы
 * для логирования информационных сообщений, предупреждений и ошибок.
 */
@injectable()
export class LoggerService implements ILogger {
	/** Экземпляр логгера tslog */
	public logger: Logger<ILogObj>

	/** Создаёт экземпляр сервиса логирования и инициализирует логгер tslog. */
	constructor() {
		this.logger = new Logger()
	}

	/**
	 * Логирует информационное сообщение.
	 * @param args - Аргументы для логирования
	 */
	public log(...args: unknown[]): void {
		this.logger.info(...args)
	}

	/**
	 * Логирует предупреждение.
	 * @param args - Аргументы для логирования
	 */
	public warn(...args: unknown[]): void {
		this.logger.warn(...args)
	}

	/**
	 * Логирует сообщение об ошибке.
	 * @param args - Аргументы для логирования
	 */
	public error(...args: unknown[]): void {
		this.logger.error(...args)
	}
}
