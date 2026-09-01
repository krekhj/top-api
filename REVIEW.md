# Аудит проекта (REVIEW)

Дата: сентябрь 2025
Статус проверки: `npm run build` ✅ | `eslint` ❌ (7 ошибок, 1 warning) | юнит-тесты ✅ (3/3) | e2e-тесты ✅ (2/2, против реальной БД)

---

## 🔴 Критично: баги и безопасность

### 1. Утечка паролей: `GET /api/auth/all` отдаёт `passwordHash`
- `src/auth/auth.controller.ts:33-36` — эндпоинт без `@UseGuards(JwtAuthGuard)`.
- `src/auth/auth.service.ts:41-43` — `findAllUsers()` возвращает полные документы, включая хеш пароля.
- **Фикс:** убрать эндпоинт или `select('-passwordHash')` + закрыть guard'ом.

### 2. JWT-токены никогда не протухают (два места одновременно)
- `src/auth/strategies/jwt.stratagy.ts:12` — `ignoreExpiration: true` — стратегия принимает просроченные токены.
- `src/auth/auth.service.ts:45-50` — `signAsync(payload)` без `expiresIn`.
- **Фикс:** `ignoreExpiration: false` и `expiresIn: '30m'` (или конфиг).

### 3. `POST /api/files/upload` — виснет навсегда
- `src/files/files.controller.ts:18-20` — `await new Promise(() => setTimeout(() => {}, 1000))` — промис никогда не резолвится (executor не вызывает `resolve`), запрос зависает до таймаута.
- `@UseInterceptors(FileInterceptor)` — нет имени поля (`'file'`) → multer выбросит ошибку при реальной загрузке.
- Файл никуда не сохраняется, `FilesService` пустой. Контроллер вообще не использует сервис.
- **Фикс:** `FileInterceptor('file')`, сохранение через `diskStorage`/`S3`, вернуть путь к файлу.

### 4. Баг: `GET /api/top-page/byAlias/:id` возвращает ВСЕ страницы
- `src/top-page/top-page.controller.ts:35-38` — маршрут объявляет параметр `:id`, а код читает `@Param('alias')` → всегда `undefined`.
- `src/top-page/top-page.service.ts:46-52` — `find({ alias: undefined })`: mongoose игнорирует `undefined` в запросе → возвращается вся коллекция.
- **Фикс:** `@Param('alias')` в маршруте (`byAlias/:alias`) или `@Param('id')` в коде + `findOne` вместо `find` (alias уникален).

### 5. Регистрация: неверный статус и гонка
- `src/auth/auth.controller.ts:23` — `HttpException('Уже существует юзер', 300)` — статус 300 (Multiple Choices), нужен `409 Conflict`.
- `src/auth/auth.service.ts:16-23` — при одновременных регистрациях один и тот же email сработает unique-индекс → необработанная ошибка E11000 → 500.
- **Фикс:** `ConflictException` + try/catch вокруг `save()` на ошибку `11000`.

### 6. Нет валидации на большей части эндпоинтов
- В `src/main.ts` нет глобального `ValidationPipe` — валидация включена точечно через `@UsePipes(new ValidationPipe())` (и то не везде).
- **Без валидации:** `POST /product/create`, `PATCH /product/:id`, `POST /top-page/create`, `PATCH /top-page/:id`, `POST /auth/register` (там есть), `DELETE`-ы.
- `src/product/product.controller.ts:23` — `create` принимает `Omit<ProductModel, '_id'>` — в БД уходит любой мусор, хотя готовый `CreateProductDto` есть и не используется.
- **Фикс:** глобальный `ValidationPipe({ whitelist: true, transform: true })` в `main.ts`.

