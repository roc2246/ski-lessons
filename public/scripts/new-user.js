document.querySelectorAll("form")[1].addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("new-username").value;
  const password = document.getElementById("new-password").value;
  console.log("TEST");
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("Login successful:", data);
      // Store token if needed
      localStorage.setItem("token", data.token);
      alert(`${username} registered`);
    } else {
      alert(data.error || "Login failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
});
