let students = JSON.parse(localStorage.getItem("students") || "[]");

// generate next ID safely
let next = students.length + 1;
let sid = "STU" + String(next).padStart(4, "0");
id.value = sid;

function saveStudent() {
  // collect values FIRST
  let student = {
    id: sid,
    name: name.value.trim(),
    father: father.value.trim(),
    dob: dob.value,
    address: address.value.trim()
  };

  // save to storage
  students.push(student);
  localStorage.setItem("students", JSON.stringify(students));

  // show PVC card
  document.getElementById("printCard").style.display = "block";

  // fill PVC card details
  cardId.innerText = student.id;
  cardName.innerText = student.name;
  cardFather.innerText = student.father;
  cardDob.innerText = student.dob;
  cardAddress.innerText = student.address;

  // generate QR NOW (after save)
  qr.innerHTML = "";
  new QRCode(qr, {
    text: student.id,
    width: 90,
    height: 90
  });

  alert("Student saved & QR generated");
}

function printPVC() {
  if (document.getElementById("printCard").style.display === "none") {
    alert("Please save student first");
    return;
  }
  window.print();
}