### 7. Docker: приложение в контейнере не подключится к MongoDB
- `compose.yaml` монтирует `.env` (`MONGO_HOST=localhost`), но внутри контейнера `localhost` — это сам контейнер, а не сервис `mongo` → подключение упадёт.
- `depends_on: [mongo]` без `healthcheck` — приложение может стартовать раньше БД.
- `Dockerfile`: `FROM node:26-alpine` — образ Node 26 на текущий момент отсутствует (LTS — 22/24); сборка образа упадёт.
- **Фикс:** `MONGO_HOST=mongo` для контейнера (env override в compose), `healthcheck` для mongo, `node:24-alpine`/`node:22-alpine`, `npm ci` вместо `npm install`.

---

## 🟠 Требует рефакторинга

### 8. Дублирование модели пользователя
- `src/auth/user.model.ts` (`email` + `passwordHash`) и `src/users/models/user.model.ts` (`email` + `password` + `images`) — две разные модели одного юзера.
- `UsersModule`/`UsersService.getByEmail` — мёртвый код: нигде не используется, из модуля ничего не экспортируется (`src/users/users.module.ts`).

### 9. Мёртвый код и отладочный мусор
- `ReviewService.deleteByProductId` (`review.service.ts:21-23`) — не вызывается нигде.
- `FilesService` — пустой класс, не инжектится.
- `console.log(email)` + закомментированный `@UseGuards` в `review.controller.ts:38,44` — `@UserEmail()` без guard всегда `undefined`.
- Закомментированные поля `calculatedRating` в `product.model.ts:22-23` и `create-product.dto.ts:21-22`.
- `configService.get('TEST')` в конструкторе `TopPageController` (`top-page.controller.ts:25`) — бессмысленный вызов.

### 10. Непоследовательная защита маршрутов
- Отзывы: удаление под JWT, но `GET /review/byProduct` — guard закомментирован.
- Продукты и топ-страницы: `create`/`delete`/`patch` вообще без авторизации — любой может менять контент.

### 11. Агрегация `findWithReview` (`product.service.ts:31-71`)
- `$function` с инлайн-JS для сортировки отзывов — антипаттерн (не оптимизируется, блокирует движок); лучше `$unwind` + `$sort` + `$group`, либо `$sortArray` (требует MongoDB 5.2+).
- `from: 'reviewmodels'` — хардкод имени коллекции (автоплюрализация mongoose); сломается при переименовании модели. Лучше брать имя коллекции из модели.
- `reviewAvg: { $avg: '$review.rating' }` — при пустом массиве вернёт `null`, хотя тип заявлен `number`.
- Неверный generic: `aggregate<Promise<ProductModel & ...>>` — `aggregate` возвращает массив, не промис.
- `$limit: dto.limit` без верхней границы — можно завалить БД большим числом.

### 12. Сервис топ-страниц: ошибки-копипасты и неработающие проверки
- `top-page.service.ts:48-49, 76-78` — `findByAlias` и `findByText` бросают «Не обновлено» (копипаста).
- `findByAlias` использует `find()` (массив) + `if (!resp)` — пустой массив truthy, проверка никогда не срабатывает, NotFound не будет никогда. Нужен `findOne`.
- Опечатка «Не найдёно» (`top-page.service.ts:33`).

### 13. `findByCategory` разворачивает весь DTO в `$match`
- `top-page.service.ts:54-72` — `...firstCategory` — любые лишние поля из тела запроса попадут в запрос к БД. Нужно матчить только `firstLevelCategory`.

### 14. e2e-тесты не изолированы и хрупкие
- `test/auth.e2e-spec.ts`, `test/review.e2e-spec.ts` — ходят в реальную БД (нужен поднятый mongo), требуют заранее существующего пользователя `test@mail.ru`, не чистят за собой данные, зависят от порядка.
- `console.log(body)` — отладочный мусор.
- `test/review.e2e-spec.ts:64-71` — проверка `body.length === 1` сломается, если БД уже содержит отзывы с этим productId.
- **Фикс:** тестовая БД (`mongodb-memory-server` или отдельная база с очисткой), регистрация пользователя в `beforeAll`.

