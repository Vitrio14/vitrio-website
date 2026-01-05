document.addEventListener("DOMContentLoaded", async () => {
  const loginBtnDiscord = document.getElementById("discordLogin");
  const heroLoginBtn = document.getElementById("heroLoginBtn");
  const hubLoginBtn = document.getElementById("hubLoginBtn");
  const hubLogoutBtn = document.getElementById("hubLogoutBtn");
  const hubProfileBtn = document.getElementById("hubProfileBtn");

  const miniStatus = document.getElementById("miniStatus");

  const adminLink = document.getElementById("adminLink");
  const logo = document.getElementById("logo");

  const hubAvatar = document.getElementById("hubAvatar");
  const hubName = document.getElementById("hubName");
  const hubId = document.getElementById("hubId");

  const omegaValue = document.getElementById("omegaValue");
  const rankPill = document.getElementById("rankPill");
  const rankNext = document.getElementById("rankNext");

  // Click login
  const bindLogin = (el) => el && el.addEventListener("click", loginDiscord);
  bindLogin(loginBtnDiscord);
  bindLogin(heroLoginBtn);
  bindLogin(hubLoginBtn);
  loadLeaderboard();


  // Easter egg: 10 click sul logo → mostra Area Admin
  let clicks = 0;
  if (logo && adminLink) {
    logo.addEventListener("click", () => {
      clicks++;
      if (clicks === 10) adminLink.classList.add("show");
    });
  }

  // Se non loggato: UI default
  const token = localStorage.getItem("discord_access_token");
  if (!token) {
    if (miniStatus) miniStatus.textContent = "🔒 Non loggato";
    if (omegaValue) omegaValue.textContent = "—";
    if (rankPill) rankPill.textContent = "🏆 Rank: —";
    if (rankNext) rankNext.textContent = "➡️ Prossimo: —";
    return;
  }

  try {
    // 1) Carica utente Discord
    const res = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await res.json();
    localStorage.setItem("discord_user_id", user.id);

    if (!user?.id) return;

    // UI logged
    if (miniStatus) miniStatus.textContent = "✅ Loggato";
    if (loginBtnDiscord) loginBtnDiscord.style.display = "none";
    if (hubLoginBtn) hubLoginBtn.style.display = "none";
    if (hubLogoutBtn) hubLogoutBtn.style.display = "inline-block";
    if (hubProfileBtn) hubProfileBtn.style.display = "inline-block";

    if (hubAvatar) {
      hubAvatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    }
    if (hubName) hubName.textContent = user.username;
    if (hubId) hubId.textContent = `ID: ${user.id}`;

    // Logout
    if (hubLogoutBtn) {
      hubLogoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("discord_access_token");
        window.location.href = "index.html";
      });
    }

// 2) Carica Omega dal tuo backend
const omega = await fetchOmega(user.id);

// valore precedente (se non esiste = 0)
const prevOmega = Number(localStorage.getItem("lastOmega") || 0);

// aggiorna UI
omegaValue.textContent = formatNumber(omega);
omegaValue.classList.add("omega-pulse");
setTimeout(() => omegaValue.classList.remove("omega-pulse"), 900);

// UX2: +Omega volante SOLO se aumentano
if (omega > prevOmega) {
  showOmegaFloat(omega - prevOmega);
}

// salva valore corrente
localStorage.setItem("lastOmega", omega);



const rank = computeRank(omega);
if (rankPill) rankPill.textContent = `🏆 Rank: ${rank.name}`;
if (rankNext) rankNext.textContent = rank.max === Infinity
  ? "➡️ Prossimo: MAX"
  : `➡️ Prossimo: ${rank.max + 1}`;

renderProgress(omega, rank);
renderBadges(rank, omega);
renderShop(omega);


  } catch (err) {
    console.error("Index hub load failed:", err);
  }
});

function formatNumber(n) {
  try { return Number(n).toLocaleString("it-IT"); } catch { return String(n); }
}

async function fetchOmega(userId) {
  try {
    const url = `https://api.vitriotv.com/getOmega?userId=${encodeURIComponent(userId)}`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data?.ok) return 0;
    return Number(data.omega || 0);
  } catch {
    return 0;
  }
}

function showOmegaFloat(amount) {
  const el = document.createElement("div");
  el.className = "omega-float";
  el.textContent = `+${amount} Omega`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}


// Rank semplice (lo rendiamo “premium” dopo: livelli, progress bar, ecc.)
function computeRank(omega) {
  const tiers = [
    { name: "Bronze", min: 0, next: 250 },
    { name: "Silver", min: 250, next: 750 },
    { name: "Gold", min: 750, next: 1500 },
    { name: "Diamond", min: 1500, next: null },
  ];

  const current = tiers.slice().reverse().find(t => omega >= t.min) || tiers[0];

  if (current.next === null) {
    return { name: current.name, nextLabel: "➡️ Prossimo: MAX" };
  }

  const missing = Math.max(0, current.next - omega);
  return {
    name: current.name,
    nextLabel: `➡️ Prossimo: ${current.next} (+${formatNumber(missing)})`
  };
}

