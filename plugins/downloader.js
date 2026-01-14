/**
 * 📥 DOWNLOADER COMMANDS
 * Download media from various platforms
 */

import { config } from '../config.js';

export const category = {
  name: "Downloader",
  emoji: "📥",
  description: "Download media from YouTube, TikTok, Instagram & more"
};

export const commands = {
  play: {
    desc: "Play audio from YouTube",
    usage: ".play <name/link>",
    example: ".play Shape of You",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .play <name/link>\n\n📌 Example: .play Shape of You" 
        });
      }
      await sock.sendMessage(sender, { 
        text: `🎵 *Searching:* ${args.join(' ')}\n\n⏳ Please wait...` 
      });
    }
  },

  song: {
    desc: "Download song from YouTube",
    usage: ".song <name/link>",
    example: ".song Blinding Lights",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .song <name/link>\n\n📌 Example: .song Blinding Lights" 
        });
      }
      await sock.sendMessage(sender, { 
        text: `🎵 *Downloading:* ${args.join(' ')}\n\n⏳ Please wait...` 
      });
    }
  },

  video: {
    desc: "Download video from YouTube",
    usage: ".video <name/link>",
    example: ".video funny cats",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .video <name/link>\n\n📌 Example: .video funny cats" 
        });
      }
      await sock.sendMessage(sender, { 
        text: `🎬 *Downloading:* ${args.join(' ')}\n\n⏳ Please wait...` 
      });
    }
  },

  ytmp3: {
    desc: "Convert YouTube to MP3",
    usage: ".ytmp3 <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .ytmp3 <youtube_link>\n\n📌 Example: .ytmp3 https://youtube.com/watch?v=xxx" 
        });
      }
      await sock.sendMessage(sender, { text: `🎵 *Converting to MP3...*` });
    }
  },

  ytmp4: {
    desc: "Convert YouTube to MP4",
    usage: ".ytmp4 <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .ytmp4 <youtube_link>\n\n📌 Example: .ytmp4 https://youtube.com/watch?v=xxx" 
        });
      }
      await sock.sendMessage(sender, { text: `🎬 *Converting to MP4...*` });
    }
  },

  tiktok: {
    desc: "Download TikTok video",
    usage: ".tiktok <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .tiktok <link>\n\n📌 Example: .tiktok https://tiktok.com/@user/video/xxx" 
        });
      }
      await sock.sendMessage(sender, { text: `📱 *Downloading TikTok...*` });
    }
  },

  tt: {
    desc: "Download TikTok (short)",
    usage: ".tt <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      return commands.tiktok.handler(sock, sender, args, msg);
    }
  },

  instagram: {
    desc: "Download Instagram media",
    usage: ".instagram <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .instagram <link>\n\n📌 Example: .instagram https://instagram.com/p/xxx" 
        });
      }
      await sock.sendMessage(sender, { text: `📸 *Downloading Instagram...*` });
    }
  },

  ig: {
    desc: "Download Instagram (short)",
    usage: ".ig <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      return commands.instagram.handler(sock, sender, args, msg);
    }
  },

  facebook: {
    desc: "Download Facebook video",
    usage: ".facebook <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .facebook <link>\n\n📌 Example: .facebook https://facebook.com/video/xxx" 
        });
      }
      await sock.sendMessage(sender, { text: `📘 *Downloading Facebook...*` });
    }
  },

  fb: {
    desc: "Download Facebook (short)",
    usage: ".fb <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      return commands.facebook.handler(sock, sender, args, msg);
    }
  },

  twitter: {
    desc: "Download Twitter/X media",
    usage: ".twitter <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .twitter <link>\n\n📌 Example: .twitter https://twitter.com/user/status/xxx" 
        });
      }
      await sock.sendMessage(sender, { text: `🐦 *Downloading Twitter...*` });
    }
  },

  spotify: {
    desc: "Download from Spotify",
    usage: ".spotify <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .spotify <link>\n\n📌 Example: .spotify https://open.spotify.com/track/xxx" 
        });
      }
      await sock.sendMessage(sender, { text: `🎵 *Downloading Spotify...*` });
    }
  },

  mediafire: {
    desc: "Download from MediaFire",
    usage: ".mediafire <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .mediafire <link>\n\n📌 Example: .mediafire https://mediafire.com/file/xxx" 
        });
      }
      await sock.sendMessage(sender, { text: `📁 *Downloading MediaFire...*` });
    }
  },

  apk: {
    desc: "Download APK",
    usage: ".apk <name>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .apk <app_name>\n\n📌 Example: .apk WhatsApp" 
        });
      }
      await sock.sendMessage(sender, { text: `📱 *Searching APK: ${args.join(' ')}*` });
    }
  },

  pinterest: {
    desc: "Download Pinterest image",
    usage: ".pinterest <link/query>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .pinterest <link/query>\n\n📌 Example: .pinterest aesthetic wallpaper" 
        });
      }
      await sock.sendMessage(sender, { text: `📌 *Downloading Pinterest...*` });
    }
  },

  gdrive: {
    desc: "Download from Google Drive",
    usage: ".gdrive <link>",
    category: "downloader",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .gdrive <link>\n\n📌 Example: .gdrive https://drive.google.com/file/d/xxx" 
        });
      }
      await sock.sendMessage(sender, { text: `📁 *Downloading Google Drive...*` });
    }
  }
};

export default { category, commands };
