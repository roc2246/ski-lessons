// src/utils/auth-library.js

// --------------------- LOGIN ---------------------
export async function login(username, password) {
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      alert(data?.error || "Login failed"); // match test
      return null;
    }

    if (data?.token) {
      localStorage.setItem("token", data.token);
      if (typeof globalThis !== "undefined" && globalThis.location) {
        globalThis.location.href = "/instructor";
      }
    }

    return data;
  } catch (error) {
    console.error("Error during login:", error);
    alert(error.message || "Something went wrong during login");
  }
}


// --------------------- LOGOUT ---------------------
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

// --------------------- REGISTER ---------------------
export async function register(username, password, admin) {
  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, admin }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`${username} registered`);
    } else {
      alert(data.error || "Registration failed");
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}

// --------------------- SELF DELETE ---------------------
export async function selfDeleteFrontend(token) {
  if (
    !globalThis.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
  ) {
    return;
  }

  try {
    const res = await fetch("/api/self-delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.removeItem("token");
      alert(data.message || "Account deleted successfully"); // matches test
      globalThis.location.href = "/index.html";
    } else {
      alert(data.message || "Failed to delete account");
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    alert("An unexpected error occurred. Please try again");
  }
}
