import { UserModel } from '@prisma/client'

import { ITokenPair } from '../jwt/jwt.service.interface'

import { UserLoginDTO } from './dto/user-login.dto'
import { UserRegisterDTO } from './dto/user-register.dto'

/**
 * Интерфейс результата создания пользователя.
 * Содержит данные созданного пользователя и пару JWT-токенов.
 */
export interface IUserServiceCreateResult {
	/** Данные созданного пользователя без поля пароля */
	user: Omit<UserModel, 'password'>
	/** Пара JWT-токенов (access + refresh) */
	tokens: ITokenPair
}

/**
 * Интерфейс сервиса пользователей.
 * Определяет контракт бизнес-логики для операций с пользователями.
 */
export interface IUserService {
	/**
	 * Создаёт нового пользователя.
	 * @param dto - Данные для регистрации пользователя
	 * @returns Созданный пользователь с токенами или null, если пользователь уже существует
	 */
	createUser: (dto: UserRegisterDTO) => Promise<IUserServiceCreateResult | null>

	/**
	 * Валидирует учётные данные пользователя при входе.
	 * @param dto - Данные для аутентификации
	 * @returns Пара JWT-токенов или null, если учётные данные невалидны
	 */
	validateUser: (dto: UserLoginDTO) => Promise<ITokenPair | null>

	/**
	 * Возвращает публичную информацию о пользователе.
	 * @param email - Email пользователя
	 * @returns Данные пользователя без пароля или null, если не найден
	 */
	getUserInfo: (email: string) => Promise<Omit<UserModel, 'password'> | null>
}
