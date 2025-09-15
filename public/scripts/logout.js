import * as lib from "./auth-library.js";
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");
  lib.logout(token);
  window.location.href = "/index.html";
});
