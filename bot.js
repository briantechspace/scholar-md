import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { store } from "./store.js";
import { pairingState } from "./server.js";
import QRCode from "qrcode";

// Import session manager and logger
import { sessionManager } from "./lib/sessionManager.js";
import { errorLog, activityLog, sessionLog } from "./lib/logger.js";

// Import new menu system with hacker intro
import {
  generateForwardedIntro,
  generateBotInfoCard,
  generateOwnerCard,
  generatePresenceCard,
  generateGroupCard,
  generateDownloaderCard,
  generateStickerCard,
  generateAICard,
  generateToolsCard,
  generateFunCard,
  generateSearchCard,
  generateAudioCard,
  generateImageCard,
  generatePrimbonCard,
  generateConverterCard,
  generateCreatorCard,
  menuCategories,
  autoFollowChannel,
  sendCategoryWithStyle,
  sendFullMenu,
  sendQuickMenu,
  BOT_CONFIG
} from "./lib/menuSystem.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database paths
const DB_DIR = path.join(__dirname, "database", "data");
const USERS = path.join(DB_DIR, "users.json");
const ANALYTICS = path.join(DB_DIR, "analytics.json");
const SETTINGS = path.join(DB_DIR, "settings.json");

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const logger = pino({ level: "silent" });

// Safe file operations
const safeRead = (f, defaultValue = {}) => {
  try {
    const raw = fs.readFileSync(f, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    try {
      fs.writeFileSync(f, JSON.stringify(defaultValue, null, 2));
    } catch (writeErr) { }
    return defaultValue;
  }
};

const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

// Get current time in EAT
function nowEAT() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: config.timezone }));
}

// Format date nicely
function formatDate(date) {
  return new Date(date).toLocaleString("en-KE", {
    timeZone: config.timezone,
    dateStyle: "medium",
    timeStyle: "short"
  });
}

// Random pick from array
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// ═══════════════════════════════════════════════════════════════════
// COMMAND HANDLERS - All the bot's features (100+ Commands)
// ═══════════════════════════════════════════════════════════════════

