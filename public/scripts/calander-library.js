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

export function getCalendarContext(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  return {
    year,
    month,
    firstDay: new Date(year, month, 1).getDay(),
    daysInMonth: new Date(year, month + 1, 0).getDate(),
    monthNames: [
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
    ],
    dom: {
      monthYear: document.getElementById("monthYear"),
      calendarDates: document.getElementById("calendarDates"),
    },
  };
}

export function createEle() {
  return {
    timeslot: (length) => `<h4 class="date__time-slot">${length}</h4>`,
    type: (type) => `<span class="date__lesson-type">${type}</span>`,
    dayCont: (day) => `<h3 class="date__day">${day}</h3>`,
    addLesson: () => `<button class="addLesson">Add Lesson</button>`,
  };
}

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
    console.log(data);
    if (!response.ok) {
      throw new Error(data?.message || "Failed to assign lesson");
    }

    console.log("Lesson assignment updated:", data.lesson);
    return data.lesson;
  } catch (error) {
    console.error("Error assigning lesson:", error.message);
    throw error;
  }
}

export function blankDays(firstDay, dom) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < firstDay; i++) {
    fragment.appendChild(document.createElement("div"));
  }
  dom.calendarDates.appendChild(fragment);
}

export async function addLessonBtn(lessons) {
  const lessonBtn = document.getElementsByClassName("addLesson");
  for (let x = 0; x < lessonBtn.length; x++) {
    lessonBtn[x].addEventListener("click", async () => {
      await assignLesson(lessons[x]._id, token);
    });
  }
}