function renderProgress(omega, rank) {
  const fill = document.getElementById("omegaProgressFill");
  const label = document.getElementById("omegaProgressLabel");
  if (!fill || !label) return;

  if (rank.max === Infinity) {
    fill.style.width = "100%";
    label.textContent = "Livello massimo raggiunto 💎";
    return;
  }

  const range = rank.max - rank.min + 1;
  const progress = Math.min(100, ((omega - rank.min) / range) * 100);
  fill.style.width = `${progress}%`;
  label.textContent = `${omega} / ${rank.max + 1} Omega`;
}

function renderBadges(rank, omega) {
  const row = document.getElementById("badgeRowPremium");
  if (!row) return;
  row.innerHTML = "";

  const rankBadge = document.createElement("span");
  rankBadge.className = `badge-premium badge-${rank.key}`;
  rankBadge.textContent = `🏆 ${rank.name}`;
  row.appendChild(rankBadge);

  if (omega >= 1000) addBadge(row,"🔥 Hardcore","badge-gold");
  if (omega >= 2500) addBadge(row,"💎 Elite","badge-diamond");
}

function addBadge(row, text, cls) {
  const b = document.createElement("span");
  b.className = `badge-premium ${cls}`;
  b.textContent = text;
  row.appendChild(b);
}

function renderShop(omega) {
  const grid = document.getElementById("shopGrid");
  if (!grid) return;

  const rewards = [
    { id:"vip", title:"VIP Discord (7g)", cost:500 },
    { id:"highlight", title:"Messaggio Highlight", cost:250 },
    { id:"spin", title:"Ruota Fortuna", cost:1000 },
  ];

  grid.innerHTML = "";
  rewards.forEach(r => {
    const card = document.createElement("div");
    card.className = "shop-card";

    const disabled = omega < r.cost;

    card.innerHTML = `
      <div class="shop-title">${r.title}</div>
      <div class="shop-cost">Costo: ${r.cost} Omega</div>
      <button class="button button-sm shop-btn" ${disabled ? "disabled" : ""}>
        ${disabled ? "Omega insufficienti" : "Riscatta"}
      </button>
    `;

    const btn = card.querySelector("button");
    if (!disabled) {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "⏳ Elaborazione...";

        const res = await redeemReward(r.id);
        if (res.ok) {
          btn.textContent = "✅ Riscattato";
          alert(`Reward riscattata: ${res.reward}`);
          location.reload();
        } else {
          alert(res.error || "Errore nel riscatto");
          btn.textContent = "Riscatta";
          btn.disabled = false;
        }
      });
    }

    grid.appendChild(card);
  });
}

async function redeemReward(rewardId) {
  try {
    const token = localStorage.getItem("discord_access_token");
    if (!token) return { ok:false, error:"Non loggato" };

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const user = await userRes.json();
    if (!user?.id) return { ok:false, error:"Utente non valido" };

    const res = await fetch("https://api.vitriotv.com/redeemReward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        rewardId
      })
    });

    return await res.json();
  } catch (err) {
    console.error(err);
    return { ok:false, error:"Errore di rete" };
  }
}
async function loadLeaderboard() {
 if (u.userId === localStorage.getItem("discord_user_id")) {
  checkRankUp(i + 1);
}
  const list = document.getElementById("leaderboardList");
  if (!list) return;

  list.innerHTML = "⏳ Caricamento leaderboard...";

  try {
    const res = await fetch("https://api.vitriotv.com/leaderboard?limit=10");
    const data = await res.json();
    if (!data.ok) throw new Error();

    list.innerHTML = "";

    data.users.forEach((u, i) => {
      const row = document.createElement("div");
      row.className = `leader-row top-${i+1}`;
      row.innerHTML = `
        <div class="leader-rank">${i + 1}</div>
        <div class="leader-user">
          <img src="${u.avatar || "assets/img/logo.png"}" class="leader-avatar">
          <div class="leader-name">${u.username}</div>
        </div>
        <div class="leader-omega">${formatNumber(u.omega)}</div>
      `;
      const myId = localStorage.getItem("discord_user_id");
if (myId && u.userId === myId) {
  row.classList.add("me");
}

      list.appendChild(row);
    });

  } catch {
    list.innerHTML = "Errore nel caricamento leaderboard.";
  }
}

function checkRankUp(newPos) {
  const prev = Number(localStorage.getItem("lastRankPos"));
  if (!prev || newPos < prev) {
    showToast(`🚀 Sei salito in classifica! (#${newPos})`);
  }
  localStorage.setItem("lastRankPos", newPos);
}