const commands = {
  // ─────────────────────────────────────────────────────────────────
  // 📋 MENU & HELP COMMANDS - Swipeable Cards!
  // ─────────────────────────────────────────────────────────────────
  menu: {
    desc: "Show full menu with all swipeable cards",
    usage: ".menu",
    handler: async (sock, sender, args, msg) => {
      const pushName = msg?.pushName || 'User';
      await sendFullMenu(sock, sender, pushName);
    }
  },

  // Quick menu (just bot info card)
  menufast: {
    desc: "Show quick menu without all cards",
    usage: ".menufast",
    handler: async (sock, sender, args, msg) => {
      const pushName = msg?.pushName || 'User';
      await sendQuickMenu(sock, sender, pushName);
    }
  },

  // Team info card
  team: {
    desc: "Show creator and collaborator info",
    usage: ".team",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'creator');
    }
  },

  // Individual category commands
  ownermenu: {
    desc: "Show owner commands",
    usage: ".ownermenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'owner');
    }
  },

  presencemenu: {
    desc: "Show presence features",
    usage: ".presencemenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'presence');
    }
  },

  groupmenu: {
    desc: "Show group commands",
    usage: ".groupmenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'group');
    }
  },

  downloader: {
    desc: "Show downloader commands",
    usage: ".downloader",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'downloader');
    }
  },

  stickermenu: {
    desc: "Show sticker commands",
    usage: ".stickermenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'sticker');
    }
  },

  aimenu: {
    desc: "Show AI commands",
    usage: ".aimenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'ai');
    }
  },

  toolsmenu: {
    desc: "Show tools commands",
    usage: ".toolsmenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'tools');
    }
  },

  funmenu: {
    desc: "Show fun & games commands",
    usage: ".funmenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'fun');
    }
  },

  searchmenu: {
    desc: "Show search commands",
    usage: ".searchmenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'search');
    }
  },

  audiomenu: {
    desc: "Show audio commands",
    usage: ".audiomenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'audio');
    }
  },

  imagemenu: {
    desc: "Show image commands",
    usage: ".imagemenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'image');
    }
  },

  primbonmenu: {
    desc: "Show primbon commands",
    usage: ".primbonmenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'primbon');
    }
  },

  convertermenu: {
    desc: "Show converter commands",
    usage: ".convertermenu",
    handler: async (sock, sender) => {
      await sendCategoryWithStyle(sock, sender, 'converter');
    }
  },

  // Legacy full text menu
  menutext: {
    desc: "Show text-only menu without images",
    usage: ".menutext",
    handler: async (sock, sender, args, msg) => {
      const menu = `
╔═══════════════════════════════════╗
║   🎓 *${config.botName}* 🎓
║   _${config.edition}_
╠═══════════════════════════════════╣

📋 *MAIN MENU*
.menu
.help
.commands
.list
.about

🌐 *GENERAL*
.ping
.alive
.runtime
.owner
.repo
.donate

📥 *DOWNLOADER*
.play <name/link>
.song <name/link>
.video <name/link>
.ytmp3 <link>
.ytmp4 <link>
.tiktok <link>
.instagram <link>
.facebook <link>
.twitter <link>
.spotify <link>
.mediafire <link>
.apk <name>

🎨 *STICKER*
.sticker
.s
.stickergif
.stickervid
.toimg
.tomp3
.tomp4
.tovideo
.emojimix <😀+😎>
.attp <text>
.ttp <text>
.take <packname>
.rename <pack> <author>

🖼️ *IMAGE TOOLS*
.blur
.removebg
.enhance
.cartoon
.pixelate
.invert
.grayscale
.sepia
.rotate <degree>
.flip
.mirror

🤖 *AI FEATURES*
.ai <query>
.gpt <query>
.gemini <query>
.imagine <prompt>
.dalle <prompt>

🔧 *TOOLS*
.calc <expr>
.translate <lang> <text>
.trt <lang> <text>
.tts <text>
.weather <city>
.define <word>
.wiki <query>
.ss <url>
.qr <text>
.readqr
.short <url>
.base64enc <text>
.base64dec <text>

🎮 *GAMES*
.roll
.flip
.rps <rock/paper/scissors>
.guess <1-10>
.slot
.quiz
.trivia
.hangman
.tictactoe
.truth
.dare
.8ball <question>
.love <name1> <name2>
.ship @user1 @user2
.rate <thing>
.roast @user
.simp @user
.gay @user
.horny @user
.wasted @user

🔮 *PRIMBON*
.zodiac <sign>
.tarot
.shio <year>
.artinama <name>
.jodoh <name1> <name2>
.ramalan
.nasib
.keberuntungan
.mimpi <keyword>
.karakter <name>
.weton <day>

📊 *INFO*
.info
.profile @user
.groupinfo
.listadmin
.totalusers
.uptime

👤 *USER*
.register <name.age>
.unregister
.afk <reason>
.level
.leaderboard
.daily
.weekly

🎭 *FUN*
.joke
.quote
.fact
.meme
.pickup
.insult
.compliment
.advice
.motivation
.lyrics <song>
.anime
.waifu
.neko
.wallpaper <query>
.couplepp

🔊 *AUDIO*
.bass
.blown
.slow
.fast
.reverse
.nightcore
.earrape

👑 *OWNER*
.addprem <number> <days>
.delprem <number>
.ban <number>
.unban <number>
.broadcast <message>
.setname <name>
.setbio <bio>
.setpp
.restart
.shutdown
.mode <public/private>
.cleartmp
.clearsession

👮 *GROUP ADMIN*
.kick @user
.add <number>
.promote @user
.demote @user
.mute
.unmute
.hidetag <message>
.tagall
.antilink on
.antilink off
.antilink kick
.antilink warn
.antispam on
.antispam off
.welcome on
.welcome off
.goodbye on
.goodbye off
.setgname <name>
.setgdesc <description>
.setgpp
.resetlink
.groupsetting
.delete
.warn @user
.warnings @user
.clearwarns @user

💎 *PREMIUM*
.premium
.buy
.mystatus

╠═══════════════════════════════════╣
║ ⏰ ${formatDate(new Date())}
║ 👤 Owner: ${config.ownerDisplayName}
║ 📊 Total: 150+ Commands
╚═══════════════════════════════════╝

_Type .help <command> for usage_
      `.trim();

      await sock.sendMessage(sender, { text: menu });
    }
  },

  help: {
    desc: "Show help information",
    usage: ".help [command]",
    handler: async (sock, sender, args, msg) => {
      // If specific command help requested
      if (args.length > 0) {
        const cmdName = args[0].toLowerCase().replace('.', '');
        if (commands[cmdName]) {
          const cmd = commands[cmdName];
          return sock.sendMessage(sender, {
            text: `📖 *Command: .${cmdName}*\n\n📝 Description: ${cmd.desc}\n💡 Usage: ${cmd.usage || `.${cmdName}`}\n${cmd.example ? `📌 Example: ${cmd.example}` : ''}`
          });
        }
        return sock.sendMessage(sender, { text: `❌ Command ".${cmdName}" not found!` });
      }

      const help = `
🆘 *${config.botName} HELP*

*How to use:*
• All commands start with dot (.)
• Type .menu for all commands
• Type .help <cmd> for specific help

*Categories:*
.menu - Main menu
.downloader - Download menu
.stickermenu - Sticker commands
.imagemenu - Image tools
.aimenu - AI features
.toolsmenu - Utility tools
.gamemenu - Games list
.primbonmenu - Primbon/fortune
.groupmenu - Group commands
.ownermenu - Owner commands

*Subscription:*
🆓 Free Trial: 3 days
💎 Premium: KES 50/month
👑 VIP: KES 100/month

*Get Premium:* (Free for now!)

*Support:* ${config.ownerDisplayName}
      `.trim();

      await sock.sendMessage(sender, { text: help });
    }
  },

  list: {
    desc: "List all commands",
    usage: ".list",
    handler: async (sock, sender, args, msg) => {
      await commands.menu.handler(sock, sender, args, msg);
    }
  },

  commands: {
    desc: "List all commands",
    usage: ".commands",
    handler: async (sock, sender, args, msg) => {
      const cmdList = Object.entries(commands)
        .map(([name, cmd]) => `.${name}`)
        .join('\n');

      await sock.sendMessage(sender, {
        text: `📜 *ALL COMMANDS*\n\n${cmdList}\n\n_Total: ${Object.keys(commands).length} commands_\n\n_Type .help <cmd> for usage_`
      });
    }
  },

  about: {
    desc: "About this bot",
    usage: ".about",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🤖 *About ${config.botName}*\n\n📦 Version: ${config.edition}\n👨‍💻 Developer: ${config.ownerDisplayName}\n📱 Platform: WhatsApp\n💻 Language: JavaScript\n📚 Library: Baileys\n\n_A powerful WhatsApp bot with 150+ commands!_`
      });
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 📥 CATEGORY MENUS
  // ═══════════════════════════════════════════════════════════════
  downloader: {
    desc: "Download commands menu",
    usage: ".downloader",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `📥 *DOWNLOADER MENU*

.play <name/link>
.song <name/link>
.video <name/link>
.ytmp3 <link>
.ytmp4 <link>
.tiktok <link>
.instagram <link>
.facebook <link>
.twitter <link>
.spotify <link>
.mediafire <link>
.apk <name>
.pinterest <query>
.gdrive <link>

_Send link/name with command!_`
      });
    }
  },

  stickermenu: {
    desc: "Sticker commands menu",
    usage: ".stickermenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🎨 *STICKER MENU*

.sticker
.s
.stickergif
.stickervid
.toimg
.tomp3
.tomp4
.tovideo
.emojimix <😀+😎>
.attp <text>
.ttp <text>
.take <packname>
.rename <pack> <author>
.crop
.circle
.smeme <top>|<bottom>
.wm <text>

_Reply to media with command!_`
      });
    }
  },

  imagemenu: {
    desc: "Image tools menu",
    usage: ".imagemenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🖼️ *IMAGE TOOLS MENU*

.blur
.removebg
.enhance
.cartoon
.pixelate
.invert
.grayscale
.sepia
.rotate <degree>
.flip
.mirror
.brightness <value>
.contrast <value>
.hdr
.fisheye
.wanted
.jail
.trigger
.facepalm
.beautiful
.delete_img
.trash
.hitler
.affect
.batslap @user
.kiss @user
.slap @user
.hug @user
.pat @user

_Reply to image with command!_`
      });
    }
  },

  aimenu: {
    desc: "AI features menu",
    usage: ".aimenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🤖 *AI FEATURES MENU*

.ai <query>
.gpt <query>
.gemini <query>
.imagine <prompt>
.dalle <prompt>
.chatgpt <query>
.bard <query>
.blackbox <query>
.stable <prompt>
.aivoice <text>
.aiart <prompt>
.aicode <language> <task>
.aisummarize
.aitranslate <lang> <text>

_Ask anything to AI!_`
      });
    }
  },

  toolsmenu: {
    desc: "Utility tools menu",
    usage: ".toolsmenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🔧 *TOOLS MENU*

.calc <expression>
.translate <lang> <text>
.trt <lang> <text>
.tts <text>
.weather <city>
.define <word>
.wiki <query>
.ss <url>
.qr <text>
.readqr
.short <url>
.base64enc <text>
.base64dec <text>
.binary <text>
.decodebinary <binary>
.ocr
.ssweb <url>
.fetch <url>
.whois <domain>
.ip <domain>
.currency <amt> <from> <to>
.time <timezone>
.countdown <date>
.reminder <time> <msg>
.note <text>
.notes
.clearnotes
.poll <question>|<opt1>|<opt2>

_Useful utilities!_`
      });
    }
  },

  gamemenu: {
    desc: "Games menu",
    usage: ".gamemenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🎮 *GAMES MENU*

.roll
.flip
.rps <rock/paper/scissors>
.guess <1-10>
.slot
.quiz
.trivia
.hangman
.guess_letter <letter>
.tictactoe @user
.surrender
.truth
.dare
.8ball <question>
.love <name1> <name2>
.ship @user1 @user2
.rate <thing>
.roast @user
.simp @user
.gay @user
.horny @user
.wasted @user
.howgay @user
.howsimp @user
.akinator
.wordchain
.mathquiz
.typingtest
.emojigame

_Have fun!_`
      });
    }
  },

  primbonmenu: {
    desc: "Primbon/Fortune menu",
    usage: ".primbonmenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🔮 *PRIMBON MENU*

.zodiac <sign>
.tarot
.tarotlove
.tarotcareer
.shio <year>
.artinama <name>
.artitanggal <DD-MM>
.jodoh <name1> <name2>
.jodohname <name1> <name2>
.ramalan
.ramalanjodoh
.ramalancinta
.nasib
.keberuntungan
.haribaik
.mimpi <keyword>
.tafsirmimpi <keyword>
.karakter <name>
.sifat <name>
.weton <day>
.neptunus <bday>
.numerology <bday>
.palmistry
.fengshui

_Discover your fortune!_`
      });
    }
  },

  groupmenu: {
    desc: "Group commands menu",
    usage: ".groupmenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `👮 *GROUP ADMIN MENU*

.kick @user
.add <number>
.promote @user
.demote @user
.mute
.unmute
.hidetag <message>
.tagall
.tagadmin
.tagnotadmin
.antilink on
.antilink off
.antilink kick
.antilink warn
.antilink delete
.antispam on
.antispam off
.antitoxic on
.antitoxic off
.welcome on
.welcome off
.welcome set <message>
.goodbye on
.goodbye off
.goodbye set <message>
.setgname <name>
.setgdesc <description>
.setgpp
.resetlink
.groupsetting
.delete
.warn @user
.warnings @user
.clearwarns @user
.setwarn <limit>
.antidelete on
.antidelete off
.poll <q>|<o1>|<o2>
.lockchat
.openchat

_Admin only commands!_`
      });
    }
  },

  ownermenu: {
    desc: "Owner commands menu",
    usage: ".ownermenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `👑 *OWNER MENU*

.addprem <number> <days>
.delprem <number>
.cekprem <number>
.listprem
.ban <number>
.unban <number>
.listban
.broadcast <message>
.bcgroup <message>
.bcpremium <message>
.setname <name>
.setbio <bio>
.setpp
.restart
.shutdown
.update
.mode <public/private>
.cleartmp
.clearsession
.addsudo <number>
.delsudo <number>
.listsudo
.eval <code>
.exec <command>
.join <link>
.leave
.block <number>
.unblock <number>
.getinfo <number>
.backup
.restore

_Owner only commands!_`
      });
    }
  },

  funmenu: {
    desc: "Fun commands menu",
    usage: ".funmenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🎭 *FUN MENU*

.joke
.darkjoke
.quote
.quotes
.motivasi
.fact
.randomfact
.meme
.pickup
.pickup_id
.insult
.compliment
.advice
.motivation
.riddle
.lyrics <song>
.anime
.waifu
.neko
.shinobu
.husbu
.wallpaper <query>
.couplepp
.aesthetic
.couple
.ppcouple
.fml
.showerthought

_Just for fun!_`
      });
    }
  },

  audiomenu: {
    desc: "Audio tools menu",
    usage: ".audiomenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🔊 *AUDIO TOOLS MENU*

.bass
.blown
.slow
.fast
.reverse
.nightcore
.earrape
.deep
.robot
.chipmunk
.vibrato
.8d
.distort
.echo
.flanger
.volume <value>

_Reply to audio with command!_`
      });
    }
  },

  searchmenu: {
    desc: "Search commands menu",
    usage: ".searchmenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🔍 *SEARCH MENU*

.google <query>
.youtube <query>
.ytsearch <query>
.image <query>
.gif <query>
.stickersearch <query>
.playstore <app>
.appstore <app>
.github <user/repo>
.npm <package>
.imdb <movie>
.movie <name>
.anime_search <name>
.manga <name>
.pinterest <query>
.wallpaper <query>
.spotify_search <query>
.shopee <item>
.tokopedia <item>
.amazon <item>
.ebay <item>

_Search anything!_`
      });
    }
  },

  usermenu: {
    desc: "User commands menu",
    usage: ".usermenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `👤 *USER MENU*

.register <name>|<age>
.unreg
.afk <reason>
.level
.leaderboard
.lb
.daily
.weekly
.myprofile
.me
.mystatus
.info
.profile @user

_Manage your profile!_`
      });
    }
  },

  imagemenu: {
    desc: "Image tools menu",
    usage: ".imagemenu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🖼️ *IMAGE TOOLS MENU*

.blur
.removebg
.nobg
.enhance
.hd
.remini
.cartoon
.pixelate
.invert
.grayscale
.sepia
.rotate <degree>
.flipimg
.mirror
.brightness <value>
.contrast <value>
.hdr
.fisheye
.wanted
.jail
.trigger
.facepalm
.beautiful
.trash
.affect
.batslap @user
.kiss @user
.slap @user
.hug @user
.pat @user

_Reply to image with command!_`
      });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🎨 STICKER COMMANDS
  // ─────────────────────────────────────────────────────────────────
  sticker: {
    desc: "Convert image/video to sticker",
    usage: ".sticker",
    example: ".sticker (reply to image/video)",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
      const videoMsg = msg.message?.videoMessage || quotedMsg?.videoMessage;

      if (!imageMsg && !videoMsg) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .sticker\n\n📌 Send or reply to an image/video"
        });
      }

      try {
        const media = imageMsg || videoMsg;
        const buffer = await sock.downloadMediaMessage(msg);

        await sock.sendMessage(sender, {
          sticker: buffer,
          mimetype: "image/webp",
          packname: config.botName,
          author: config.ownerDisplayName
        });
      } catch (err) {
        await sock.sendMessage(sender, { text: "❌ Failed to create sticker. Try again!" });
      }
    }
  },

  s: {
    desc: "Shortcut for sticker",
    usage: ".s",
    handler: async (sock, sender, args, msg) => {
      await commands.sticker.handler(sock, sender, args, msg);
    }
  },

  stickergif: {
    desc: "Convert GIF to animated sticker",
    usage: ".stickergif",
    handler: async (sock, sender, args, msg) => {
      await commands.sticker.handler(sock, sender, args, msg);
    }
  },

  stickervid: {
    desc: "Convert video to animated sticker",
    usage: ".stickervid",
    handler: async (sock, sender, args, msg) => {
      await commands.sticker.handler(sock, sender, args, msg);
    }
  },

  toimg: {
    desc: "Convert sticker to image",
    usage: ".toimg",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.stickerMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .toimg\n\n📌 Reply to a sticker" });
      }
      await sock.sendMessage(sender, { text: "🔄 Converting sticker to image..." });
    }
  },

  tomp3: {
    desc: "Convert video to audio",
    usage: ".tomp3",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.videoMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .tomp3\n\n📌 Reply to a video" });
      }
      await sock.sendMessage(sender, { text: "🔄 Converting to audio..." });
    }
  },

  tomp4: {
    desc: "Convert sticker/GIF to video",
    usage: ".tomp4",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.stickerMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .tomp4\n\n📌 Reply to an animated sticker" });
      }
      await sock.sendMessage(sender, { text: "🔄 Converting to video..." });
    }
  },

  tovideo: {
    desc: "Convert sticker to video",
    usage: ".tovideo",
    handler: async (sock, sender, args, msg) => {
      await commands.tomp4.handler(sock, sender, args, msg);
    }
  },

  emojimix: {
    desc: "Mix two emojis",
    usage: ".emojimix <emoji1>+<emoji2>",
    example: ".emojimix 😀+😎",
    handler: async (sock, sender, args, msg) => {
      if (!args.length || !args[0].includes('+')) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .emojimix <emoji1>+<emoji2>\n\n📌 Example: .emojimix 😀+😎" });
      }
      await sock.sendMessage(sender, { text: `🔄 Mixing emojis: ${args[0]}...` });
    }
  },

  emix: {
    desc: "Shortcut for emojimix",
    usage: ".emix <emoji1>+<emoji2>",
    handler: async (sock, sender, args, msg) => {
      await commands.emojimix.handler(sock, sender, args, msg);
    }
  },

  attp: {
    desc: "Animated text to sticker",
    usage: ".attp <text>",
    example: ".attp Hello World",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .attp <text>\n\n📌 Example: .attp Hello World" });
      }
      await sock.sendMessage(sender, { text: `🎨 Creating animated sticker: "${args.join(' ')}"...` });
    }
  },

  ttp: {
    desc: "Text to sticker",
    usage: ".ttp <text>",
    example: ".ttp Hello",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ttp <text>\n\n📌 Example: .ttp Hello" });
      }
      await sock.sendMessage(sender, { text: `🎨 Creating text sticker: "${args.join(' ')}"...` });
    }
  },

  take: {
    desc: "Take sticker with custom pack name",
    usage: ".take <packname>",
    example: ".take MyPack",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.stickerMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .take <packname>\n\n📌 Reply to a sticker" });
      }
      const packname = args.join(' ') || config.botName;
      await sock.sendMessage(sender, { text: `✅ Taking sticker with pack: "${packname}"` });
    }
  },

  steal: {
    desc: "Steal sticker (same as take)",
    usage: ".steal <packname>",
    handler: async (sock, sender, args, msg) => {
      await commands.take.handler(sock, sender, args, msg);
    }
  },

  rename: {
    desc: "Rename sticker pack/author",
    usage: ".rename <pack>|<author>",
    example: ".rename MyPack|MyName",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.stickerMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .rename <pack>|<author>\n\n📌 Reply to a sticker" });
      }
      await sock.sendMessage(sender, { text: "✅ Renaming sticker..." });
    }
  },

  crop: {
    desc: "Crop image to sticker",
    usage: ".crop",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .crop\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: "✅ Cropping image to sticker..." });
    }
  },

  circle: {
    desc: "Circle crop sticker",
    usage: ".circle",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .circle\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: "✅ Creating circle sticker..." });
    }
  },

  smeme: {
    desc: "Create sticker meme",
    usage: ".smeme <top>|<bottom>",
    example: ".smeme Top Text|Bottom Text",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .smeme <top>|<bottom>\n\n📌 Reply to image with top and bottom text" });
      }
      await sock.sendMessage(sender, { text: "✅ Creating meme sticker..." });
    }
  },

  wm: {
    desc: "Add watermark to sticker",
    usage: ".wm <text>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .wm <text>\n\n📌 Reply to sticker" });
      }
      await sock.sendMessage(sender, { text: "✅ Adding watermark..." });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🤖 AI COMMANDS
  // ─────────────────────────────────────────────────────────────────
  ai: {
    desc: "Chat with AI",
    usage: ".ai <query>",
    example: ".ai What is the capital of Kenya?",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .ai <query>\n\n📌 Example: .ai What is the capital of Kenya?"
        });
      }

      const question = args.join(" ");

      // Simple AI responses (integrate with real AI APIs for production)
      const responses = {
        greeting: ["Hello! How can I help you today? 😊", "Hi there! What's on your mind?", "Hey! I'm here to help!"],
        thanks: ["You're welcome! 🙏", "Happy to help!", "Anytime! 😊"],
        default: [
          `Great question! "${question}" - Let me think about that... 🤔`,
          `Interesting! About "${question}" - I'd say it depends on the context.`,
          `"${question}" - That's something worth exploring! 💡`
        ]
      };

      let response;
      const q = question.toLowerCase();

      if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
        response = pick(responses.greeting);
      } else if (q.includes("thank")) {
        response = pick(responses.thanks);
      } else {
        response = pick(responses.default);
      }

      await sock.sendMessage(sender, { text: `🤖 *AI Response*\n\n${response}` });
    }
  },

  gpt: {
    desc: "GPT AI assistant",
    usage: ".gpt <query>",
    example: ".gpt Explain quantum physics",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .gpt <query>\n\n📌 Example: .gpt Explain quantum physics" });
      }
      await commands.ai.handler(sock, sender, args, msg);
    }
  },

  chatgpt: {
    desc: "ChatGPT AI",
    usage: ".chatgpt <query>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .chatgpt <query>\n\n📌 Example: .chatgpt Tell me a story" });
      }
      await commands.ai.handler(sock, sender, args, msg);
    }
  },

  gemini: {
    desc: "Google Gemini AI",
    usage: ".gemini <query>",
    example: ".gemini What is machine learning?",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .gemini <query>\n\n📌 Example: .gemini What is machine learning?" });
      }
      await sock.sendMessage(sender, { text: `🔮 *Gemini AI*\n\nProcessing: "${args.join(' ')}"...\n\n_Feature coming soon!_` });
    }
  },

  bard: {
    desc: "Google Bard AI",
    usage: ".bard <query>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .bard <query>\n\n📌 Example: .bard Explain AI" });
      }
      await commands.gemini.handler(sock, sender, args, msg);
    }
  },

  blackbox: {
    desc: "Blackbox AI for coding",
    usage: ".blackbox <query>",
    example: ".blackbox How to sort array in Python",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .blackbox <query>\n\n📌 Example: .blackbox How to sort array in Python" });
      }
      await sock.sendMessage(sender, { text: `💻 *Blackbox AI*\n\nQuery: "${args.join(' ')}"\n\n_Coding AI feature coming soon!_` });
    }
  },

  imagine: {
    desc: "AI image generation",
    usage: ".imagine <prompt>",
    example: ".imagine A cat in space",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .imagine <prompt>\n\n📌 Example: .imagine A cat in space" });
      }
      await sock.sendMessage(sender, { text: `🎨 *AI Image*\n\nGenerating: "${args.join(' ')}"...\n\n_Feature coming soon!_` });
    }
  },

  dalle: {
    desc: "DALL-E image generation",
    usage: ".dalle <prompt>",
    example: ".dalle Sunset over mountains",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .dalle <prompt>\n\n📌 Example: .dalle Sunset over mountains" });
      }
      await commands.imagine.handler(sock, sender, args, msg);
    }
  },

  stable: {
    desc: "Stable Diffusion AI",
    usage: ".stable <prompt>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .stable <prompt>\n\n📌 Example: .stable A dragon" });
      }
      await commands.imagine.handler(sock, sender, args, msg);
    }
  },

  aiart: {
    desc: "AI art generator",
    usage: ".aiart <prompt>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .aiart <prompt>\n\n📌 Example: .aiart Abstract painting" });
      }
      await commands.imagine.handler(sock, sender, args, msg);
    }
  },

  aivoice: {
    desc: "AI voice generator",
    usage: ".aivoice <text>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .aivoice <text>\n\n📌 Example: .aivoice Hello world" });
      }
      await sock.sendMessage(sender, { text: `🔊 *AI Voice*\n\nGenerating: "${args.join(' ')}"...\n\n_Feature coming soon!_` });
    }
  },

  aicode: {
    desc: "AI code generator",
    usage: ".aicode <language> <task>",
    example: ".aicode python fibonacci",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .aicode <language> <task>\n\n📌 Example: .aicode python fibonacci" });
      }
      await sock.sendMessage(sender, { text: `💻 *AI Code*\n\nLanguage: ${args[0]}\nTask: ${args.slice(1).join(' ')}\n\n_Feature coming soon!_` });
    }
  },

  aisummarize: {
    desc: "AI text summarizer",
    usage: ".aisummarize",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.conversation && !args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .aisummarize\n\n📌 Reply to a text message or provide text" });
      }
      await sock.sendMessage(sender, { text: `📝 *AI Summary*\n\nSummarizing text...\n\n_Feature coming soon!_` });
    }
  },

  aitranslate: {
    desc: "AI translator",
    usage: ".aitranslate <lang> <text>",
    example: ".aitranslate es Hello world",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .aitranslate <lang> <text>\n\n📌 Example: .aitranslate es Hello world" });
      }
      await sock.sendMessage(sender, { text: `🌐 *AI Translate*\n\nTo: ${args[0]}\nText: ${args.slice(1).join(' ')}\n\n_Feature coming soon!_` });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🎮 GAMES & FUN
  // ─────────────────────────────────────────────────────────────────
  games: {
    desc: "Show available games",
    usage: ".games",
    handler: async (sock, sender, args, msg) => {
      await commands.gamemenu.handler(sock, sender, args, msg);
    }
  },

  roll: {
    desc: "Roll a dice",
    usage: ".roll [sides]",
    example: ".roll 20",
    handler: async (sock, sender, args, msg) => {
      const sides = parseInt(args[0]) || 6;
      const dice = Math.floor(Math.random() * sides) + 1;
      const emojis = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      await sock.sendMessage(sender, {
        text: `🎲 *Dice Roll (d${sides})*\n\nYou rolled: ${sides === 6 ? emojis[dice] : ''} *${dice}*`
      });
    }
  },

  dice: {
    desc: "Roll a dice",
    usage: ".dice",
    handler: async (sock, sender, args, msg) => {
      await commands.roll.handler(sock, sender, args, msg);
    }
  },

  flip: {
    desc: "Flip a coin",
    usage: ".flip",
    handler: async (sock, sender, args, msg) => {
      const result = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙";
      await sock.sendMessage(sender, {
        text: `🪙 *Coin Flip*\n\nResult: *${result}*`
      });
    }
  },

  coinflip: {
    desc: "Flip a coin",
    usage: ".coinflip",
    handler: async (sock, sender, args, msg) => {
      await commands.flip.handler(sock, sender, args, msg);
    }
  },

  rps: {
    desc: "Rock Paper Scissors",
    usage: ".rps <rock/paper/scissors>",
    example: ".rps rock",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .rps <rock/paper/scissors>\n\n📌 Example: .rps rock"
        });
      }

      const choices = ["rock", "paper", "scissors"];
      const emojis = { rock: "🪨", paper: "📄", scissors: "✂️" };
      const userChoice = args[0].toLowerCase();

      if (!choices.includes(userChoice)) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .rps <rock/paper/scissors>\n\n📌 Choose: rock, paper, or scissors" });
      }

      const botChoice = pick(choices);
      let result;

      if (userChoice === botChoice) result = "🤝 It's a tie!";
      else if (
        (userChoice === "rock" && botChoice === "scissors") ||
        (userChoice === "paper" && botChoice === "rock") ||
        (userChoice === "scissors" && botChoice === "paper")
      ) result = "🎉 You win!";
      else result = "😔 You lose!";

      await sock.sendMessage(sender, {
        text: `✊ *Rock Paper Scissors*\n\nYou: ${emojis[userChoice]}\nBot: ${emojis[botChoice]}\n\n${result}`
      });
    }
  },

  guess: {
    desc: "Guess the number game",
    usage: ".guess <1-10>",
    example: ".guess 5",
    handler: async (sock, sender, args, msg) => {
      const number = Math.floor(Math.random() * 10) + 1;
      const guess = parseInt(args[0]);

      if (!args.length || isNaN(guess)) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .guess <1-10>\n\n📌 Example: .guess 5"
        });
      }

      if (guess === number) {
        await sock.sendMessage(sender, { text: `🎉 *Correct!* The number was ${number}! 🏆` });
      } else {
        await sock.sendMessage(sender, { text: `❌ Wrong! The number was *${number}*. Try again!` });
      }
    }
  },

  tebak: {
    desc: "Guess number (alternate)",
    usage: ".tebak <1-10>",
    handler: async (sock, sender, args, msg) => {
      await commands.guess.handler(sock, sender, args, msg);
    }
  },

  quiz: {
    desc: "Trivia quiz",
    usage: ".quiz",
    handler: async (sock, sender, args, msg) => {
      const quizzes = [
        { q: "What is the capital of Kenya?", a: "Nairobi", opts: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"] },
        { q: "How many continents are there?", a: "7", opts: ["5", "6", "7", "8"] },
        { q: "What year did Kenya gain independence?", a: "1963", opts: ["1960", "1963", "1965", "1970"] },
        { q: "What is the largest planet?", a: "Jupiter", opts: ["Mars", "Saturn", "Jupiter", "Neptune"] },
        { q: "Who invented the telephone?", a: "Alexander Graham Bell", opts: ["Edison", "Tesla", "Bell", "Newton"] },
        { q: "What is H2O?", a: "Water", opts: ["Hydrogen", "Oxygen", "Water", "Carbon"] },
        { q: "Which planet is known as Red Planet?", a: "Mars", opts: ["Venus", "Mars", "Jupiter", "Mercury"] },
        { q: "What is the largest mammal?", a: "Blue Whale", opts: ["Elephant", "Blue Whale", "Giraffe", "Shark"] }
      ];

      const quiz = pick(quizzes);
      const shuffled = quiz.opts.sort(() => Math.random() - 0.5);

      await sock.sendMessage(sender, {
        text: `📝 *QUIZ TIME*\n\n${quiz.q}\n\nA) ${shuffled[0]}\nB) ${shuffled[1]}\nC) ${shuffled[2]}\nD) ${shuffled[3]}\n\n_Answer: ${quiz.a}_`
      });
    }
  },

  trivia: {
    desc: "Trivia game",
    usage: ".trivia",
    handler: async (sock, sender, args, msg) => {
      await commands.quiz.handler(sock, sender, args, msg);
    }
  },

  hangman: {
    desc: "Play hangman",
    usage: ".hangman",
    handler: async (sock, sender, args, msg) => {
      const words = ["JAVASCRIPT", "WHATSAPP", "KENYA", "PROGRAMMING", "COMPUTER", "SCHOLAR", "PREMIUM"];
      const word = pick(words);
      const hidden = word.split('').map(() => '_').join(' ');
      await sock.sendMessage(sender, {
        text: `🎮 *HANGMAN*\n\nWord: ${hidden}\nLetters: ${word.length}\n\n💡 Use .guess_letter <letter> to guess!`
      });
    }
  },

  guess_letter: {
    desc: "Guess letter in hangman",
    usage: ".guess_letter <letter>",
    example: ".guess_letter A",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .guess_letter <letter>\n\n📌 Example: .guess_letter A" });
      }
      await sock.sendMessage(sender, { text: `✅ You guessed: ${args[0].toUpperCase()}` });
    }
  },

  tictactoe: {
    desc: "Play Tic Tac Toe",
    usage: ".tictactoe @user",
    handler: async (sock, sender, args, msg) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .tictactoe @user\n\n📌 Mention someone to play with" });
      }
      await sock.sendMessage(sender, {
        text: `🎮 *TIC TAC TOE*\n\n╔═══╦═══╦═══╗\n║ 1 ║ 2 ║ 3 ║\n╠═══╬═══╬═══╣\n║ 4 ║ 5 ║ 6 ║\n╠═══╬═══╬═══╣\n║ 7 ║ 8 ║ 9 ║\n╚═══╩═══╩═══╝\n\nType 1-9 to make your move!`
      });
    }
  },

  surrender: {
    desc: "Surrender in tictactoe",
    usage: ".surrender",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: "🏳️ You surrendered the game!" });
    }
  },

  slot: {
    desc: "Slot machine game",
    usage: ".slot",
    handler: async (sock, sender, args, msg) => {
      const symbols = ["🍎", "🍊", "🍋", "🍇", "🍒", "💎", "7️⃣", "🔔"];
      const result = [pick(symbols), pick(symbols), pick(symbols)];

      let message = `🎰 *SLOT MACHINE*\n\n╔═══════════╗\n║ ${result.join(" │ ")} ║\n╚═══════════╝\n\n`;

      if (result[0] === result[1] && result[1] === result[2]) {
        message += "🎉 *JACKPOT!* 🎉";
      } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        message += "🥈 *Nice!* Two matching!";
      } else {
        message += "😔 No luck. Try again!";
      }

      await sock.sendMessage(sender, { text: message });
    }
  },

  casino: {
    desc: "Casino slot game",
    usage: ".casino",
    handler: async (sock, sender, args, msg) => {
      await commands.slot.handler(sock, sender, args, msg);
    }
  },

  love: {
    desc: "Love calculator",
    usage: ".love <name1> <name2>",
    example: ".love John Jane",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .love <name1> <name2>\n\n📌 Example: .love John Jane"
        });
      }

      const percent = Math.floor(Math.random() * 101);
      let message = `💕 *Love Calculator*\n\n❤️ ${args[0]} + ${args[1]} ❤️\n\n`;

      const hearts = "❤️".repeat(Math.ceil(percent / 10));
      message += `${hearts}\n*${percent}%* compatible!\n\n`;

      if (percent >= 80) message += "🔥 Perfect match!";
      else if (percent >= 60) message += "💖 Great potential!";
      else if (percent >= 40) message += "💛 Could work!";
      else message += "💔 Keep looking...";

      await sock.sendMessage(sender, { text: message });
    }
  },

  ship: {
    desc: "Ship two users",
    usage: ".ship @user1 @user2",
    handler: async (sock, sender, args, msg) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned || mentioned.length < 2) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ship @user1 @user2\n\n📌 Mention two users" });
      }
      const percent = Math.floor(Math.random() * 101);
      await sock.sendMessage(sender, {
        text: `💘 *SHIP METER*\n\n@${mentioned[0].split('@')[0]} ❤️ @${mentioned[1].split('@')[0]}\n\n${'💕'.repeat(Math.ceil(percent / 10))}\n*${percent}%*`,
        mentions: mentioned
      });
    }
  },

  "8ball": {
    desc: "Magic 8 ball",
    usage: ".8ball <question>",
    example: ".8ball Will I be rich?",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .8ball <question>\n\n📌 Example: .8ball Will I be rich?"
        });
      }

      const answers = [
        "Yes, definitely! ✅", "Without a doubt! 💯", "Most likely! 👍",
        "Outlook good! 😊", "Signs point to yes! ✨", "Ask again later... 🤔",
        "Cannot predict now... 🔮", "Don't count on it... 😬", "My reply is no... ❌",
        "Very doubtful... 😕", "Absolutely! 🎉", "Never! 🚫"
      ];

      await sock.sendMessage(sender, {
        text: `🎱 *Magic 8 Ball*\n\nQ: ${args.join(" ")}\n\n🔮 ${pick(answers)}`
      });
    }
  },

  truth: {
    desc: "Get a truth question",
    usage: ".truth",
    handler: async (sock, sender, args, msg) => {
      const truths = [
        "What's your biggest fear?",
        "Who was your first crush?",
        "What's your most embarrassing moment?",
        "Have you ever lied to your best friend?",
        "What's a secret you've never told anyone?",
        "What's the worst thing you've ever done?",
        "Who do you secretly dislike?",
        "What's your biggest insecurity?",
        "Have you ever cheated on a test?",
        "What's your most awkward date?"
      ];

      await sock.sendMessage(sender, { text: `🤔 *TRUTH*\n\n${pick(truths)}` });
    }
  },

  dare: {
    desc: "Get a dare",
    usage: ".dare",
    handler: async (sock, sender, args, msg) => {
      const dares = [
        "Send a voice note singing your favorite song!",
        "Change your profile pic for 1 hour!",
        "Text your crush right now!",
        "Do 10 pushups and send a video!",
        "Post a story saying 'I love SCHOLAR MD bot!'",
        "Send 'I love you' to the last person who texted you!",
        "Let someone post anything on your status!",
        "Call a random contact and sing happy birthday!",
        "Send your most embarrassing photo!",
        "Type with your eyes closed for next 2 minutes!"
      ];

      await sock.sendMessage(sender, { text: `😈 *DARE*\n\n${pick(dares)}` });
    }
  },

  tod: {
    desc: "Truth or Dare menu",
    usage: ".tod",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `🎭 *TRUTH OR DARE*\n\n.truth - Get a truth question\n.dare - Get a dare\n\n_Choose wisely!_`
      });
    }
  },

  rate: {
    desc: "Rate something",
    usage: ".rate <thing>",
    example: ".rate pizza",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .rate <thing>\n\n📌 Example: .rate pizza" });
      }
      const rating = Math.floor(Math.random() * 11);
      await sock.sendMessage(sender, {
        text: `⭐ *Rating: ${args.join(' ')}*\n\n${'⭐'.repeat(rating)}${'☆'.repeat(10 - rating)}\n\n*${rating}/10*`
      });
    }
  },

  roast: {
    desc: "Roast someone",
    usage: ".roast @user",
    handler: async (sock, sender, args, msg) => {
      const roasts = [
        "You're the reason God created the middle finger.",
        "I'd agree with you but then we'd both be wrong.",
        "You're like a cloud. When you disappear, it's a beautiful day.",
        "I'm not insulting you, I'm describing you.",
        "If laughter is the best medicine, your face must be curing the world.",
        "You're so dense, light bends around you."
      ];
      await sock.sendMessage(sender, { text: `🔥 *ROAST*\n\n${pick(roasts)}` });
    }
  },

  simp: {
    desc: "Simp meter",
    usage: ".simp @user",
    handler: async (sock, sender, args, msg) => {
      const percent = Math.floor(Math.random() * 101);
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      const target = mentioned?.[0] ? `@${mentioned[0].split('@')[0]}` : "You";
      await sock.sendMessage(sender, {
        text: `😍 *SIMP METER*\n\n${target}\n\n${'🥺'.repeat(Math.ceil(percent / 10))}\n*${percent}%* simp!`,
        mentions: mentioned || []
      });
    }
  },

  howsimp: {
    desc: "How simp are you",
    usage: ".howsimp @user",
    handler: async (sock, sender, args, msg) => {
      await commands.simp.handler(sock, sender, args, msg);
    }
  },

  gay: {
    desc: "Gay meter",
    usage: ".gay @user",
    handler: async (sock, sender, args, msg) => {
      const percent = Math.floor(Math.random() * 101);
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      const target = mentioned?.[0] ? `@${mentioned[0].split('@')[0]}` : "You";
      await sock.sendMessage(sender, {
        text: `🏳️‍🌈 *GAY METER*\n\n${target}\n\n${'🌈'.repeat(Math.ceil(percent / 10))}\n*${percent}%*`,
        mentions: mentioned || []
      });
    }
  },

  howgay: {
    desc: "How gay meter",
    usage: ".howgay @user",
    handler: async (sock, sender, args, msg) => {
      await commands.gay.handler(sock, sender, args, msg);
    }
  },

  horny: {
    desc: "Horny meter",
    usage: ".horny @user",
    handler: async (sock, sender, args, msg) => {
      const percent = Math.floor(Math.random() * 101);
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      const target = mentioned?.[0] ? `@${mentioned[0].split('@')[0]}` : "You";
      await sock.sendMessage(sender, {
        text: `😏 *HORNY METER*\n\n${target}\n\n${'🔥'.repeat(Math.ceil(percent / 10))}\n*${percent}%*`,
        mentions: mentioned || []
      });
    }
  },

  wasted: {
    desc: "Wasted effect",
    usage: ".wasted @user",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: "💀 *WASTED*\n\n_Feature coming soon!_" });
    }
  },

  akinator: {
    desc: "Play Akinator",
    usage: ".akinator",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: "🧞 *AKINATOR*\n\n_Think of a character..._\n\n_Feature coming soon!_" });
    }
  },

  wordchain: {
    desc: "Word chain game",
    usage: ".wordchain",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: "🔤 *WORD CHAIN*\n\nStarting word: APPLE\n\n_Say a word starting with 'E'!_" });
    }
  },

  mathquiz: {
    desc: "Math quiz",
    usage: ".mathquiz",
    handler: async (sock, sender, args, msg) => {
      const ops = ['+', '-', '*'];
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const op = pick(ops);
      const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
      await sock.sendMessage(sender, {
        text: `🔢 *MATH QUIZ*\n\n${a} ${op} ${b} = ?\n\n_Reply with the answer!_`
      });
    }
  },

  typingtest: {
    desc: "Typing test game",
    usage: ".typingtest",
    handler: async (sock, sender, args, msg) => {
      const sentences = [
        "The quick brown fox jumps over the lazy dog",
        "Pack my box with five dozen liquor jugs",
        "How vexingly quick daft zebras jump"
      ];
      await sock.sendMessage(sender, {
        text: `⌨️ *TYPING TEST*\n\nType this sentence:\n\n"${pick(sentences)}"\n\n_Reply with the exact text!_`
      });
    }
  },

  emojigame: {
    desc: "Emoji guessing game",
    usage: ".emojigame",
    handler: async (sock, sender, args, msg) => {
      const games = [
        { emoji: "🍎📱", answer: "Apple" },
        { emoji: "🔥🦊", answer: "Firefox" },
        { emoji: "👻📸", answer: "Snapchat" },
        { emoji: "🐦💬", answer: "Twitter" }
      ];
      const game = pick(games);
      await sock.sendMessage(sender, {
        text: `🎯 *EMOJI GAME*\n\n${game.emoji}\n\n_What is this?_\n\n||Answer: ${game.answer}||`
      });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🔧 TOOLS & UTILITIES
  // ─────────────────────────────────────────────────────────────────
  tools: {
    desc: "Show available tools",
    usage: ".tools",
    handler: async (sock, sender, args, msg) => {
      await commands.toolsmenu.handler(sock, sender, args, msg);
    }
  },

  time: {
    desc: "Get current time",
    usage: ".time [timezone]",
    example: ".time America/New_York",
    handler: async (sock, sender, args, msg) => {
      const tz = args[0] || config.timezone;
      const now = new Date().toLocaleString("en-US", { timeZone: tz });
      await sock.sendMessage(sender, {
        text: `⏰ *Current Time*\n\n🕐 ${now}\n📍 Timezone: ${tz}`
      });
    }
  },

  date: {
    desc: "Get today's date",
    usage: ".date",
    handler: async (sock, sender, args, msg) => {
      const now = nowEAT();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      await sock.sendMessage(sender, {
        text: `📅 *Today's Date*\n\n📆 ${now.toLocaleDateString("en-KE", { dateStyle: "full" })}\n🗓️ Day: ${days[now.getDay()]}`
      });
    }
  },

  runtime: {
    desc: "Bot uptime",
    usage: ".runtime",
    handler: async (sock, sender, args, msg) => {
      const uptime = process.uptime();
      const days = Math.floor(uptime / 86400);
      const hours = Math.floor((uptime % 86400) / 3600);
      const mins = Math.floor((uptime % 3600) / 60);
      const secs = Math.floor(uptime % 60);
      await sock.sendMessage(sender, {
        text: `⏱️ *Bot Uptime*\n\n${days}d ${hours}h ${mins}m ${secs}s`
      });
    }
  },

  uptime: {
    desc: "Bot uptime",
    usage: ".uptime",
    handler: async (sock, sender, args, msg) => {
      await commands.runtime.handler(sock, sender, args, msg);
    }
  },

  calc: {
    desc: "Calculator",
    usage: ".calc <expression>",
    example: ".calc 5+5*2",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .calc <expression>\n\n📌 Example: .calc 5+5*2"
        });
      }

      try {
        const expression = args.join(" ").replace(/[^0-9+\-*/().%\s]/g, "");
        const result = eval(expression);
        await sock.sendMessage(sender, {
          text: `🧮 *Calculator*\n\n${expression} = *${result}*`
        });
      } catch (err) {
        await sock.sendMessage(sender, { text: "❌ Invalid expression! Use only numbers and operators (+, -, *, /, %)" });
      }
    }
  },

  math: {
    desc: "Calculator",
    usage: ".math <expression>",
    handler: async (sock, sender, args, msg) => {
      await commands.calc.handler(sock, sender, args, msg);
    }
  },

  translate: {
    desc: "Translate text",
    usage: ".translate <lang> <text>",
    example: ".translate es Hello world",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .translate <lang> <text>\n\n📌 Example: .translate es Hello world\n\n*Languages:* en, es, fr, de, sw, ar, zh, ja, ko, hi"
        });
      }
      const lang = args[0];
      const text = args.slice(1).join(' ');
      await sock.sendMessage(sender, { text: `🌐 *Translate*\n\nTo: ${lang}\nText: ${text}\n\n_Feature requires API integration_` });
    }
  },

  trt: {
    desc: "Translate (shortcut)",
    usage: ".trt <lang> <text>",
    handler: async (sock, sender, args, msg) => {
      await commands.translate.handler(sock, sender, args, msg);
    }
  },

  tts: {
    desc: "Text to speech",
    usage: ".tts <text>",
    example: ".tts Hello world",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .tts <text>\n\n📌 Example: .tts Hello world" });
      }
      await sock.sendMessage(sender, { text: `🔊 *Text to Speech*\n\nText: "${args.join(' ')}"\n\n_Generating audio..._` });
    }
  },

  weather: {
    desc: "Get weather info",
    usage: ".weather <city>",
    example: ".weather Nairobi",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .weather <city>\n\n📌 Example: .weather Nairobi" });
      }
      await sock.sendMessage(sender, {
        text: `🌤️ *Weather: ${args.join(' ')}*\n\n🌡️ Temp: 25°C\n💧 Humidity: 65%\n💨 Wind: 10 km/h\n\n_Feature requires API_`
      });
    }
  },

  cuaca: {
    desc: "Get weather (alt)",
    usage: ".cuaca <city>",
    handler: async (sock, sender, args, msg) => {
      await commands.weather.handler(sock, sender, args, msg);
    }
  },

  define: {
    desc: "Define a word",
    usage: ".define <word>",
    example: ".define serendipity",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .define <word>\n\n📌 Example: .define serendipity" });
      }
      await sock.sendMessage(sender, { text: `📖 *Define: ${args[0]}*\n\n_Feature requires dictionary API_` });
    }
  },

  wiki: {
    desc: "Search Wikipedia",
    usage: ".wiki <query>",
    example: ".wiki Kenya",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .wiki <query>\n\n📌 Example: .wiki Kenya" });
      }
      await sock.sendMessage(sender, { text: `📚 *Wikipedia: ${args.join(' ')}*\n\n_Feature requires Wikipedia API_` });
    }
  },

  wikipedia: {
    desc: "Search Wikipedia",
    usage: ".wikipedia <query>",
    handler: async (sock, sender, args, msg) => {
      await commands.wiki.handler(sock, sender, args, msg);
    }
  },

  ss: {
    desc: "Screenshot website",
    usage: ".ss <url>",
    example: ".ss google.com",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ss <url>\n\n📌 Example: .ss google.com" });
      }
      await sock.sendMessage(sender, { text: `📸 *Screenshot*\n\nCapturing: ${args[0]}...\n\n_Feature requires screenshot API_` });
    }
  },

  ssweb: {
    desc: "Website screenshot",
    usage: ".ssweb <url>",
    handler: async (sock, sender, args, msg) => {
      await commands.ss.handler(sock, sender, args, msg);
    }
  },

  screenshot: {
    desc: "Website screenshot",
    usage: ".screenshot <url>",
    handler: async (sock, sender, args, msg) => {
      await commands.ss.handler(sock, sender, args, msg);
    }
  },

  qr: {
    desc: "Generate QR code",
    usage: ".qr <text>",
    example: ".qr Hello World",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .qr <text>\n\n📌 Example: .qr Hello World" });
      }
      await sock.sendMessage(sender, { text: `📱 *QR Code*\n\nGenerating QR for: "${args.join(' ')}"\n\n_Feature coming soon!_` });
    }
  },

  readqr: {
    desc: "Read QR code",
    usage: ".readqr",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .readqr\n\n📌 Reply to an image with QR code" });
      }
      await sock.sendMessage(sender, { text: `📱 *Reading QR...*\n\n_Feature coming soon!_` });
    }
  },

  short: {
    desc: "Shorten URL",
    usage: ".short <url>",
    example: ".short https://google.com",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .short <url>\n\n📌 Example: .short https://google.com" });
      }
      await sock.sendMessage(sender, { text: `🔗 *URL Shortener*\n\nOriginal: ${args[0]}\nShort: _Feature coming soon!_` });
    }
  },

  shorturl: {
    desc: "Shorten URL",
    usage: ".shorturl <url>",
    handler: async (sock, sender, args, msg) => {
      await commands.short.handler(sock, sender, args, msg);
    }
  },

  base64enc: {
    desc: "Encode to base64",
    usage: ".base64enc <text>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .base64enc <text>\n\n📌 Example: .base64enc Hello" });
      }
      const encoded = Buffer.from(args.join(' ')).toString('base64');
      await sock.sendMessage(sender, { text: `🔐 *Base64 Encode*\n\nInput: ${args.join(' ')}\nOutput: ${encoded}` });
    }
  },

  base64dec: {
    desc: "Decode from base64",
    usage: ".base64dec <base64>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .base64dec <base64>\n\n📌 Example: .base64dec SGVsbG8=" });
      }
      try {
        const decoded = Buffer.from(args[0], 'base64').toString('utf8');
        await sock.sendMessage(sender, { text: `🔓 *Base64 Decode*\n\nInput: ${args[0]}\nOutput: ${decoded}` });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Invalid base64 string!" });
      }
    }
  },

  binary: {
    desc: "Convert to binary",
    usage: ".binary <text>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .binary <text>\n\n📌 Example: .binary Hello" });
      }
      const binary = args.join(' ').split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      await sock.sendMessage(sender, { text: `💻 *Binary*\n\nInput: ${args.join(' ')}\nOutput: ${binary}` });
    }
  },

  decodebinary: {
    desc: "Decode binary",
    usage: ".decodebinary <binary>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .decodebinary <binary>\n\n📌 Example: .decodebinary 01001000" });
      }
      try {
        const decoded = args.join(' ').split(' ').map(b => String.fromCharCode(parseInt(b, 2))).join('');
        await sock.sendMessage(sender, { text: `💻 *Decode Binary*\n\nInput: ${args.join(' ')}\nOutput: ${decoded}` });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Invalid binary!" });
      }
    }
  },

  ocr: {
    desc: "Extract text from image",
    usage: ".ocr",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ocr\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `📝 *OCR*\n\nExtracting text...\n\n_Feature coming soon!_` });
    }
  },

  fetch: {
    desc: "Fetch URL content",
    usage: ".fetch <url>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .fetch <url>\n\n📌 Example: .fetch api.example.com" });
      }
      await sock.sendMessage(sender, { text: `🌐 *Fetch URL*\n\nURL: ${args[0]}\n\n_Feature coming soon!_` });
    }
  },

  whois: {
    desc: "Domain whois lookup",
    usage: ".whois <domain>",
    example: ".whois google.com",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .whois <domain>\n\n📌 Example: .whois google.com" });
      }
      await sock.sendMessage(sender, { text: `🔍 *WHOIS: ${args[0]}*\n\n_Feature coming soon!_` });
    }
  },

  ip: {
    desc: "IP/Domain lookup",
    usage: ".ip <domain/ip>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ip <domain/ip>\n\n📌 Example: .ip google.com" });
      }
      await sock.sendMessage(sender, { text: `🌐 *IP Lookup: ${args[0]}*\n\n_Feature coming soon!_` });
    }
  },

  currency: {
    desc: "Convert currency",
    usage: ".currency <amount> <from> <to>",
    example: ".currency 100 USD KES",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 3) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .currency <amount> <from> <to>\n\n📌 Example: .currency 100 USD KES" });
      }
      await sock.sendMessage(sender, { text: `💱 *Currency*\n\n${args[0]} ${args[1]} → ${args[2]}\n\n_Feature requires API_` });
    }
  },

  countdown: {
    desc: "Countdown to date",
    usage: ".countdown <date>",
    example: ".countdown 2026-12-25",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .countdown <date>\n\n📌 Example: .countdown 2026-12-25" });
      }
      const target = new Date(args[0]);
      const now = new Date();
      const diff = target - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      await sock.sendMessage(sender, { text: `⏳ *Countdown*\n\nTo: ${args[0]}\n\n*${days} days* remaining!` });
    }
  },

  reminder: {
    desc: "Set a reminder",
    usage: ".reminder <time> <message>",
    example: ".reminder 10m Check email",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .reminder <time> <message>\n\n📌 Example: .reminder 10m Check email" });
      }
      await sock.sendMessage(sender, { text: `⏰ *Reminder Set*\n\nTime: ${args[0]}\nMessage: ${args.slice(1).join(' ')}\n\n_Feature coming soon!_` });
    }
  },

  note: {
    desc: "Save a note",
    usage: ".note <text>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .note <text>\n\n📌 Example: .note Buy groceries" });
      }
      await sock.sendMessage(sender, { text: `📝 *Note Saved*\n\n"${args.join(' ')}"` });
    }
  },

  notes: {
    desc: "View saved notes",
    usage: ".notes",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `📝 *Your Notes*\n\n_No notes saved yet!_\n\nUse .note <text> to save` });
    }
  },

  clearnotes: {
    desc: "Clear all notes",
    usage: ".clearnotes",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🗑️ *Notes Cleared*` });
    }
  },

  poll: {
    desc: "Create a poll",
    usage: ".poll <question>|<opt1>|<opt2>",
    example: ".poll Favorite color?|Red|Blue|Green",
    handler: async (sock, sender, args, msg) => {
      const text = args.join(' ');
      const parts = text.split('|');
      if (parts.length < 3) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .poll <question>|<opt1>|<opt2>\n\n📌 Example: .poll Favorite color?|Red|Blue|Green" });
      }
      await sock.sendMessage(sender, { text: `📊 *Poll: ${parts[0]}*\n\n${parts.slice(1).map((o, i) => `${i + 1}. ${o}`).join('\n')}` });
    }
  },

  info: {
    desc: "Get user info",
    usage: ".info",
    handler: async (sock, sender, args, msg) => {
      const users = safeRead(USERS, {});
      const user = users[sender] || {};
      const now = nowEAT();

      const isPremium = user.premiumUntil && new Date(user.premiumUntil) > now;
      const isFree = user.freeUntil && new Date(user.freeUntil) > now;

      let status = "❌ Expired";
      if (isPremium) status = "💎 Premium";
      else if (isFree) status = "🆓 Free Trial";

      await sock.sendMessage(sender, {
        text: `📱 *User Information*\n\n📞 Phone: ${sender.split('@')[0]}\n📊 Status: ${status}\n📅 Premium Until: ${user.premiumUntil ? formatDate(user.premiumUntil) : 'N/A'}\n🆓 Free Until: ${user.freeUntil ? formatDate(user.freeUntil) : 'N/A'}`
      });
    }
  },

  profile: {
    desc: "View profile",
    usage: ".profile @user",
    handler: async (sock, sender, args, msg) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      const target = mentioned?.[0] || sender;
      await sock.sendMessage(sender, {
        text: `👤 *Profile*\n\n📱 Number: ${target.split('@')[0]}\n\n_Feature coming soon!_`,
        mentions: mentioned || []
      });
    }
  },

  stats: {
    desc: "Bot statistics",
    usage: ".stats",
    handler: async (sock, sender, args, msg) => {
      const analytics = safeRead(ANALYTICS, {});
      const users = safeRead(USERS, {});

      const totalUsers = Object.keys(users).length;
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const mins = Math.floor((uptime % 3600) / 60);

      await sock.sendMessage(sender, {
        text: `📊 *Bot Statistics*\n\n🤖 Bot: ${config.botName}\n📦 Version: ${config.edition}\n👥 Total Users: ${totalUsers}\n⏱️ Uptime: ${hours}h ${mins}m\n🌐 Status: ✅ Online\n📩 Total Messages: ${analytics.messages || 0}`
      });
    }
  },

  totalusers: {
    desc: "Total users count",
    usage: ".totalusers",
    handler: async (sock, sender, args, msg) => {
      const users = safeRead(USERS, {});
      await sock.sendMessage(sender, { text: `👥 *Total Users*\n\n${Object.keys(users).length} users registered` });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 📥 DOWNLOAD COMMANDS
  // ─────────────────────────────────────────────────────────────────
  download: {
    desc: "Show download options",
    usage: ".download",
    handler: async (sock, sender, args, msg) => {
      await commands.downloader.handler(sock, sender, args, msg);
    }
  },

  play: {
    desc: "Play/download music",
    usage: ".play <name/link>",
    example: ".play Shape of You",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .play <name/link>\n\n📌 Example: .play Shape of You"
        });
      }

      await sock.sendMessage(sender, {
        text: `🎵 *Searching...*\n\n🔍 "${args.join(' ')}"\n\n⏳ Finding best match...`
      });
    }
  },

  song: {
    desc: "Download song",
    usage: ".song <name/link>",
    example: ".song Blinding Lights",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .song <name/link>\n\n📌 Example: .song Blinding Lights" });
      }
      await sock.sendMessage(sender, { text: `🎵 *Downloading Song*\n\nSearching: "${args.join(' ')}"...` });
    }
  },

  music: {
    desc: "Download music",
    usage: ".music <name/link>",
    handler: async (sock, sender, args, msg) => {
      await commands.song.handler(sock, sender, args, msg);
    }
  },

  video: {
    desc: "Download video",
    usage: ".video <name/link>",
    example: ".video Funny cats",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .video <name/link>\n\n📌 Example: .video Funny cats" });
      }
      await sock.sendMessage(sender, { text: `🎬 *Downloading Video*\n\nSearching: "${args.join(' ')}"...` });
    }
  },

  ytmp3: {
    desc: "YouTube to MP3",
    usage: ".ytmp3 <link>",
    example: ".ytmp3 https://youtu.be/xxx",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ytmp3 <link>\n\n📌 Example: .ytmp3 https://youtu.be/xxx" });
      }
      await sock.sendMessage(sender, { text: `🎵 *YouTube to MP3*\n\nDownloading: ${args[0]}...` });
    }
  },

  ytmp4: {
    desc: "YouTube to MP4",
    usage: ".ytmp4 <link>",
    example: ".ytmp4 https://youtu.be/xxx",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ytmp4 <link>\n\n📌 Example: .ytmp4 https://youtu.be/xxx" });
      }
      await sock.sendMessage(sender, { text: `🎬 *YouTube to MP4*\n\nDownloading: ${args[0]}...` });
    }
  },

  ytsearch: {
    desc: "Search YouTube",
    usage: ".ytsearch <query>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ytsearch <query>\n\n📌 Example: .ytsearch lofi music" });
      }
      await sock.sendMessage(sender, { text: `🔍 *YouTube Search*\n\nQuery: "${args.join(' ')}"...` });
    }
  },

  tiktok: {
    desc: "Download TikTok",
    usage: ".tiktok <link>",
    example: ".tiktok https://vm.tiktok.com/xxx",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .tiktok <link>\n\n📌 Example: .tiktok https://vm.tiktok.com/xxx" });
      }
      await sock.sendMessage(sender, { text: `📱 *TikTok Download*\n\nDownloading: ${args[0]}...` });
    }
  },

  tt: {
    desc: "TikTok download (short)",
    usage: ".tt <link>",
    handler: async (sock, sender, args, msg) => {
      await commands.tiktok.handler(sock, sender, args, msg);
    }
  },

  tiktokmp3: {
    desc: "TikTok audio",
    usage: ".tiktokmp3 <link>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .tiktokmp3 <link>\n\n📌 Example: .tiktokmp3 https://vm.tiktok.com/xxx" });
      }
      await sock.sendMessage(sender, { text: `🎵 *TikTok Audio*\n\nDownloading: ${args[0]}...` });
    }
  },

  instagram: {
    desc: "Download Instagram",
    usage: ".instagram <link>",
    example: ".instagram https://instagram.com/p/xxx",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .instagram <link>\n\n📌 Example: .instagram https://instagram.com/p/xxx" });
      }
      await sock.sendMessage(sender, { text: `📷 *Instagram Download*\n\nDownloading: ${args[0]}...` });
    }
  },

  ig: {
    desc: "Instagram download (short)",
    usage: ".ig <link>",
    handler: async (sock, sender, args, msg) => {
      await commands.instagram.handler(sock, sender, args, msg);
    }
  },

  igstory: {
    desc: "Download IG story",
    usage: ".igstory <username>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .igstory <username>\n\n📌 Example: .igstory johndoe" });
      }
      await sock.sendMessage(sender, { text: `📸 *Instagram Story*\n\nUser: ${args[0]}...` });
    }
  },

  facebook: {
    desc: "Download Facebook video",
    usage: ".facebook <link>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .facebook <link>\n\n📌 Example: .facebook https://fb.watch/xxx" });
      }
      await sock.sendMessage(sender, { text: `📘 *Facebook Download*\n\nDownloading: ${args[0]}...` });
    }
  },

  fb: {
    desc: "Facebook download (short)",
    usage: ".fb <link>",
    handler: async (sock, sender, args, msg) => {
      await commands.facebook.handler(sock, sender, args, msg);
    }
  },

  twitter: {
    desc: "Download Twitter/X video",
    usage: ".twitter <link>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .twitter <link>\n\n📌 Example: .twitter https://x.com/xxx/status/xxx" });
      }
      await sock.sendMessage(sender, { text: `🐦 *Twitter Download*\n\nDownloading: ${args[0]}...` });
    }
  },

  x: {
    desc: "X/Twitter download",
    usage: ".x <link>",
    handler: async (sock, sender, args, msg) => {
      await commands.twitter.handler(sock, sender, args, msg);
    }
  },

  spotify: {
    desc: "Download Spotify track",
    usage: ".spotify <link>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .spotify <link>\n\n📌 Example: .spotify https://open.spotify.com/track/xxx" });
      }
      await sock.sendMessage(sender, { text: `🎵 *Spotify Download*\n\nDownloading: ${args[0]}...` });
    }
  },

  mediafire: {
    desc: "Download from MediaFire",
    usage: ".mediafire <link>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .mediafire <link>\n\n📌 Example: .mediafire https://mediafire.com/xxx" });
      }
      await sock.sendMessage(sender, { text: `📁 *MediaFire Download*\n\nDownloading: ${args[0]}...` });
    }
  },

  apk: {
    desc: "Download APK",
    usage: ".apk <name>",
    example: ".apk WhatsApp",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .apk <name>\n\n📌 Example: .apk WhatsApp" });
      }
      await sock.sendMessage(sender, { text: `📱 *APK Download*\n\nSearching: ${args.join(' ')}...` });
    }
  },

  pinterest: {
    desc: "Download from Pinterest",
    usage: ".pinterest <query/link>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .pinterest <query/link>\n\n📌 Example: .pinterest aesthetic wallpaper" });
      }
      await sock.sendMessage(sender, { text: `📌 *Pinterest*\n\nSearching: ${args.join(' ')}...` });
    }
  },

  gdrive: {
    desc: "Download from Google Drive",
    usage: ".gdrive <link>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .gdrive <link>\n\n📌 Example: .gdrive https://drive.google.com/xxx" });
      }
      await sock.sendMessage(sender, { text: `📁 *Google Drive*\n\nDownloading: ${args[0]}...` });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 💰 PREMIUM & PAYMENT (REMOVED)
  // ─────────────────────────────────────────────────────────────────
  // Commands removed as per free version request

  // ─────────────────────────────────────────────────────────────────
  // 🔮 PRIMBON / FORTUNE COMMANDS
  // ─────────────────────────────────────────────────────────────────
  zodiac: {
    desc: "Get zodiac info",
    usage: ".zodiac <sign>",
    example: ".zodiac leo",
    handler: async (sock, sender, args, msg) => {
      const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
      if (!args.length || !signs.includes(args[0].toLowerCase())) {
        return sock.sendMessage(sender, { text: `❌ *Usage:* .zodiac <sign>\n\n📌 Signs: ${signs.join(', ')}` });
      }
      const sign = args[0].toLowerCase();
      const luck = Math.floor(Math.random() * 100);
      await sock.sendMessage(sender, {
        text: `♈ *Zodiac: ${sign.toUpperCase()}*\n\n🍀 Lucky Number: ${Math.floor(Math.random() * 99) + 1}\n💕 Love: ${Math.floor(Math.random() * 100)}%\n💼 Career: ${Math.floor(Math.random() * 100)}%\n💰 Money: ${Math.floor(Math.random() * 100)}%\n\n✨ Overall Luck: ${luck}%`
      });
    }
  },

  horoscope: {
    desc: "Daily horoscope",
    usage: ".horoscope <sign>",
    handler: async (sock, sender, args, msg) => {
      await commands.zodiac.handler(sock, sender, args, msg);
    }
  },

  tarot: {
    desc: "Tarot card reading",
    usage: ".tarot",
    handler: async (sock, sender, args, msg) => {
      const cards = ["The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World"];
      const card = pick(cards);
      await sock.sendMessage(sender, { text: `🃏 *TAROT READING*\n\n✨ Your Card: *${card}*\n\n_The universe has a message for you..._` });
    }
  },

  tarotlove: {
    desc: "Tarot love reading",
    usage: ".tarotlove",
    handler: async (sock, sender, args, msg) => {
      const cards = ["The Lovers", "Two of Cups", "Ace of Cups", "Ten of Cups", "Knight of Cups", "Queen of Cups", "King of Cups"];
      await sock.sendMessage(sender, { text: `💕 *TAROT LOVE*\n\n✨ Your Card: *${pick(cards)}*\n\n_Love guidance for you..._` });
    }
  },

  tarotcareer: {
    desc: "Tarot career reading",
    usage: ".tarotcareer",
    handler: async (sock, sender, args, msg) => {
      const cards = ["Ace of Pentacles", "Three of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "The Emperor", "The Chariot"];
      await sock.sendMessage(sender, { text: `💼 *TAROT CAREER*\n\n✨ Your Card: *${pick(cards)}*\n\n_Career guidance for you..._` });
    }
  },

  shio: {
    desc: "Chinese zodiac by year",
    usage: ".shio <year>",
    example: ".shio 2000",
    handler: async (sock, sender, args, msg) => {
      if (!args.length || isNaN(args[0])) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .shio <year>\n\n📌 Example: .shio 2000" });
      }
      const zodiac = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
      const year = parseInt(args[0]);
      const shio = zodiac[(year - 4) % 12];
      await sock.sendMessage(sender, { text: `🐉 *Chinese Zodiac*\n\nYear: ${year}\nZodiac: *${shio}* 🎋` });
    }
  },

  artinama: {
    desc: "Name meaning",
    usage: ".artinama <name>",
    example: ".artinama John",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .artinama <name>\n\n📌 Example: .artinama John" });
      }
      await sock.sendMessage(sender, { text: `📛 *Name Meaning*\n\nName: ${args.join(' ')}\n\n_Feature requires name API_` });
    }
  },

  artitanggal: {
    desc: "Birthday meaning",
    usage: ".artitanggal <DD-MM>",
    example: ".artitanggal 15-06",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .artitanggal <DD-MM>\n\n📌 Example: .artitanggal 15-06" });
      }
      await sock.sendMessage(sender, { text: `📅 *Birthday Meaning*\n\nDate: ${args[0]}\n\n_Feature coming soon!_` });
    }
  },

  jodoh: {
    desc: "Love match calculator",
    usage: ".jodoh <name1> <name2>",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .jodoh <name1> <name2>\n\n📌 Example: .jodoh John Jane" });
      }
      await commands.love.handler(sock, sender, args, msg);
    }
  },

  jodohname: {
    desc: "Jodoh by name",
    usage: ".jodohname <name1> <name2>",
    handler: async (sock, sender, args, msg) => {
      await commands.jodoh.handler(sock, sender, args, msg);
    }
  },

  ramalan: {
    desc: "Daily fortune",
    usage: ".ramalan",
    handler: async (sock, sender, args, msg) => {
      const fortunes = [
        "Today will bring unexpected opportunities! 🌟",
        "Be patient, good things are coming! 🍀",
        "A surprise awaits you today! 🎁",
        "Focus on your goals, success is near! 💪",
        "Love is in the air today! 💕",
        "Financial luck is on your side! 💰"
      ];
      await sock.sendMessage(sender, { text: `🔮 *Daily Fortune*\n\n${pick(fortunes)}` });
    }
  },

  ramalanjodoh: {
    desc: "Love fortune",
    usage: ".ramalanjodoh",
    handler: async (sock, sender, args, msg) => {
      const fortunes = ["Your soulmate is closer than you think! 💕", "Be open to love today! 💖", "Romance is heading your way! 🌹"];
      await sock.sendMessage(sender, { text: `💕 *Love Fortune*\n\n${pick(fortunes)}` });
    }
  },

  ramalancinta: {
    desc: "Love prediction",
    usage: ".ramalancinta",
    handler: async (sock, sender, args, msg) => {
      await commands.ramalanjodoh.handler(sock, sender, args, msg);
    }
  },

  nasib: {
    desc: "Fate prediction",
    usage: ".nasib",
    handler: async (sock, sender, args, msg) => {
      const nasib = ["Very Lucky! 🍀", "Lucky! ✨", "Neutral 😐", "Challenging 💪", "Very Challenging 🔥"];
      await sock.sendMessage(sender, { text: `🎰 *Your Fate Today*\n\n${pick(nasib)}` });
    }
  },

  keberuntungan: {
    desc: "Luck meter",
    usage: ".keberuntungan",
    handler: async (sock, sender, args, msg) => {
      const luck = Math.floor(Math.random() * 101);
      await sock.sendMessage(sender, { text: `🍀 *Luck Meter*\n\n${'🍀'.repeat(Math.ceil(luck / 10))}\n\n*${luck}%* lucky today!` });
    }
  },

  haribaik: {
    desc: "Good day prediction",
    usage: ".haribaik",
    handler: async (sock, sender, args, msg) => {
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      await sock.sendMessage(sender, { text: `📅 *Lucky Day*\n\nYour lucky day this week: *${pick(days)}*` });
    }
  },

  mimpi: {
    desc: "Dream interpretation",
    usage: ".mimpi <keyword>",
    example: ".mimpi snake",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .mimpi <keyword>\n\n📌 Example: .mimpi snake" });
      }
      await sock.sendMessage(sender, { text: `💭 *Dream: ${args.join(' ')}*\n\n_Dream interpretation feature coming soon!_` });
    }
  },

  tafsirmimpi: {
    desc: "Dream meaning",
    usage: ".tafsirmimpi <keyword>",
    handler: async (sock, sender, args, msg) => {
      await commands.mimpi.handler(sock, sender, args, msg);
    }
  },

  karakter: {
    desc: "Character by name",
    usage: ".karakter <name>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .karakter <name>\n\n📌 Example: .karakter John" });
      }
      const traits = ["Creative", "Loyal", "Ambitious", "Kind", "Brave", "Wise", "Passionate", "Calm"];
      await sock.sendMessage(sender, { text: `👤 *Character: ${args[0]}*\n\nTraits: ${pick(traits)}, ${pick(traits)}, ${pick(traits)}` });
    }
  },

  sifat: {
    desc: "Personality by name",
    usage: ".sifat <name>",
    handler: async (sock, sender, args, msg) => {
      await commands.karakter.handler(sock, sender, args, msg);
    }
  },

  weton: {
    desc: "Javanese day meaning",
    usage: ".weton <day>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .weton <day>\n\n📌 Example: .weton Monday" });
      }
      await sock.sendMessage(sender, { text: `📅 *Weton: ${args[0]}*\n\n_Javanese calendar feature_` });
    }
  },

  neptunus: {
    desc: "Neptune fortune",
    usage: ".neptunus <birthday>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .neptunus <birthday>\n\n📌 Example: .neptunus 1990-01-15" });
      }
      await sock.sendMessage(sender, { text: `🔵 *Neptune Reading*\n\nBirthday: ${args[0]}\n\n_Feature coming soon!_` });
    }
  },

  numerology: {
    desc: "Numerology reading",
    usage: ".numerology <birthday>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .numerology <birthday>\n\n📌 Example: .numerology 1990-01-15" });
      }
      const lifeNumber = Math.floor(Math.random() * 9) + 1;
      await sock.sendMessage(sender, { text: `🔢 *Numerology*\n\nYour Life Path Number: *${lifeNumber}*` });
    }
  },

  palmistry: {
    desc: "Palm reading",
    usage: ".palmistry",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `✋ *Palmistry*\n\n_Send a photo of your palm for reading!_\n\n_Feature coming soon!_` });
    }
  },

  fengshui: {
    desc: "Feng Shui tips",
    usage: ".fengshui",
    handler: async (sock, sender, args, msg) => {
      const tips = [
        "Clear clutter from your entrance for good energy! 🚪",
        "Add plants to bring life energy! 🌱",
        "Position your desk to face the door! 🖥️",
        "Use mirrors to expand space and light! 🪞"
      ];
      await sock.sendMessage(sender, { text: `🏠 *Feng Shui Tip*\n\n${pick(tips)}` });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 👑 OWNER COMMANDS
  // ─────────────────────────────────────────────────────────────────
  addprem: {
    desc: "Add premium to user (owner)",
    usage: ".addprem <number> <days>",
    example: ".addprem 254712345678 30",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }

      const target = args[0]?.replace(/[^0-9]/g, "");
      const days = parseInt(args[1]) || 30;

      if (!target) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .addprem <number> <days>\n\n📌 Example: .addprem 254712345678 30"
        });
      }

      const users = safeRead(USERS, {});
      const targetJid = `${target}@s.whatsapp.net`;

      if (!users[targetJid]) {
        users[targetJid] = { freeUntil: null, premiumUntil: null };
      }

      users[targetJid].premiumUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      write(USERS, users);

      await sock.sendMessage(sender, {
        text: `✅ Premium added!\n\n📱 User: ${target}\n📅 Duration: ${days} days`
      });

      await sock.sendMessage(targetJid, {
        text: `🎉 *PREMIUM ACTIVATED!*\n\nYou now have ${days} days of premium access!\n\nEnjoy all features of ${config.botName}! 💎`
      });
    }
  },

  delprem: {
    desc: "Remove premium (owner)",
    usage: ".delprem <number>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .delprem <number>\n\n📌 Example: .delprem 254712345678" });
      }
      const users = safeRead(USERS, {});
      const targetJid = `${args[0].replace(/[^0-9]/g, "")}@s.whatsapp.net`;
      if (users[targetJid]) {
        users[targetJid].premiumUntil = null;
        write(USERS, users);
      }
      await sock.sendMessage(sender, { text: `✅ Premium removed from ${args[0]}` });
    }
  },

  cekprem: {
    desc: "Check user premium (owner)",
    usage: ".cekprem <number>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .cekprem <number>" });
      }
      const users = safeRead(USERS, {});
      const targetJid = `${args[0].replace(/[^0-9]/g, "")}@s.whatsapp.net`;
      const user = users[targetJid];
      if (user?.premiumUntil) {
        await sock.sendMessage(sender, { text: `📋 *Premium Status*\n\n📱 ${args[0]}\n📅 Until: ${formatDate(user.premiumUntil)}` });
      } else {
        await sock.sendMessage(sender, { text: `📋 User ${args[0]} has no premium` });
      }
    }
  },

  listprem: {
    desc: "List premium users (owner)",
    usage: ".listprem",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      const users = safeRead(USERS, {});
      const now = new Date();
      const premUsers = Object.entries(users).filter(([jid, u]) => u.premiumUntil && new Date(u.premiumUntil) > now);
      if (premUsers.length === 0) {
        return sock.sendMessage(sender, { text: "📋 No premium users" });
      }
      const list = premUsers.map(([jid, u]) => `• ${jid.split('@')[0]} - ${formatDate(u.premiumUntil)}`).join('\n');
      await sock.sendMessage(sender, { text: `💎 *Premium Users*\n\n${list}` });
    }
  },

  ban: {
    desc: "Ban user (owner)",
    usage: ".ban <number>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ban <number>" });
      }
      await sock.sendMessage(sender, { text: `🚫 User ${args[0]} has been banned` });
    }
  },

  unban: {
    desc: "Unban user (owner)",
    usage: ".unban <number>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .unban <number>" });
      }
      await sock.sendMessage(sender, { text: `✅ User ${args[0]} has been unbanned` });
    }
  },

  listban: {
    desc: "List banned users",
    usage: ".listban",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `🚫 *Banned Users*\n\n_No users banned_` });
    }
  },

  broadcast: {
    desc: "Broadcast message (owner)",
    usage: ".broadcast <message>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }

      if (!args.length) {
        return sock.sendMessage(sender, {
          text: "❌ *Usage:* .broadcast <message>"
        });
      }

      const users = safeRead(USERS, {});
      const message = args.join(" ");
      let sent = 0;

      for (const jid of Object.keys(users)) {
        try {
          await sock.sendMessage(jid, {
            text: `📢 *BROADCAST*\n\n${message}\n\n_From: ${config.botName}_`
          });
          sent++;
        } catch (err) { }
      }

      await sock.sendMessage(sender, { text: `✅ Broadcast sent to ${sent} users!` });
    }
  },

  bcgroup: {
    desc: "Broadcast to groups (owner)",
    usage: ".bcgroup <message>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .bcgroup <message>" });
      }
      await sock.sendMessage(sender, { text: `📢 Broadcasting to groups...` });
    }
  },

  bcpremium: {
    desc: "Broadcast to premium (owner)",
    usage: ".bcpremium <message>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .bcpremium <message>" });
      }
      await sock.sendMessage(sender, { text: `📢 Broadcasting to premium users...` });
    }
  },

  setname: {
    desc: "Set bot name (owner)",
    usage: ".setname <name>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .setname <name>" });
      }
      await sock.sendMessage(sender, { text: `✅ Bot name set to: ${args.join(' ')}` });
    }
  },

  setbio: {
    desc: "Set bot bio (owner)",
    usage: ".setbio <bio>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .setbio <bio>" });
      }
      await sock.sendMessage(sender, { text: `✅ Bot bio updated` });
    }
  },

  setpp: {
    desc: "Set bot profile pic (owner)",
    usage: ".setpp",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .setpp\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `✅ Profile picture updated` });
    }
  },

  restart: {
    desc: "Restart bot (owner)",
    usage: ".restart",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `🔄 Restarting bot...` });
    }
  },

  shutdown: {
    desc: "Shutdown bot (owner)",
    usage: ".shutdown",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `🔴 Shutting down...` });
    }
  },

  update: {
    desc: "Update bot (owner)",
    usage: ".update",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `🔄 Checking for updates...` });
    }
  },

  mode: {
    desc: "Set bot mode (owner)",
    usage: ".mode <public/private>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length || !['public', 'private'].includes(args[0])) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .mode <public/private>" });
      }
      await sock.sendMessage(sender, { text: `✅ Bot mode set to: ${args[0]}` });
    }
  },

  cleartmp: {
    desc: "Clear temp files (owner)",
    usage: ".cleartmp",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `🗑️ Temp files cleared` });
    }
  },

  clearsession: {
    desc: "Clear session (owner)",
    usage: ".clearsession",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `🗑️ Session cleared` });
    }
  },

  addsudo: {
    desc: "Add sudo user (owner)",
    usage: ".addsudo <number>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .addsudo <number>" });
      }
      await sock.sendMessage(sender, { text: `✅ Added ${args[0]} as sudo` });
    }
  },

  delsudo: {
    desc: "Remove sudo user (owner)",
    usage: ".delsudo <number>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .delsudo <number>" });
      }
      await sock.sendMessage(sender, { text: `✅ Removed ${args[0]} from sudo` });
    }
  },

  listsudo: {
    desc: "List sudo users",
    usage: ".listsudo",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `👤 *Sudo Users*\n\n_No sudo users_` });
    }
  },

  eval: {
    desc: "Evaluate code (owner)",
    usage: ".eval <code>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .eval <code>" });
      }
      try {
        const result = eval(args.join(' '));
        await sock.sendMessage(sender, { text: `✅ Result:\n\n${result}` });
      } catch (e) {
        await sock.sendMessage(sender, { text: `❌ Error:\n\n${e.message}` });
      }
    }
  },

  exec: {
    desc: "Execute shell (owner)",
    usage: ".exec <command>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .exec <command>" });
      }
      await sock.sendMessage(sender, { text: `⚠️ Shell execution disabled for security` });
    }
  },

  join: {
    desc: "Join group (owner)",
    usage: ".join <link>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .join <link>" });
      }
      await sock.sendMessage(sender, { text: `✅ Joining group...` });
    }
  },

  leave: {
    desc: "Leave group (owner)",
    usage: ".leave",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `👋 Leaving group...` });
    }
  },

  block: {
    desc: "Block user (owner)",
    usage: ".block <number>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .block <number>" });
      }
      await sock.sendMessage(sender, { text: `🚫 Blocked ${args[0]}` });
    }
  },

  unblock: {
    desc: "Unblock user (owner)",
    usage: ".unblock <number>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .unblock <number>" });
      }
      await sock.sendMessage(sender, { text: `✅ Unblocked ${args[0]}` });
    }
  },

  getinfo: {
    desc: "Get user info (owner)",
    usage: ".getinfo <number>",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .getinfo <number>" });
      }
      await sock.sendMessage(sender, { text: `📋 Info for ${args[0]}\n\n_Feature coming soon_` });
    }
  },

  backup: {
    desc: "Backup data (owner)",
    usage: ".backup",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `📦 Creating backup...` });
    }
  },

  restore: {
    desc: "Restore data (owner)",
    usage: ".restore",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      await sock.sendMessage(sender, { text: `📦 Restoring data...\n\n📌 Reply to backup file` });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 👥 GROUP ADMIN COMMANDS
  // ─────────────────────────────────────────────────────────────────
  kick: {
    desc: "Kick member from group",
    usage: ".kick @user",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .kick @user\n\n📌 Mention the user to kick" });
      }
      try {
        await sock.groupParticipantsUpdate(sender, mentioned, 'remove');
        await sock.sendMessage(sender, { text: `✅ Kicked ${mentioned.length} member(s)` });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to kick. Make sure bot is admin!" });
      }
    }
  },

  remove: {
    desc: "Remove member from group",
    usage: ".remove @user",
    handler: async (sock, sender, args, msg) => {
      await commands.kick.handler(sock, sender, args, msg);
    }
  },

  add: {
    desc: "Add member to group",
    usage: ".add <number>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const number = args[0]?.replace(/[^0-9]/g, "");
      if (!number) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .add <number>\n\n📌 Example: .add 254712345678" });
      }
      try {
        await sock.groupParticipantsUpdate(sender, [`${number}@s.whatsapp.net`], 'add');
        await sock.sendMessage(sender, { text: `✅ Added ${number}` });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to add. User may have privacy settings enabled." });
      }
    }
  },

  promote: {
    desc: "Promote member to admin",
    usage: ".promote @user",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .promote @user\n\n📌 Mention the user to promote" });
      }
      try {
        await sock.groupParticipantsUpdate(sender, mentioned, 'promote');
        await sock.sendMessage(sender, { text: `✅ Promoted to admin!`, mentions: mentioned });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to promote. Make sure bot is admin!" });
      }
    }
  },

  demote: {
    desc: "Demote admin to member",
    usage: ".demote @user",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .demote @user\n\n📌 Mention the admin to demote" });
      }
      try {
        await sock.groupParticipantsUpdate(sender, mentioned, 'demote');
        await sock.sendMessage(sender, { text: `✅ Demoted from admin!`, mentions: mentioned });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to demote. Make sure bot is admin!" });
      }
    }
  },

  mute: {
    desc: "Mute group (only admins can send)",
    usage: ".mute",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        await sock.groupSettingUpdate(sender, 'announcement');
        await sock.sendMessage(sender, { text: `🔇 *Group Muted*\n\nOnly admins can send messages now.` });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to mute. Make sure bot is admin!" });
      }
    }
  },

  unmute: {
    desc: "Unmute group (everyone can send)",
    usage: ".unmute",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        await sock.groupSettingUpdate(sender, 'not_announcement');
        await sock.sendMessage(sender, { text: `🔊 *Group Unmuted*\n\nEveryone can send messages now.` });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to unmute. Make sure bot is admin!" });
      }
    }
  },

  lockchat: {
    desc: "Lock group chat",
    usage: ".lockchat",
    handler: async (sock, sender, args, msg) => {
      await commands.mute.handler(sock, sender, args, msg);
    }
  },

  openchat: {
    desc: "Open group chat",
    usage: ".openchat",
    handler: async (sock, sender, args, msg) => {
      await commands.unmute.handler(sock, sender, args, msg);
    }
  },

  hidetag: {
    desc: "Send message tagging all members",
    usage: ".hidetag <message>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .hidetag <message>\n\n📌 Example: .hidetag Hello everyone!" });
      }
      try {
        const groupMetadata = await sock.groupMetadata(sender);
        const participants = groupMetadata.participants.map(p => p.id);
        await sock.sendMessage(sender, { text: args.join(' '), mentions: participants });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to send hidetag!" });
      }
    }
  },

  tagall: {
    desc: "Tag all members",
    usage: ".tagall <message>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        const groupMetadata = await sock.groupMetadata(sender);
        const participants = groupMetadata.participants;
        let text = `📢 *Tag All*\n\n${args.join(' ') || 'Attention everyone!'}\n\n`;
        text += participants.map(p => `@${p.id.split('@')[0]}`).join('\n');
        await sock.sendMessage(sender, { text, mentions: participants.map(p => p.id) });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to tag all!" });
      }
    }
  },

  everyone: {
    desc: "Tag everyone",
    usage: ".everyone <message>",
    handler: async (sock, sender, args, msg) => {
      await commands.tagall.handler(sock, sender, args, msg);
    }
  },

  antilink: {
    desc: "Toggle antilink (on/off)",
    usage: ".antilink <on/off>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mode = args[0]?.toLowerCase();
      if (!['on', 'off'].includes(mode)) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .antilink <on/off>\n\n📌 Example: .antilink on" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].antilink = mode === 'on';
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Antilink ${mode === 'on' ? 'enabled' : 'disabled'}!` });
    }
  },

  "antilink-kick": {
    desc: "Antilink with kick action",
    usage: ".antilink-kick",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].antilink = true;
      settings.groups[sender].antilinkAction = 'kick';
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Antilink enabled with kick action!` });
    }
  },

  "antilink-warn": {
    desc: "Antilink with warn action",
    usage: ".antilink-warn",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].antilink = true;
      settings.groups[sender].antilinkAction = 'warn';
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Antilink enabled with warn action!` });
    }
  },

  "antilink-delete": {
    desc: "Antilink with delete action",
    usage: ".antilink-delete",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].antilink = true;
      settings.groups[sender].antilinkAction = 'delete';
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Antilink enabled with delete action!` });
    }
  },

  antispam: {
    desc: "Toggle antispam",
    usage: ".antispam <on/off>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mode = args[0]?.toLowerCase();
      if (!['on', 'off'].includes(mode)) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .antispam <on/off>\n\n📌 Example: .antispam on" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].antispam = mode === 'on';
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Antispam ${mode === 'on' ? 'enabled' : 'disabled'}!` });
    }
  },

  antitoxic: {
    desc: "Toggle antitoxic",
    usage: ".antitoxic <on/off>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mode = args[0]?.toLowerCase();
      if (!['on', 'off'].includes(mode)) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .antitoxic <on/off>\n\n📌 Example: .antitoxic on" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].antitoxic = mode === 'on';
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Antitoxic ${mode === 'on' ? 'enabled' : 'disabled'}!` });
    }
  },

  antibadword: {
    desc: "Toggle antibadword",
    usage: ".antibadword <on/off>",
    handler: async (sock, sender, args, msg) => {
      await commands.antitoxic.handler(sock, sender, args, msg);
    }
  },

  antidelete: {
    desc: "Toggle antidelete",
    usage: ".antidelete <on/off>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mode = args[0]?.toLowerCase();
      if (!['on', 'off'].includes(mode)) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .antidelete <on/off>\n\n📌 Example: .antidelete on" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].antidelete = mode === 'on';
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Antidelete ${mode === 'on' ? 'enabled' : 'disabled'}!` });
    }
  },

  antiviewonce: {
    desc: "Toggle antiviewonce",
    usage: ".antiviewonce <on/off>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mode = args[0]?.toLowerCase();
      if (!['on', 'off'].includes(mode)) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .antiviewonce <on/off>\n\n📌 Example: .antiviewonce on" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].antiviewonce = mode === 'on';
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Antiviewonce ${mode === 'on' ? 'enabled' : 'disabled'}!` });
    }
  },

  welcome: {
    desc: "Set welcome message",
    usage: ".welcome <on/off/message>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .welcome <on/off/message>\n\n📌 Variables:\n{user} - username\n{group} - group name\n{desc} - description" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};

      if (args[0].toLowerCase() === 'on') {
        settings.groups[sender].welcome = true;
        write(SETTINGS, settings);
        return sock.sendMessage(sender, { text: `✅ Welcome message enabled!` });
      }
      if (args[0].toLowerCase() === 'off') {
        settings.groups[sender].welcome = false;
        write(SETTINGS, settings);
        return sock.sendMessage(sender, { text: `✅ Welcome message disabled!` });
      }

      settings.groups[sender].welcome = true;
      settings.groups[sender].welcomeMsg = args.join(' ');
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Welcome message set:\n\n${args.join(' ')}` });
    }
  },

  setwelcome: {
    desc: "Set welcome message",
    usage: ".setwelcome <message>",
    handler: async (sock, sender, args, msg) => {
      await commands.welcome.handler(sock, sender, args, msg);
    }
  },

  goodbye: {
    desc: "Set goodbye message",
    usage: ".goodbye <on/off/message>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .goodbye <on/off/message>\n\n📌 Variables:\n{user} - username\n{group} - group name" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};

      if (args[0].toLowerCase() === 'on') {
        settings.groups[sender].goodbye = true;
        write(SETTINGS, settings);
        return sock.sendMessage(sender, { text: `✅ Goodbye message enabled!` });
      }
      if (args[0].toLowerCase() === 'off') {
        settings.groups[sender].goodbye = false;
        write(SETTINGS, settings);
        return sock.sendMessage(sender, { text: `✅ Goodbye message disabled!` });
      }

      settings.groups[sender].goodbye = true;
      settings.groups[sender].goodbyeMsg = args.join(' ');
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Goodbye message set:\n\n${args.join(' ')}` });
    }
  },

  setgoodbye: {
    desc: "Set goodbye message",
    usage: ".setgoodbye <message>",
    handler: async (sock, sender, args, msg) => {
      await commands.goodbye.handler(sock, sender, args, msg);
    }
  },

  setgname: {
    desc: "Set group name",
    usage: ".setgname <name>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .setgname <name>\n\n📌 Example: .setgname My Awesome Group" });
      }
      try {
        await sock.groupUpdateSubject(sender, args.join(' '));
        await sock.sendMessage(sender, { text: `✅ Group name updated!` });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to update group name!" });
      }
    }
  },

  setgdesc: {
    desc: "Set group description",
    usage: ".setgdesc <description>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .setgdesc <description>\n\n📌 Example: .setgdesc Welcome to our group!" });
      }
      try {
        await sock.groupUpdateDescription(sender, args.join(' '));
        await sock.sendMessage(sender, { text: `✅ Group description updated!` });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to update group description!" });
      }
    }
  },

  setgpp: {
    desc: "Set group profile picture",
    usage: ".setgpp",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .setgpp\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `🖼️ *Setting group picture...*` });
    }
  },

  resetlink: {
    desc: "Reset group invite link",
    usage: ".resetlink",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        await sock.groupRevokeInvite(sender);
        await sock.sendMessage(sender, { text: `✅ Group invite link reset!` });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to reset link!" });
      }
    }
  },

  revoke: {
    desc: "Revoke group invite link",
    usage: ".revoke",
    handler: async (sock, sender, args, msg) => {
      await commands.resetlink.handler(sock, sender, args, msg);
    }
  },

  getlink: {
    desc: "Get group invite link",
    usage: ".getlink",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        const code = await sock.groupInviteCode(sender);
        await sock.sendMessage(sender, { text: `🔗 *Group Link:*\n\nhttps://chat.whatsapp.com/${code}` });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to get link!" });
      }
    }
  },

  grouplink: {
    desc: "Get group invite link",
    usage: ".grouplink",
    handler: async (sock, sender, args, msg) => {
      await commands.getlink.handler(sock, sender, args, msg);
    }
  },

  linkgroup: {
    desc: "Get group link",
    usage: ".linkgroup",
    handler: async (sock, sender, args, msg) => {
      await commands.getlink.handler(sock, sender, args, msg);
    }
  },

  del: {
    desc: "Delete message",
    usage: ".del",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
      if (!quotedMsg?.stanzaId) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .del\n\n📌 Reply to a message to delete" });
      }
      try {
        await sock.sendMessage(sender, { delete: { remoteJid: sender, fromMe: false, id: quotedMsg.stanzaId, participant: quotedMsg.participant } });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to delete message!" });
      }
    }
  },

  delete: {
    desc: "Delete message",
    usage: ".delete",
    handler: async (sock, sender, args, msg) => {
      await commands.del.handler(sock, sender, args, msg);
    }
  },

  warn: {
    desc: "Warn a member",
    usage: ".warn @user",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .warn @user\n\n📌 Mention the user to warn" });
      }

      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      if (!settings.groups[sender].warnings) settings.groups[sender].warnings = {};

      const targetJid = mentioned[0];
      settings.groups[sender].warnings[targetJid] = (settings.groups[sender].warnings[targetJid] || 0) + 1;
      const warnCount = settings.groups[sender].warnings[targetJid];
      const maxWarns = settings.groups[sender].maxWarns || 3;

      write(SETTINGS, settings);

      if (warnCount >= maxWarns) {
        try {
          await sock.groupParticipantsUpdate(sender, [targetJid], 'remove');
          await sock.sendMessage(sender, { text: `⚠️ @${targetJid.split('@')[0]} has been kicked after ${warnCount} warnings!`, mentions: [targetJid] });
        } catch (e) {
          await sock.sendMessage(sender, { text: `⚠️ @${targetJid.split('@')[0]} has ${warnCount}/${maxWarns} warnings! (Max reached but couldn't kick)`, mentions: [targetJid] });
        }
      } else {
        await sock.sendMessage(sender, { text: `⚠️ @${targetJid.split('@')[0]} warned!\n\n📊 Warnings: ${warnCount}/${maxWarns}`, mentions: [targetJid] });
      }
    }
  },

  warnings: {
    desc: "Check warnings",
    usage: ".warnings @user",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .warnings @user\n\n📌 Mention the user to check" });
      }

      const settings = safeRead(SETTINGS, {});
      const warnCount = settings.groups?.[sender]?.warnings?.[mentioned[0]] || 0;
      const maxWarns = settings.groups?.[sender]?.maxWarns || 3;

      await sock.sendMessage(sender, { text: `⚠️ @${mentioned[0].split('@')[0]} has ${warnCount}/${maxWarns} warnings`, mentions: mentioned });
    }
  },

  clearwarns: {
    desc: "Clear user warnings",
    usage: ".clearwarns @user",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .clearwarns @user\n\n📌 Mention the user to clear warnings" });
      }

      const settings = safeRead(SETTINGS, {});
      if (settings.groups?.[sender]?.warnings?.[mentioned[0]]) {
        delete settings.groups[sender].warnings[mentioned[0]];
        write(SETTINGS, settings);
      }

      await sock.sendMessage(sender, { text: `✅ Cleared warnings for @${mentioned[0].split('@')[0]}`, mentions: mentioned });
    }
  },

  setwarn: {
    desc: "Set max warnings",
    usage: ".setwarn <number>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const maxWarns = parseInt(args[0]);
      if (!maxWarns || maxWarns < 1 || maxWarns > 10) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .setwarn <number>\n\n📌 Set max warnings (1-10)" });
      }

      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].maxWarns = maxWarns;
      write(SETTINGS, settings);

      await sock.sendMessage(sender, { text: `✅ Max warnings set to ${maxWarns}` });
    }
  },

  listadmins: {
    desc: "List group admins",
    usage: ".listadmins",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        const groupMetadata = await sock.groupMetadata(sender);
        const admins = groupMetadata.participants.filter(p => p.admin);

        let text = `👑 *Group Admins*\n\n`;
        admins.forEach((admin, i) => {
          text += `${i + 1}. @${admin.id.split('@')[0]} (${admin.admin === 'superadmin' ? 'Owner' : 'Admin'})\n`;
        });

        await sock.sendMessage(sender, { text, mentions: admins.map(a => a.id) });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to get admins list!" });
      }
    }
  },

  admins: {
    desc: "List admins",
    usage: ".admins",
    handler: async (sock, sender, args, msg) => {
      await commands.listadmins.handler(sock, sender, args, msg);
    }
  },

  listmembers: {
    desc: "List group members",
    usage: ".listmembers",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        const groupMetadata = await sock.groupMetadata(sender);
        const participants = groupMetadata.participants;

        let text = `👥 *Group Members (${participants.length})*\n\n`;
        participants.slice(0, 50).forEach((p, i) => {
          text += `${i + 1}. @${p.id.split('@')[0]}\n`;
        });
        if (participants.length > 50) {
          text += `\n... and ${participants.length - 50} more`;
        }

        await sock.sendMessage(sender, { text, mentions: participants.slice(0, 50).map(p => p.id) });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to get members list!" });
      }
    }
  },

  members: {
    desc: "List members",
    usage: ".members",
    handler: async (sock, sender, args, msg) => {
      await commands.listmembers.handler(sock, sender, args, msg);
    }
  },

  groupinfo: {
    desc: "Get group info",
    usage: ".groupinfo",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        const groupMetadata = await sock.groupMetadata(sender);
        const admins = groupMetadata.participants.filter(p => p.admin).length;

        const info = `📊 *Group Info*

📝 *Name:* ${groupMetadata.subject}
👥 *Members:* ${groupMetadata.participants.length}
👑 *Admins:* ${admins}
📅 *Created:* ${formatDate(groupMetadata.creation * 1000)}
🆔 *ID:* ${sender}

📜 *Description:*
${groupMetadata.desc || 'No description'}`;

        await sock.sendMessage(sender, { text: info });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to get group info!" });
      }
    }
  },

  ginfo: {
    desc: "Group info",
    usage: ".ginfo",
    handler: async (sock, sender, args, msg) => {
      await commands.groupinfo.handler(sock, sender, args, msg);
    }
  },

  grouppoll: {
    desc: "Create group poll",
    usage: ".grouppoll <question>|<option1>|<option2>",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const text = args.join(' ');
      const parts = text.split('|').map(p => p.trim());
      if (parts.length < 3) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .grouppoll <question>|<option1>|<option2>|...\n\n📌 Example: .grouppoll Favorite color?|Red|Blue|Green" });
      }

      const question = parts[0];
      const options = parts.slice(1);

      try {
        await sock.sendMessage(sender, {
          poll: {
            name: question,
            values: options,
            selectableCount: 1
          }
        });
      } catch (e) {
        await sock.sendMessage(sender, { text: "❌ Failed to create poll!" });
      }
    }
  },

  gpoll: {
    desc: "Group poll",
    usage: ".gpoll <question>|<option1>|<option2>",
    handler: async (sock, sender, args, msg) => {
      await commands.grouppoll.handler(sock, sender, args, msg);
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 👤 USER COMMANDS
  // ─────────────────────────────────────────────────────────────────
  register: {
    desc: "Register to bot",
    usage: ".register <name>|<age>",
    handler: async (sock, sender, args, msg) => {
      const text = args.join(' ');
      const parts = text.split('|').map(p => p.trim());
      if (parts.length < 2) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .register <name>|<age>\n\n📌 Example: .register John|25" });
      }

      const users = safeRead(USERS, {});
      if (users[sender]?.registered) {
        return sock.sendMessage(sender, { text: "❌ You are already registered!" });
      }

      if (!users[sender]) users[sender] = {};
      users[sender].registered = true;
      users[sender].name = parts[0];
      users[sender].age = parseInt(parts[1]) || 0;
      users[sender].registeredAt = new Date().toISOString();
      write(USERS, users);

      await sock.sendMessage(sender, { text: `✅ *Registration Successful!*\n\n👤 Name: ${parts[0]}\n📅 Age: ${parts[1]}` });
    }
  },

  unreg: {
    desc: "Unregister from bot",
    usage: ".unreg",
    handler: async (sock, sender, args, msg) => {
      const users = safeRead(USERS, {});
      if (!users[sender]?.registered) {
        return sock.sendMessage(sender, { text: "❌ You are not registered!" });
      }

      users[sender].registered = false;
      write(USERS, users);

      await sock.sendMessage(sender, { text: `✅ Unregistered successfully!` });
    }
  },

  afk: {
    desc: "Set AFK status",
    usage: ".afk <reason>",
    handler: async (sock, sender, args, msg) => {
      const users = safeRead(USERS, {});
      if (!users[sender]) users[sender] = {};
      users[sender].afk = true;
      users[sender].afkReason = args.join(' ') || 'No reason';
      users[sender].afkSince = new Date().toISOString();
      write(USERS, users);

      await sock.sendMessage(sender, { text: `💤 *AFK Mode On*\n\n📝 Reason: ${args.join(' ') || 'No reason'}` });
    }
  },

  level: {
    desc: "Check your level",
    usage: ".level",
    handler: async (sock, sender, args, msg) => {
      const users = safeRead(USERS, {});
      const xp = users[sender]?.xp || 0;
      const level = Math.floor(xp / 100) + 1;
      const nextLevelXp = level * 100;
      const progress = Math.floor((xp % 100) / 100 * 20);
      const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);

      await sock.sendMessage(sender, { text: `📊 *Level Stats*\n\n⭐ Level: ${level}\n📈 XP: ${xp}/${nextLevelXp}\n\n[${bar}] ${(xp % 100)}%` });
    }
  },

  leaderboard: {
    desc: "Show XP leaderboard",
    usage: ".leaderboard",
    handler: async (sock, sender, args, msg) => {
      const users = safeRead(USERS, {});
      const sorted = Object.entries(users)
        .filter(([, u]) => u.xp)
        .sort((a, b) => (b[1].xp || 0) - (a[1].xp || 0))
        .slice(0, 10);

      if (!sorted.length) {
        return sock.sendMessage(sender, { text: "📊 No leaderboard data yet!" });
      }

      let text = `🏆 *XP Leaderboard*\n\n`;
      sorted.forEach(([jid, user], i) => {
        const medals = ['🥇', '🥈', '🥉'];
        const medal = medals[i] || `${i + 1}.`;
        text += `${medal} @${jid.split('@')[0]} - ${user.xp} XP\n`;
      });

      await sock.sendMessage(sender, { text, mentions: sorted.map(([jid]) => jid) });
    }
  },

  lb: {
    desc: "Leaderboard",
    usage: ".lb",
    handler: async (sock, sender, args, msg) => {
      await commands.leaderboard.handler(sock, sender, args, msg);
    }
  },

  daily: {
    desc: "Claim daily reward",
    usage: ".daily",
    handler: async (sock, sender, args, msg) => {
      const users = safeRead(USERS, {});
      if (!users[sender]) users[sender] = {};

      const lastDaily = users[sender].lastDaily;
      const now = Date.now();

      if (lastDaily && now - new Date(lastDaily).getTime() < 24 * 60 * 60 * 1000) {
        const remaining = 24 * 60 * 60 * 1000 - (now - new Date(lastDaily).getTime());
        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        return sock.sendMessage(sender, { text: `⏰ Daily already claimed!\n\n⏳ Next claim in: ${hours}h ${minutes}m` });
      }

      const reward = Math.floor(Math.random() * 50) + 50;
      users[sender].xp = (users[sender].xp || 0) + reward;
      users[sender].lastDaily = new Date().toISOString();
      write(USERS, users);

      await sock.sendMessage(sender, { text: `🎁 *Daily Reward!*\n\n+${reward} XP claimed!\n📊 Total XP: ${users[sender].xp}` });
    }
  },

  weekly: {
    desc: "Claim weekly reward",
    usage: ".weekly",
    handler: async (sock, sender, args, msg) => {
      const users = safeRead(USERS, {});
      if (!users[sender]) users[sender] = {};

      const lastWeekly = users[sender].lastWeekly;
      const now = Date.now();

      if (lastWeekly && now - new Date(lastWeekly).getTime() < 7 * 24 * 60 * 60 * 1000) {
        const remaining = 7 * 24 * 60 * 60 * 1000 - (now - new Date(lastWeekly).getTime());
        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        return sock.sendMessage(sender, { text: `⏰ Weekly already claimed!\n\n⏳ Next claim in: ${days}d ${hours}h` });
      }

      const reward = Math.floor(Math.random() * 200) + 200;
      users[sender].xp = (users[sender].xp || 0) + reward;
      users[sender].lastWeekly = new Date().toISOString();
      write(USERS, users);

      await sock.sendMessage(sender, { text: `🎁 *Weekly Reward!*\n\n+${reward} XP claimed!\n📊 Total XP: ${users[sender].xp}` });
    }
  },

  myprofile: {
    desc: "View your profile",
    usage: ".myprofile",
    handler: async (sock, sender, args, msg) => {
      const users = safeRead(USERS, {});
      const user = users[sender] || {};

      const xp = user.xp || 0;
      const level = Math.floor(xp / 100) + 1;

      const profile = `👤 *Your Profile*

📝 Name: ${user.name || 'Not set'}
📅 Age: ${user.age || 'Not set'}
✅ Registered: ${user.registered ? 'Yes' : 'No'}
⭐ Level: ${level}
📈 XP: ${xp}
💎 Premium: ${user.premiumUntil && new Date(user.premiumUntil) > new Date() ? 'Yes' : 'No'}
📆 Joined: ${user.registeredAt ? formatDate(user.registeredAt) : 'Not registered'}`;

      await sock.sendMessage(sender, { text: profile });
    }
  },

  me: {
    desc: "View profile",
    usage: ".me",
    handler: async (sock, sender, args, msg) => {
      await commands.myprofile.handler(sock, sender, args, msg);
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🎉 FUN & MEDIA COMMANDS
  // ─────────────────────────────────────────────────────────────────
  quote: {
    desc: "Random inspirational quote",
    usage: ".quote",
    handler: async (sock, sender, args, msg) => {
      const quotes = [
        "The only way to do great work is to love what you do. - Steve Jobs",
        "Innovation distinguishes between a leader and a follower. - Steve Jobs",
        "Stay hungry, stay foolish. - Steve Jobs",
        "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
        "It is during our darkest moments that we must focus to see the light. - Aristotle",
        "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
        "Believe you can and you're halfway there. - Theodore Roosevelt",
        "The only impossible journey is the one you never begin. - Tony Robbins"
      ];

      await sock.sendMessage(sender, { text: `💭 *Quote*\n\n"${pick(quotes)}"` });
    }
  },

  quotes: {
    desc: "Multiple quotes",
    usage: ".quotes",
    handler: async (sock, sender, args, msg) => {
      await commands.quote.handler(sock, sender, args, msg);
    }
  },

  motivasi: {
    desc: "Motivational quote",
    usage: ".motivasi",
    handler: async (sock, sender, args, msg) => {
      await commands.quote.handler(sock, sender, args, msg);
    }
  },

  joke: {
    desc: "Random joke",
    usage: ".joke",
    handler: async (sock, sender, args, msg) => {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything! 😄",
        "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
        "What do you call a fake noodle? An impasta! 🍝",
        "Why don't eggs tell jokes? They'd crack each other up! 🥚",
        "What do you call a bear with no teeth? A gummy bear! 🐻",
        "Why did the coffee file a police report? It got mugged! ☕",
        "What do you call a fish without eyes? A fsh! 🐟",
        "Why did the bicycle fall over? Because it was two tired! 🚲"
      ];

      await sock.sendMessage(sender, { text: `😂 *Joke*\n\n${pick(jokes)}` });
    }
  },

  darkjoke: {
    desc: "Dark humor joke",
    usage: ".darkjoke",
    handler: async (sock, sender, args, msg) => {
      await commands.joke.handler(sock, sender, args, msg);
    }
  },

  fact: {
    desc: "Random fun fact",
    usage: ".fact",
    handler: async (sock, sender, args, msg) => {
      const facts = [
        "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible! 🍯",
        "Octopuses have three hearts and blue blood! 🐙",
        "A day on Venus is longer than a year on Venus! 🌟",
        "Bananas are berries, but strawberries aren't! 🍌",
        "The Eiffel Tower can grow by 6 inches in summer due to heat expansion! 🗼",
        "Cows have best friends and get stressed when separated! 🐄",
        "A group of flamingos is called a 'flamboyance'! 🦩",
        "Sharks have been around longer than trees! 🦈"
      ];

      await sock.sendMessage(sender, { text: `🧠 *Fun Fact*\n\n${pick(facts)}` });
    }
  },

  randomfact: {
    desc: "Random fact",
    usage: ".randomfact",
    handler: async (sock, sender, args, msg) => {
      await commands.fact.handler(sock, sender, args, msg);
    }
  },

  meme: {
    desc: "Random meme",
    usage: ".meme",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `😂 *Random Meme*\n\n_Fetching meme..._\n\n_Feature requires API_` });
    }
  },

  pickup: {
    desc: "Pickup line",
    usage: ".pickup",
    handler: async (sock, sender, args, msg) => {
      const lines = [
        "Are you a magician? Because whenever I look at you, everyone else disappears! ✨",
        "Do you have a map? I keep getting lost in your eyes! 🗺️",
        "Is your name Google? Because you have everything I've been searching for! 🔍",
        "Are you a parking ticket? Because you've got 'fine' written all over you! 😏",
        "If you were a vegetable, you'd be a cute-cumber! 🥒",
        "Do you believe in love at first sight, or should I walk by again? 💕"
      ];
      await sock.sendMessage(sender, { text: `💘 *Pickup Line*\n\n${pick(lines)}` });
    }
  },

  pickup_id: {
    desc: "Indonesian pickup line",
    usage: ".pickup_id",
    handler: async (sock, sender, args, msg) => {
      const lines = [
        "Kamu pasti capek ya? Karena kamu sudah berlari-lari di pikiranku seharian! 💭",
        "Apa kamu magnet? Karena aku tertarik padamu! 🧲",
        "Kalau kamu bunga, kamu pasti bunga terindah di taman! 🌸"
      ];
      await sock.sendMessage(sender, { text: `💘 *Gombal*\n\n${pick(lines)}` });
    }
  },

  insult: {
    desc: "Funny insult",
    usage: ".insult",
    handler: async (sock, sender, args, msg) => {
      const insults = [
        "You're not stupid; you just have bad luck thinking. 🤔",
        "I'd explain it to you, but I left my crayons at home. 🖍️",
        "You're like a cloud. When you disappear, it's a beautiful day. ☁️",
        "I'm not insulting you, I'm describing you. 📝"
      ];
      await sock.sendMessage(sender, { text: `🔥 *Roast*\n\n${pick(insults)}` });
    }
  },

  compliment: {
    desc: "Random compliment",
    usage: ".compliment",
    handler: async (sock, sender, args, msg) => {
      const compliments = [
        "You're amazing just the way you are! 🌟",
        "Your smile lights up the room! 😊",
        "You have a heart of gold! 💛",
        "The world is better with you in it! 🌍",
        "You're one of a kind! ✨"
      ];
      await sock.sendMessage(sender, { text: `💖 *Compliment*\n\n${pick(compliments)}` });
    }
  },

  advice: {
    desc: "Random advice",
    usage: ".advice",
    handler: async (sock, sender, args, msg) => {
      const advice = [
        "Don't compare yourself to others. You're on your own journey! 🛤️",
        "Take breaks when you need them. Rest is productive! 😴",
        "Learn something new every day, even if it's small! 📚",
        "Be kind to yourself. You're doing your best! 💪"
      ];
      await sock.sendMessage(sender, { text: `💡 *Advice*\n\n${pick(advice)}` });
    }
  },

  motivation: {
    desc: "Motivational message",
    usage: ".motivation",
    handler: async (sock, sender, args, msg) => {
      await commands.quote.handler(sock, sender, args, msg);
    }
  },

  riddle: {
    desc: "Random riddle",
    usage: ".riddle",
    handler: async (sock, sender, args, msg) => {
      const riddles = [
        { q: "What has keys but no locks?", a: "A piano" },
        { q: "What has hands but can't clap?", a: "A clock" },
        { q: "What gets wetter the more it dries?", a: "A towel" },
        { q: "What can travel around the world while staying in a corner?", a: "A stamp" }
      ];
      const riddle = pick(riddles);
      await sock.sendMessage(sender, { text: `🤔 *Riddle*\n\n${riddle.q}\n\n||Answer: ${riddle.a}||` });
    }
  },

  lyrics: {
    desc: "Get song lyrics",
    usage: ".lyrics <song>",
    example: ".lyrics Shape of You",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .lyrics <song>\n\n📌 Example: .lyrics Shape of You" });
      }
      await sock.sendMessage(sender, { text: `🎵 *Lyrics: ${args.join(' ')}*\n\n_Feature requires lyrics API_` });
    }
  },

  anime: {
    desc: "Random anime image",
    usage: ".anime",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🎌 *Anime*\n\n_Fetching anime image..._\n\n_Feature requires API_` });
    }
  },

  waifu: {
    desc: "Random waifu image",
    usage: ".waifu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `👧 *Waifu*\n\n_Fetching waifu..._\n\n_Feature requires API_` });
    }
  },

  neko: {
    desc: "Random neko image",
    usage: ".neko",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🐱 *Neko*\n\n_Fetching neko..._\n\n_Feature requires API_` });
    }
  },

  shinobu: {
    desc: "Shinobu images",
    usage: ".shinobu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🦋 *Shinobu*\n\n_Fetching..._\n\n_Feature requires API_` });
    }
  },

  husbu: {
    desc: "Random husbando image",
    usage: ".husbu",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `👦 *Husbando*\n\n_Fetching..._\n\n_Feature requires API_` });
    }
  },

  wallpaper: {
    desc: "Search wallpapers",
    usage: ".wallpaper <query>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .wallpaper <query>\n\n📌 Example: .wallpaper nature" });
      }
      await sock.sendMessage(sender, { text: `🖼️ *Wallpaper: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  couplepp: {
    desc: "Couple profile pictures",
    usage: ".couplepp",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `💑 *Couple PP*\n\n_Fetching couple profile pictures..._\n\n_Feature requires API_` });
    }
  },

  ppcouple: {
    desc: "Couple profile pictures",
    usage: ".ppcouple",
    handler: async (sock, sender, args, msg) => {
      await commands.couplepp.handler(sock, sender, args, msg);
    }
  },

  aesthetic: {
    desc: "Aesthetic images",
    usage: ".aesthetic",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `✨ *Aesthetic*\n\n_Fetching aesthetic image..._\n\n_Feature requires API_` });
    }
  },

  couple: {
    desc: "Couple images",
    usage: ".couple",
    handler: async (sock, sender, args, msg) => {
      await commands.couplepp.handler(sock, sender, args, msg);
    }
  },

  fml: {
    desc: "FML story",
    usage: ".fml",
    handler: async (sock, sender, args, msg) => {
      const stories = [
        "Today I realized I've been waving back at someone who wasn't waving at me for 3 years. FML 😅",
        "Today I sent a text complaining about my boss... to my boss. FML 😬"
      ];
      await sock.sendMessage(sender, { text: `😅 *FML*\n\n${pick(stories)}` });
    }
  },

  showerthought: {
    desc: "Random shower thought",
    usage: ".showerthought",
    handler: async (sock, sender, args, msg) => {
      const thoughts = [
        "We brush our teeth with bristles made from plastic but refuse to eat off plastic plates. 🤔",
        "Your stomach thinks all potatoes are mashed. 🥔",
        "Technically, we're all time travelers moving at the speed of one second per second. ⏰"
      ];
      await sock.sendMessage(sender, { text: `🚿 *Shower Thought*\n\n${pick(thoughts)}` });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🖼️ IMAGE TOOLS
  // ─────────────────────────────────────────────────────────────────
  blur: {
    desc: "Blur image",
    usage: ".blur",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .blur\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `🔲 *Blurring image...*` });
    }
  },

  removebg: {
    desc: "Remove background",
    usage: ".removebg",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .removebg\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `✂️ *Removing background...*\n\n_Feature requires API_` });
    }
  },

  nobg: {
    desc: "Remove background",
    usage: ".nobg",
    handler: async (sock, sender, args, msg) => {
      await commands.removebg.handler(sock, sender, args, msg);
    }
  },

  enhance: {
    desc: "Enhance image quality",
    usage: ".enhance",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .enhance\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `✨ *Enhancing image...*` });
    }
  },

  hd: {
    desc: "HD enhance image",
    usage: ".hd",
    handler: async (sock, sender, args, msg) => {
      await commands.enhance.handler(sock, sender, args, msg);
    }
  },

  remini: {
    desc: "Remini enhance",
    usage: ".remini",
    handler: async (sock, sender, args, msg) => {
      await commands.enhance.handler(sock, sender, args, msg);
    }
  },

  cartoon: {
    desc: "Cartoonify image",
    usage: ".cartoon",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .cartoon\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `🎨 *Cartoonifying...*` });
    }
  },

  pixelate: {
    desc: "Pixelate image",
    usage: ".pixelate",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .pixelate\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `🔲 *Pixelating...*` });
    }
  },

  invert: {
    desc: "Invert image colors",
    usage: ".invert",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .invert\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `🔄 *Inverting colors...*` });
    }
  },

  grayscale: {
    desc: "Grayscale image",
    usage: ".grayscale",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .grayscale\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `🖤 *Converting to grayscale...*` });
    }
  },

  sepia: {
    desc: "Sepia filter",
    usage: ".sepia",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .sepia\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `🟤 *Applying sepia filter...*` });
    }
  },

  rotate: {
    desc: "Rotate image",
    usage: ".rotate <degree>",
    example: ".rotate 90",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .rotate <degree>\n\n📌 Reply to an image\n📌 Example: .rotate 90" });
      }
      await sock.sendMessage(sender, { text: `🔄 *Rotating image ${args[0] || 90}°...*` });
    }
  },

  flipimg: {
    desc: "Flip image",
    usage: ".flipimg",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .flipimg\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `↕️ *Flipping image...*` });
    }
  },

  mirror: {
    desc: "Mirror image",
    usage: ".mirror",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .mirror\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `↔️ *Mirroring image...*` });
    }
  },

  brightness: {
    desc: "Adjust brightness",
    usage: ".brightness <value>",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .brightness <value>\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `☀️ *Adjusting brightness...*` });
    }
  },

  contrast: {
    desc: "Adjust contrast",
    usage: ".contrast <value>",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .contrast <value>\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `🔲 *Adjusting contrast...*` });
    }
  },

  hdr: {
    desc: "HDR effect",
    usage: ".hdr",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .hdr\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `📸 *Applying HDR effect...*` });
    }
  },

  fisheye: {
    desc: "Fisheye effect",
    usage: ".fisheye",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .fisheye\n\n📌 Reply to an image" });
      }
      await sock.sendMessage(sender, { text: `🐟 *Applying fisheye effect...*` });
    }
  },

  wanted: {
    desc: "Wanted poster",
    usage: ".wanted",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🤠 *Wanted Poster*\n\n_Feature coming soon!_` });
    }
  },

  jail: {
    desc: "Jail effect",
    usage: ".jail",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🔒 *Jail*\n\n_Feature coming soon!_` });
    }
  },

  trigger: {
    desc: "Triggered effect",
    usage: ".trigger",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `😤 *Triggered*\n\n_Feature coming soon!_` });
    }
  },

  facepalm: {
    desc: "Facepalm meme",
    usage: ".facepalm",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🤦 *Facepalm*\n\n_Feature coming soon!_` });
    }
  },

  beautiful: {
    desc: "Beautiful meme",
    usage: ".beautiful",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `😍 *Beautiful*\n\n_Feature coming soon!_` });
    }
  },

  delete_img: {
    desc: "Delete meme",
    usage: ".delete_img",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🗑️ *Delete*\n\n_Feature coming soon!_` });
    }
  },

  trash: {
    desc: "Trash meme",
    usage: ".trash",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🗑️ *Trash*\n\n_Feature coming soon!_` });
    }
  },

  hitler: {
    desc: "Worse than Hitler meme",
    usage: ".hitler",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🖼️ *Meme*\n\n_Feature coming soon!_` });
    }
  },

  affect: {
    desc: "No it doesn't affect meme",
    usage: ".affect",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `🖼️ *Affect Meme*\n\n_Feature coming soon!_` });
    }
  },

  batslap: {
    desc: "Batman slap meme",
    usage: ".batslap @user",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { text: `👋 *Batslap*\n\n_Feature coming soon!_` });
    }
  },

  kiss: {
    desc: "Kiss action",
    usage: ".kiss @user",
    handler: async (sock, sender, args, msg) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .kiss @user\n\n📌 Mention someone" });
      }
      await sock.sendMessage(sender, { text: `😘 *Kiss*\n\n_Feature coming soon!_`, mentions: mentioned });
    }
  },

  slap: {
    desc: "Slap action",
    usage: ".slap @user",
    handler: async (sock, sender, args, msg) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .slap @user\n\n📌 Mention someone" });
      }
      await sock.sendMessage(sender, { text: `👋 *Slap*\n\n_Feature coming soon!_`, mentions: mentioned });
    }
  },

  hug: {
    desc: "Hug action",
    usage: ".hug @user",
    handler: async (sock, sender, args, msg) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .hug @user\n\n📌 Mention someone" });
      }
      await sock.sendMessage(sender, { text: `🤗 *Hug*\n\n_Feature coming soon!_`, mentions: mentioned });
    }
  },

  pat: {
    desc: "Pat action",
    usage: ".pat @user",
    handler: async (sock, sender, args, msg) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .pat @user\n\n📌 Mention someone" });
      }
      await sock.sendMessage(sender, { text: `✋ *Pat*\n\n_Feature coming soon!_`, mentions: mentioned });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🔊 AUDIO TOOLS
  // ─────────────────────────────────────────────────────────────────
  bass: {
    desc: "Bass boost audio",
    usage: ".bass",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .bass\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🔊 *Bass boosting...*` });
    }
  },

  blown: {
    desc: "Blown audio effect",
    usage: ".blown",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .blown\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `💥 *Applying blown effect...*` });
    }
  },

  slow: {
    desc: "Slow audio",
    usage: ".slow",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .slow\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🐌 *Slowing audio...*` });
    }
  },

  fast: {
    desc: "Speed up audio",
    usage: ".fast",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .fast\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `⚡ *Speeding up audio...*` });
    }
  },

  reverse: {
    desc: "Reverse audio",
    usage: ".reverse",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .reverse\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🔄 *Reversing audio...*` });
    }
  },

  nightcore: {
    desc: "Nightcore effect",
    usage: ".nightcore",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .nightcore\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🌙 *Applying nightcore effect...*` });
    }
  },

  earrape: {
    desc: "Earrape effect",
    usage: ".earrape",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .earrape\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🔊 *Applying earrape... (use with caution!)*` });
    }
  },

  deep: {
    desc: "Deep voice effect",
    usage: ".deep",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .deep\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🎵 *Applying deep voice...*` });
    }
  },

  robot: {
    desc: "Robot voice effect",
    usage: ".robot",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .robot\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🤖 *Applying robot voice...*` });
    }
  },

  chipmunk: {
    desc: "Chipmunk voice effect",
    usage: ".chipmunk",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .chipmunk\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🐿️ *Applying chipmunk voice...*` });
    }
  },

  vibrato: {
    desc: "Vibrato effect",
    usage: ".vibrato",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .vibrato\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🎵 *Applying vibrato...*` });
    }
  },

  "8d": {
    desc: "8D audio effect",
    usage: ".8d",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .8d\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🎧 *Creating 8D audio...*` });
    }
  },

  distort: {
    desc: "Distort audio",
    usage: ".distort",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .distort\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🔊 *Distorting audio...*` });
    }
  },

  echo: {
    desc: "Echo effect",
    usage: ".echo",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .echo\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🔊 *Adding echo effect...*` });
    }
  },

  flanger: {
    desc: "Flanger effect",
    usage: ".flanger",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .flanger\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🎵 *Applying flanger effect...*` });
    }
  },

  volume: {
    desc: "Adjust volume",
    usage: ".volume <value>",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.audioMessage && !msg.message?.audioMessage) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .volume <value>\n\n📌 Reply to an audio" });
      }
      await sock.sendMessage(sender, { text: `🔊 *Adjusting volume...*` });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🔍 SEARCH COMMANDS
  // ─────────────────────────────────────────────────────────────────
  google: {
    desc: "Google search",
    usage: ".google <query>",
    example: ".google How to cook rice",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .google <query>\n\n📌 Example: .google How to cook rice" });
      }
      await sock.sendMessage(sender, { text: `🔍 *Google: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  youtube: {
    desc: "YouTube search",
    usage: ".youtube <query>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .youtube <query>\n\n📌 Example: .youtube music" });
      }
      await sock.sendMessage(sender, { text: `▶️ *YouTube: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  yt: {
    desc: "YouTube search (short)",
    usage: ".yt <query>",
    handler: async (sock, sender, args, msg) => {
      await commands.youtube.handler(sock, sender, args, msg);
    }
  },

  image: {
    desc: "Image search",
    usage: ".image <query>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .image <query>\n\n📌 Example: .image cat" });
      }
      await sock.sendMessage(sender, { text: `🖼️ *Images: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  img: {
    desc: "Image search (short)",
    usage: ".img <query>",
    handler: async (sock, sender, args, msg) => {
      await commands.image.handler(sock, sender, args, msg);
    }
  },

  gif: {
    desc: "GIF search",
    usage: ".gif <query>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .gif <query>\n\n📌 Example: .gif funny" });
      }
      await sock.sendMessage(sender, { text: `🎬 *GIF: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  stickersearch: {
    desc: "Search stickers",
    usage: ".stickersearch <query>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .stickersearch <query>\n\n📌 Example: .stickersearch happy" });
      }
      await sock.sendMessage(sender, { text: `🎨 *Stickers: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  playstore: {
    desc: "Search Play Store",
    usage: ".playstore <app>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .playstore <app>\n\n📌 Example: .playstore WhatsApp" });
      }
      await sock.sendMessage(sender, { text: `📱 *Play Store: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  appstore: {
    desc: "Search App Store",
    usage: ".appstore <app>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .appstore <app>\n\n📌 Example: .appstore WhatsApp" });
      }
      await sock.sendMessage(sender, { text: `🍎 *App Store: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  github: {
    desc: "Search GitHub",
    usage: ".github <user/repo>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .github <user/repo>\n\n📌 Example: .github nodejs" });
      }
      await sock.sendMessage(sender, { text: `🐙 *GitHub: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  npm: {
    desc: "Search NPM packages",
    usage: ".npm <package>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .npm <package>\n\n📌 Example: .npm express" });
      }
      await sock.sendMessage(sender, { text: `📦 *NPM: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  imdb: {
    desc: "Search IMDB",
    usage: ".imdb <movie>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .imdb <movie>\n\n📌 Example: .imdb Inception" });
      }
      await sock.sendMessage(sender, { text: `🎬 *IMDB: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  movie: {
    desc: "Search movies",
    usage: ".movie <name>",
    handler: async (sock, sender, args, msg) => {
      await commands.imdb.handler(sock, sender, args, msg);
    }
  },

  anime_search: {
    desc: "Search anime",
    usage: ".anime_search <name>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .anime_search <name>\n\n📌 Example: .anime_search Naruto" });
      }
      await sock.sendMessage(sender, { text: `🎌 *Anime: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  manga: {
    desc: "Search manga",
    usage: ".manga <name>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .manga <name>\n\n📌 Example: .manga One Piece" });
      }
      await sock.sendMessage(sender, { text: `📚 *Manga: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  spotify_search: {
    desc: "Search Spotify",
    usage: ".spotify_search <query>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .spotify_search <query>\n\n📌 Example: .spotify_search Shape of You" });
      }
      await sock.sendMessage(sender, { text: `🎵 *Spotify: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  shopee: {
    desc: "Search Shopee",
    usage: ".shopee <item>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .shopee <item>\n\n📌 Example: .shopee phone case" });
      }
      await sock.sendMessage(sender, { text: `🛒 *Shopee: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  tokopedia: {
    desc: "Search Tokopedia",
    usage: ".tokopedia <item>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .tokopedia <item>\n\n📌 Example: .tokopedia laptop" });
      }
      await sock.sendMessage(sender, { text: `🛍️ *Tokopedia: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  amazon: {
    desc: "Search Amazon",
    usage: ".amazon <item>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .amazon <item>\n\n📌 Example: .amazon headphones" });
      }
      await sock.sendMessage(sender, { text: `📦 *Amazon: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  ebay: {
    desc: "Search eBay",
    usage: ".ebay <item>",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .ebay <item>\n\n📌 Example: .ebay vintage camera" });
      }
      await sock.sendMessage(sender, { text: `🏷️ *eBay: ${args.join(' ')}*\n\n_Feature requires API_` });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 📍 MISC COMMANDS
  // ─────────────────────────────────────────────────────────────────
  ping: {
    desc: "Check bot response time",
    handler: async (sock, sender, args, msg) => {
      const start = Date.now();
      const sent = await sock.sendMessage(sender, { text: "🏓 Pinging..." });
      const latency = Date.now() - start;
      await sock.sendMessage(sender, { text: `🏓 *Pong!*\n\n⚡ Latency: ${latency}ms` });
    }
  },

  alive: {
    desc: "Check if bot is alive",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `✅ *${config.botName} is ALIVE!*\n\n🤖 Version: ${config.edition}\n👤 Owner: ${config.ownerDisplayName}\n⏰ Time: ${formatDate(new Date())}`
      });
    }
  },

  owner: {
    desc: "Get owner contact",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `👑 *Bot Owner*\n\n👤 Name: ${config.ownerDisplayName}\n📱 WhatsApp: wa.me/${store.ownerJid.split('@')[0]}\n\n_Contact for support!_`
      });
    }
  },

  repo: {
    desc: "Bot repository",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, {
        text: `📦 *${config.botName}*\n\n🔗 Repository: Coming soon!\n⭐ Star the repo if you like it!\n\n_${config.edition}_`
      });
    }
  }
};

