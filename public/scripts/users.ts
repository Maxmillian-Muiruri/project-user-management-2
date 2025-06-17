export function setupUsers(token: string) {
  const usersTable = document.getElementById("users-table") as HTMLTableElement;

  loadUsers(token);
}

async function loadUsers(token: string) {
  const usersTable = document.getElementById("users-table") as HTMLTableElement;

  try {
    const response = await fetch("http://localhost:3000/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to load users");
    }

    const users = await response.json();
    const tbody = usersTable.querySelector("tbody") as HTMLTableSectionElement;

    tbody.innerHTML = "";
    users.forEach((user: any) => {
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
  } catch (error) {
    console.error("Error loading users:", error);
  }
}
