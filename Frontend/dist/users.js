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
exports.setupUsers = setupUsers;
function setupUsers(token) {
    const usersTable = document.getElementById("users-table");
    loadUsers(token);
}
function loadUsers(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const usersTable = document.getElementById("users-table");
        try {
            const response = yield fetch("http://localhost:3000/users", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to load users");
            }
            const users = yield response.json();
            const tbody = usersTable.querySelector("tbody");
            tbody.innerHTML = "";
            users.forEach((user) => {
                const row = document.createElement("tr");
                row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>
          <button class="btn btn-sm">Edit</button>
          <button class="btn btn-sm btn-outline">Delete</button>
        </td>
      `;
                tbody.appendChild(row);
            });
        }
        catch (error) {
            console.error("Error loading users:", error);
        }
    });
}
