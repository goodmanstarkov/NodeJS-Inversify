/**
 * Интерфейс полезной нагрузки JWT-токена.
 */
export interface IJwtPayload {
	/** Email пользователя */
	email: string
	/** Время выпуска токена (issued at) в секундах Unix */
	iat?: number
	/** Время истечения токена (expiration) в секундах Unix */
	exp?: number
}

/**
 * Интерфейс пары JWT-токенов (access + refresh).
 */
export interface ITokenPair {
	/** Токен доступа для аутентификации запросов */
	accessToken: string
	/** Токен обновления для получения новой пары токенов */
	refreshToken: string
}

/**
 * Интерфейс сервиса JWT-токенов.
 * Определяет контракт для создания, верификации и управления JWT-токенами.
 */
export interface IJwtService {
	/**
	 * Подписывает access-токен с указанной полезной нагрузкой.
	 * @param payload - Полезная нагрузка токена
	 * @returns Подписанный access-токен
	 */
	signAccessToken: (payload: IJwtPayload) => Promise<string>

	/**
	 * Подписывает refresh-токен с указанной полезной нагрузкой.
	 * @param payload - Полезная нагрузка токена
	 * @returns Подписанный refresh-токен
	 */
	signRefreshToken: (payload: IJwtPayload) => Promise<string>

	/**
	 * Верифицирует access-токен и извлекает полезную нагрузку.
	 * @param token - Access-токен для верификации
	 * @returns Декодированная полезная нагрузка токена
	 */
	verifyAccessToken: (token: string) => Promise<IJwtPayload>

	/**
	 * Верифицирует refresh-токен и извлекает полезную нагрузку.
	 * @param token - Refresh-токен для верификации
	 * @returns Декодированная полезная нагрузка токена
	 */
	verifyRefreshToken: (token: string) => Promise<IJwtPayload>

	/**
	 * Генерирует пару токенов (access + refresh) для указанной полезной нагрузки.
	 * @param payload - Полезная нагрузка для токенов
	 * @returns Пара из access- и refresh-токенов
	 */
	generateTokenPair: (payload: IJwtPayload) => Promise<ITokenPair>
}
