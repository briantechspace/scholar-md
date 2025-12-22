const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys");

const P = require("pino");

let sock;
let state;
let saveCreds;
let isReady = false;

async function initSocket() {
  if (sock) return sock;

  const auth = await useMultiFileAuthState("auth_info");
  state = auth.state;
  saveCreds = auth.saveCreds;

  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    auth: state,
    version,
    logger: P({ level: "silent" }),
    browser: ["SCHOLAR MD", "Chrome", "1.0"]
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
    if (connection === "open") {
      console.log("✅ WhatsApp connected");
      isReady = true;
    }

    if (connection === "close") {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !==
        DisconnectReason.loggedOut;

      if (shouldReconnect) {
        sock = null;
        initSocket();
      }
    }
  });

  return sock;
}

async function generatePairingCode(phone) {
  if (!sock) await initSocket();

  if (state.creds.registered) {
    throw new Error("Bot already linked. Pairing not allowed.");
  }

  const code = await sock.requestPairingCode(phone);
  console.log("🔑 Pairing code:", code);
  return code;
}

module.exports = {
  initSocket,
  generatePairingCode
};
