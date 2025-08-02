async function assignLesson(lessonId, token) {
  try {
    const response = await fetch(`/api/lessons/${lessonId}/assign`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
console.log(data)
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

(async () => await assignLesson("687ceb9ed32791c6f61af55e", token))();
