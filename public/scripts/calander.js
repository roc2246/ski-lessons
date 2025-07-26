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

    const data = await response.json();
    console.log("Lessons:", data.lessons);
    return data.lessons;
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
  await getLessons()

  // Add the actual dates
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    const dateClass = isToday ? "date today" : "date";

    calendarDates.innerHTML += `<div class="${dateClass}">
    <h3 class="date__heading">${day}</h3>
    
    </div>`;
  }
}

function changeMonth(offset) {
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar(currentDate);
}

// Initial render
renderCalendar(currentDate);
