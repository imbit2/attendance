function load() {
  let q = document.getElementById("q").value.toLowerCase();
  let students = JSON.parse(localStorage.getItem("students") || "[]");
  let t = document.getElementById("t");

  t.innerHTML = "<tr><th>ID</th><th>Name</th></tr>";
  students.filter(s =>
    s.id.toLowerCase().includes(q) ||
    s.name.toLowerCase().includes(q)
  ).forEach(s => {
    t.innerHTML += `<tr>
      <td onclick="openEdit('${s.id}')">${s.id}</td>
      <td>${s.name}</td>
    </tr>`;
  });
}

function clearSearch() {
  q.value = "";
  load();
}

function openEdit(id) {
  location.href = "generate_student_qr.html?id=" + id;
}

load();
