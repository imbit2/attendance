let students = JSON.parse(localStorage.getItem("students") || "[]");

let next = students.length + 1;
let sid = "STU" + String(next).padStart(4, "0");
id.value = sid;

new QRCode(qr, sid);

function save() {
  students.push({
    id: sid,
    name: name.value || "",
    father: father.value || "",
    dob: dob.value || "",
    address: address.value || ""
  });
  localStorage.setItem("students", JSON.stringify(students));
  alert("Saved");
}
