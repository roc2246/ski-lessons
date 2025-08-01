const monthYear = document.getElementById("monthYear");
const calendarDates = document.getElementById("calendarDates");

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let currentDate = new Date();

async function getLessons() {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch("/api/lessons", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch lessons");
    }

    const { lessons } = await response.json();
    return lessons;
  } catch (err) {
    console.error("Error retrieving lessons:", err.message);
    throw err;
  }
}

function preprocessLessons(lessons) {
  return lessons.map((lesson) => {
    const [month, day, year] = lesson.date.split("-").map(Number);
    const [startTime] = lesson.timeLength.split("-");
    const [hours = "0", minutes = "0"] = startTime.split(":");

    return {
      ...lesson,
      _year: year,
      _month: month,
      _day: day,
      _startDate: new Date(year, month - 1, day, +hours, +minutes),
    };
  });
}

async function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Set header text
  monthYear.textContent = `${monthNames[month]} ${year}`;

  // Clear previous calendar
  calendarDates.innerHTML = "";

  // Add blank days for alignment
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < firstDay; i++) {
    fragment.appendChild(document.createElement("div"));
  }
  calendarDates.appendChild(fragment);

  // Fetch and prepare lessons
  const lessons = await getLessons();
  const preprocessedLessons = preprocessLessons(lessons);

  // Filter lessons for current month and year
  const filterLessons = preprocessedLessons.filter(
    (lesson) => lesson._month === month + 1 && lesson._year === year
  );

  // Sort lessons by start date/time
  filterLessons.sort((a, b) => a._startDate - b._startDate);

  // Helper functions for lesson HTML
  const timeslot = (length) => `<h4 class="date__time-slot">${length}</h4>`;
  const type = (type) => `<span class="date__lesson-type">${type}</span>`;
  const dayCont = (day) => `<h3 class="date__day">${day}</h3>`;

  let lessonCounter = 0;
  let html = "";

  for (let day = 1; day <= daysInMonth; day++) {
    let dayHTML = `<div class="date">${dayCont(day)}`;

    // Append all lessons for this day
    while (
      lessonCounter < filterLessons.length &&
      filterLessons[lessonCounter]._day === day
    ) {
      const lesson = filterLessons[lessonCounter];
      dayHTML += timeslot(lesson.timeLength) + type(lesson.type);
      lessonCounter++;
    }

    dayHTML += "</div>";
    html += dayHTML;
  }

  // Render calendar days with lessons
  calendarDates.innerHTML += html;
}

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar(currentDate);
}

// Initial render
renderCalendar(currentDate);
