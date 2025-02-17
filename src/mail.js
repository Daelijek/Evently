const nodemailer = require("nodemailer");

// Создаем транспорт для отправки писем
const transporter = nodemailer.createTransport({
  service: "gmail", // Используем Gmail
  auth: {
    user: "dias1605ermek@gmail.com", // Ваш email
    pass: "clqz fofo lzst mcui", // Пароль от вашего email
  },
});

// Функция для отправки письма подписки (уже существует)
async function sendSubscriptionEmail(email) {
  try {
    const mailOptions = {
      from: "dias1605ermek@gmail.com",
      to: email,
      subject: "Thank you for subscribing!",
      text: `Hello!\n\nThank you for subscribing to our newsletter. You will now receive the latest updates and tips for event planning.\n\nBest regards,\nThe Evently Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
}

// Новая функция для отправки приглашения на событие
async function sendInvitationEmail(email, event, inviteLink) {
  try {
    const mailOptions = {
      from: "dias1605ermek@gmail.com", // ваш email
      to: email,
      subject: `Invitation: ${event.name}`,
      text: `Hello!

You are invited to the event "${event.name}".
Date: ${new Date(event.date).toLocaleString()}
Location: ${event.location}

Details: ${event.description || "No description provided"}

To view the event details, please click on the following link:
${inviteLink}

Best regards,
The Evently Team`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Invitation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending invitation email:", error);
    throw new Error("Failed to send invitation email");
  }
}

module.exports = { sendSubscriptionEmail, sendInvitationEmail };