### 15. Юнит-тест review хрупкий
- `src/review/review.service.spec.ts:32` — `reviewRepositoryFactory()` вызывается заново в тесте; работает только случайно (через общий объект `exec` на уровне модуля). Мок лучше строить в `beforeEach` и переиспользовать.

---

## 🟡 Мелочи и code style

| № | Файл | Проблема |
|---|------|----------|
| 16 | `src/pipes/ad-product.pipe.ts` | Имя файла не совпадает с классом `IdValidationPipe`; сообщение «Передал какашку вместо id» — не для продакшена |
| 17 | `src/auth/strategies/jwt.stratagy.ts` | Опечатка `Stratagy` в имени файла и класса |
| 18 | `src/configs/jwt.config.ts:6` | Бессмысленный `await configService.get(...)` |
| 19 | `src/configs/mongo.config.ts` | Конкатенация строк вместо URL; `get()` без `getOrThrow` — отсутствующие env-переменные уходят тихо как `undefined`; `authSource=admin` захардкожен |
| 20 | `src/auth/dto/auth.dto.ts` | `login` без `@IsEmail()` (хотя это email), пароль без `@IsNotEmpty`/`@MinLength` |
| 21 | `src/review/review.model.ts`, `src/product/product.model.ts` | Пропсы без `required: true` — обязательность полей держится только на DTO, которые не везде подключены |
| 22 | `src/review/review.controller.ts:48-51` | Метод называется `getAllProducts` (копипаста из product) |
| 23 | `src/main.ts:9` | `bootstrap()` без обработки rejection (warning линтера); нет CORS, helmet, глобального exception filter, shutdown hooks |
| 24 | `src/auth/auth.service.ts:29-39` | `validateUser` считает `compareSync` ещё до проверки существования юзера — проверки стоит поменять местами |
| 25 | `src/product/product.controller.ts:41` | `patch` принимает `ProductModel` вместо `CreateProductDto` |
| 26 | `src/review/review.controller.ts:30-36` | `delete` возвращает пустое тело 200 — логичнее 204 или удалённый документ |
| 27 | `src/auth/auth.module.ts` vs `UsersModule` | Два модуля, регистрирующих модели пользователя, — путаница в DI |
| 28 | `eslint` | 7 ошибок: unused var `file` (`files.controller.ts:18`), unsafe any-доступы в e2e-тестах; 1 warning: floating promise в `main.ts` |
| 29 | `.env` | `JWT_SECRET=test` — только для разработки, в проде нужен секрет из секрет-менеджера |
| 30 | README | Заявляет «Docker-ready: одна команда», но `docker compose up` упадёт из-за `MONGO_HOST` (п. 7) |

---

## ✅ Что сделано хорошо
- Чистая модульная структура (auth / product / review / top-page / files).
- DTO с `class-validator` там, где подключены (nested-валидация характеристик, `@IsEnum`).
- `IdValidationPipe` для проверки ObjectId в параметрах (везде, кроме `byAlias`).
- Хеширование паролей bcryptjs, `timestamps` на схемах.
- Агрегация с `$lookup` для отзывов — правильная идея, требует лишь доработки.
- Юнит-тесты сервисов, e2e-тесты есть (но не изолированы).
- `.env` и `mongo-data` в `.gitignore`.

---

## 🛠 Рекомендуемый порядок действий
1. **Безопасность:** п. 1 (утечка паролей), п. 2 (вечные токены), п. 5 (статус 409 + E11000).
2. **Баги:** п. 3 (files upload), п. 4 (byAlias), п. 6 (глобальная валидация).
3. **Docker:** п. 7.
4. **Рефакторинг:** п. 8–13 (дубли моделей, мёртвый код, агрегация, guard'ы).
5. **Тесты:** п. 14–15 (изоляция e2e, починка моков).
6. **Чистка:** п. 16–30 (линт, опечатки, мусор).
