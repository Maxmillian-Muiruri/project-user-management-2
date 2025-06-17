"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuth = setupAuth;
function setupAuth() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const showRegisterLink = document.getElementById("show-register");
    const showLoginLink = document.getElementById("show-login");
    // Toggle between login and register forms
    showRegisterLink.addEventListener("click", (e) => {
        var _a, _b;
        e.preventDefault();
        (_a = document.getElementById("login-section")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        (_b = document.getElementById("register-section")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    });
    showLoginLink.addEventListener("click", (e) => {
        var _a, _b;
        e.preventDefault();
        (_a = document.getElementById("register-section")) === null || _a === void 0 ? void 0 : _a.classList.add("hidden");
        (_b = document.getElementById("login-section")) === null || _b === void 0 ? void 0 : _b.classList.remove("hidden");
    });
    // Login form submission
    loginForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password")
            .value;
        try {
            const response = yield fetch("http://localhost:3000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                throw new Error("Login failed");
            }
            const data = yield response.json();
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            // Get user info
            const userResponse = yield fetch("http://localhost:3000/auth/me", {
                headers: {
                    Authorization: `Bearer ${data.accessToken}`,
                },
            });
            if (userResponse.ok) {
                const userData = yield userResponse.json();
                localStorage.setItem("userRole", userData.role);
                localStorage.setItem("userName", userData.name);
                window.location.reload();
            }
        }
        catch (error) {
            alert("Login failed. Please check your credentials.");
            console.error(error);
        }
    }));
    // Register form submission
    registerForm.addEventListener("submit", (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        const name = document.getElementById("reg-name")
            .value;
        const email = document.getElementById("reg-email")
            .value;
        const password = document.getElementById("reg-password").value;
        const confirmPassword = document.getElementById("reg-confirm-password").value;
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            const response = yield fetch("http://localhost:3000/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, confirmPassword }),
            });
            if (!response.ok) {
                throw new Error("Registration failed");
            }
            const data = yield response.json();
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("userRole", "USER");
            localStorage.setItem("userName", name);
            window.location.reload();
        }
        catch (error) {
            alert("Registration failed. Please try again.");
            console.error(error);
        }
    }));
}
