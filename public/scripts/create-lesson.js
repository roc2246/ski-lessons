import * as lib from "./admin-library.js";

// -----------------------------
// FORM SUBMIT HANDLER
// -----------------------------
const form = document.getElementById("lesson-form");
(async () => {
  try {
    const dropdown = document.getElementById("assignedTo");
    const users = await lib.getUsers();
    for (let x = 0; x < users.length; x++) {
      const opt = document.createElement("option");
      opt.value = users[x]._id
      opt.innerText = users[x].username;
      dropdown.appendChild(opt);
    }
  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const lessonData = {
    type: document.getElementById("type").value,
    date: document.getElementById("date").value,
    timeLength: document.getElementById("timeLength").value,
    guests: document.getElementById("guests").value,
    assignedTo: document.getElementById("assignedTo").value,
  };

  try {
    const createdLesson = await lib.lessonCreate(lessonData);
    alert("Lesson created successfully!");
    console.log(createdLesson);

    form.reset();
  } catch (err) {
    console.error(err);
    alert("Failed to create lesson.");
  }
});
