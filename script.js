/* =========================================================
   STUDENT HELPERS
========================================================= */
function getStudents() {
  return JSON.parse(localStorage.getItem("students")) || [];
}

function saveStudents(data) {
  localStorage.setItem("students", JSON.stringify(data));
}

/* =========================================================
   ATTENDANCE HELPERS (NEW SYSTEM)
========================================================= */

// today's date in YYYY-MM-DD
function today() {
  return new Date().toLocaleDateString("en-CA");
}

/* =========================================================
   AUTO-MARK ABSENT FOR TODAY (RUNS ON PAGE LOAD)
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  autoStoreAbsentForToday();
});

function autoStoreAbsentForToday() {
  const date = today();

  let students = getStudents();
  let todayAtt = JSON.parse(localStorage.getItem("attendance_today")) || {};
  let history = JSON.parse(localStorage.getItem("attendance_history")) || {};

  if (!history[date]) history[date] = {};

  // loop all students with a valid name
  students.forEach(student => {
    if (!student.name || student.name.trim() === "") return;

    // If student not already added today → mark Absent
    if (!todayAtt[student.id]) {
      todayAtt[student.id] = {
        scans: [],          // no scans yet
        status: "Absent",
        inTime: "",
        outTime: ""
      };

      history[date][student.id] = todayAtt[student.id];
    }
  });

  // Save back
  localStorage.setItem("attendance_today", JSON.stringify(todayAtt));
  localStorage.setItem("attendance_history", JSON.stringify(history));
}

/* =========================================================
   FIX SAFARI / MOBILE BACK-CACHE
========================================================= */
window.addEventListener("pageshow", event => {
  if (event.persisted) window.location.reload();
});
