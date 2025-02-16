const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Подключение к MongoDB
const uri =
  "mongodb+srv://Daelijek:dias1605dddsss@evently.egk2u.mongodb.net/?retryWrites=true&w=majority&appName=Evently";

mongoose
  .connect(uri)
  .then(() => {
    console.log("Подключение к MongoDB успешно установлено.");
  })
  .catch((err) => {
    console.error("Ошибка подключения к MongoDB:", err);
  });

// Логи для событий подключения
const db = mongoose.connection;

db.on("connected", () => {
  console.log("MongoDB: Установлено соединение с сервером.");
});

db.on("error", (err) => {
  console.error("MongoDB: Ошибка соединения:", err);
});

db.on("disconnected", () => {
  console.log("MongoDB: Соединение разорвано.");
});

// Схема пользователя
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    default: "user", // Роль по умолчанию
    enum: ["user", "premium"], // Допустимые значения: "user" или "premium"
  },
});

// Хеширование пароля перед сохранением
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

// Сравнение паролей
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
// mongodb+srv://Daelijek:dias1605dddsss@evently.egk2u.mongodb.net/?retryWrites=true&w=majority&appName=Evently
