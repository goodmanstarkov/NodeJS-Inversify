import { UserModel } from '@prisma/client'

import { User } from './user.entity'

/**
 * Интерфейс репозитория пользователей.
 * Определяет контракт для операций с хранилищем данных пользователей.
 */
export interface IUserRepository {
	/**
	 * Создаёт нового пользователя в базе данных.
	 * @param user - Сущность пользователя для сохранения
	 * @returns Созданный пользователь без поля пароля
	 */
	create: (user: User) => Promise<Omit<UserModel, 'password'>>

	/**
	 * Находит пользователя по email (включая пароль).
	 * @param email - Email для поиска
	 * @returns Найденный пользователь или null
	 */
	findByEmail: (email: string) => Promise<UserModel | null>

	/**
	 * Находит пользователя по email без поля пароля.
	 * @param email - Email для поиска
	 * @returns Найденный пользователь без пароля или null
	 */
	findByEmailPublic: (email: string) => Promise<Omit<UserModel, 'password'> | null>
}
