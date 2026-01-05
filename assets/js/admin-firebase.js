/* ======================================================
   ADMIN FIREBASE — VITRIO (REFRACTOR V1)
====================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const rewardsList = document.getElementById("rewardsList");
const refreshRewardsBtn = document.getElementById("refreshRewardsBtn");


/* ======================
   FIREBASE CONFIG
====================== */
const firebaseConfig = {
  apiKey: "AIzaSyCosgHwGCK4mqS7qz9ZCX0ctR17I1PLPIQ",
  authDomain: "vitriottv.firebaseapp.com",
  projectId: "vitriottv",
  storageBucket: "vitriottv.firebasestorage.app",
  messagingSenderId: "159136613568",
  appId: "1:159136613568:web:62971549847db867551925",
  measurementId: "G-20CWGK8ZL6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ======================
   ELEMENTS
====================== */
const loginView = document.getElementById("loginView");
const dashboard = document.getElementById("dashboard");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const returnBtn = document.getElementById("returnBtn");
const loginError = document.getElementById("loginError");

const messagesList = document.getElementById("messagesList");
const refreshBtn = document.getElementById("refreshBtn");
const statTotal = document.getElementById("statTotal");
const statLast = document.getElementById("statLast");

/* ======================
   AUTH
====================== */
loginBtn?.addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  loginError.textContent = "";

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = "Login fallito: " + err.message;
  }
});

logoutBtn?.addEventListener("click", async () => {
  await signOut(auth);
});

returnBtn?.addEventListener("click", () => {
  window.location.href = "index.html";
});

/* ======================
   STATE
====================== */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    loginView.style.display = "block";
    dashboard.style.display = "none";
    logoutBtn.style.display = "none";
    returnBtn.style.display = "none";
    return;
  }

  loginView.style.display = "none";
  dashboard.style.display = "block";
  logoutBtn.style.display = "inline-block";
  returnBtn.style.display = "inline-block";

  loadMessages();
  loadRewards();
refreshRewardsBtn?.addEventListener("click", loadRewards);

});

/* ======================
   LOAD MESSAGES
====================== */
async function loadMessages() {
  messagesList.innerHTML = "";

  const q = query(collection(db, "messaggi"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  statTotal.textContent = snap.size;

  let lastDate = "-";

  snap.forEach(doc => {
    const d = doc.data();
    const card = document.createElement("div");
    card.className = "message-card";
    card.innerHTML = `
      <strong>${d.nome}</strong> &lt;${d.email}&gt;<br>
      <small>${d.createdAt?.toDate?.().toLocaleString?.() ?? "-"}</small>
      <p>${d.messaggio}</p>
    `;
    messagesList.appendChild(card);

    if (lastDate === "-" && d.createdAt?.toDate) {
      lastDate = d.createdAt.toDate().toLocaleString();
    }
  });

  statLast.textContent = lastDate;
}

refreshBtn?.addEventListener("click", loadMessages);

async function loadRewards() {
  rewardsList.innerHTML = "";

  const q = query(
    collection(db, "redeemedRewards"),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  snap.forEach(doc => {
    const d = doc.data();
    if (d.status !== "PENDING") return;

    const card = document.createElement("div");
    card.className = "reward-card";
    card.innerHTML = `
      <div class="reward-title">${d.title}</div>
      <div class="reward-meta">
        User: ${d.userId}<br>
        Costo: ${d.cost} Omega<br>
        Stato: ${d.status}
      </div>
      <div class="reward-actions">
        <button class="button button-sm">Approva</button>
        <button class="button button-sm button-danger">Rifiuta</button>
      </div>
    `;

    const [approveBtn, rejectBtn] = card.querySelectorAll("button");

    approveBtn.addEventListener("click", async () => {
      approveBtn.disabled = true;
      await fetch("https://api.vitriotv.com/admin/approveReward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardDocId: doc.id })
      });
      loadRewards();
    });

    rejectBtn.addEventListener("click", async () => {
      rejectBtn.disabled = true;
      await fetch("https://api.vitriotv.com/admin/rejectReward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardDocId: doc.id })
      });
      loadRewards();
    });

    rewardsList.appendChild(card);
  });
}