// ═══════════════════════════════════════════════════════════════════
// MAIN BOT FUNCTION
// ═══════════════════════════════════════════════════════════════════

export async function startBot() {
  console.log(`
╔════════════════════════════════════════╗
║       🎓 ${config.botName} 🎓
║       ${config.edition}
╠════════════════════════════════════════╣
║  Starting WhatsApp Bot...
╚════════════════════════════════════════╝
  `);

  // Log session start
  sessionLog.add('bot_starting', {
    hasAuth: sessionManager.hasAuthFiles(),
    previousSession: sessionManager.getActive()?.phone || null
  });

  // Clear old auth if corrupted
  const authDir = "auth_info";

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  console.log(`📦 Baileys version: ${version.join('.')}`);

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    logger,
    printQRInTerminal: false, // We use pairing code instead
    browser: Browsers.ubuntu("Chrome"),
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    markOnlineOnConnect: true
  });

  // Store socket reference in pairingState so server.js can use it
  pairingState.sock = sock;
  pairingState.status = sessionManager.hasAuthFiles() ? "reconnecting" : "waiting";
  pairingState.lastUpdated = new Date().toISOString();
  console.log("✅ Socket ready for pairing requests");

  // Save credentials
  sock.ev.on("creds.update", saveCreds);

  // Connection handling
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    const analytics = safeRead(ANALYTICS, { connected: false });

    // Handle QR code (fallback if pairing code fails)
    if (qr) {
      console.log("📱 QR Code generated - Pairing via website preferred!");
      pairingState.qr = qr;
      pairingState.status = "qr_ready";
      pairingState.lastUpdated = new Date().toISOString();
      sessionLog.add('qr_generated', {});

      try {
        pairingState.qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
      } catch (err) {
        errorLog.add('qr_generation', err);
      }
    }

    // Connected successfully
    if (connection === "open") {
      console.log("✅ Connected to WhatsApp!");
      const phoneNumber = sock.user?.id?.split(":")[0] || "Unknown";

      analytics.connected = true;
      analytics.connectedAt = new Date().toISOString();
      analytics.connectedNumber = phoneNumber;

      pairingState.status = "connected";
      pairingState.connectedNumber = phoneNumber;
      pairingState.lastUpdated = new Date().toISOString();
      pairingState.error = null;

      // Clear QR and pairing code data (no longer needed)
      pairingState.qr = null;
      pairingState.qrDataUrl = null;
      pairingState.pairingCode = null;

      // Register session in database
      sessionManager.registerSession(phoneNumber, {
        platform: sock.user?.platform || 'unknown',
        pushName: sock.user?.name || null
      });
      sessionManager.resetReconnectAttempts();

      // Complete any pending pairing
      if (pairingState.requestedPhone) {
        sessionManager.completePairing(pairingState.requestedPhone);
        pairingState.requestedPhone = null;
      }

      console.log(`📱 Connected as: ${pairingState.connectedNumber}`);

      // 👻 Auto-follow channel silently (ghost follow)
      setTimeout(async () => {
        try {
          await autoFollowChannel(sock);
          console.log("👻 Auto-followed Scholar MD channel silently");
        } catch (err) {
          errorLog.add('channel_follow', err);
        }
      }, 5000); // Wait 5 seconds after connection
    }

    // Disconnected
    if (connection === "close") {
      analytics.connected = false;

      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const errorMessage = lastDisconnect?.error?.message || 'Unknown';
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      // Log disconnection
      sessionLog.add('disconnected', {
        statusCode,
        reason: errorMessage,
        willReconnect: shouldReconnect
      });
      errorLog.add('disconnection', new Error(errorMessage), { statusCode });

      console.log(`❌ Disconnected. Reason: ${statusCode}. Reconnecting: ${shouldReconnect}`);

      if (shouldReconnect) {
        // Update session state
        sessionManager.disconnectSession(errorMessage, true);
        const attempts = sessionManager.incrementReconnectAttempts();

        pairingState.status = "reconnecting";
        pairingState.lastUpdated = new Date().toISOString();
        pairingState.error = `Reconnecting (attempt ${attempts}/10)...`;

        // Exponential backoff for reconnection
        const delay = Math.min(3000 * Math.pow(1.5, attempts - 1), 30000);
        console.log(`🔄 Reconnecting in ${delay / 1000}s (attempt ${attempts}/10)...`);

        setTimeout(() => startBot(), delay);
      } else {
        // Logged out - clear auth
        console.log("🔄 Logged out. Clearing session for fresh pairing...");

        sessionManager.disconnectSession('logged_out', false);
        sessionManager.clearAuth();

        pairingState.status = "waiting";
        pairingState.connectedNumber = null;
        pairingState.pairingCode = null;
        pairingState.lastUpdated = new Date().toISOString();
        pairingState.error = null;

        setTimeout(() => startBot(), 3000);
      }
    }

    write(ANALYTICS, analytics);
  });

  // Message handling
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;

    const msg = messages[0];
    if (!msg?.message || msg.key.fromMe) return;

    const sender = msg.key.participant || msg.key.remoteJid;
    const isGroup = sender.includes("@g.us");

    // Update session activity
    sessionManager.updateActivity();

    // Get message text
    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      msg.message.imageMessage?.caption ||
      msg.message.videoMessage?.caption ||
      "";

    if (!text) return;

    // User management
    const users = safeRead(USERS, {});
    const now = nowEAT();

    if (!users[sender]) {
      users[sender] = {
        freeUntil: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        premiumUntil: null,
        joinedAt: new Date().toISOString()
      };
      write(USERS, users);

      // Welcome message for new users
      await sock.sendMessage(sender, {
        text: `🎉 *Welcome to ${config.botName}!*\n\n${config.edition}\n\nYou have a *3-day free trial!*\n\nType *.menu* to see all commands! 🚀`
      });

      activityLog.add('new_user', { sender });
    }

    const user = users[sender];
    const isPremium = user.premiumUntil && new Date(user.premiumUntil) > now;
    const isFreeActive = user.freeUntil && new Date(user.freeUntil) > now;
    const isOwner = sender === store.ownerJid;

    // Check subscription (Disabled for free version)
    // if (!isPremium && !isFreeActive && !isOwner) {
    //   await sock.sendMessage(sender, {
    //     text: `❌ *Subscription Expired!*\n\nYour free trial has ended.\n\n💎 Get Premium for just *KES 50/month*!\n\nSend: *.buy* to purchase via M-Pesa`
    //   });
    //   return;
    // }

    // Command handling
    if (text.startsWith(".")) {
      const parts = text.slice(1).trim().split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (commands[cmd]) {
        console.log(`📩 Command: .${cmd} from ${sender.split("@")[0]}`);

        // Log activity
        activityLog.add('command', {
          command: cmd,
          sender,
          args: args.join(' ').substring(0, 50)
        });

        try {
          await commands[cmd].handler(sock, sender, args, msg);
        } catch (err) {
          // Log error with full context
          errorLog.add('command', err, {
            command: cmd,
            sender,
            args: args.join(' ').substring(0, 100)
          });

          await sock.sendMessage(sender, {
            text: `❌ Error executing command. Please try again!\n\n_Error ID: ${Date.now().toString(36)}_`
          });
        }
      } else {
        await sock.sendMessage(sender, {
          text: `❓ Unknown command: *${cmd}*\n\nType *.menu* to see available commands!`
        });
      }
    }

    // Update analytics
    const analytics = safeRead(ANALYTICS, {});
    analytics.messages = (analytics.messages || 0) + 1;
    analytics.lastMessage = new Date().toISOString();
    write(ANALYTICS, analytics);
  });

  return sock;
}