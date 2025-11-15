import * as lib from "./auth-library.js";
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("new-username").value;
  const password = document.getElementById("new-password").value;
  const admin = document.getElementById("admin").checked;
  lib.register(username, password, admin);
});
