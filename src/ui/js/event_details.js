document.addEventListener("DOMContentLoaded", async () => {
  // Извлекаем ID события из URL
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  if (!eventId) {
    alert("Invalid event ID");
    window.location.href = "/main";
    return;
  }

  // Элементы DOM
  const eventName = document.getElementById("event-name");
  const eventDescription = document.getElementById("event-description");
  const eventDate = document.getElementById("event-date");
  const eventLocation = document.getElementById("event-location");
  const inviteBtn = document.getElementById("invite-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const qrContainer = document.getElementById("qr-container");
  const eventLink = document.getElementById("event-link");
  const qrCodeImg = document.getElementById("qr-code");
  const timeRemainingElement = document.getElementById("time-remaining");
  const voteForm = document.getElementById("vote-form");
  const voteResults = document.getElementById("vote-results");

  try {
    // Загружаем данные о событии с сервера
    const response = await fetch(`http://localhost:3000/events/${eventId}`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Event not found");
    }

    const event = await response.json();

    // Заполняем данные о событии на странице
    eventName.textContent = event.name;
    eventDescription.textContent =
      event.description || "No description provided";
    eventDate.textContent = new Date(event.date).toLocaleDateString();
    eventLocation.textContent = event.location;

    // Генерация ссылки на мероприятие
    const eventUrl = `${window.location.origin}/html/event_details.html?id=${eventId}`;
    eventLink.value = eventUrl;
    generateQRCode(eventUrl);

    // Таймер до начала события
    const eventStartDate = new Date(event.date);
    function updateTimer() {
      const now = new Date();
      const diff = eventStartDate - now;

      if (diff <= 0) {
        timeRemainingElement.textContent = "Event has started!";
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      timeRemainingElement.textContent = `Starts in: ${days}d ${hours}h ${minutes}m`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to load event details");
    window.location.href = "/main";
  }

  // Удаление события
  deleteBtn.addEventListener("click", async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`http://localhost:3000/events/${eventId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      alert("Event deleted successfully");
      window.location.href = "/main";
    } catch (error) {
      console.error("Error:", error);
      alert("Error deleting event");
    }
  });

  // Показать QR-код и ссылку приглашения
  inviteBtn.addEventListener("click", () => {
    qrContainer.style.display = "block";
  });

  function generateQRCode(url) {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
      url
    )}`;
    qrCodeImg.src = qrApiUrl;
  }

  // Обработка голосования
  voteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const selectedOption = document.querySelector(
      'input[name="eventTime"]:checked'
    );
    if (!selectedOption) {
      alert("Пожалуйста, выберите время для голосования");
      return;
    }
    const voteTime = selectedOption.value;
    try {
      const voteResponse = await fetch(
        `http://localhost:3000/events/${eventId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ time: voteTime }),
        }
      );
      if (!voteResponse.ok) {
        throw new Error("Failed to record vote");
      }
      const voteData = await voteResponse.json();
      voteResults.textContent = "Ваш голос учтён!";
      // Опционально: выводим обновлённые результаты голосования
      displayVoteResults(voteData.timeVotes);
    } catch (error) {
      console.error("Error:", error);
      alert("Ошибка при голосовании");
    }
  });

  function displayVoteResults(votes) {
    let resultsHtml = "<h3>Результаты голосования:</h3><ul>";
    // votes приходит в виде объекта { "10:00": 3, "12:00": 5, ... }
    for (const time in votes) {
      resultsHtml += `<li>${time}: ${votes[time]} голос(ов)</li>`;
    }
    resultsHtml += "</ul>";
    voteResults.innerHTML = resultsHtml;
  }
});
