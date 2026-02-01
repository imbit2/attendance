let generatedIds = [];

/* =====================================================
      GENERATE BULK QR
====================================================== */
function generateBulk() {
  const count = parseInt(document.getElementById("qrCount").value);
  if (!count) {
    alert("Please select quantity");
    return;
  }

  let last = parseInt(localStorage.getItem("lastPTCId") || "0");

  const qrGrid = document.getElementById("qrGrid");
  qrGrid.innerHTML = "";
  generatedIds = [];

  for (let i = 1; i <= count; i++) {
    const newNum = last + i;
    const studentId = "PTC" + String(newNum).padStart(4, "0");

    generatedIds.push(studentId);

    /* BUILD QR CARD */
    const box = document.createElement("div");
    box.className = "qr-box";

    const idDiv = document.createElement("div");
    idDiv.className = "qr-id";
    idDiv.innerText = studentId;

    const qrDiv = document.createElement("div");
    qrDiv.className = "qr-container";

    box.appendChild(idDiv);
    box.appendChild(qrDiv);
    qrGrid.appendChild(box);

    new QRCode(qrDiv, {
      text: studentId,
      width: 80,
      height: 80,
      correctLevel: QRCode.CorrectLevel.H
    });
  }

  /* Save last ID pointer */
  localStorage.setItem("lastPTCId", last + count);

  /* Save student records */
  saveGeneratedIdsToStudents(generatedIds);
}

/* =====================================================
       EXPORT PNG
====================================================== */
async function exportPNG() {
  const qrGrid = document.getElementById("qrGrid");

  if (!qrGrid || qrGrid.children.length === 0) {
    alert("Generate QR codes first");
    return;
  }

  const canvas = await html2canvas(qrGrid, {
    backgroundColor: "#ffffff",
    scale: 2
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "PTC_Bulk_QR.png";
  link.click();
}

/* =====================================================
      EXPORT PDF
====================================================== */
async function exportPDF() {
  if (generatedIds.length === 0) {
    alert("Generate QR codes first");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const cards = document.querySelectorAll(".qr-box");

  const cardW = 21;
  const cardH = 28;
  const qrSize = 16;

  const marginX = 10;
  const marginY = 10;
  const gapX = 4;
  const gapY = 6;
  const maxCols = 7;

  let x = marginX;
  let y = marginY;
  let col = 0;

  cards.forEach((card, idx) => {
    const qrCanvas = card.querySelector("canvas, img");
    if (!qrCanvas) return;

    const qrImg =
      qrCanvas.tagName === "CANVAS"
        ? qrCanvas.toDataURL("image/png")
        : qrCanvas.src;

    const idText = generatedIds[idx];

    pdf.setLineWidth(0.2);
    pdf.rect(x, y, cardW, cardH);

    pdf.setFontSize(8);
    pdf.text(idText, x + cardW / 2, y + 5, { align: "center" });

    pdf.addImage(
      qrImg,
      "PNG",
      x + (cardW - qrSize) / 2,
      y + 8,
      qrSize,
      qrSize
    );

    col++;
    x += cardW + gapX;

    if (col === maxCols) {
      col = 0;
      x = marginX;
      y += cardH + gapY;

      if (y + cardH > 280) {
        pdf.addPage();
        y = marginY;
      }
    }
  });

  pdf.save("PTC_QR_A4_Print.pdf");
}

/* =====================================================
      SAVE NEW IDS TO STUDENT LIST
      (MOST IMPORTANT FIX!)
====================================================== */
function saveGeneratedIdsToStudents(ids) {
  let students = JSON.parse(localStorage.getItem("students")) || [];

  const existingIds = new Set(students.map(s => s.id));

  ids.forEach(id => {
    if (!existingIds.has(id)) {
      students.push({
        id,
        name: "",
        guardian: "",
        dob: "",
        address: "",
        belt: "",
        phone: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  });

  /* 💥 IMPORTANT FIX:
     Avoid corrupted student objects by validating all records */
  students = students.map(s => ({
    id: s.id || "",
    name: s.name || "",
    guardian: s.guardian || "",
    dob: s.dob || "",
    address: s.address || "",
    belt: s.belt || "",
    phone: s.phone || "",
    createdAt: s.createdAt || "",
    updatedAt: new Date().toISOString()
  }));

  localStorage.setItem("students", JSON.stringify(students));
}
