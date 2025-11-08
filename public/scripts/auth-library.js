export async function login(username, password) {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "/instructor.html";
    } else {
      alert(data.error || "Login failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

export async function logout(token) {
  try {
    await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.removeItem("token");
  } catch (err) {
    console.error("Logout request failed:", err);
  }
}

export async function register(username, password) {
    try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    res.ok ? alert(`${username} registered`) : alert(data.error);
  } catch (error) {
    console.error("Error during login:", error);
  }
}
