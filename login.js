// Predefined accounts (stored only once)
if (!localStorage.getItem("loginAccounts")) {
  localStorage.setItem("loginAccounts", JSON.stringify({
    admin: "admin123",
    coach: "coach123"
  }));
}

// LOGIN FUNCTION
function login() {
  const id = document.getElementById("loginId").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  let accounts = JSON.parse(localStorage.getItem("loginAccounts"));

  if (!accounts[id]) {
    alert("Invalid User ID");
    return;
  }

  if (accounts[id] !== pass) {
    alert("Wrong Password");
    return;
  }

  // Save login role
  localStorage.setItem("logged_role", id);

  // Redirect to main dashboard
  window.location.href = "index.html";
}
