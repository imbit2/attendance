// ===============================
// ATTENDANCE DETAILS PAGE
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("attendanceDate");

  const today = new Date().toLocaleDateString("en-CA");
  dateInput.value = today;

  loadAttendance(today);

  dateInput.addEventListener("change", () => {
    loadAttendance(dateInput.value);
  });
});

// ===============================
// LOAD ATTENDANCE FOR A DATE
// ===============================
function loadAttendance(date) {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const attendance = JSON.parse(localStorage.getItem("attendance")) || {};
  const tbody = document.getElementById("attendanceTableBody");

  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5">No students found</td></tr>`;
    return;
  }

  const dayData = attendance[date] || {};

  let rows = students.map(s => {
    const rec = dayData[s.id] || { scans: [], status: "Absent" };
    const scans = rec.scans || [];

    return {
      id: s.id,
      name: s.name || "-",
      inTime: scans[0] || "-",
      outTime: scans[1] || "-",
      status: scans.length > 0 ? "Present" : "Absent"
    };
  });

  // Sort: Present first → IN time
  rows.sort((a, b) => {
    if (a.status !== b.status)
      return a.status === "Present" ? -1 : 1;

    if (a.status === "Absent") return 0;

    return a.inTime.localeCompare(b.inTime);
  });

  // Render table
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

// ===============================
// EXPORT EXCEL (CSV)
// ===============================
function exportExcel() {
  const date = document.getElementById("attendanceDate").value;
  const attendance = JSON.parse(localStorage.getItem("attendance")) || {};
  const students = JSON.parse(localStorage.getItem("students")) || {};

  let csv = "Student ID,Name,IN,OUT,Status\n";

  students.forEach(s => {
    const rec = attendance[date]?.[s.id] || { scans: [] };
    const scans = rec.scans || [];

    csv += [
      s.id,
      s.name || "",
      scans[0] || "",
      scans[1] || "",
      scans.length > 0 ? "Present" : "Absent"
    ].join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Attendance_${date}.csv`;
  link.click();
}
