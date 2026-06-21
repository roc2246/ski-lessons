export async function isAdmin(token) {
  if (!token) {
    throw new Error("No auth token provided");
  }

  try {
    const res = await fetch("/api/users/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to retrieve admin status");
    }

    return data.credentials.admin;
  } catch (error) {
    console.error("Error checking admin status:", error);
    throw error;
  }
}

export async function getUsers() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token provided");
  }

  try {
    const res = await fetch("/api/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to retrieve users");
    }

    if (!data || !Array.isArray(data.users)) {
      throw new Error("Malformed response: missing users field");
    }

    return data.users;
  } catch (error) {
    console.error("Error retrieving users:", error);
    throw error;
  }
}

export async function lessonCreate(newLesson) {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No auth token provided");
  }

  try {
    const lessonData = {
      ...newLesson,
      assignedTo:
        newLesson.assignedTo === "None" || newLesson.assignedTo === ""
          ? null
          : newLesson.assignedTo,
      date: newLesson.date,
    };

    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ lessonData }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("Lesson created successfully:", data.lesson);
      return data.lesson;
    } else {
      console.error("Lesson creation failed:", data);
      throw new Error(data.message || "Failed to create lesson");
    }
  } catch (error) {
    console.error("Error during lesson creation:", error);
    throw error;
  }
}
