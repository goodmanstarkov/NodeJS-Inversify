import { UserModel } from '@prisma/client'
import { inject } from 'inversify'

import { IPrismaService } from '../database/prisma.service.interface'
import { TYPES } from '../types'

import { User } from './user.entity'
import { IUserRepository } from './user.repository.interface'

/**
 * Репозиторий пользователей.
 * Реализует операции чтения и записи данных пользователей
 * в базе данных через Prisma ORM.
 */
export class UserRepository implements IUserRepository {
	/**
	 * Создаёт экземпляр репозитория пользователей.
	 * @param prismaService - Сервис Prisma для доступа к базе данных
	 */
	constructor(@inject(TYPES.IPrismaService) private readonly prismaService: IPrismaService) {}

	/**
	 * Создаёт нового пользователя в базе данных.
	 * Возвращает созданного пользователя без поля пароля.
	 * @param param0 - Сущность пользователя (деструктурируется для получения email, name, password)
	 * @returns Созданный пользователь без поля пароля
	 */
	public async create({ email, name, password }: User): Promise<Omit<UserModel, 'password'>> {
		return this.prismaService.client.userModel.create({
			data: {
				email,
				name,
				password,
			},
			omit: {
				password: true,
			},
		})
	}

	/**
	 * Находит пользователя по email с включением всех полей (включая пароль).
	 * Используется для внутренней валидации.
	 * @param email - Email пользователя для поиска
	 * @returns Найденный пользователь или null, если не найден
	 */
	public async findByEmail(email: string): Promise<UserModel | null> {
		return this.prismaService.client.userModel.findUnique({
			where: { email },
		})
	}

	/**
	 * Находит пользователя по email без поля пароля.
	 * Используется для публичной выдачи информации о пользователе.
	 * @param email - Email пользователя для поиска
	 * @returns Найденный пользователь без пароля или null, если не найден
	 */
	public async findByEmailPublic(email: string): Promise<Omit<UserModel, 'password'> | null> {
		return this.prismaService.client.userModel.findUnique({
			where: { email },
			omit: { password: true },
		})
	}
}
