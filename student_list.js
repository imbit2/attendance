function load() {
  const q = document.getElementById("q").value.toLowerCase();
  const students = JSON.parse(localStorage.getItem("students") || "[]");
  const table = document.getElementById("t");

  table.innerHTML = `
    <tr>
      <th>Student ID</th>
      <th>Student Name</th>
    </tr>
  `;

  students
    .filter(s =>
      s.id.toLowerCase().includes(q) ||
      (s.name || "").toLowerCase().includes(q)
    )
    .forEach(s => {
      table.innerHTML += `
        <tr>
          <td style="color:#3498db;cursor:pointer;font-weight:600"
              onclick="openEdit('${s.id}')">
              ${s.id}
          </td>
          <td>${s.name || "-"}</td>
        </tr>
      `;
    });
}

function openEdit(id) {
  window.location.href = "edit_student.html?id=" + encodeURIComponent(id);
}

function clearSearch() {
  document.getElementById("q").value = "";
  load();
}

// Load on page open
load();
