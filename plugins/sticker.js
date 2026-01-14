/**
 * 🎨 STICKER COMMANDS
 * Create and convert stickers
 */

import { config } from '../config.js';

export const category = {
  name: "Sticker",
  emoji: "🎨",
  description: "Create stickers from images, videos & text"
};

export const commands = {
  sticker: {
    desc: "Convert image/video to sticker",
    usage: ".sticker",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const imageMsg = msg.message?.imageMessage || quotedMsg?.imageMessage;
      const videoMsg = msg.message?.videoMessage || quotedMsg?.videoMessage;
      
      if (!imageMsg && !videoMsg) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .sticker\n\n📌 Send or reply to an image/video" 
        });
      }
      await sock.sendMessage(sender, { text: `🎨 *Creating sticker...*` });
    }
  },

  s: {
    desc: "Sticker (short)",
    usage: ".s",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      return commands.sticker.handler(sock, sender, args, msg);
    }
  },

  toimg: {
    desc: "Convert sticker to image",
    usage: ".toimg",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.stickerMessage) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .toimg\n\n📌 Reply to a sticker" 
        });
      }
      await sock.sendMessage(sender, { text: `🖼️ *Converting to image...*` });
    }
  },

  emojimix: {
    desc: "Mix two emojis",
    usage: ".emojimix <emoji1>+<emoji2>",
    example: ".emojimix 😀+😎",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      if (!args.length || !args[0].includes('+')) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .emojimix <emoji1>+<emoji2>\n\n📌 Example: .emojimix 😀+😎" 
        });
      }
      await sock.sendMessage(sender, { text: `🎭 *Mixing emojis...*` });
    }
  },

  attp: {
    desc: "Animated text to sticker",
    usage: ".attp <text>",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .attp <text>\n\n📌 Example: .attp Hello World" 
        });
      }
      await sock.sendMessage(sender, { text: `✨ *Creating animated text sticker...*` });
    }
  },

  ttp: {
    desc: "Text to picture sticker",
    usage: ".ttp <text>",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .ttp <text>\n\n📌 Example: .ttp Hello World" 
        });
      }
      await sock.sendMessage(sender, { text: `🖼️ *Creating text sticker...*` });
    }
  },

  take: {
    desc: "Change sticker pack name",
    usage: ".take <packname>",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.stickerMessage) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .take <packname>\n\n📌 Reply to a sticker" 
        });
      }
      await sock.sendMessage(sender, { text: `📝 *Changing sticker pack name...*` });
    }
  },

  steal: {
    desc: "Steal sticker with new pack",
    usage: ".steal <pack> <author>",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      return commands.take.handler(sock, sender, args, msg);
    }
  },

  smeme: {
    desc: "Create sticker meme",
    usage: ".smeme <top>|<bottom>",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .smeme <top>|<bottom>\n\n📌 Reply to an image" 
        });
      }
      await sock.sendMessage(sender, { text: `😂 *Creating meme sticker...*` });
    }
  },

  wm: {
    desc: "Add watermark to sticker",
    usage: ".wm <text>",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.stickerMessage) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .wm <text>\n\n📌 Reply to a sticker" 
        });
      }
      await sock.sendMessage(sender, { text: `📝 *Adding watermark...*` });
    }
  },

  crop: {
    desc: "Crop sticker",
    usage: ".crop",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .crop\n\n📌 Reply to an image" 
        });
      }
      await sock.sendMessage(sender, { text: `✂️ *Cropping...*` });
    }
  },

  circle: {
    desc: "Circle crop sticker",
    usage: ".circle",
    category: "sticker",
    handler: async (sock, sender, args, msg) => {
      const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quotedMsg?.imageMessage && !msg.message?.imageMessage) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .circle\n\n📌 Reply to an image" 
        });
      }
      await sock.sendMessage(sender, { text: `⭕ *Creating circle sticker...*` });
    }
  }
};

export default { category, commands };
