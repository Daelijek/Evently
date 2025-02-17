document.querySelector(".form_button").addEventListener("click", async () => {
  const eName = document.getElementById("eName").value.trim();
  const description = document.getElementById("description").value.trim();
  const date = document.getElementById("start").value;
  const location = document.getElementById("eLocation").value.trim();
  const imageInput = document.getElementById("eImage");
  const imageFile = imageInput.files[0];

  // Если элемент выбора шаблона существует, получаем его значение
  let template = "default";
  const templateSelect = document.getElementById("template-select");
  if (templateSelect) {
    template = templateSelect.value;
  }

  // Validation: Ensure required fields are not empty
  if (!eName || !date || !location) {
    alert("Please fill in all required fields (Name, Date, Location).");
    return;
  }

  // Создаем FormData для отправки данных (в том числе файла и выбранного шаблона)
  const formData = new FormData();
  formData.append("name", eName);
  formData.append("description", description);
  formData.append("date", date);
  formData.append("location", location);
  formData.append("template", template); // отправляем выбранный шаблон

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
