const express = require("express");
const path = require("path");
const cors = require("cors");
const { nanoid } = require("nanoid");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const jwt = require("jsonwebtoken");

const app = express();
const port = 3000;

const ACCESS_SECRET = "access_secret_key";
const REFRESH_SECRET = "refresh_secret_key";

// Хранилище refresh токенов в памяти
let refreshTokens = [];

// Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API интернет-магазина",
      version: "1.0.0",
      description: "CRUD API для управления товарами с JWT и refresh token",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Локальный сервер",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Product: {
          type: "object",
          required: ["name", "category", "description", "price", "stock"],
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            price: { type: "number" },
            stock: { type: "integer" },
            rating: { type: "number", nullable: true },
            image: { type: "string", nullable: true },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "admin@mail.com" },
            password: { type: "string", example: "123" },
          },
        },
        RefreshRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: {
            refreshToken: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./app.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/img", express.static(path.join(__dirname, "img")));

app.use((req, res, next) => {
  res.on("finish", () => {
    console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      console.log("Body:", req.body);
    }
  });
  next();
});

// Пользователи
let users = [
  {
    id: nanoid(6),
    email: "admin@mail.com",
    password: "123",
    role: "admin",
  },
  {
    id: nanoid(6),
    email: "user@mail.com",
    password: "123",
    role: "user",
  },
];

// Товары
let products = [
  {
    id: nanoid(6),
    name: "Компьютерная мышь",
    category: "Периферия",
    description: "Эргономичная форма, точный сенсор.",
    price: 1490,
    stock: 34,
    rating: 4.6,
    image: "/img/p1.jpg",
  },
  {
    id: nanoid(6),
    name: "Клавиатура механическая",
    category: "Периферия",
    description: "Переключатели Blue, подсветка, anti-ghosting.",
    price: 4990,
    stock: 12,
    rating: 4.7,
    image: "/img/p2.jpg",
  },
  {
    id: nanoid(6),
    name: "Наушники",
    category: "Аудио",
    description: "Закрытые, чистый звук, микрофон.",
    price: 3590,
    stock: 18,
    rating: 4.4,
    image: "/img/p3.jpg",
  },
  {
    id: nanoid(6),
    name: 'Монитор 24" IPS',
    category: "Мониторы",
    description: "1920x1080, 75Hz, IPS матрица.",
    price: 12990,
    stock: 9,
    rating: 4.5,
    image: "/img/p4.jpg",
  },
  {
    id: nanoid(6),
    name: "SSD 1TB",
    category: "Накопители",
    description: "NVMe, высокая скорость чтения/записи.",
    price: 8990,
    stock: 22,
    rating: 4.8,
    image: "/img/p5.jpg",
  },
  {
    id: nanoid(6),
    name: "Видеокарта",
    category: "Комплектующие",
    description: "Подходит для игр 1080p, 8GB VRAM.",
    price: 28990,
    stock: 6,
    rating: 4.3,
    image: "/img/p6.jpg",
  },
  {
    id: nanoid(6),
    name: "Оперативная память 16GB",
    category: "Комплектующие",
    description: "DDR4, 3200MHz, 2x8GB.",
    price: 4590,
    stock: 40,
    rating: 4.7,
    image: "/img/p7.jpg",
  },
  {
    id: nanoid(6),
    name: "Блок питания 650W",
    category: "Комплектующие",
    description: "80+ Bronze, тихий вентилятор.",
    price: 5990,
    stock: 15,
    rating: 4.5,
    image: "/img/p8.jpg",
  },
  {
    id: nanoid(6),
    name: "Web-камера",
    category: "Аксессуары",
    description: "Full HD, автофокус, встроенный микрофон.",
    price: 2790,
    stock: 25,
    rating: 4.2,
    image: "/img/p9.jpg",
  },
  {
    id: nanoid(6),
    name: "Коврик для мыши",
    category: "Аксессуары",
    description: "Большой размер, нескользящая основа.",
    price: 790,
    stock: 60,
    rating: 4.6,
    image: "/img/p10.jpg",
  },
];

function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email,
    },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

function findProductOr404(id, res) {
  const product = products.find((p) => p.id === id);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return null;
  }
  return product;
}

