/**
 * Интерфейс параметров конструктора сущности пользователя.
 */
export interface IUserConstructorParams {
	/** Email пользователя */
	email: string
	/** Имя пользователя (может быть null) */
	name: string | null
	/** Хеш пароля (опционально, передаётся при загрузке существующего пользователя) */
	passwordHash?: string
}

/**
 * Интерфейс сущности пользователя.
 * Определяет контракт доменной модели пользователя с методами работы с паролем.
 */
export interface IUserEntity {
	/** Email пользователя */
	email: string
	/** Имя пользователя (может быть null) */
	name: string | null
	/** Хешированный пароль пользователя */
	password: string

	/**
	 * Устанавливает пароль, хешируя его с указанной солью.
	 * @param pass - Пароль в открытом виде
	 * @param salt - Количество раундов хеширования bcrypt
	 */
	setPassword: (pass: string, salt: number) => Promise<void>

	/**
	 * Сравнивает переданный пароль с хешированным паролем пользователя.
	 * @param password - Пароль в открытом виде для сравнения
	 * @returns true, если пароль совпадает
	 */
	comparePassword: (password: string) => Promise<boolean>
}
