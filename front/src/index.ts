const BASE_URL = "http://localhost:3000";

// DOM Elements
const loginForm = document.getElementById("login-form") as HTMLFormElement;
const registerForm = document.getElementById("register-form") as HTMLFormElement;
const showLoginBtn = document.getElementById("show-login") as HTMLButtonElement;
const showRegisterBtn = document.getElementById("show-register") as HTMLButtonElement;

// Toggle Forms
showLoginBtn.addEventListener("click", () => {
  loginForm.style.display = "flex";
  registerForm.style.display = "none";
});

showRegisterBtn.addEventListener("click", () => {
  loginForm.style.display = "none";
  registerForm.style.display = "flex";
});

// Handle Login
loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = (document.getElementById("login-email") as HTMLInputElement).value;
  const password = (document.getElementById("login-password") as HTMLInputElement).value;

  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);

    // Redirect
    window.location.href = "userdashboard.html";
  } catch (err) {
    alert("Invalid login credentials.");
    console.error(err);
  }
});

// Handle Registration
registerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = (document.getElementById("register-name") as HTMLInputElement).value;
  const email = (document.getElementById("register-email") as HTMLInputElement).value;
  const password = (document.getElementById("register-password") as HTMLInputElement).value;

  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) throw new Error("Registration failed");
    alert("Registration successful. Please log in.");
    showLoginBtn.click(); // Switch to login
  } catch (err) {
    alert("Registration failed. Email might already be used.");
    console.error(err);
  }
});
