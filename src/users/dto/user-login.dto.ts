import { IsEmail, IsString } from 'class-validator'

/**
 * DTO для аутентификации пользователя.
 * Содержит данные, необходимые для входа в систему.
 */
export class UserLoginDTO {
	/** Email пользователя */
	@IsEmail({}, { message: 'Неверно указан email' })
	public readonly email: string

	/** Пароль пользователя */
	@IsString()
	public readonly password: string
}
