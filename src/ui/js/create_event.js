document.querySelector(".form_button").addEventListener("click", async () => {
  const eventData = {
    name: document.getElementById("eName").value.trim(),
    description: document.getElementById("description").value.trim(),
    date: document.getElementById("start").value,
    location: document.getElementById("eLocation").value.trim(),
  };

  // Validation: Ensure required fields are not empty
  if (!eventData.name || !eventData.date || !eventData.location) {
    alert("Please fill in all required fields (Name, Date, Location).");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Важно: отправляем куки
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      window.location.href = "/main"; // Redirect after successful creation
    } else {
      alert("Error creating event. Please try again.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Server is unavailable.");
  }
});