import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv'
import { inject, injectable } from 'inversify'
import isUndefined from 'lodash/isUndefined'

import { ILogger } from '../logger/logger.interface'
import { TYPES } from '../types'

import { IConfigService } from './config.service.interface'

/**
 * Сервис конфигурации приложения.
 * Загружает переменные окружения из файла .env в режиме разработки
 * или использует переменные окружения Docker в продакшене.
 */
@injectable()
export class ConfigService implements IConfigService {
	/** Распарсенные переменные окружения из .env файла (undefined в продакшене) */
	private readonly config: DotenvParseOutput | undefined

	/**
	 * Создаёт экземпляр сервиса конфигурации.
	 * В продакшен-режиме использует переменные окружения Docker.
	 * В режиме разработки загружает конфигурацию из файла .env.
	 * @param logger - Сервис логирования
	 */
	constructor(@inject(TYPES.ILogger) private logger: ILogger) {
		const isProd = process.env.NODE_ENV === 'production'

		if (isProd) {
			this.config = undefined
			this.logger.log('[ConfigService] Конфигурация из переменных окружения Docker загружена')
		} else {
			const result: DotenvConfigOutput = config()

			if (result.error) {
				this.logger.error('[ConfigService] Не удалось прочитать файл .env или он отсутствует')
				this.config = undefined
			} else {
				this.logger.log('[ConfigService] Конфигурация .env загружена')
				this.config = result.parsed!
			}
		}
	}

	/**
	 * Возвращает значение конфигурационного параметра по ключу.
	 * Сначала ищет в .env конфигурации, затем в переменных окружения процесса.
	 * @param key - Имя переменной окружения или ключ конфигурации
	 * @returns Значение параметра в виде строки
	 * @throws Ошибку, если параметр не найден ни в .env, ни в переменных окружения
	 */
	get(key: string): string {
		const value = this.config?.[key] ?? process.env[key]

		if (isUndefined(value)) {
			throw new Error(`Конфигурация ${key} не найдена`)
		}

		return value
	}
}
