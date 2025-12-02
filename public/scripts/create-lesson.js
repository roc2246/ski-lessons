import * as adminLib from "./admin-library.js";
import * as domLib from "./dom-library.js";

// -----------------------------
// FORM SUBMIT HANDLER
// -----------------------------
const form = document.getElementById("lesson-form");

(async () => {
  try {
    const dropdown = document.getElementById("assignedTo");
    const users = await adminLib.getUsers();
    for (let x = 0; x < users.length; x++) {
      domLib.createOption(dropdown, users[x]._id, users[x].username);
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
    const createdLesson = await adminLib.lessonCreate(lessonData);
    alert("Lesson created successfully!");
    console.log(createdLesson);

    form.reset();
  } catch (err) {
    console.error(err);
    alert("Failed to create lesson.");
  }
});
