import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import { config } from "./config.js";
import { store } from "./store.js";
import { pairingState } from "./server.js";
import { stkPush } from "./mpesa.js";
import QRCode from "qrcode";

const USERS = "./users.json";
const ANALYTICS = "./analytics.json";
const SETTINGS = "./settings.json";

const logger = pino({ level: "silent" });

// Safe file operations
const safeRead = (f, defaultValue = {}) => {
  try {
    const raw = fs.readFileSync(f, "utf8");
    return JSON.parse(raw || "{}");
  } catch (e) {
    try {
      fs.writeFileSync(f, JSON.stringify(defaultValue, null, 2));
    } catch (writeErr) {}
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
// COMMAND HANDLERS - All the bot's features
// ═══════════════════════════════════════════════════════════════════

const commands = {
  // ─────────────────────────────────────────────────────────────────
  // 📋 MENU & HELP COMMANDS
  // ─────────────────────────────────────────────────────────────────
  menu: {
    desc: "Show main menu",
    handler: async (sock, sender, args, msg) => {
      const menu = `
╔════════════════════════════════╗
║  🎓 *${config.botName}*  🎓
║  _${config.edition}_
╠════════════════════════════════╣
║
║  👋 Welcome! I'm your smart
║  WhatsApp assistant bot.
║
╠═══ 📚 *CATEGORIES* ═══════════╣
║
║  📋 *.menu* - This menu
║  ❓ *.help* - All commands
║  📖 *.commands* - Command list
║
║  🎮 *.games* - Fun games
║  🔧 *.tools* - Useful tools
║  📥 *.download* - Downloaders
║  🎨 *.sticker* - Sticker maker
║  🤖 *.ai* - AI features
║  💰 *.premium* - Premium info
║
╠════════════════════════════════╣
║  ⏰ ${formatDate(new Date())}
║  👤 Owner: ${config.ownerDisplayName}
╚════════════════════════════════╝

Type any command to get started! 🚀
      `.trim();
      
      await sock.sendMessage(sender, { text: menu });
    }
  },

  help: {
    desc: "Show help information",
    handler: async (sock, sender, args, msg) => {
      const help = `
🆘 *SCHOLAR MD HELP CENTER*

*How to use the bot:*
• All commands start with a dot (.)
• Example: .menu, .sticker, .ai

*Subscription Plans:*
├ 🆓 Free Trial: 3 days
├ 💎 Premium: KES 50/month
└ 👑 VIP: KES 100/month

*Getting Premium:*
Send *.buy* to purchase via M-Pesa

*Support:*
Contact: ${config.ownerDisplayName}
WhatsApp: wa.me/${store.ownerJid.split('@')[0]}

*Bot Status:* ✅ Online
      `.trim();
      
      await sock.sendMessage(sender, { text: help });
    }
  },

  commands: {
    desc: "List all commands",
    handler: async (sock, sender, args, msg) => {
      const cmdList = Object.entries(commands)
        .map(([name, cmd]) => `• *.${name}* - ${cmd.desc}`)
        .join('\n');
      
      await sock.sendMessage(sender, { 
        text: `📜 *ALL COMMANDS*\n\n${cmdList}\n\n_Total: ${Object.keys(commands).length} commands_` 
      });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🎨 STICKER COMMANDS
  // ─────────────────────────────────────────────────────────────────
  sticker: {
    desc: "Convert image/video to sticker",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
      const videoMsg = msg.message?.videoMessage || quotedMsg?.videoMessage;
      
      if (!imageMsg && !videoMsg) {
        return sock.sendMessage(sender, { 
          text: "📸 *Send or reply to an image/video with .sticker*\n\nExample: Send an image with caption `.sticker`" 
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
    handler: async (sock, sender, args, msg) => {
      await commands.sticker.handler(sock, sender, args, msg);
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🤖 AI COMMANDS
  // ─────────────────────────────────────────────────────────────────
  ai: {
    desc: "Chat with AI",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "🤖 *AI Chat*\n\nUsage: `.ai <your question>`\n\nExample: `.ai What is the capital of Kenya?`" 
        });
      }
      
      const question = args.join(" ");
      
      // Simple AI responses (you can integrate with real AI APIs)
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
    handler: async (sock, sender, args, msg) => {
      await commands.ai.handler(sock, sender, args, msg);
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🎮 GAMES & FUN
  // ─────────────────────────────────────────────────────────────────
  games: {
    desc: "Show available games",
    handler: async (sock, sender, args, msg) => {
      const gameMenu = `
🎮 *GAMES MENU*

├ 🎲 *.roll* - Roll a dice
├ 🪙 *.flip* - Flip a coin
├ ✊ *.rps* - Rock Paper Scissors
├ 🔢 *.guess* - Number guessing
├ 📝 *.quiz* - Trivia quiz
├ 🎰 *.slot* - Slot machine
├ 💕 *.love* - Love calculator
├ 🎱 *.8ball* - Magic 8 ball
└ 🤔 *.dare* - Truth or dare

Have fun! 🎉
      `.trim();
      
      await sock.sendMessage(sender, { text: gameMenu });
    }
  },

  roll: {
    desc: "Roll a dice",
    handler: async (sock, sender, args, msg) => {
      const dice = Math.floor(Math.random() * 6) + 1;
      const emojis = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      await sock.sendMessage(sender, { 
        text: `🎲 *Dice Roll*\n\nYou rolled: ${emojis[dice]} *${dice}*` 
      });
    }
  },

  flip: {
    desc: "Flip a coin",
    handler: async (sock, sender, args, msg) => {
      const result = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙";
      await sock.sendMessage(sender, { 
        text: `🪙 *Coin Flip*\n\nResult: *${result}*` 
      });
    }
  },

  rps: {
    desc: "Rock Paper Scissors",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "✊ *Rock Paper Scissors*\n\nUsage: `.rps rock/paper/scissors`\n\nExample: `.rps rock`" 
        });
      }
      
      const choices = ["rock", "paper", "scissors"];
      const emojis = { rock: "🪨", paper: "📄", scissors: "✂️" };
      const userChoice = args[0].toLowerCase();
      
      if (!choices.includes(userChoice)) {
        return sock.sendMessage(sender, { text: "❌ Choose: rock, paper, or scissors" });
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
    handler: async (sock, sender, args, msg) => {
      const number = Math.floor(Math.random() * 10) + 1;
      const guess = parseInt(args[0]);
      
      if (!args.length || isNaN(guess)) {
        return sock.sendMessage(sender, { 
          text: "🔢 *Guess the Number*\n\nUsage: `.guess <1-10>`\n\nExample: `.guess 5`" 
        });
      }
      
      if (guess === number) {
        await sock.sendMessage(sender, { text: `🎉 *Correct!* The number was ${number}! 🏆` });
      } else {
        await sock.sendMessage(sender, { text: `❌ Wrong! The number was *${number}*. Try again!` });
      }
    }
  },

  quiz: {
    desc: "Trivia quiz",
    handler: async (sock, sender, args, msg) => {
      const quizzes = [
        { q: "What is the capital of Kenya?", a: "Nairobi", opts: ["Nairobi", "Mombasa", "Kisumu", "Nakuru"] },
        { q: "How many continents are there?", a: "7", opts: ["5", "6", "7", "8"] },
        { q: "What year did Kenya gain independence?", a: "1963", opts: ["1960", "1963", "1965", "1970"] },
        { q: "What is the largest planet?", a: "Jupiter", opts: ["Mars", "Saturn", "Jupiter", "Neptune"] },
        { q: "Who invented the telephone?", a: "Alexander Graham Bell", opts: ["Edison", "Tesla", "Bell", "Newton"] }
      ];
      
      const quiz = pick(quizzes);
      const shuffled = quiz.opts.sort(() => Math.random() - 0.5);
      
      await sock.sendMessage(sender, { 
        text: `📝 *QUIZ TIME*\n\n${quiz.q}\n\nA) ${shuffled[0]}\nB) ${shuffled[1]}\nC) ${shuffled[2]}\nD) ${shuffled[3]}\n\n_Answer: ${quiz.a}_` 
      });
    }
  },

  slot: {
    desc: "Slot machine game",
    handler: async (sock, sender, args, msg) => {
      const symbols = ["🍎", "🍊", "🍋", "🍇", "🍒", "💎", "7️⃣", "🔔"];
      const result = [pick(symbols), pick(symbols), pick(symbols)];
      
      let message = `🎰 *SLOT MACHINE*\n\n╔═══════════╗\n║ ${result.join(" │ ")} ║\n╚═══════════╝\n\n`;
      
      if (result[0] === result[1] && result[1] === result[2]) {
        message += "🎉 *JACKPOT!* 🎉 You hit the jackpot!";
      } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        message += "🥈 *Nice!* Two matching symbols!";
      } else {
        message += "😔 No luck this time. Try again!";
      }
      
      await sock.sendMessage(sender, { text: message });
    }
  },

  love: {
    desc: "Love calculator",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, { 
          text: "💕 *Love Calculator*\n\nUsage: `.love name1 name2`\n\nExample: `.love John Jane`" 
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

  "8ball": {
    desc: "Magic 8 ball",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "🎱 *Magic 8 Ball*\n\nUsage: `.8ball <question>`\n\nExample: `.8ball Will I be rich?`" 
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

  dare: {
    desc: "Truth or dare",
    handler: async (sock, sender, args, msg) => {
      const truths = [
        "What's your biggest fear?", "Who was your first crush?",
        "What's your most embarrassing moment?", "Have you ever lied to your best friend?",
        "What's a secret you've never told anyone?"
      ];
      
      const dares = [
        "Send a voice note singing your favorite song!", "Change your profile pic for 1 hour!",
        "Text your crush right now!", "Do 10 pushups and send a video!",
        "Post a story saying 'I love SCHOLAR MD bot!'"
      ];
      
      const choice = args[0]?.toLowerCase();
      
      if (choice === "truth") {
        await sock.sendMessage(sender, { text: `🤔 *TRUTH*\n\n${pick(truths)}` });
      } else if (choice === "dare") {
        await sock.sendMessage(sender, { text: `😈 *DARE*\n\n${pick(dares)}` });
      } else {
        await sock.sendMessage(sender, { 
          text: "🎭 *Truth or Dare*\n\nUsage: `.dare truth` or `.dare dare`" 
        });
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🔧 TOOLS & UTILITIES
  // ─────────────────────────────────────────────────────────────────
  tools: {
    desc: "Show available tools",
    handler: async (sock, sender, args, msg) => {
      const toolsMenu = `
🔧 *TOOLS MENU*

├ ⏰ *.time* - Current time
├ 📅 *.date* - Today's date
├ 🧮 *.calc* - Calculator
├ 🌐 *.translate* - Translator
├ 📊 *.poll* - Create poll
├ ⏱️ *.remind* - Set reminder
├ 📝 *.note* - Save notes
├ 🔗 *.short* - URL shortener
├ 📱 *.info* - User info
└ 📊 *.stats* - Bot statistics

_More tools coming soon!_
      `.trim();
      
      await sock.sendMessage(sender, { text: toolsMenu });
    }
  },

  time: {
    desc: "Get current time",
    handler: async (sock, sender, args, msg) => {
      const now = nowEAT();
      await sock.sendMessage(sender, { 
        text: `⏰ *Current Time*\n\n🕐 ${now.toLocaleTimeString("en-KE")}\n📍 Timezone: ${config.timezone}` 
      });
    }
  },

  date: {
    desc: "Get today's date",
    handler: async (sock, sender, args, msg) => {
      const now = nowEAT();
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      
      await sock.sendMessage(sender, { 
        text: `📅 *Today's Date*\n\n📆 ${now.toLocaleDateString("en-KE", { dateStyle: "full" })}\n🗓️ Day: ${days[now.getDay()]}` 
      });
    }
  },

  calc: {
    desc: "Calculator",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "🧮 *Calculator*\n\nUsage: `.calc <expression>`\n\nExample: `.calc 5+5*2`" 
        });
      }
      
      try {
        const expression = args.join(" ").replace(/[^0-9+\-*/().%\s]/g, "");
        const result = eval(expression);
        await sock.sendMessage(sender, { 
          text: `🧮 *Calculator*\n\n${expression} = *${result}*` 
        });
      } catch (err) {
        await sock.sendMessage(sender, { text: "❌ Invalid expression!" });
      }
    }
  },

  info: {
    desc: "Get user info",
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

  stats: {
    desc: "Bot statistics",
    handler: async (sock, sender, args, msg) => {
      const analytics = safeRead(ANALYTICS, {});
      const users = safeRead(USERS, {});
      
      const totalUsers = Object.keys(users).length;
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const mins = Math.floor((uptime % 3600) / 60);
      
      await sock.sendMessage(sender, { 
        text: `📊 *Bot Statistics*\n\n🤖 Bot: ${config.botName}\n📦 Version: ${config.edition}\n👥 Total Users: ${totalUsers}\n⏱️ Uptime: ${hours}h ${mins}m\n🌐 Status: ${analytics.connected ? '✅ Online' : '❌ Offline'}` 
      });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 📥 DOWNLOAD COMMANDS
  // ─────────────────────────────────────────────────────────────────
  download: {
    desc: "Show download options",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { 
        text: `📥 *DOWNLOAD MENU*\n\n├ 🎵 *.play* - Play music\n├ 🎬 *.video* - Download video\n├ 📷 *.ig* - Instagram download\n├ 🐦 *.twitter* - Twitter download\n└ 📱 *.tiktok* - TikTok download\n\n_Send link with command!_` 
      });
    }
  },

  play: {
    desc: "Play/download music",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "🎵 *Music Player*\n\nUsage: `.play <song name>`\n\nExample: `.play Shape of You`" 
        });
      }
      
      await sock.sendMessage(sender, { 
        text: `🎵 *Searching...*\n\n🔍 "${args.join(' ')}"\n\n⏳ This feature requires API integration. Coming soon!` 
      });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 💰 PREMIUM & PAYMENT
  // ─────────────────────────────────────────────────────────────────
  premium: {
    desc: "Premium subscription info",
    handler: async (sock, sender, args, msg) => {
      await sock.sendMessage(sender, { 
        text: `💎 *PREMIUM PLANS*\n\n┌─────────────────────┐\n│  🆓 *FREE TRIAL*    │\n│  Duration: 3 days   │\n│  Features: Basic    │\n├─────────────────────┤\n│  💎 *PREMIUM*       │\n│  Price: KES 50/mo   │\n│  Features: All      │\n├─────────────────────┤\n│  👑 *VIP*           │\n│  Price: KES 100/mo  │\n│  Features: All+     │\n└─────────────────────┘\n\n💳 Pay with M-Pesa!\nSend: *.buy premium* or *.buy vip*` 
      });
    }
  },

  buy: {
    desc: "Purchase premium",
    handler: async (sock, sender, args, msg) => {
      const plan = args[0]?.toLowerCase() || "premium";
      const amount = plan === "vip" ? 100 : 50;
      const phone = sender.split("@")[0];
      
      await sock.sendMessage(sender, { 
        text: `💳 *M-PESA PAYMENT*\n\n📦 Plan: ${plan.toUpperCase()}\n💰 Amount: KES ${amount}\n📱 Phone: ${phone}\n\n⏳ Initiating STK Push...\n\n_Check your phone for M-Pesa prompt!_` 
      });
      
      try {
        const result = await stkPush(phone, amount, `SCHOLAR-${plan.toUpperCase()}`);
        if (result.ResponseCode === "0") {
          await sock.sendMessage(sender, { 
            text: "✅ *Payment request sent!*\n\nCheck your phone and enter M-Pesa PIN to complete." 
          });
        } else {
          await sock.sendMessage(sender, { 
            text: `❌ Payment failed: ${result.ResponseDescription || 'Unknown error'}` 
          });
        }
      } catch (err) {
        await sock.sendMessage(sender, { 
          text: "❌ Payment service unavailable. Try again later." 
        });
      }
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 👑 OWNER COMMANDS
  // ─────────────────────────────────────────────────────────────────
  addprem: {
    desc: "Add premium to user (owner)",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      
      const target = args[0]?.replace(/[^0-9]/g, "");
      const days = parseInt(args[1]) || 30;
      
      if (!target) {
        return sock.sendMessage(sender, { 
          text: "👑 *Add Premium*\n\nUsage: `.addprem 254xxx days`\n\nExample: `.addprem 254712345678 30`" 
        });
      }
      
      const users = safeRead(USERS, {});
      const targetJid = `${target}@s.whatsapp.net`;
      
      if (!users[targetJid]) {
        users[targetJid] = { freeUntil: null, premiumUntil: null };
      }
      
      users[targetJid].premiumUntil = new Date(Date.now() + days*24*60*60*1000).toISOString();
      write(USERS, users);
      
      await sock.sendMessage(sender, { 
        text: `✅ Premium added!\n\n📱 User: ${target}\n📅 Duration: ${days} days` 
      });
      
      await sock.sendMessage(targetJid, { 
        text: `🎉 *PREMIUM ACTIVATED!*\n\nYou now have ${days} days of premium access!\n\nEnjoy all features of ${config.botName}! 💎` 
      });
    }
  },

  broadcast: {
    desc: "Broadcast message (owner)",
    handler: async (sock, sender, args, msg) => {
      if (sender !== store.ownerJid) {
        return sock.sendMessage(sender, { text: "❌ Owner only command!" });
      }
      
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "📢 *Broadcast*\n\nUsage: `.broadcast <message>`" 
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
        } catch (err) {}
      }
      
      await sock.sendMessage(sender, { text: `✅ Broadcast sent to ${sent} users!` });
    }
  },

  // ─────────────────────────────────────────────────────────────────
  // 🎉 FUN TEXT COMMANDS
  // ─────────────────────────────────────────────────────────────────
  quote: {
    desc: "Random inspirational quote",
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
      
      await sock.sendMessage(sender, { text: `💭 *Quote of the Day*\n\n"${pick(quotes)}"` });
    }
  },

  joke: {
    desc: "Random joke",
    handler: async (sock, sender, args, msg) => {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything! 😄",
        "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
        "What do you call a fake noodle? An impasta! 🍝",
        "Why don't eggs tell jokes? They'd crack each other up! 🥚",
        "What do you call a bear with no teeth? A gummy bear! 🐻",
        "Why did the coffee file a police report? It got mugged! ☕"
      ];
      
      await sock.sendMessage(sender, { text: `😂 *Random Joke*\n\n${pick(jokes)}` });
    }
  },

  fact: {
    desc: "Random fun fact",
    handler: async (sock, sender, args, msg) => {
      const facts = [
        "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible! 🍯",
        "Octopuses have three hearts and blue blood! 🐙",
        "A day on Venus is longer than a year on Venus! 🌟",
        "Bananas are berries, but strawberries aren't! 🍌",
        "The Eiffel Tower can grow by 6 inches in summer due to heat expansion! 🗼",
        "Cows have best friends and get stressed when separated! 🐄"
      ];
      
      await sock.sendMessage(sender, { text: `🧠 *Fun Fact*\n\n${pick(facts)}` });
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

  const { state, saveCreds } = await useMultiFileAuthState("auth_info");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    logger,
    printQRInTerminal: true,
    browser: Browsers.ubuntu("Chrome"),
    generateHighQualityLinkPreview: true
  });

  // Save credentials
  sock.ev.on("creds.update", saveCreds);

  // Connection handling
  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;
    const analytics = safeRead(ANALYTICS, { connected: false });

    // Handle QR code
    if (qr) {
      console.log("📱 QR Code generated - Scan with WhatsApp!");
      pairingState.qr = qr;
      pairingState.status = "qr_ready";
      pairingState.lastUpdated = new Date().toISOString();
      
      try {
        pairingState.qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
      } catch (err) {
        console.error("QR generation error:", err);
      }
      
      analytics.qr = qr;
      analytics.qrUpdatedAt = new Date().toISOString();
    }

    // Connected successfully
    if (connection === "open") {
      console.log("✅ Connected to WhatsApp!");
      analytics.connected = true;
      pairingState.status = "connected";
      pairingState.connectedNumber = sock.user?.id?.split(":")[0] || "Unknown";
      pairingState.lastUpdated = new Date().toISOString();
      
      // Clear QR data
      pairingState.qr = null;
      pairingState.qrDataUrl = null;
    }

    // Disconnected
    if (connection === "close") {
      analytics.connected = false;
      pairingState.status = "disconnected";
      
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      
      console.log(`❌ Disconnected. Reason: ${statusCode}. Reconnecting: ${shouldReconnect}`);
      
      if (shouldReconnect) {
        // Reconnect
        setTimeout(() => startBot(), 3000);
      } else {
        // Logged out - clear auth
        console.log("🔄 Logged out. Clearing session for fresh pairing...");
        try {
          fs.rmSync("auth_info", { recursive: true, force: true });
        } catch (err) {}
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
        freeUntil: new Date(now.getTime() + 3*24*60*60*1000).toISOString(),
        premiumUntil: null,
        joinedAt: new Date().toISOString()
      };
      write(USERS, users);
      
      // Welcome message for new users
      await sock.sendMessage(sender, {
        text: `🎉 *Welcome to ${config.botName}!*\n\n${config.edition}\n\nYou have a *3-day free trial!*\n\nType *.menu* to see all commands! 🚀`
      });
    }

    const user = users[sender];
    const isPremium = user.premiumUntil && new Date(user.premiumUntil) > now;
    const isFreeActive = user.freeUntil && new Date(user.freeUntil) > now;
    const isOwner = sender === store.ownerJid;

    // Check subscription
    if (!isPremium && !isFreeActive && !isOwner) {
      await sock.sendMessage(sender, {
        text: `❌ *Subscription Expired!*\n\nYour free trial has ended.\n\n💎 Get Premium for just *KES 50/month*!\n\nSend: *.buy* to purchase via M-Pesa`
      });
      return;
    }

    // Command handling
    if (text.startsWith(".")) {
      const parts = text.slice(1).trim().split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const args = parts.slice(1);

      if (commands[cmd]) {
        console.log(`📩 Command: .${cmd} from ${sender.split("@")[0]}`);
        try {
          await commands[cmd].handler(sock, sender, args, msg);
        } catch (err) {
          console.error(`Command error (${cmd}):`, err);
          await sock.sendMessage(sender, { 
            text: `❌ Error executing command. Please try again!` 
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
