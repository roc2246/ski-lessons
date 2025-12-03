import * as lib from "./calendar-library.js";

let currentDate = new Date();

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  render();
}

function render() {
  lib.renderCalendar({ date: currentDate }, false);
}

document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));

// Initial render
render();
