export function setupAuth() {
  const loginForm = document.getElementById("login-form") as HTMLFormElement;
  const registerForm = document.getElementById(
    "register-form"
  ) as HTMLFormElement;
  const showRegisterLink = document.getElementById(
    "show-register"
  ) as HTMLAnchorElement;
  const showLoginLink = document.getElementById(
    "show-login"
  ) as HTMLAnchorElement;

  // Toggle between login and register forms
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("login-section")?.classList.add("hidden");
    document.getElementById("register-section")?.classList.remove("hidden");
  });

  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("register-section")?.classList.add("hidden");
    document.getElementById("login-section")?.classList.remove("hidden");
  });

  // Login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("login btn hit");

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Get user info
      const userResponse = await fetch("http://localhost:3000/auth/me", {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        localStorage.setItem("userRole", userData.role);
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userEmail", userData.email);
        window.location.reload();
      }
    } catch (error) {
      alert("Login failed. Please check your credentials.");
      console.error(error);
    }
  });

  // Register form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (document.getElementById("reg-name") as HTMLInputElement)
      .value;
    const email = (document.getElementById("reg-email") as HTMLInputElement)
      .value;
    const password = (
      document.getElementById("reg-password") as HTMLInputElement
    ).value;
    const confirmPassword = (
      document.getElementById("reg-confirm-password") as HTMLInputElement
    ).value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("userRole", "USER");
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);

      window.location.reload();
    } catch (error) {
      alert("Registration failed. Please try again.");
      console.error(error);
    }
  });
}
