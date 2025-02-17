document.querySelector(".form_button").addEventListener("click", async () => {
  const eName = document.getElementById("eName").value.trim();
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("start").value;
  const location = document.getElementById("eLocation").value.trim();
  const imageInput = document.getElementById("eImage");
  const imageFile = imageInput.files[0];
  const eventData = {
    name: document.getElementById("eName").value.trim(),
    description: document.getElementById("description").value.trim(),
    date: document.getElementById("start").value,
    location: document.getElementById("eLocation").value.trim(),
  };

  // Validation: Ensure required fields are not empty
  if (!eName || !date || !location) {
    alert("Please fill in all required fields (Name, Date, Location).");
    return;
  }

  // Создаем FormData для отправки файла
  const formData = new FormData();
  formData.append("name", eName);
  formData.append("description", description);
  formData.append("date", date);
  formData.append("location", location);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  try {
    const response = await fetch("http://localhost:3000/events", {
      method: "POST",
      credentials: "include",
      body: formData,
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

document.getElementById("eImage").addEventListener("change", function () {
  const fileNameSpan = document.getElementById("file-name");
  if (this.files && this.files.length > 0) {
    fileNameSpan.textContent = this.files[0].name;
  } else {
    fileNameSpan.textContent = "No file chosen";
  }
});
