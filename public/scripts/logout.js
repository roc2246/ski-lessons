document.getElementById("logoutBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  try {
    await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, 
      },
    });
  } catch (err) {
    console.error("Logout request failed:", err);
  }

  localStorage.removeItem("token");
  window.location.href = "/index.html";
});
