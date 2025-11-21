import * as lib from "./admin-library.js";

      // -----------------------------
      // FORM SUBMIT HANDLER
      // -----------------------------
      const form = document.getElementById("lesson-form");

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