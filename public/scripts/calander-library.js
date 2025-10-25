// ================================
// Calendar Library
// ================================

/**
 * Fetch all lessons from the API
 */
export async function getLessons() {
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

/**
 * Preprocess lessons to add _year, _month, _day, _startDate
 */
export function preprocessLessons(lessons) {
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

/**
 * Return calendar context including month, year, firstDay, daysInMonth, DOM references
 */
export function getCalendarContext(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return {
    year,
    month,
    firstDay: new Date(year, month, 1).getDay(),
    daysInMonth: new Date(year, month + 1, 0).getDate(),
    monthNames: [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ],
    dom: {
      monthYear: document.getElementById("monthYear"),
      calendarDates: document.getElementById("calendarDates"),
    },
  };
}

/**
 * Create HTML snippets for calendar elements
 */
export function createEle() {
  return {
    timeslot: (length) => `<h4 class="date__time-slot">${length}</h4>`,
    type: (type) => `<span class="date__lesson-type">${type}</span>`,
    dayCont: (day) => `<h3 class="date__day">${day}</h3>`,
    addLesson: () => `<button class="addLesson">Add Lesson</button>`,
  };
}

/**
 * Fill calendar with blank days for alignment
 */
export function blankDays(firstDay, dom) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < firstDay; i++) {
    fragment.appendChild(document.createElement("div"));
  }
  dom.calendarDates.appendChild(fragment);
}

/**
 * Assign lesson via API
 */
export async function assignLesson(lessonId, token) {
  try {
    const response = await fetch(`/api/lessons/${lessonId}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Failed to assign lesson");
    console.log("Lesson assignment updated:", data.lesson);
    return data.lesson;
  } catch (error) {
    console.error("Error assigning lesson:", error.message);
    throw error;
  }
}

/**
 * Add click listeners to all "Add Lesson" buttons
 */
export async function addLessonBtn(lessons) {
  const token = localStorage.getItem("token");
  const lessonBtn = document.getElementsByClassName("addLesson");
  for (let x = 0; x < lessonBtn.length; x++) {
    lessonBtn[x].addEventListener("click", async () => {
      await assignLesson(lessons[x]._id, token);
    });
  }
}

/**
 * Generic calendar renderer
 * 
 * @param {Object} options
 * options.date - Date object to render
 * options.lessonFilter - function(lesson) => boolean
 * options.extraDayHTML - function(lesson) => string
 * options.onComplete - function(filteredLessons)
 */
export async function renderCalendar({
  date,
  lessonFilter = () => true,
  extraDayHTML = () => "",
  onComplete = () => {},
}) {
  const context = getCalendarContext(date);
  const { year, month, firstDay, daysInMonth, monthNames, dom } = context;

  dom.monthYear.textContent = `${monthNames[month]} ${year}`;
  dom.calendarDates.innerHTML = "";

  // Add blank days for alignment
  blankDays(firstDay, dom);

  // Fetch and preprocess lessons
  const lessons = await getLessons();
  const preprocessedLessons = preprocessLessons(lessons);
  const filteredLessons = preprocessedLessons
    .filter((lesson) => lesson._month === month + 1 && lesson._year === year)
    .filter(lessonFilter)
    .sort((a, b) => a._startDate - b._startDate);

  // Fill calendar with lesson data
  let lessonCounter = 0;
  let html = "";

  for (let day = 1; day <= daysInMonth; day++) {
    let dayHTML = `<div class="date">${createEle().dayCont(day)}`;

    while (
      lessonCounter < filteredLessons.length &&
      filteredLessons[lessonCounter]._day === day
    ) {
      const lesson = filteredLessons[lessonCounter];
      dayHTML +=
        createEle().timeslot(lesson.timeLength) +
        createEle().type(lesson.type) +
        extraDayHTML(lesson);
      lessonCounter++;
    }

    dayHTML += "</div>";
    html += dayHTML;
  }

  dom.calendarDates.innerHTML = html;

  // Call optional callback
  onComplete(filteredLessons);
}