function validateProductPayload(payload, { partial = false } = {}) {
  const errors = [];
  const has = (k) => payload[k] !== undefined;

  if (!partial || has("name")) {
    if (typeof payload.name !== "string" || !payload.name.trim()) {
      errors.push("name must be a non-empty string");
    }
  }

  if (!partial || has("category")) {
    if (typeof payload.category !== "string" || !payload.category.trim()) {
      errors.push("category must be a non-empty string");
    }
  }

  if (!partial || has("description")) {
    if (typeof payload.description !== "string" || !payload.description.trim()) {
      errors.push("description must be a non-empty string");
    }
  }

  if (!partial || has("price")) {
    if (typeof payload.price !== "number" || payload.price < 0) {
      errors.push("price must be a number >= 0");
    }
  }

  if (!partial || has("stock")) {
    if (!Number.isInteger(payload.stock) || payload.stock < 0) {
      errors.push("stock must be an integer >= 0");
    }
  }

  if (has("rating")) {
    if (payload.rating !== null && (typeof payload.rating !== "number" || payload.rating < 0 || payload.rating > 5)) {
      errors.push("rating must be null or number 0..5");
    }
  }

  if (has("image")) {
    if (payload.image !== null && typeof payload.image !== "string") {
      errors.push("image must be a string or null");
    }
  }

  return errors;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Нет токена" });
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Неверный формат токена" });
  }

  const token = parts[1];

  try {
    const user = jwt.verify(token, ACCESS_SECRET);
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Access token истёк или недействителен" });
  }
}

function roleMiddleware(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Нет доступа" });
    }
    next();
  };
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Проверка работы сервера
 *     tags: [Service]
 */
app.get("/", (req, res) => {
  res.json({
    message: "Backend is running",
    productsCount: products.length,
  });
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Неверные данные" });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.push(refreshToken);

  res.json({
    accessToken,
    refreshToken,
    role: user.role,
  });
});

/**
 * @swagger
 * /refresh:
 *   post:
 *     summary: Обновить access token
 *     tags: [Auth]
 */
app.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token отсутствует" });
  }

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json({ message: "Refresh token недействителен" });
  }

  try {
    const user = jwt.verify(refreshToken, REFRESH_SECRET);
    const accessToken = generateAccessToken(user);

    res.json({ accessToken });
  } catch {
    return res.status(403).json({ message: "Refresh token истёк или недействителен" });
  }
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Выход пользователя
 *     tags: [Auth]
 */
app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);
  }

  res.json({ message: "Выход выполнен" });
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.get("/api/products", authMiddleware, (req, res) => {
  res.json(products);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.get("/api/products/:id", authMiddleware, (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;
  res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.post("/api/products", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const errors = validateProductPayload(req.body, { partial: false });

  if (errors.length) {
    return res.status(400).json({ error: "Validation error", details: errors });
  }

  const newProduct = {
    id: nanoid(6),
    name: req.body.name.trim(),
    category: req.body.category.trim(),
    description: req.body.description.trim(),
    price: req.body.price,
    stock: req.body.stock,
    rating: req.body.rating ?? null,
    image: req.body.image?.trim() ? req.body.image.trim() : null,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.patch("/api/products/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const product = findProductOr404(req.params.id, res);
  if (!product) return;

  if (
    req.body?.name === undefined &&
    req.body?.category === undefined &&
    req.body?.description === undefined &&
    req.body?.price === undefined &&
    req.body?.stock === undefined &&
    req.body?.rating === undefined &&
    req.body?.image === undefined
  ) {
    return res.status(400).json({ error: "Nothing to update" });
  }

  const errors = validateProductPayload(req.body, { partial: true });

  if (errors.length) {
    return res.status(400).json({ error: "Validation error", details: errors });
  }

  if (req.body.name !== undefined) product.name = req.body.name.trim();
  if (req.body.category !== undefined) product.category = req.body.category.trim();
  if (req.body.description !== undefined) product.description = req.body.description.trim();
  if (req.body.price !== undefined) product.price = req.body.price;
  if (req.body.stock !== undefined) product.stock = req.body.stock;
  if (req.body.rating !== undefined) product.rating = req.body.rating;
  if (req.body.image !== undefined) product.image = req.body.image?.trim() ? req.body.image.trim() : null;

  res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
app.delete("/api/products/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const id = req.params.id;
  const exists = products.some((p) => p.id === id);

  if (!exists) {
    return res.status(404).json({ error: "Product not found" });
  }

  products = products.filter((p) => p.id !== id);
  res.status(204).send();
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// errors
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  console.log(`Backend started: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api-docs`);
});