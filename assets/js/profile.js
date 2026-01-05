/* ======================================================
   PROFILO UTENTE — VITRIO (REFRACTOR V1)
====================================================== */

const DISCORD_TOKEN = localStorage.getItem("discord_access_token");
const GUILD_ID = "821024627391463504";

if (!DISCORD_TOKEN) {
  alert("Devi effettuare l'accesso con Discord.");
  window.location.href = "index.html";
}

/* ======================
   RUOLI + CATEGORIE
====================== */
const ROLE_DATA = {
  "1431022260923273297": { name: "Vitrio (Owner)", color: "#ffa000", category: "Staff Zone", permissions: ["Accesso totale", "Admin"] },
  "1008168835381203064": { name: "Responsabile Staff", color: "#00ffdc", category: "Staff Zone", permissions: ["Gestione Staff", "Moderazione completa"] },
  "821028322087272508": { name: "Moderatore", color: "#007bff", category: "Staff Zone", permissions: ["Kick", "Ban", "Moderazione Chat"] },
  "1435034819233845309": { name: "Helper", color: "#2ecc71", category: "Staff Zone", permissions: ["Supporto ticket"] },
  "1008168246958112778": { name: "Mod Chat Twitch", color: "#00dcff", category: "Twitch Zone", permissions: ["Moderazione Twitch"] },

  "1006332851656065054": { name: "Twitch Sub", color: "#71368a", category: "Sub Zone", permissions: ["Contenuti Sub"] },
  "821031156861894666": { name: "VIP", color: "#ff00e6", category: "VIP Zone", permissions: ["Accesso VIP"] },
  "859419416160632842": { name: "Team Vitrio", color: "#f1c40f", category: "Team Zone", permissions: ["Accesso Team Privato"] },
  "821030119552319489": { name: "Follow", color: "#ff5706", category: "Community Zone", permissions: ["Supporter Base"] },
  "866718824190312492": { name: "Server Booster", color: "#f47fff", category: "Booster Zone", permissions: ["Perks Booster"] }
};

/* ======================
   UTILS
====================== */
function getCreationDateFromSnowflake(id) {
  const discordEpoch = 1420070400000;
  return new Date(Number(id) / 4194304 + discordEpoch);
}

/* ======================
   LOAD USER
====================== */
async function loadUser() {
  const res = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${DISCORD_TOKEN}` }
  });
  const user = await res.json();

  document.getElementById("username").textContent = user.username;
  document.getElementById("userid").textContent = "ID: " + user.id;
  document.getElementById("globalName").textContent = user.global_name ?? "-";
  document.getElementById("accountId").textContent = user.id;

  document.getElementById("avatar").src =
    `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

  const created = getCreationDateFromSnowflake(user.id);
  document.getElementById("createdAt").textContent =
    created.toLocaleDateString("it-IT");
}

/* ======================
   LOAD ROLES
====================== */
async function loadRoles() {
  const loading = document.getElementById("loadingMsg");
  const badgeRow = document.getElementById("badgeRow");
  const grid = document.getElementById("sectionsGrid");

  try {
    const memberRes = await fetch(
      `https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`,
      { headers: { Authorization: `Bearer ${DISCORD_TOKEN}` } }
    );
    const member = await memberRes.json();

    const roles = member.roles || [];
    loading.style.display = "none";
    grid.style.display = "grid";

    const grouped = {};

    roles.forEach(roleId => {
      const role = ROLE_DATA[roleId];
      if (!role) return;

      if (!grouped[role.category]) grouped[role.category] = [];
      grouped[role.category].push(role);

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = role.name;
      badge.style.borderColor = role.color;
      badgeRow.appendChild(badge);
    });

    Object.entries(grouped).forEach(([category, roles]) => {
      const card = document.createElement("div");
      card.className = "section-card";
      card.innerHTML = `
        <h3>${category}</h3>
        <div class="access-ok">Accesso consentito</div>
        <ul>${roles.map(r => `<li>${r.permissions.join(", ")}</li>`).join("")}</ul>
      `;
      grid.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    loading.textContent = "Errore nel caricamento dei ruoli.";
  }
}

/* ======================
   INIT
====================== */
document.addEventListener("DOMContentLoaded", () => {
  loadUser();
  loadRoles();
  loadOmegaHistory(user.id);

});

async function loadOmegaHistory(userId) {
  const box = document.getElementById("omegaHistory");
  if (!box) return;

  box.innerHTML = "⏳ Caricamento storico...";

  try {
    const res = await fetch(
      `https://api.vitriotv.com/omegaHistory?userId=${userId}`
    );
    const data = await res.json();

    if (!data.ok || !data.history.length) {
      box.innerHTML = "<div class='muted'>Nessuna attività recente.</div>";
      return;
    }

    box.innerHTML = "";

    data.history.forEach(h => {
      const row = document.createElement("div");
      const isPlus = h.change > 0;

      row.className = `omega-row ${isPlus ? "plus" : "minus"}`;
      row.innerHTML = `
        <div class="omega-info">
          <div>${h.type}</div>
          <div class="omega-type">
            ${new Date(h.timestamp).toLocaleString("it-IT")}
          </div>
        </div>
        <div class="omega-value ${isPlus ? "plus" : "minus"}">
          ${isPlus ? "+" : ""}${h.change}
        </div>
      `;

      box.appendChild(row);
    });

  } catch (err) {
    console.error(err);
    box.innerHTML = "<div class='muted'>Errore nel caricamento.</div>";
  }
}
