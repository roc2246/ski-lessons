     document.querySelector("form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

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
            console.log("Login successful:", data);
            // Store token if needed
            localStorage.setItem("token", data.token);
            // Redirect
            window.location.href = "/instructor.html";
          } else {
            alert(data.error || "Login failed");
          }
        } catch (error) {
          console.error("Error during login:", error);
        }
      });