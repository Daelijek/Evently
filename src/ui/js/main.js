document.addEventListener("DOMContentLoaded", async () => {
  const logoutButton = document.getElementById("logout-button");

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        const response = await fetch("/logout", { method: "GET" });
        if (response.ok) {
          window.location.href = "/";
        } else {
          alert("Ошибка при выходе");
        }
      } catch (error) {
        console.error("Ошибка:", error);
        alert("Ошибка сервера");
      }
    });
  }

  const container = document.querySelector(".main_container");
  const eventCardTemplate = document.getElementById("event-card-template");

  try {
    const response = await fetch("http://localhost:3000/events", {
      method: "GET",
      credentials: "include", // Важно: отправляем куки
    });

    if (!response.ok) {
      throw new Error("Ошибка при загрузке событий");
    }

    const events = await response.json();
    if (events.length === 0) {
      alert("Нет доступных событий");
      return;
    }

    events.forEach((event) => {
      const eventElement = eventCardTemplate.content.cloneNode(true);
      const eventName = eventElement.querySelector(".event_name");
      const eventImage = eventElement.querySelector(".event_image");
    
      eventName.textContent = event.name;
      if (event.imageUrl) {
        eventImage.src = event.imageUrl; // Устанавливаем путь к изображению
        eventImage.style.display = "block";
      } else {
        eventImage.style.display = "none"; // Скрываем изображение, если его нет
      }
    
      const showDetailsButton = eventElement.querySelector(".show-details");
      showDetailsButton.onclick = () => showEventDetails(event.id);
    
      const deleteEventButton = eventElement.querySelector(".delete-event");
      deleteEventButton.onclick = () => deleteEvent(event.id);
    
      container.appendChild(eventElement);
    });
  } catch (error) {
    console.error("Error:", error);
    alert("Не удалось загрузить события");
  }
});

function showEventDetails(eventId) {
  if (!eventId) {
    alert("Ошибка: ID события отсутствует!");
    return;
  }
  window.location.href = `/html/event_details.html?id=${eventId}`;
}

// Функция удаления события
function deleteEvent(eventId) {
  if (!eventId) {
    alert("Ошибка: ID события отсутствует!");
    return;
  }

  if (!confirm("Вы уверены, что хотите удалить это событие?")) return;

  fetch(`http://localhost:3000/events/${eventId}`, {
    method: "DELETE",
    credentials: "include", // Важно: отправляем куки
  })
    .then((response) => {
      if (!response.ok) throw new Error("Не удалось удалить событие");
      alert("Событие успешно удалено");
      window.location.reload(); // Обновляем страницу после удаления
    })
    .catch((error) => {
      console.error("Ошибка:", error);
      alert("Ошибка при удалении события");
    });
}

async function checkAuth() {
  try {
    const response = await fetch("http://localhost:3000/me", {
      method: "GET",
      credentials: "include", // Важно: отправляем куки
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Пользователь авторизован:", data.user);
    } else {
      console.log("Пользователь не авторизован");
    }
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

checkAuth();
