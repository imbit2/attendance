document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("attendanceDate").value = today;
  loadAttendance();
});

/* LOAD ATTENDANCE FOR SELECTED DATE */
function loadAttendance() {
  const date = document.getElementById("attendanceDate").value;

  const attendance = JSON.parse(localStorage.getItem("attendance") || "{}");
  const students = JSON.parse(localStorage.getItem("students") || "[]");

  const tbody = document.getElementById("attendanceTableBody");
  tbody.innerHTML = "";

  if (!attendance[date]) {
    tbody.innerHTML = `<tr><td colspan="3">No attendance found</td></tr>`;
    return;
  }

  students.forEach(student => {
    if (attendance[date][student.id]) {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${student.id}</td>
        <td>${student.name || "-"}</td>
        <td>${attendance[date][student.id]}</td>
      `;

      tbody.appendChild(tr);
    }
  });
}

/* AUTO LOAD WHEN DATE CHANGES */
document.getElementById("attendanceDate").addEventListener("change", loadAttendance);

/* EXPORT CURRENT DATE TO EXCEL (CSV) */
function exportExcel() {
  const date = document.getElementById("attendanceDate").value;
  const attendance = JSON.parse(localStorage.getItem("attendance") || "{}");
  const students = JSON.parse(localStorage.getItem("students") || "[]");

  if (!attendance[date]) {
    alert("No attendance to export");
    return;
  }

  let csv = "Student ID,Name,Status\n";

  students.forEach(student => {
    if (attendance[date][student.id]) {
      csv += `${student.id},${student.name || ""},${attendance[date][student.id]}\n`;
    }
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `Attendance_${date}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
