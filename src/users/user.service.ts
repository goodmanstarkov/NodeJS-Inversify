import { UserModel } from '@prisma/client'
import { inject, injectable } from 'inversify'

import { IConfigService } from '../config/config.service.interface'
import { IJwtService, ITokenPair } from '../jwt/jwt.service.interface'
import { TYPES } from '../types'

import { UserLoginDTO } from './dto/user-login.dto'
import { UserRegisterDTO } from './dto/user-register.dto'
import { User } from './user.entity'
import { IUserRepository } from './user.repository.interface'
import { IUserService, IUserServiceCreateResult } from './user.service.interface'

/**
 * Сервис пользователей.
 * Реализует бизнес-логику регистрации, аутентификации
 * и получения информации о пользователях.
 */
@injectable()
export class UserService implements IUserService {
	/**
	 * Создаёт экземпляр сервиса пользователей.
	 * @param configService - Сервис конфигурации для получения параметров (например, соль хеширования)
	 * @param userRepository - Репозиторий пользователей для доступа к данным
	 * @param jwtService - Сервис JWT для генерации токенов
	 */
	constructor(
		@inject(TYPES.IConfigService) private readonly configService: IConfigService,
		@inject(TYPES.IUserRepository) private readonly userRepository: IUserRepository,
		@inject(TYPES.IJwtService) private readonly jwtService: IJwtService,
	) {}

	/**
	 * Регистрирует нового пользователя.
	 * Хеширует пароль, проверяет уникальность email,
	 * сохраняет пользователя в БД и генерирует пару JWT-токенов.
	 * @param param0 - Данные регистрации (email, name, password)
	 * @returns Созданный пользователь с токенами или null, если email уже занят
	 */
	public async createUser({
		email,
		name,
		password,
	}: UserRegisterDTO): Promise<IUserServiceCreateResult | null> {
		const newUser = new User({ email, name })
		const passwordSalt = Number(this.configService.get('SALT'))
		await newUser.setPassword(password, passwordSalt)

		const existingUser = await this.userRepository.findByEmail(email)

		if (existingUser) {
			return null
		}

		const user = await this.userRepository.create(newUser)
		const tokens = await this.generateTokens(email)

		return { user, tokens }
	}

	/**
	 * Валидирует учётные данные пользователя при входе.
	 * Проверяет существование пользователя и совпадение пароля.
	 * @param param0 - Данные аутентификации (email, password)
	 * @returns Пара JWT-токенов или null, если учётные данные невалидны
	 */
	public async validateUser({ email, password }: UserLoginDTO): Promise<ITokenPair | null> {
		const existingUser = await this.userRepository.findByEmail(email)

		if (!existingUser) {
			return null
		}

		const user = new User({
			email: existingUser.email,
			name: existingUser.name,
			passwordHash: existingUser.password,
		})

		const isValid = await user.comparePassword(password)

		if (!isValid) {
			return null
		}

		return this.generateTokens(email)
	}

	/**
	 * Возвращает публичную информацию о пользователе по email.
	 * @param email - Email пользователя
	 * @returns Данные пользователя без пароля или null, если не найден
	 */
	public async getUserInfo(email: string): Promise<Omit<UserModel, 'password'> | null> {
		return this.userRepository.findByEmailPublic(email)
	}

	/**
	 * Генерирует пару JWT-токенов (access + refresh) для пользователя.
	 * @param email - Email пользователя для включения в токен
	 * @returns Пара JWT-токенов
	 */
	private generateTokens(email: string): Promise<ITokenPair> {
		return this.jwtService.generateTokenPair({ email })
	}
}
