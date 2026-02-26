# Node.js Inversify API

REST API на Node.js с использованием InversifyJS для внедрения зависимостей, Prisma ORM, PostgreSQL и Redis.

## Технологический стек

- **Runtime:** Node.js 22
- **Язык:** TypeScript
- **Фреймворк:** Express
- **DI-контейнер:** InversifyJS
- **ORM:** Prisma
- **База данных:** PostgreSQL
- **Кэш / хранилище токенов:** Redis (ioredis)
- **Логирование:** tslog
- **Валидация:** class-validator + class-transformer
- **Хеширование паролей:** bcryptjs
- **Линтинг:** ESLint + Prettier
- **Контейнеризация:** Docker, Docker Compose, Nginx

## Архитектура

Проект построен на принципах чистой архитектуры с инверсией зависимостей (Dependency Injection) через InversifyJS.

```
src/
├── main.ts                  # Точка входа, IoC-контейнер
├── app.ts                   # Express-приложение
├── types.ts                 # Символы для DI
├── common/                  # Общие абстракции
│   ├── base.controller.ts   # Базовый контроллер
│   ├── validate.middleware.ts
│   ├── route.interface.ts
│   └── middleware.interface.ts
├── config/                  # Сервис конфигурации (.env / Docker env)
├── database/                # Prisma-сервис (подключение к БД)
├── errors/                  # Фильтр исключений, HttpError
├── logger/                  # Логгер (tslog)
├── redis/                   # Redis-сервис (кэш, whitelist токенов)
│   ├── redis.service.ts     # Реализация (ioredis)
│   └── redis.service.interface.ts
└── users/                   # Модуль пользователей
    ├── dto/                 # DTO с валидацией
    ├── user.controller.ts   # Контроллер
    ├── user.service.ts      # Бизнес-логика
    ├── user.repository.ts   # Репозиторий (Prisma)
    └── user.entity.ts       # Доменная сущность
```

Слои взаимодействуют по схеме: **Controller → Service → Repository → Prisma**.

## Redis

Redis используется в двух ключевых сценариях:

### Whitelist refresh-токенов

Refresh-токены хранятся в Redis по ключу `refresh:<token>` с TTL, равным времени жизни токена. Это позволяет:

- **Проверять валидность** — при обновлении токенов (`/users/refresh`) контроллер сначала проверяет наличие токена в Redis. Если токен не найден, он считается отозванным.
- **Ротировать токены** — при успешном обновлении старый токен удаляется из Redis, а новый сохраняется.
- **Отзывать токены при выходе** — при вызове `/users/logout` refresh-токен удаляется из Redis, что делает его недействительным даже до истечения JWT.

### Кэширование данных пользователя

Метод `getUserInfo` в `UserService` кэширует результат запроса к БД в Redis:

- Ключ: `user:<email>`
- TTL: 300 секунд (5 минут)
- При попадании в кэш данные возвращаются без обращения к PostgreSQL

### Жизненный цикл подключения

- `RedisService` регистрируется в IoC-контейнере как singleton
- Подключение устанавливается при старте приложения параллельно с Prisma
- При получении сигналов `SIGINT`/`SIGTERM` соединение корректно закрывается (graceful shutdown)

## Предварительные требования

