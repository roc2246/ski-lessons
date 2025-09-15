import * as lib from "./auth-library.js";
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  lib.login(username, password);
});
