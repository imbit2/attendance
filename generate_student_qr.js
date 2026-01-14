let students = JSON.parse(localStorage.getItem("students") || "[]");

// generate next ID
let next = students.length + 1;
let sid = "STU" + String(next).padStart(4, "0");

// fill ID
id.value = sid;

// show data on card
cardId.innerText = sid;

// generate QR
qr.innerHTML = "";
new QRCode(qr, {
  text: sid,
  width: 90,
  height: 90
});

// live update card
name.addEventListener("input", () => cardName.innerText = name.value);
dob.addEventListener("change", () => cardDob.innerText = dob.value);

// save student
function saveStudent() {
  students.push({
    id: sid,
    name: name.value || "",
    father: father.value || "",
    dob: dob.value || "",
    address: address.value || ""
  });

  localStorage.setItem("students", JSON.stringify(students));
  alert("Student Saved Successfully");
}

// print pvc card
function printCard() {
  window.print();
}
