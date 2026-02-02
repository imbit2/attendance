/* ============================
   INITIAL SETUP ON PAGE LOAD
============================ */

document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("attendanceDate");

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Set default value = today
  dateInput.value = today;

  // Restrict max date to today (no future date allowed)
  dateInput.max = today;

  // Load today's attendance on page load
  loadAttendance(today);

  // Load attendance when user changes date
  dateInput.addEventListener("change", () => {
    loadAttendance(dateInput.value);
  });
});

/* ============================
   LOAD ATTENDANCE TABLE
============================ */

function loadAttendance(date) {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const history = JSON.parse(localStorage.getItem("attendance_history")) || {};

  const dayData = history[date] || {};
  const tbody = document.getElementById("attendanceTableBody");
  tbody.innerHTML = "";

  students.forEach(student => {
    const record = dayData[student.id];

    let inTime = "-";
    let outTime = "-";
    let status = "Absent";

    if (record) {
      status = record.status || "Present";
      inTime = record.scans?.[0] || "-";
      outTime = record.scans?.[1] || "-";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name || "-"}</td>
      <td>${inTime}</td>
      <td>${outTime}</td>
      <td>${status}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ============================
   EXPORT TO EXCEL (CSV)
============================ */

function exportExcel() {
  const date = document.getElementById("attendanceDate").value;

  const students = JSON.parse(localStorage.getItem("students")) || [];
  const history = JSON.parse(localStorage.getItem("attendance_history")) || {};
  const dayData = history[date] || {};

  let csv = "Student ID,Name,In Time,Out Time,Status\n";

  students.forEach(student => {
    const record = dayData[student.id];

    let inTime = record?.scans?.[0] || "-";
    let outTime = record?.scans?.[1] || "-";
    let status = record ? record.status || "Present" : "Absent";

    csv += `${student.id},${student.name || ""},${inTime},${outTime},${status}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Attendance_${date}.csv`;
  link.click();
}
