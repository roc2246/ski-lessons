import * as lib from "./calander-library.js";

let currentDate = new Date();

async function renderCalendar(date) {
  const context = lib.getCalendarContext(date);
  const { year, month, firstDay, daysInMonth, monthNames, dom } = context;

  dom.monthYear.textContent = `${monthNames[month]} ${year}`;
  dom.calendarDates.innerHTML = "";

  // Add blank days for alignment
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < firstDay; i++) {
    fragment.appendChild(document.createElement("div"));
  }
  dom.calendarDates.appendChild(fragment);

  // Fetch and prepare lessons
  const lessons = await lib.getLessons();
  const preprocessedLessons = lib.preprocessLessons(lessons);
  const filterLessons = preprocessedLessons.filter(
    (lesson) =>
      lesson._month === month + 1 &&
      lesson._year === year &&
      lesson.upForGrabs === true
  );
  filterLessons.sort((a, b) => a._startDate - b._startDate);

  // Fill calender with lesson data
  let lessonCounter = 0;
  let html = "";
  for (let day = 1; day <= daysInMonth; day++) {
    let dayHTML = `<div class="date">${lib.createEle().dayCont(day)}`;

    while (
      lessonCounter < filterLessons.length &&
      filterLessons[lessonCounter]._day === day
    ) {
      const lesson = filterLessons[lessonCounter];
      dayHTML +=
        lib.createEle().timeslot(lesson.timeLength) +
        lib.createEle().type(lesson.type) +
        lib.createEle().addLesson();
      lessonCounter++;
    }

    dayHTML += "</div>";
    html += dayHTML;
  }
  dom.calendarDates.innerHTML = html;

  // NOT IN CALENDER.JS
  const addLessonBtn = document.getElementsByClassName("addLesson");
  for (let x = 0; x < addLessonBtn.length; x++) {
    addLessonBtn[x].addEventListener("click", async () => {
      await lib.assignLesson(filterLessons[x]._id, token);
    });
  }
}

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar(currentDate);
}

document.querySelector(".header button:first-child").addEventListener("click", () => changeMonth(-1));
document.querySelector(".header button:last-child").addEventListener("click", () => changeMonth(1));


// Initial render
renderCalendar(currentDate);
