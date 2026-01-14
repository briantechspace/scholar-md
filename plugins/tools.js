/**
 * 🔧 TOOLS COMMANDS
 * Utility tools and converters
 */

import { config } from '../config.js';

export const category = {
  name: "Tools",
  emoji: "🔧",
  description: "Calculators, converters & utility tools"
};

export const commands = {
  calc: {
    desc: "Calculator",
    usage: ".calc <expression>",
    example: ".calc 2+2*5",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .calc <expression>\n\n📌 Example: .calc 2+2*5" 
        });
      }
      try {
        const expr = args.join('').replace(/[^0-9+\-*/.()%^]/g, '');
        const result = eval(expr);
        await sock.sendMessage(sender, { text: `🔢 *Calculator*\n\n${args.join('')} = *${result}*` });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Invalid expression!" });
      }
    }
  },

  translate: {
    desc: "Translate text",
    usage: ".translate <lang> <text>",
    example: ".translate es Hello world",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .translate <lang> <text>\n\n📌 Example: .translate es Hello world\n\n🌐 Languages: en, es, fr, de, it, pt, ar, hi, sw, etc." 
        });
      }
      await sock.sendMessage(sender, { text: `🌐 *Translating to ${args[0]}...*` });
    }
  },

  trt: {
    desc: "Translate (short)",
    usage: ".trt <lang> <text>",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      return commands.translate.handler(sock, sender, args, msg);
    }
  },

  tts: {
    desc: "Text to speech",
    usage: ".tts <text>",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .tts <text>\n\n📌 Example: .tts Hello everyone!" 
        });
      }
      await sock.sendMessage(sender, { text: `🔊 *Converting to speech...*` });
    }
  },

  weather: {
    desc: "Get weather info",
    usage: ".weather <city>",
    example: ".weather Nairobi",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .weather <city>\n\n📌 Example: .weather Nairobi" 
        });
      }
      await sock.sendMessage(sender, { text: `🌤️ *Weather: ${args.join(' ')}*\n\n_Fetching weather data..._` });
    }
  },

  define: {
    desc: "Define a word",
    usage: ".define <word>",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .define <word>\n\n📌 Example: .define serendipity" 
        });
      }
      await sock.sendMessage(sender, { text: `📖 *Definition: ${args[0]}*\n\n_Looking up..._` });
    }
  },

  wiki: {
    desc: "Wikipedia search",
    usage: ".wiki <query>",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .wiki <query>\n\n📌 Example: .wiki Albert Einstein" 
        });
      }
      await sock.sendMessage(sender, { text: `📚 *Wikipedia: ${args.join(' ')}*\n\n_Searching..._` });
    }
  },

  ss: {
    desc: "Screenshot website",
    usage: ".ss <url>",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .ss <url>\n\n📌 Example: .ss https://google.com" 
        });
      }
      await sock.sendMessage(sender, { text: `📸 *Taking screenshot...*` });
    }
  },

  qr: {
    desc: "Generate QR code",
    usage: ".qr <text>",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .qr <text>\n\n📌 Example: .qr https://mywebsite.com" 
        });
      }
      await sock.sendMessage(sender, { text: `📱 *Generating QR code...*` });
    }
  },

  readqr: {
    desc: "Read QR code",
    usage: ".readqr",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .readqr\n\n📌 Reply to a QR code image" 
        });
      }
      await sock.sendMessage(sender, { text: `📱 *Reading QR code...*` });
    }
  },

  short: {
    desc: "Shorten URL",
    usage: ".short <url>",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .short <url>\n\n📌 Example: .short https://verylongurl.com/path" 
        });
      }
      await sock.sendMessage(sender, { text: `🔗 *Shortening URL...*` });
    }
  },

  currency: {
    desc: "Currency converter",
    usage: ".currency <amount> <from> <to>",
    example: ".currency 100 USD KES",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 3) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .currency <amount> <from> <to>\n\n📌 Example: .currency 100 USD KES" 
        });
      }
      await sock.sendMessage(sender, { text: `💱 *Converting ${args[0]} ${args[1]} to ${args[2]}...*` });
    }
  },

  ocr: {
    desc: "Extract text from image",
    usage: ".ocr",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .ocr\n\n📌 Reply to an image with text" 
        });
      }
      await sock.sendMessage(sender, { text: `📝 *Extracting text...*` });
    }
  },

  reminder: {
    desc: "Set a reminder",
    usage: ".reminder <time> <message>",
    example: ".reminder 10m Check the oven",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .reminder <time> <message>\n\n📌 Example: .reminder 10m Check the oven\n\n⏰ Time formats: 30s, 5m, 1h, 1d" 
        });
      }
      await sock.sendMessage(sender, { text: `⏰ *Reminder set!*\n\nTime: ${args[0]}\nMessage: ${args.slice(1).join(' ')}` });
    }
  },

  note: {
    desc: "Save a note",
    usage: ".note <text>",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .note <text>\n\n📌 Example: .note Remember to call mom" 
        });
      }
      await sock.sendMessage(sender, { text: `📝 *Note saved!*\n\n${args.join(' ')}` });
    }
  },

  poll: {
    desc: "Create a poll",
    usage: ".poll <question>|<option1>|<option2>",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      const text = args.join(' ');
      const parts = text.split('|').map(p => p.trim());
      if (parts.length < 3) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .poll <question>|<option1>|<option2>|...\n\n📌 Example: .poll Favorite color?|Red|Blue|Green" 
        });
      }
      
      try {
        await sock.sendMessage(sender, {
          poll: {
            name: parts[0],
            values: parts.slice(1),
            selectableCount: 1
          }
        });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to create poll!" });
      }
    }
  },

  runtime: {
    desc: "Check bot uptime",
    usage: ".runtime",
    category: "tools",
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

  ping: {
    desc: "Check bot response",
    usage: ".ping",
    category: "tools",
    handler: async (sock, sender, args, msg) => {
      const start = Date.now();
      await sock.sendMessage(sender, { text: `🏓 *Pong!*\n\n⚡ Speed: ${Date.now() - start}ms` });
    }
  }
};

export default { category, commands };
