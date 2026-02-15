/**
 * Пользовательский класс HTTP-ошибки.
 * Расширяет стандартный Error, добавляя HTTP-статус код
 * и контекст возникновения ошибки.
 */
export class HttpError extends Error {
	/**
	 * Создаёт экземпляр HTTP-ошибки.
	 * @param statusCode - HTTP-статус код ошибки
	 * @param message - Сообщение об ошибке
	 * @param context - Контекст, в котором произошла ошибка (например, имя контроллера или маршрута)
	 */
	constructor(
		public readonly statusCode: number,
		message: string,
		public readonly context?: string,
	) {
		super(message)
	}
}