- [Node.js](https://nodejs.org/) >= 22
- [Docker](https://www.docker.com/) и Docker Compose
- npm

## Переменные окружения

Создайте файл `.env` в корне проекта на основе `.env.example`.

| Переменная                      | Описание                             | Пример           |
| ------------------------------- | ------------------------------------ | ---------------- |
| `SALT`                          | Соль для bcrypt                      | `10`             |
| `POSTGRES_USER`                 | Пользователь PostgreSQL              | `postgres`       |
| `POSTGRES_PASSWORD`             | Пароль PostgreSQL                    | `postgres`       |
| `POSTGRES_DB`                   | Имя базы данных                      | `nodejs-inversify` |
| `POSTGRES_HOST`                 | Хост PostgreSQL                      | `localhost`      |
| `POSTGRES_PORT`                 | Порт PostgreSQL                      | `5432`           |
| `JWT_ACCESS_SECRET`             | Секрет для access-токенов            | `<random>`       |
| `JWT_REFRESH_SECRET`            | Секрет для refresh-токенов           | `<random>`       |
| `JWT_ACCESS_EXPIRES_IN`         | Время жизни access-токена            | `15m`            |
| `JWT_REFRESH_EXPIRES_IN`        | Время жизни refresh-токена (дни)     | `7d`             |
| `JWT_REFRESH_TOKEN_COOKIE_NAME` | Имя cookie для refresh-токена        | `refreshToken`   |
| `REDIS_HOST`                    | Хост Redis                           | `localhost`      |
| `REDIS_PORT`                    | Порт Redis                           | `6379`           |

## Запуск в режиме разработки

Одна команда поднимает PostgreSQL и Redis в Docker, выполняет миграции и запускает приложение с hot-reload через nodemon:

```bash
npm install
npm run dev
```

После запуска сервер доступен по адресу: **http://localhost:8000**

### Что делает `npm run dev` под капотом:

1. Поднимает контейнер PostgreSQL (`docker compose up -d postgres`)
2. Поднимает контейнер Redis (`docker compose up -d redis`)
3. Генерирует Prisma Client (`prisma generate`)
4. Применяет миграции (`prisma migrate deploy`)
5. Запускает приложение через nodemon с линтингом при каждом изменении

## Запуск в Docker (продакшен)

Полная сборка с Nginx в качестве reverse proxy:

```bash
docker compose up -d --build
```

Это поднимет:

| Сервис       | Описание                        | Порт |
| ------------ | ------------------------------- | ---- |
| **postgres** | База данных PostgreSQL          | 5432 |
| **redis**    | Кэш и хранилище токенов        | 6379 |
| **migrate**  | Одноразовое применение миграций | —    |
| **backend**  | Node.js приложение (Express)    | 8000 |
| **nginx**    | Reverse proxy с rate limiting   | 80   |

Приложение доступно по адресу: **http://localhost**

## API эндпоинты

Базовый URL: `http://localhost:8000/api`

### Общие

| Метод | Путь      | Описание                   | Авторизация |
| ----- | --------- | -------------------------- | ----------- |
| GET   | `/health` | Проверка работоспособности | Нет         |

**Ответ `200`:**

```json
{ "status": "ok" }
```

---

### Пользователи (`/users`)

#### POST `/users/register`

Регистрация нового пользователя. Валидирует тело запроса через `class-validator`.

**Тело запроса:**

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "name": "Иван"
}
```

| Поле       | Обязательное | Описание              |
| ---------- | ------------ | --------------------- |
| `email`    | Да           | Валидный email адрес  |
| `password` | Да           | Пароль пользователя   |
| `name`     | Нет          | Имя пользователя      |

**Ответ `201`** — пользователь создан:

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Иван"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Refresh-токен устанавливается в httpOnly cookie.

**Ответ `422`** — пользователь с таким email уже существует:

```json
{ "message": "Такой пользователь уже существует" }
```

**Ответ `422`** — ошибка валидации (массив ошибок `class-validator`).

---

#### POST `/users/login`

Аутентификация пользователя по email и паролю.

**Тело запроса:**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

| Поле       | Обязательное | Описание              |
| ---------- | ------------ | --------------------- |
| `email`    | Да           | Валидный email адрес  |
| `password` | Да           | Пароль пользователя   |

**Ответ `200`** — успешный вход:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Refresh-токен устанавливается в httpOnly cookie.

**Ответ `401`** — неверные учётные данные:

```json
{ "message": "Неверный email или пароль" }
```

**Ответ `422`** — ошибка валидации (массив ошибок `class-validator`).

---

#### POST `/users/refresh`

Обновление пары JWT-токенов. Refresh-токен передаётся через httpOnly cookie (устанавливается автоматически при login/register). Перед верификацией JWT проверяется наличие токена в Redis-whitelist — если токен отсутствует, он считается отозванным. При успешном обновлении старый токен удаляется из Redis, новый сохраняется.

**Тело запроса:** не требуется.

**Cookie:** `refresh_token` (имя настраивается в `.env`).

**Ответ `200`** — токены обновлены:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Новый refresh-токен устанавливается в httpOnly cookie.

**Ответ `401`** — refresh-токен отсутствует:

```json
{ "message": "Refresh токен не предоставлен" }
```

**Ответ `401`** — refresh-токен отозван (отсутствует в Redis):

```json
{ "message": "Refresh токен отозван" }
```

**Ответ `401`** — refresh-токен невалиден или истёк:

```json
{ "message": "Невалидный refresh токен" }
```

---

#### POST `/users/logout`

Выход из системы. Удаляет refresh-токен из Redis-whitelist и очищает httpOnly cookie.

**Тело запроса:** не требуется.

**Ответ `200`:**

```json
{ "message": "Вы вышли из системы" }
```

---

#### GET `/users/info`

Получение информации о текущем аутентифицированном пользователе. Требует авторизацию.

**Заголовок:** `Authorization: Bearer <access_token>`

**Ответ `200`:**

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Иван"
}
```

**Ответ `401`** — токен отсутствует или невалиден:

```json
{ "message": "Не авторизован" }
```

**Ответ `404`** — пользователь не найден:

```json
{ "message": "Пользователь не найден" }
```

---

### Сводная таблица

| Метод | Путь              | Описание                        | Авторизация | Middleware            |
| ----- | ----------------- | ------------------------------- | ----------- | --------------------- |
| GET   | `/health`         | Проверка работоспособности      | Нет         | —                     |
| POST  | `/users/register` | Регистрация пользователя        | Нет         | ValidateMiddleware    |
| POST  | `/users/login`    | Аутентификация пользователя     | Нет         | ValidateMiddleware    |
| POST  | `/users/refresh`  | Обновление пары JWT-токенов     | Cookie      | —                     |
| POST  | `/users/logout`   | Выход из системы                | Нет         | —                     |
| GET   | `/users/info`     | Информация о текущем пользователе | Bearer      | AuthGuard             |

## Доступные скрипты

| Команда                   | Описание                                                     |
| ------------------------- | ------------------------------------------------------------ |
| `npm run dev`             | Запуск в режиме разработки (PostgreSQL + Redis + миграции + nodemon) |
| `npm run build`           | Компиляция TypeScript в JavaScript                           |
| `npm run dev:clean`       | Очистка + установка зависимостей + запуск dev                |
| `npm run build:clean`     | Очистка + установка зависимостей + сборка                    |
| `npm run lint`            | Проверка кода линтером                                       |
| `npm run lint:fix`        | Автоисправление ошибок линтера                               |
| `npm run prettier`        | Форматирование кода                                          |
| `npm run docker:up`       | Запуск всех Docker-контейнеров                               |
| `npm run docker:postgres` | Запуск только PostgreSQL                                     |
| `npm run docker:redis`    | Запуск только Redis                                          |
| `npm run migrate`         | Создание миграции Prisma                                     |
| `npm run migrate:deploy`  | Применение миграций                                          |
| `npm run migrate:studio`  | Запуск Prisma Studio (GUI для БД)                            |
| `npm run clean`           | Удаление `node_modules` и `dist`                             |

## Автор

Alexander Starkov
