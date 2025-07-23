 document
        .getElementById("logoutBtn")
        .addEventListener("click", async () => {
          const token = localStorage.getItem("token");

          try {
            await fetch("/api/logout", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Optional: if your backend expects auth
              },
            });
          } catch (err) {
            console.error("Logout request failed:", err);
          }

          // Clear token and redirect regardless of logout result
          localStorage.removeItem("token");
          window.location.href = "/index.html";
        });