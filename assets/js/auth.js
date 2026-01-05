const DISCORD_CLIENT_ID = "1305192295590789130";
const DISCORD_REDIRECT = "https://vitriotv.com/discord-auth.html";
const DISCORD_SCOPES = "identify guilds guilds.members.read";

function loginDiscord() {
  const url =
    "https://discord.com/api/oauth2/authorize" +
    `?client_id=${DISCORD_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT)}` +
    "&response_type=code" +
    `&scope=${encodeURIComponent(DISCORD_SCOPES)}`;
  window.location.href = url;
}
