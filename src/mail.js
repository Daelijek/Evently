const nodemailer = require("nodemailer");

// Создаем транспорт для отправки писем
const transporter = nodemailer.createTransport({
  service: "gmail", // Используем Gmail
  auth: {
    user: "dias1605ermek@gmail.com", // Ваш email
    pass: "clqz fofo lzst mcui", // Пароль от вашего email
  },
});

// Функция для отправки письма
async function sendSubscriptionEmail(email) {
  try {
    const mailOptions = {
      from: "your-email@gmail.com", // Отправитель
      to: email, // Получатель
      subject: "Thank you for subscribing!", // Тема письма
      text: `Hello!\n\nThank you for subscribing to our newsletter. You will now receive the latest updates and tips for event planning.\n\nBest regards,\nThe Evently Team`, // Текст письма
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

module.exports = { sendSubscriptionEmail };
