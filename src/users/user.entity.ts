import { compare, hash } from 'bcryptjs'

import { IUserConstructorParams, IUserEntity } from './user.entity.interface'

/**
 * Доменная сущность пользователя.
 * Инкапсулирует данные пользователя и логику работы с паролем
 * (хеширование и сравнение).
 */
export class User implements IUserEntity {
	/** Email пользователя */
	private _email: string
	/** Имя пользователя */
	private _name: string | null
	/** Хешированный пароль пользователя */
	private _password: string

	/**
	 * Создаёт экземпляр сущности пользователя.
	 * @param params - Параметры инициализации пользователя
	 * @param params.email - Email пользователя
	 * @param params.name - Имя пользователя
	 * @param params.passwordHash - Хеш пароля (для существующих пользователей)
	 */
	constructor({ email, name, passwordHash }: IUserConstructorParams) {
		this._email = email
		this._name = name

		if (passwordHash) {
			this._password = passwordHash
		}
	}

	/** Возвращает email пользователя */
	get email(): string {
		return this._email
	}

	/** Возвращает имя пользователя */
	get name(): string | null {
		return this._name
	}

	/** Возвращает хешированный пароль пользователя */
	get password(): string {
		return this._password
	}

	/**
	 * Хеширует и устанавливает пароль пользователя.
	 * @param pass - Пароль в открытом виде
	 * @param salt - Количество раундов хеширования bcrypt
	 */
	public async setPassword(pass: string, salt: number): Promise<void> {
		this._password = await hash(pass, salt)
	}

	/**
	 * Сравнивает переданный пароль с хешированным паролем пользователя.
	 * @param password - Пароль в открытом виде для сравнения
	 * @returns true, если пароль совпадает
	 */
	public comparePassword(password: string): Promise<boolean> {
		return compare(password, this._password)
	}
}
