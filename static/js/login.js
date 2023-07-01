const form = document.querySelector(".form");
const usernameInput = document.querySelector(".username-input");
const passwordInput = document.querySelector(".password-input");
const errorEl = document.querySelector(".error-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorEl.classList.add("hidden");

  const data = {
    username: usernameInput.value,
    password: passwordInput.value,
  };

  const raw = await fetch("http://localhost:3000/login", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const res = await raw.json();

  if (res === -1) {
    errorEl.textContent = "User not found!";
    errorEl.classList.remove("hidden");
    return false;
  }

  window.location.href = "http://localhost:3000/login";
});
