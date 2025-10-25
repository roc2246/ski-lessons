import * as lib from "./calander-library.js";

let currentDate = new Date();

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  render();
}

function render() {
  lib.renderCalendar({
    date: currentDate,
    lessonFilter: (lesson) => lesson.upForGrabs,
    extraDayHTML: () => lib.createEle().addLesson(),
    onComplete: (filteredLessons) => lib.addLessonBtn(filteredLessons),
  });
}

document.querySelector(".header button:first-child").addEventListener("click", () => changeMonth(-1));
document.querySelector(".header button:last-child").addEventListener("click", () => changeMonth(1));

// Initial render
render();
