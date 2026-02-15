import { IsEmail, IsOptional, IsString } from 'class-validator'

/**
 * DTO для регистрации нового пользователя.
 * Содержит данные, необходимые для создания учётной записи.
 */
export class UserRegisterDTO {
	/** Email нового пользователя */
	@IsEmail({}, { message: 'Неверно указан email' })
	public readonly email: string

	/** Пароль нового пользователя */
	@IsString({ message: 'Не указан пароль' })
	public readonly password: string

	/** Имя пользователя (опционально) */
	@IsOptional()
	@IsString({ message: 'Имя должно быть строкой' })
	public readonly name: string | null
}
