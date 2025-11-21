export async function isAdmin(token) {
  if (!token) {
    throw new Error("No auth token provided");
  }

  try {
    const res = await fetch("/api/is-admin", {
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

    return data.credentials.admin
  } catch (error) {
    console.error("Error checking admin status:", error);
    throw error;
  }
}

export async function lessonCreate(newLesson) {
  try {
    const res = await fetch("/api/create-lesson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lessonData: newLesson }),
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
