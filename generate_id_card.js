const students = JSON.parse(localStorage.getItem("students") || "[]");
const lastId = localStorage.getItem("lastStudentId");

const student = students.find(s => s.id === lastId);

if (!student) {
  alert("Student not found");
}

document.getElementById("cId").innerText = student.id;
document.getElementById("cName").innerText = student.name;
document.getElementById("cFather").innerText = student.father;
document.getElementById("cDob").innerText = student.dob;
document.getElementById("cAddress").innerText = student.address;

new QRCode(document.getElementById("qrCode"), {
  text: student.id,
  width: 90,
  height: 90
});
