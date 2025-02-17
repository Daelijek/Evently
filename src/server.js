const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/User"); // Подключаем модель пользователя
const bodyParser = require("body-parser"); // Для парсинга данных формы
const { sendSubscriptionEmail } = require("./mail"); // Импортируем функцию отправки писем

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Разрешаем запросы с этого источника
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000"); // URL вашего фронтенда
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// Middleware для сессий
app.use(
  session({
    secret: "your-secret-key", // Секретный ключ для подписи сессии
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Установите `true`, если используете HTTPS
  })
);

// Middleware для статических файлов
app.use(express.static(path.join(__dirname, "ui")));

// Путь к JSON-файлу событий
const EVENTS_FILE = path.join(__dirname, "logs", "events.json");

// Создаем папку, если она не существует
if (!fs.existsSync(path.dirname(EVENTS_FILE))) {
  fs.mkdirSync(path.dirname(EVENTS_FILE), { recursive: true });
}

// Загрузка событий из файла
const loadEvents = () => {
  if (!fs.existsSync(EVENTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(EVENTS_FILE, "utf8"));
};

// Сохранение событий в файл
const saveEvents = (events) => {
  fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2), "utf8");
};

// Middleware для проверки аутентификации
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next(); // Пользователь авторизован
  }
  res.status(401).json({ error: "Необходимо войти в систему" });
}

// Страница ознакомления (Landing Page)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "ui", "html", "landing.html"));
});

// Главная страница (защищена)
app.get("/main", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "ui", "html", "mainPage.html"));
});

// Страница входа
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "ui", "html", "login.html"));
});

// Страница регистрации
app.get("/registration", (req, res) => {
  res.sendFile(path.join(__dirname, "ui", "html", "registration.html"));
});

// Страница создания события
app.get("/createEvent", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "ui", "html", "create_event.html"));
});

// Страница деталей события
app.get("/event_details", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "ui", "html", "event_details.html"));
});

// Маршрут для получения событий текущего пользователя
app.get("/events", isAuthenticated, async (req, res) => {
  try {
    const events = await Event.find({ userId: req.session.user.id }).sort({
      date: 1,
    });
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Маршрут для получения события по ID
app.get("/events/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    // Популяция поля userId, чтобы вернуть имя организатора
    const event = await Event.findOne({
      _id: id,
      userId: req.session.user.id,
    }).populate("userId", "name");

    if (!event) {
      return res.status(404).json({ error: "Событие не найдено" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

const Event = require("./models/Event"); // Импортируем модель события

// Маршрут для создания события
app.post("/events", isAuthenticated, async (req, res) => {
  const { name, description, date, location } = req.body;

  try {
    // Создаем новое событие с привязкой к пользователю
    const newEvent = new Event({
      name,
      description,
      date,
      location,
      userId: req.session.user.id, // Привязываем событие к текущему пользователю
    });

    await newEvent.save();
    res.status(201).json({ message: "Событие успешно создано" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Маршрут для удаления события
app.delete("/events/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    // Проверяем, что id является валидным ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Неверный ID события" });
    }

    // Удаляем событие, если оно принадлежит текущему пользователю
    const deletedEvent = await Event.findOneAndDelete({
      _id: id,
      userId: req.session.user.id,
    });

    if (!deletedEvent) {
      return res.status(404).json({ error: "Событие не найдено" });
    }

    res.status(200).json({ message: "Событие успешно удалено" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Маршрут для регистрации
app.post("/register", async (req, res) => {
  const { email, name, surname, dateOfBirth, phoneNumber, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Пользователь уже существует" });
    }

    const newUser = new User({
      email,
      name,
      surname,
      dateOfBirth,
      phoneNumber,
      password,
      role: "user", // Устанавливаем роль по умолчанию
    });

    await newUser.save();
    res.status(201).json({ message: "Пользователь успешно зарегистрирован" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Маршрут для входа
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Пользователь не найден" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Неверный пароль" });
    }

    // Сохраняем пользователя в сессии
    req.session.user = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    res.status(200).json({
      message: "Вход выполнен успешно",
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Маршрут для получения данных текущего пользователя
app.get("/me", isAuthenticated, (req, res) => {
  res.status(200).json({ user: req.session.user });
});

// Маршрут для выхода
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка при выходе" });
    }
    res.json({ message: "Вы успешно вышли" });
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Маршрут для изменения роли пользователя (только для администраторов)
app.put("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }

    // Проверяем, что роль допустима
    if (!["user", "premium"].includes(role)) {
      return res.status(400).json({ error: "Недопустимая роль" });
    }

    user.role = role; // Обновляем роль
    await user.save();

    res.status(200).json({ message: "Роль успешно обновлена", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Middleware для парсинга данных формы
app.use(bodyParser.urlencoded({ extended: true }));

// Маршрут для подписки
app.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Отправляем письмо пользователю
    await sendSubscriptionEmail(email);

    res.status(200).send("<h1>Subscription successful! Check your email.</h1>");
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send(
        "<h1>Failed to send subscription email. Please try again later.</h1>"
      );
  }
});

// Голосование за время проведения события
app.post("/events/:id/vote", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const { time } = req.body;

  if (!time) {
    return res.status(400).json({ error: "Необходимо указать время" });
  }

  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Событие не найдено" });
    }

    // Получаем текущее число голосов за выбранное время и увеличиваем его на 1
    const currentVotes = event.timeVotes.get(time) || 0;
    event.timeVotes.set(time, currentVotes + 1);

    await event.save();

    // Приводим Map к объекту для отправки клиенту
    res.status(200).json({
      message: "Голос учтён",
      timeVotes: Object.fromEntries(event.timeVotes),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});
