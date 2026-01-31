let html5QrCode;
let scanLocked = false;
const today = new Date().toLocaleDateString("en-CA");
let cameraRetryCount = 0;

/* =====================================================
   START SCAN WITH AUTO-RETRY IF CAMERA FAILS TO OPEN
====================================================== */
window.addEventListener("load", () => {
    startScan();
});

function startScan() {
    html5QrCode = new Html5Qrcode("qr-reader");

    Html5Qrcode.getCameras()
        .then(devices => {
            if (!devices || devices.length === 0) {
                if (cameraRetryCount < 3) {
                    cameraRetryCount++;
                    console.warn("Camera not found, retrying…");
                    return setTimeout(startScan, 1500);
                }
                alert("Camera not available.");
                return;
            }

            // Prefer the BACK camera
            const backCam =
                devices.find(d => d.label.toLowerCase().includes("back")) ||
                devices[devices.length - 1];

            html5QrCode
                .start(
                    { deviceId: { exact: backCam.id } },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1,
                        disableFlip: true
                    },
                    onScanSuccess,
                    onScanFailure
                )
                .catch(err => {
                    console.error("Camera start error:", err);

                    if (cameraRetryCount < 3) {
                        cameraRetryCount++;
                        return setTimeout(startScan, 1500);
                    }

                    alert("Unable to open camera.");
                });
        })
        .catch(err => {
            console.error("Camera detection error:", err);

            if (cameraRetryCount < 3) {
                cameraRetryCount++;
                return setTimeout(startScan, 1500);
            }
        });
}

/* =====================================================
                 STOP CAMERA
====================================================== */
function stopScan() {
    if (html5QrCode) {
        html5QrCode.stop().then(() => location.reload());
    }
}

/* =====================================================
             QR SCAN SUCCESS HANDLER
====================================================== */
function onScanSuccess(content) {
    handleAttendance(content);
}

function onScanFailure(error) {
    // ignore
}

/* =====================================================
                ATTENDANCE LOGIC
====================================================== */
function handleAttendance(content) {
    if (scanLocked) return;

    const students = JSON.parse(localStorage.getItem("students")) || [];
    const attendance = JSON.parse(localStorage.getItem("attendance")) || {};

    const student = students.find(s => s.id === content);

    // ❌ Invalid QR
    if (!student) return speak("Invalid ID");

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
    const timeStr = now.toTimeString().slice(0, 5); // HH:MM

    // ❌ More than 2 scans
    if (scans.length >= 2) return speak("Attendance already done");

    /* SECOND SCAN RULE */
    if (scans.length === 1) {
        const [h, m] = scans[0].split(":").map(Number);

        const firstScanTime = new Date();
        firstScanTime.setHours(h, m, 0, 0);

        const diff = (now - firstScanTime) / 60000; // mins

        if (diff < 60) {
            const remaining = Math.ceil(60 - diff);
            return speak(`Scan after ${remaining} minutes`);
        }

        // ✔ 2nd scan success
        scans.push(timeStr);
        localStorage.setItem("attendance", JSON.stringify(attendance));
        return speak("Thank You.Today's attendance is successful");
    }

    /* FIRST SCAN */
    scans.push(timeStr);
    record.status = "Present";

    localStorage.setItem("attendance", JSON.stringify(attendance));

    speak("Welcome to Playmate");
}

/* =====================================================
                TEXT TO SPEECH
====================================================== */
function speak(text) {
    scanLocked = true;

    speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-IN";

    speechSynthesis.speak(msg);

    // Pause scanner for 3 seconds
    setTimeout(() => {
        scanLocked = false;
    }, 3000);
}


/* let html5QrCode;
const today = new Date().toLocaleDateString("en-CA");

window.addEventListener("load", startScan);

function startScan() {
  html5QrCode = new Html5Qrcode("qr-reader");

  Html5Qrcode.getCameras().then(devices => {
    if (!devices || devices.length === 0) {
      alert("No camera found");
      return;
    }

    // ✅ Prefer BACK camera
    const backCam =
      devices.find(d => d.label.toLowerCase().includes("back")) ||
      devices[devices.length - 1]; // fallback

    html5QrCode.start(
      { deviceId: { exact: backCam.id } },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }, // bigger = easier focus
        aspectRatio: 1.0,
        disableFlip: true
      },
      onScanSuccess,
      onScanFailure
    );
  });
}

function stopScan() {
  if (html5QrCode) {
    html5QrCode.stop().then(() => window.close());
  }
}

function onScanSuccess(content) {
  handleAttendance(content);
}

function onScanFailure() {
  // ignore scan errors
}

/* =========================
   ATTENDANCE LOGIC (UNCHANGED)
========================= *
let scanLocked = false;

function handleAttendance(content) {
  if (scanLocked) return;

  const students = JSON.parse(localStorage.getItem("students")) || [];
  const attendance = JSON.parse(localStorage.getItem("attendance")) || {};

  const student = students.find(s => s.id === content);

  /* ❌ Invalid ID *
  if (!student) {
    speak("Invalid ID");
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
  const timeStr = now.toTimeString().slice(0, 5); // HH:MM

  /* ❌ Rule 3: More than 2 scans *
  if (scans.length >= 2) {
    speak("Attendance already done");
    return;
  }

  /* ❌ Rule 2: 2nd scan before 60 minutes *
  if (scans.length === 1) {
    const [h, m] = scans[0].split(":").map(Number);
    const firstScan = new Date();
    firstScan.setHours(h, m, 0, 0);

    if ((now - firstScan) / 60000 < 60) {
      speak("Scan after sixty minutes");
      return;
    }
    // ✅ 2nd successful scan
    scans.push(timeStr);
    localStorage.setItem("attendance", JSON.stringify(attendance));
    speak("Thank You");
    return;
  }

  /* ✅ Rule 1: Successful scan *
  scans.push(timeStr);
  record.status = "Present"; // ✅ MARK PRESENT IMMEDIATELY

  localStorage.setItem("attendance", JSON.stringify(attendance));

  speak("Welcome to Playmate");
}

/* 🔊 Voice feedback *
function speak(text) {
  scanLocked = true;

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = "en-IN";

  speechSynthesis.cancel();
  speechSynthesis.speak(msg);

  /* ⏸ Pause scanner for 3 seconds after EVERY message *
  setTimeout(() => {
    scanLocked = false;
  }, 3000);
}




