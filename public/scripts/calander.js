const monthYear = document.getElementById("monthYear");
const calendarDates = document.getElementById("calendarDates");

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let currentDate = new Date();
async function getLessons() {
  try {
    const token = localStorage.getItem("token"); // or however you're storing the JWT

    const response = await fetch("/api/lessons", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

async function renderCalendar(date) {
  // Sets date data
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Set initial content
  monthYear.textContent = `${monthNames[month]} ${year}`;
  calendarDates.innerHTML = "";
  for (let i = 0; i < firstDay; i++) calendarDates.innerHTML += `<div></div>`;

  // Fetch lessons
  let callCount = 0;
  let lessons;
  while (callCount < 1) {
    lessons = await getLessons();
    callCount++;
  }

  // Filter for lessons for the month
  let filterLessons = lessons.filter(
    (lesson) => lesson.date.includes(month + 1) && lesson.date.includes(year)
  );
  filterLessons.sort((a, b) => {
    const getDateTime = (lesson) => {
      const [month, day, year] = lesson.date.split("-").map(Number);
      const [startTime] = lesson.timeLength.split("-");

      // Normalize startTime to HH:MM format
      let [hours, minutes] = startTime.split(":");
      const hour = parseInt(hours, 10);
      const min = parseInt(minutes, 10);

      return new Date(year, month - 1, day, hour, min);
    };

    return getDateTime(a) - getDateTime(b);
  });

  // Fills lesson data into instructor calander
  filterLessons.forEach((lesson) => {
    const [, dayStr] = lesson.date.split("-");
    lesson._day = parseInt(dayStr, 10);
  });

  const timeslot = (length) => `<h4 class="date__time-slot">${length}</h4>`;
  const type = (type) => `<h4 class="date__lesson-type">${type}</h4>`;
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

  calendarDates.innerHTML = html;
}

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar(currentDate);
}

// Initial render
renderCalendar(currentDate);
