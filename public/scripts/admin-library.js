export async function lessonCreate(newLesson, token) {
  if (!token) {
    throw new Error("No auth token provided");
  }
  try {
    const res = await fetch("/api/create-lesson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
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
