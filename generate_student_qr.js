function generateStudentId() {
  let students = JSON.parse(localStorage.getItem("students") || "[]");
  let next = students.length + 1;
  return "STU" + String(next).padStart(4, "0");
}

document.getElementById("studentId").value = generateStudentId();

function saveStudent() {
  const student = {
    id: document.getElementById("studentId").value,
    name: document.getElementById("studentName").value,
    father: document.getElementById("fatherName").value,
    dob: document.getElementById("dob").value,
    address: document.getElementById("address").value
  };

  if (!student.name) {
    alert("Student name is required");
    return;
  }

  let students = JSON.parse(localStorage.getItem("students") || "[]");
  students.push(student);
  localStorage.setItem("students", JSON.stringify(students));

  localStorage.setItem("lastStudentId", student.id);

  document.getElementById("saveMsg").style.display = "block";
  document.getElementById("generateBtn").style.display = "block";
}

function goToIdCard() {
  window.location.href = "generate_id_card.html";
}
