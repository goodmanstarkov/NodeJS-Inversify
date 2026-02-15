import { ClassConstructor, plainToInstance } from 'class-transformer'
import { validate } from 'class-validator'
import { Request, Response, NextFunction } from 'express'

import { IMiddleware } from './middleware.interface'

/**
 * Middleware валидации тела запроса.
 * Преобразует тело запроса в экземпляр указанного DTO-класса
 * и выполняет валидацию с помощью class-validator.
 */
export class ValidateMiddleware implements IMiddleware {
	/**
	 * Создаёт экземпляр middleware валидации.
	 * @param classToValidate - Конструктор DTO-класса для валидации тела запроса
	 */
	constructor(private readonly classToValidate: ClassConstructor<object>) {}

	/**
	 * Преобразует тело запроса в экземпляр DTO и валидирует его.
	 * При наличии ошибок возвращает ответ 422 со списком ошибок.
	 * При успешной валидации передаёт управление следующему обработчику.
	 * @param req - Объект входящего HTTP-запроса (деструктурируется для получения body)
	 * @param res - Объект HTTP-ответа
	 * @param next - Функция передачи управления следующему обработчику
	 */
	execute({ body }: Request, res: Response, next: NextFunction): void {
		const instance = plainToInstance(this.classToValidate, body)

		validate(instance).then((errors) => {
			if (errors.length) {
				res.status(422).send(errors)
			} else {
				next()
			}
		})
	}
}
