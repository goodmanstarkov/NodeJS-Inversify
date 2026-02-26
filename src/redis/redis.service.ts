import { inject, injectable } from 'inversify'
import Redis from 'ioredis'

import { IConfigService } from '../config/config.service.interface'
import { ILogger } from '../logger/logger.interface'
import { TYPES } from '../types'

import { IRedisService } from './redis.service.interface'

/**
 * Сервис для работы с Redis.
 * Управляет жизненным циклом подключения к Redis,
 * предоставляет методы для операций с ключами.
 */
@injectable()
export class RedisService implements IRedisService {
	private client: Redis

	/**
	 * Создаёт экземпляр сервиса Redis.
	 * Инициализирует клиент с параметрами подключения из конфигурации.
	 * @param logger - Сервис логирования
	 * @param configService - Сервис конфигурации для получения хоста и порта Redis
	 */
	constructor(
		@inject(TYPES.ILogger) private readonly logger: ILogger,
		@inject(TYPES.IConfigService) private readonly configService: IConfigService,
	) {
		this.client = new Redis({
			host: this.configService.get('REDIS_HOST'),
			port: Number(this.configService.get('REDIS_PORT')),
			lazyConnect: true,
		})
	}

	public async connect(): Promise<void> {
		try {
			await this.client.connect()
			this.logger.log('[RedisService] Redis подключён')
		} catch (e) {
			const mainErrorMessage = '[RedisService] Ошибка при подключении к Redis'

			if (e instanceof Error) {
				this.logger.error(`${mainErrorMessage}: ${e.message}`)
			} else {
				this.logger.error(`${mainErrorMessage}: ${e}`)
			}
		}
	}

	public async disconnect(): Promise<void> {
		try {
			this.client.disconnect()
			this.logger.log('[RedisService] Redis отключён')
		} catch (e) {
			const mainErrorMessage = '[RedisService] Ошибка при отключении от Redis'

			if (e instanceof Error) {
				this.logger.error(`${mainErrorMessage}: ${e.message}`)
			} else {
				this.logger.error(`${mainErrorMessage}: ${e}`)
			}
		}
	}

	public async get(key: string): Promise<string | null> {
		return this.client.get(key)
	}

	public async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		if (ttlSeconds) {
			await this.client.set(key, value, 'EX', ttlSeconds)
		} else {
			await this.client.set(key, value)
		}
	}

	public async del(key: string): Promise<void> {
		await this.client.del(key)
	}

	public async exists(key: string): Promise<boolean> {
		const result = await this.client.exists(key)
		return result === 1
	}
}
