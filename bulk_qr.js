let generatedIds = [];

function generateBulk() {
  const count = parseInt(document.getElementById("qrCount").value);
  if (!count) {
    alert("Please select quantity");
    return;
  }

  let last = localStorage.getItem("lastPTCId");
  last = last ? parseInt(last) : 0;

  const qrGrid = document.getElementById("qrGrid");
  qrGrid.innerHTML = "";
  generatedIds = [];

  for (let i = 1; i <= count; i++) {
    const num = last + i;
    const studentId = "PTC" + String(num).padStart(4, "0");
    generatedIds.push(studentId);

    const box = document.createElement("div");
    box.className = "qr-box";

    const idDiv = document.createElement("div");
    idDiv.className = "qr-id";
    idDiv.innerText = studentId;

    const qrDiv = document.createElement("div");

    box.appendChild(idDiv);
    box.appendChild(qrDiv);
    qrGrid.appendChild(box);

    new QRCode(qrDiv, {
      text: studentId,
      width: 80,
      height: 108
    });
  }

  localStorage.setItem("lastPTCId", last + count);
}

async function exportPDF() {
  if (generatedIds.length === 0) {
    alert("Generate QR codes first");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF("p", "mm", "a4");

  const boxes = document.querySelectorAll(".qr-box");

  let x = 10;
  let y = 10;
  let col = 0;

  for (let i = 0; i < boxes.length; i++) {
    const canvas = await html2canvas(boxes[i], { scale: 2 });
    const img = canvas.toDataURL("image/png");

    /* CUT BORDER */
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.2);
    pdf.rect(x, y, 24, 32);

    /* QR INSIDE BORDER */
    pdf.addImage(img, "PNG", x + 2, y + 2, 20, 28);

    col++;
    x += 28;

    if (col === 7) {
      col = 0;
      x = 10;
      y += 36;

      if (y > 260) {
        pdf.addPage();
        y = 10;
      }
    }
  }

  pdf.save("PTC_QR_with_Cut_Borders.pdf");
}
