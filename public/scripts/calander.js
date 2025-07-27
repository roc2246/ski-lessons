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
  const year = date.getFullYear();
  const month = date.getMonth();
  const today = new Date();

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun, 6 = Sat
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Set header
  monthYear.textContent = `${monthNames[month]} ${year}`;

  // Clear previous days
  calendarDates.innerHTML = "";

  // Add blank slots before the first day
  for (let i = 0; i < firstDay; i++) {
    calendarDates.innerHTML += `<div></div>`;
  }

  // Fetch lessons
  const minCall = 1;
  let callCount = 0;
  let lessons;
  while (callCount < minCall) {
    lessons = await getLessons();
    callCount++;
  }

  const filterMonth = month.toString().length === 1 ? `0${month + 1}-` : `${month + 1}-`
  const filterLessons = lessons.filter((lesson) =>
    lesson.date.includes(filterMonth) &&
    lesson.date.includes(year)
  );

  let day = 1;
  let lessonCounter = 0;
  while (day < daysInMonth) {
    if (
      filterLessons[lessonCounter] &&
      filterLessons[lessonCounter].date.includes(`-${day}-`)
    ) {
      calendarDates.innerHTML += `<div class="date">
    <h3 class="date__heading">${day}</h3>
    <h4>${filterLessons[lessonCounter].timeLength}</h4>  
    <h4>${filterLessons[lessonCounter].type}</h4>  
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
