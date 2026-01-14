# 🤖 Scholar MD - Advanced WhatsApp Bot

<div align="center">

![Scholar MD](https://img.shields.io/badge/Scholar%20MD-WhatsApp%20Bot-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![Version](https://img.shields.io/badge/version-2.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=for-the-badge&logo=node.js)

**A powerful, feature-rich WhatsApp bot with 300+ commands**

[Features](#features) • [Installation](#installation) • [Commands](#commands) • [Configuration](#configuration) • [API](#api)

</div>

---

## ✨ Features

### 📥 Downloader
Download from YouTube, TikTok, Instagram, Facebook, Twitter, Spotify, and more!

### 🎨 Sticker Creator
Create stickers from images, videos, GIFs, and text with custom pack names.

### 🤖 AI Integration
- ChatGPT / GPT-4
- Google Gemini
- DALL-E / Stable Diffusion
- AI Voice Generator
- AI Code Assistant

### 🎮 Games & Fun
- Quizzes & Trivia
- Truth or Dare
- 8 Ball
- Love Calculator
- Slot Machine
- And more!

### 🔧 Utility Tools
- Calculator
- Translator
- Text-to-Speech
- Weather
- QR Generator
- Currency Converter
- OCR (Text from Image)

### 👥 Group Management
- Kick/Add members
- Promote/Demote admins
- Anti-link protection
- Welcome messages
- Warning system
- Hide-tag / Tag-all

### 🖼️ Image Tools
- Remove Background
- Blur / Sharpen
- Filters & Effects
- Wanted Poster
- Triggered GIF
- And 20+ effects!

### 🔊 Audio Tools
- Bass Boost
- Speed Up/Slow Down
- Nightcore
- 8D Audio
- Voice Changer
- And more!

### 🔮 Primbon
- Zodiac & Horoscope
- Tarot Reading
- Love Compatibility
- Dream Interpretation
- Numerology
- Feng Shui

---

## 📁 Project Structure

```
scholar-md/
├── 📂 plugins/          # Modular command plugins
│   ├── downloader.js    # Download commands
│   ├── sticker.js       # Sticker commands
│   ├── ai.js            # AI commands
│   ├── games.js         # Game commands
│   ├── tools.js         # Utility commands
│   ├── group.js         # Group admin commands
│   ├── fun.js           # Fun commands
│   ├── search.js        # Search commands
│   ├── audio.js         # Audio commands
│   ├── image.js         # Image commands
│   ├── primbon.js       # Fortune telling
│   └── owner.js         # Owner commands
├── 📂 lib/              # Core libraries
│   ├── pluginLoader.js  # Plugin management
│   └── menuSystem.js    # Carousel menu system
├── 📂 database/         # Data persistence
│   ├── index.js         # Database manager
│   └── data/            # JSON data files
├── 📂 config/           # Configuration
│   └── settings.js      # Bot settings
├── 📂 website/          # Dashboard website
│   ├── index.html       # Main page
│   ├── link.html        # QR pairing page
│   ├── css/styles.css   # Styling
│   └── js/main.js       # Frontend JS
├── 📂 public/           # Legacy public files
├── bot.js               # Main bot file
├── server.js            # Express server
├── mpesa.js             # M-Pesa integration
├── config.js            # Legacy config
├── store.js             # State management
├── package.json         # Dependencies
└── README.md            # This file
```

---

## 🚀 Installation

### Prerequisites
- Node.js v18+
- npm or yarn
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/scholar-md.git
cd scholar-md

# Install dependencies
npm install

# Configure the bot
cp config/settings.example.js config/settings.js
# Edit config/settings.js with your details

# Start the bot
npm start
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Keys
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=xxx
REMOVEBG_API_KEY=xxx
WEATHER_API_KEY=xxx

# Spotify
SPOTIFY_CLIENT_ID=xxx
SPOTIFY_CLIENT_SECRET=xxx

# M-Pesa
MPESA_CONSUMER_KEY=xxx
MPESA_CONSUMER_SECRET=xxx
MPESA_SHORTCODE=xxx
MPESA_PASSKEY=xxx

# Server
PORT=3000
```

---

## 📋 Commands

### 📥 Downloader (17 commands)
| Command | Description |
|---------|-------------|
| `.play <song>` | Play music from YouTube |
| `.song <query>` | Download song audio |
| `.video <query>` | Download video |
| `.tiktok <url>` | Download TikTok video |
| `.instagram <url>` | Download Instagram media |
| `.facebook <url>` | Download Facebook video |
| `.twitter <url>` | Download Twitter media |
| `.spotify <url>` | Download Spotify track |

### 🎨 Sticker (12 commands)
| Command | Description |
|---------|-------------|
| `.sticker` | Create sticker from media |
| `.toimg` | Convert sticker to image |
| `.emojimix <e1> <e2>` | Mix two emojis |
| `.attp <text>` | Animated text sticker |
| `.ttp <text>` | Text to picture sticker |

### 🤖 AI (14 commands)
| Command | Description |
|---------|-------------|
| `.ai <prompt>` | Chat with AI |
| `.gpt <prompt>` | Use GPT-4 |
| `.gemini <prompt>` | Use Google Gemini |
| `.imagine <prompt>` | Generate image with AI |
| `.aicode <prompt>` | Generate code |

### 🎮 Games (15 commands)
| Command | Description |
|---------|-------------|
| `.quiz` | Start a quiz |
| `.truth` | Truth question |
| `.dare` | Dare challenge |
| `.8ball <question>` | Ask magic 8 ball |
| `.love @user` | Love calculator |

### 👥 Group Admin (12 commands)
| Command | Description |
|---------|-------------|
| `.kick @user` | Kick a member |
| `.add <number>` | Add a member |
| `.promote @user` | Promote to admin |
| `.demote @user` | Demote from admin |
| `.antilink on/off` | Toggle anti-link |
| `.warn @user` | Warn a member |

---

## ⚙️ Configuration

Edit `config/settings.js` to customize:

```javascript
export default {
  bot: {
    name: 'Scholar MD',
    prefix: '.',
    owner: ['254700000000@s.whatsapp.net']
  },
  features: {
    autoRead: true,
    antiSpam: true,
    welcomeMessage: true
  },
  limits: {
    download: {
      maxSize: 100 // MB
    }
  }
};
```

---

## 💳 Premium Features

Unlock premium features with M-Pesa payment:

| Plan | Duration | Price (KES) |
|------|----------|-------------|
| Daily | 1 day | 20 |
| Weekly | 7 days | 100 |
| Monthly | 30 days | 300 |
| Yearly | 365 days | 2,500 |

### Premium Benefits:
- ✅ Unlimited downloads
- ✅ AI without limits
- ✅ Priority support
- ✅ Exclusive commands
- ✅ No cooldowns
- ✅ Custom stickers

---

## 🌐 API Reference

### Plugin Structure

```javascript
export const category = {
  name: 'CategoryName',
  emoji: '🎯',
  description: 'Category description'
};

export const commands = {
  commandName: {
    description: 'What this command does',
    usage: '.commandName <args>',
    aliases: ['alias1', 'alias2'],
    execute: async (sock, msg, args, context) => {
      // Command logic
      return 'Response message';
    }
  }
};
```

### Context Object

```javascript
{
  isOwner: boolean,
  isAdmin: boolean,
  isBotAdmin: boolean,
  isGroup: boolean,
  isPremium: boolean,
  store: Object,
  config: Object
}
```

---

## 📊 Dashboard

Access the web dashboard at `http://localhost:3000`:

- View bot statistics
- Manage users
- Configure settings
- Link devices via QR code

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

- [Baileys](https://github.com/WhiskeySockets/Baileys) - WhatsApp Web API
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing
- [FFmpeg](https://ffmpeg.org/) - Audio/video processing
- [ytdl-core](https://github.com/fent/node-ytdl-core) - YouTube downloads

---

<div align="center">

Made with ❤️ by Scholar MD Team

**Star ⭐ this repo if you find it useful!**

</div>
