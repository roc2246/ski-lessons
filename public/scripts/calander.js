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
  const filterLessons = lessons.filter(
    (lesson) => lesson.date.includes(month + 1) && lesson.date.includes(year)
  );

  // Fills lesson data into instructor calander
  let day = 1;
  let lessonCounter = 0;
  while (day < daysInMonth) {
    if (
      filterLessons[lessonCounter] &&
      filterLessons[lessonCounter].date.includes(`-${day}-`)
    ) {
      calendarDates.innerHTML += `<div class="date">
    <h3 class="date__heading">${day}</h3>
    <h4 class="date__time-slot>${filterLessons[lessonCounter].timeLength}</h4>  
    <h4 class="date__lesson-type">${filterLessons[lessonCounter].type}</h4>  
    </div>`;
      lessonCounter++;
    } else {
      calendarDates.innerHTML += `<div class="date">
    <h3 class="date__heading">${day}</h3>
    </div>`;
    }
    day++;
  }
}

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar(currentDate);
}

// Initial render
renderCalendar(currentDate);
