import * as lib from "./calander-library.js";

let currentDate = new Date();

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  render();
}

function render() {
  lib.renderCalendar({ date: currentDate });
}

document.querySelector(".header button:first-child").addEventListener("click", () => changeMonth(-1));
document.querySelector(".header button:last-child").addEventListener("click", () => changeMonth(1));

// Initial render
render();
