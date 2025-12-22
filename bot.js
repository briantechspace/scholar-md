import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys";
import Pino from "pino";
import fs from "fs";
import { config } from "./config.js";
import { store } from "./store.js";

const USERS = "./users.json";
const ANALYTICS = "./analytics.json";

const read = f => JSON.parse(fs.readFileSync(f));
const write = (f,d) => fs.writeFileSync(f, JSON.stringify(d,null,2));

function nowEAT() {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: config.timezone })
  );
}

export async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const sock = makeWASocket({
    auth: state,
    logger: Pino({ level: "silent" }),
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection }) => {
    const a = read(ANALYTICS);
    if (connection === "open") a.connected = true;
    if (connection === "close") a.connected = false;
    write(ANALYTICS, a);
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const sender = msg.key.participant || msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
    if (!text) return;

    const users = read(USERS);
    const now = nowEAT();

    if (!users[sender]) {
      users[sender] = {
        freeUntil: new Date(now.getTime() + 3*24*60*60*1000).toISOString(),
        premiumUntil: null
      };
    }

    const user = users[sender];

    if (
      (!user.premiumUntil || now > new Date(user.premiumUntil)) &&
      now > new Date(user.freeUntil)
    ) {
      await sock.sendMessage(sender, {
        text: "❌ Free plan expired. Use .addprem to upgrade."
      });
      write(USERS, users);
      return;
    }

    if (text === ".menu") {
      await sock.sendMessage(sender, {
        text: `${config.botName}\n${config.edition}\nType .help`
      });
    }

    if (text === ".help") {
      await sock.sendMessage(sender, {
        text: "Use .menu to see commands.\nFree: 3 days\nPremium: 50 KES / 30 days"
      });
    }

    write(USERS, users);
  });
}
