const form = document.querySelector(".form");
const usernameInput = document.querySelector(".username-input");
const emailInput = document.querySelector(".email-input");
const passwordInput = document.querySelector(".password-input");
const confirmPasswordInput = document.querySelector(".confirm-password-input");
const errorEl = document.querySelector(".error-msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  errorEl.classList.add("hidden");

  if (passwordInput.value !== confirmPasswordInput.value) {
    errorEl.textContent = "Passwords do not match!";
    errorEl.classList.remove("hidden");
    return false;
  }

  const data = {
    username: usernameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
  };

  const raw = await fetch("http://localhost:3000/register", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const res = await raw.json();

  if (res === -1) {
    errorEl.textContent = "Username or Email is already taken!";
    errorEl.classList.remove("hidden");
    return false;
  }

  window.location.href = "http://localhost:3000/login";
});
