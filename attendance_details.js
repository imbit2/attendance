document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("attendanceDate");

  const today = new Date().toISOString().split("T")[0];
  dateInput.value = today;

  loadAttendance(today);

  dateInput.addEventListener("change", () => {
    loadAttendance(dateInput.value);
  });
});

function loadAttendance(date) {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const attendance = JSON.parse(localStorage.getItem("attendance")) || {};
  const tbody = document.getElementById("attendanceTableBody");

  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No students found</td></tr>`;
    return;
  }

  const dayAttendance = attendance[date] || {};

  let rows = students.map(s => {
    const record = dayAttendance[s.id];
    const scans = record?.scans || [];

    return {
      id: s.id,
      name: s.name || "-",
      inTime: scans[0] || "-",
      outTime: scans[1] || "-",
      status: scans.length > 0 ? "Present" : "Absent"
    };
  });

  rows.sort((a, b) => {
  // Present first
  if (a.status !== b.status) {
    return a.status === "Present" ? -1 : 1;
  }

  // Both Absent → keep order
  if (a.status === "Absent") return 0;

  // Both Present → sort by IN time
  return a.inTime.localeCompare(b.inTime);
});

  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.name}</td>
      <td>${r.inTime}</td>
      <td>${r.outTime}</td>
      <td style="font-weight:700;color:${r.status === "Present" ? "#27ae60" : "#e74c3c"}">
        ${r.status}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ===== EXPORT TO EXCEL (IN / OUT INCLUDED) ===== */
function exportExcel() {
  const date = document.getElementById("attendanceDate").value;
  const attendance = JSON.parse(localStorage.getItem("attendance")) || {};
  const students = JSON.parse(localStorage.getItem("students")) || [];

  let csv = "Student ID,Name,IN,OUT,Status\n";

  students.forEach(s => {
    const scans = attendance[date]?.[s.id]?.scans || [];
    const inTime = scans[0] || "";
    const outTime = scans[1] || "";
    const status = scans.length > 0 ? "Present" : "Absent";

    csv += `${s.id},${s.name || ""},${inTime},${outTime},${status}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Attendance_${date}.csv`;
  link.click();
}
