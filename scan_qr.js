let qrScanner;
const today = new Date().toISOString().split("T")[0];

function startScan() {
  if (qrScanner) return;

  qrScanner = new Html5Qrcode("qr-reader");

  qrScanner.start(
    {
      facingMode: "user" // ✅ FRONT CAMERA
    },
    {
      fps: 10,
      qrbox: 250
    },
    handleScan,
    () => {} // ignore scan errors
  ).catch(err => {
    alert("Camera error: " + err);
  });
}

function stopScan() {
  if (qrScanner) {
    qrScanner.stop().then(() => {
      qrScanner.clear();
      qrScanner = null;
      window.close();
    });
  }
}

function handleScan(content) {
  const students = JSON.parse(localStorage.getItem("students")) || [];
  const attendance = JSON.parse(localStorage.getItem("attendance")) || {};

  const student = students.find(s => s.id === content);

  if (!student) {
    speak("Invalid ID");
    return;
  }

  if (!attendance[today]) attendance[today] = {};
  if (!attendance[today][student.id]) {
    attendance[today][student.id] = { scans: [] };
  }

  const scans = attendance[today][student.id].scans;
  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);

  // ❌ Max 2 scans
  if (scans.length >= 2) {
    speak("Attendance already done");
    return;
  }

  // ❌ 60 min gap
  if (scans.length === 1) {
    const [h, m] = scans[0].split(":").map(Number);
    const first = new Date();
    first.setHours(h, m, 0, 0);

    if ((now - first) / 60000 < 60) {
      speak("Scan after 60 minutes");
      return;
    }
  }

  scans.push(timeStr);
  localStorage.setItem("attendance", JSON.stringify(attendance));

  speak("Attendance successful");
}

/* 🔊 Voice feedback */
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(msg);
}
