# Tech Store — Практические занятия 7–12

Веб-приложение интернет-магазина с аутентификацией, JWT-токенами, refresh token, RBAC и React-фронтендом.

## Структура проекта

```text
project/
├── backend/                    # Node.js + Express сервер
│   ├── app.js                  # Главный файл сервера
│   ├── package.json
│   ├── routes/
│   │   ├── auth.js             # Регистрация, вход, refresh, logout, me
│   │   ├── products.js         # Маршруты товаров
│   │   └── admin.js            # Админские маршруты пользователей
│   ├── middleware/
│   │   ├── authJwt.js          # Проверка access token
│   │   └── requireRole.js      # Проверка роли пользователя
│   ├── utils/
│   │   ├── tokens.js           # Генерация access/refresh token
│   │   └── validators.js       # Валидация данных
│   ├── data/
│   │   ├── users.js            # Временное хранилище пользователей
│   │   └── products.js         # Временное хранилище товаров
│   └── img/                    # Изображения товаров
│
└── frontend/                   # React приложение
    ├── src/
    │   ├── api/
    │   │   └── index.js        # Axios клиент с interceptors и refresh
    │   ├── components/
    │   │   ├── ProductItem.jsx
    │   │   ├── ProductModal.jsx
    │   │   └── ProductsList.jsx
    │   ├── pages/
    │   │   ├── LoginPage/
    │   │   │   ├── LoginPage.jsx
    │   │   │   └── LoginPage.scss
    │   │   ├── RegisterPage/
    │   │   │   ├── RegisterPage.jsx
    │   │   │   └── RegisterPage.scss
    │   │   ├── ProductsPage/
    │   │   │   ├── ProductsPage.jsx
    │   │   │   └── ProductsPage.scss
    │   │   └── AdminPage/
    │   │       ├── AdminPage.jsx
    │   │       └── AdminPage.scss
    │   ├── App.js              # Роутинг и защита маршрутов
    │   ├── index.js
    │   └── index.css
    └── package.json
## Запуск

### Бэкенд
```bash
cd backend
npm install
npm start         # или: npm run dev (с nodemon)
# Сервер: http://localhost:3000
```

### Фронтенд
```bash
cd frontend
npm install
npm run dev
# Приложение: http://localhost:3001
```

## API маршруты

### Auth (Гость)
| Метод | Маршрут | Описание |
|-------|---------|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход |
| POST | /api/auth/refresh | Обновление токенов |

### Auth (Пользователь+)
| Метод | Маршрут | Описание |
|-------|---------|----------|
| GET | /api/auth/me | Текущий пользователь |

### Users (Администратор)
| Метод | Маршрут | Описание |
|-------|---------|----------|
| GET | /api/users | Список пользователей |
| GET | /api/users/:id | Пользователь по id |
| PUT | /api/users/:id | Обновить пользователя |
| DELETE | /api/users/:id | Заблокировать |

### Products
| Метод | Маршрут | Доступ | Описание |
|-------|---------|--------|----------|
| GET | /api/products | user+ | Список товаров |
| GET | /api/products/:id | user+ | Товар по id |
| POST | /api/products | seller/admin | Создать товар |
| PUT | /api/products/:id | seller/admin | Обновить товар |
| DELETE | /api/products/:id | admin | Удалить товар |

## Роли (RBAC)

| Роль | Товары | Пользователи |
|------|--------|--------------|
| **user** | Просмотр | — |
| **admin** | Полный доступ | Полный доступ |
