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

      function renderCalendar(date) {
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

        // Add the actual dates
        for (let day = 1; day <= daysInMonth; day++) {
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          const dateClass = isToday ? "date today" : "date";

          calendarDates.innerHTML += `<div class="${dateClass}">${day}</div>`;
        }
      }

      function changeMonth(offset) {
        currentDate.setMonth(currentDate.getMonth() + offset);
        renderCalendar(currentDate);
      }

      // Initial render
      renderCalendar(currentDate);