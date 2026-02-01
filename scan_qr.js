let html5QrCode;
let scanStarted = false;
const today = new Date().toLocaleDateString("en-CA");

// Cache students in memory (avoid slow JSON.parse on every scan)
let studentsCache = [];
try {
  studentsCache = JSON.parse(localStorage.getItem("students")) || [];
} catch (e) {
  studentsCache = [];
}

function startScan() {
  if (scanStarted) return;
  scanStarted = true;

  html5QrCode = new Html5Qrcode("qr-reader");

  Html5Qrcode.getCameras()
    .then(devices => {
      if (!devices || devices.length === 0) {
        alert("No camera found");
        scanStarted = false;
        return;
      }

      // Select best camera (rear)
      let bestCam = devices[0];
      devices.forEach(cam => {
        if (cam.id.length > bestCam.id.length) bestCam = cam;
      });

      // Start scanner
      return html5QrCode.start(
        { deviceId: { exact: bestCam.id } },
        {
          fps: 25,
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0,
          disableFlip: true,
          experimentalFeatures: {
            useBarCodeDetectorIfSupported: true
          },
          videoConstraints: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: "environment"
          }
        },
        onScanSuccess,
        onScanFailure
      );
    })
    .catch(err => {
      console.log("Camera error:", err);
      scanStarted = false;
      setTimeout(startScan, 1000);
    });
}

function stopScan() {
  if (!html5QrCode) return;

  html5QrCode.stop()
    .then(() => {
      scanStarted = false;
      location.reload();  // safer than window.close()
    })
    .catch(() => {
      scanStarted = false;
    });
}

/* =========================
   SCAN EVENT HANDLERS
========================= */
let scanLocked = false;
let failCooldown = false;

function onScanSuccess(content) {
  if (!scanLocked) handleAttendance(content);
}

function onScanFailure() {
  if (failCooldown) return;
  failCooldown = true;
  setTimeout(() => failCooldown = false, 200);
}

/* =========================
   SAFE ATTENDANCE LOGIC
========================= */
function handleAttendance(content) {
  scanLocked = true;

  // Load attendance once per scan (small data)
  let attendance = {};
  try {
    attendance = JSON.parse(localStorage.getItem("attendance")) || {};
  } catch (e) {
    attendance = {};
  }

  // Find student (fast lookup)
  const student = studentsCache.find(s => s.id === content);

  if (!student) {
    speak("Invalid ID");
    unlockScan();
    return;
  }

  if (!attendance[today]) attendance[today] = {};
  if (!attendance[today][student.id]) {
    attendance[today][student.id] = {
      scans: [],
      status: "Absent"
    };
  }

  const record = attendance[today][student.id];
  const scans = record.scans;

  const now = new Date();
  const timeStr = now.toTimeString().slice(0, 5);

  // Already completed 2 scans
  if (scans.length >= 2) {
    speak("Attendance already done");
    unlockScan();
    return;
  }

  // SECOND SCAN LOGIC
  if (scans.length === 1) {
    const [h, m] = scans[0].split(":").map(Number);
    const firstScan = new Date();
    firstScan.setHours(h, m, 0, 0);

    const diffMins = (now - firstScan) / 60000;

    if (diffMins < 60) {
      speak("Scan after sixty minutes");
      unlockScan();
      return;
    }

    scans.push(timeStr);
    localStorage.setItem("attendance", JSON.stringify(attendance));
    speak("Today's attendance is successful");
    unlockScan();
    return;
  }

  // FIRST SCAN
  scans.push(timeStr);
  record.status = "Present";
  localStorage.setItem("attendance", JSON.stringify(attendance));

  speak("Welcome to Playmate");
  unlockScan();
}

/* =========================
   SPEECH + DELAY
========================= */
function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";

  speechSynthesis.cancel();
  speechSynthesis.speak(msg);
}

function unlockScan() {
  setTimeout(() => { scanLocked = false; }, 3000);
}
