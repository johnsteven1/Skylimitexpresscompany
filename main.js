/* ================= CONFIG ================= */
const STORAGE_KEYS = {
  USERS: "users",
  CURRENT: "currentUser",
  SESSION_TIME: "sessionTime"
};

const SESSION_DURATION = 1000 * 60 * 60 * 6; // 6 hours
let isLogin = true;

/* ================= HELPERS ================= */
const $ = id => document.getElementById(id);

const hashPassword = password =>
  btoa(password.split("").reverse().join(""));

const validateEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getUsers = () =>
  JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];

const saveUsers = users =>
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

const saveSession = user => {
  localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.SESSION_TIME, Date.now());
};

const clearInputs = () => {
  $("authName").value = "";
  $("authEmail").value = "";
  $("authPassword").value = "";
};

/* ================= AUTH MODAL ================= */
function openAuth() {
  $("authModal").style.display = "flex";
}

function closeAuth() {
  $("authModal").style.display = "none";
}

function switchAuth() {
  isLogin = !isLogin;

  $("authTitle").innerText = isLogin ? "Login" : "Create Account";
  $("authBtn").innerText = isLogin ? "Login" : "Sign Up";
  $("authName").style.display = isLogin ? "none" : "block";

  clearInputs();
}

/* ================= PROFILE ================= */
function hideProfile() {
  $("userProfile").style.display = "none";
}

function showProfile(user) {
  if (!user) return;

  closeAuth();
  $("userProfile").style.display = "grid";
  $("profileName").innerText = user.name;
  $("profileEmail").innerText = user.email;
  $("profileProfit").innerText = user.profit;
}

/* ================= ADD FUNDS (TELEGRAM CONFIRMATION) ================= */
function initAddFunds() {
  const user = getCurrentUser();
  if (!user) return alert("Session expired. Please login again.");

  const amount = prompt("Enter amount you want to add ($):");

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return alert("Please enter a valid amount");
  }

  const message = `
📥 ADD FUNDS REQUEST

👤 Name: ${user.name}
📧 Email: ${user.email}
🆔 User ID: ${user.id}
💰 Amount: $${amount}

Please confirm this transaction.
`.trim();

  const confirmAction = confirm(
    "CONFIRM YOUR DETAILS\n\n" +
    `Name: ${user.name}\n` +
    `Email: ${user.email}\n` +
    `Amount: $${amount}\n\n` +
    "Click OK to continue to Telegram"
  );

  if (!confirmAction) return;

  redirectToTelegram(message);
}

function redirectToTelegram(message) {
  const TELEGRAM_USERNAME = "YourTelegramUsername"; // 🔴 CHANGE THIS
  const encodedMessage = encodeURIComponent(message);
  const telegramURL = `https://t.me/Eriksen41${TELEGRAM_USERNAME}?text=${encodedMessage}`;
  window.open(telegramURL, "_blank");
}

/* ================= UPDATE USER ================= */
function updateUser(updatedUser) {
  const users = getUsers();
  const index = users.findIndex(u => u.email === updatedUser.email);

  if (index !== -1) {
    users[index] = updatedUser;
    saveUsers(users);
    saveSession(updatedUser);
  }
}

/* ================= SESSION ================= */
function getCurrentUser() {
  const sessionTime = localStorage.getItem(STORAGE_KEYS.SESSION_TIME);
  if (!sessionTime) return null;

  if (Date.now() - sessionTime > SESSION_DURATION) {
    logoutUser();
    return null;
  }

  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT));
}

function logoutUser() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT);
  localStorage.removeItem(STORAGE_KEYS.SESSION_TIME);
  location.reload();
}

/* ================= DOM READY ================= */
document.addEventListener("DOMContentLoaded", () => {

  // 🔒 ALWAYS hide dashboard first
  hideProfile();

  $("authBtn").addEventListener("click", () => {
    const name = $("authName").value.trim();
    const email = $("authEmail").value.trim().toLowerCase();
    const password = $("authPassword").value.trim();

    if (!email || !password || (!isLogin && !name))
      return alert("All fields are required");

    if (!validateEmail(email))
      return alert("Invalid email address");

    if (!isLogin && password.length < 6)
      return alert("Password must be at least 6 characters");

    let users = getUsers();
    const hashed = hashPassword(password);

    if (isLogin) {
      const user = users.find(
        u => u.email === email && u.password === hashed
      );

      if (!user) return alert("Invalid login credentials");

      saveSession(user);
      showProfile(user);

    } else {
      if (users.some(u => u.email === email))
        return alert("Account already exists");

      const newUser = {
        id: Date.now(),
        name,
        email,
        password: hashed,
        profit: 0,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      saveUsers(users);
      saveSession(newUser);
      showProfile(newUser);
    }
  });

  /* ================= AUTO LOGIN ================= */
  const existingUser = getCurrentUser();

  if (existingUser) {
    showProfile(existingUser);
  } else {
    isLogin = true;
    switchAuth();
    openAuth();
  }
});
