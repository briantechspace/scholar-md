/**
 * 🎠 CAROUSEL MENU SYSTEM
 * Beautiful category-based menu with interactive cards
 */

import { config } from '../config.js';

// Category card data with emojis, colors and descriptions
export const menuCategories = [
  {
    id: 'downloader',
    name: '📥 Downloader',
    emoji: '📥',
    color: '#FF6B6B',
    image: 'https://i.ibb.co/download.png',
    description: 'Download from YouTube, TikTok, Instagram & more',
    commands: ['play', 'song', 'video', 'ytmp3', 'ytmp4', 'tiktok', 'instagram', 'facebook', 'twitter', 'spotify', 'mediafire', 'apk', 'pinterest', 'gdrive']
  },
  {
    id: 'sticker',
    name: '🎨 Sticker',
    emoji: '🎨',
    color: '#4ECDC4',
    image: 'https://i.ibb.co/sticker.png',
    description: 'Create stickers from images, videos & text',
    commands: ['sticker', 's', 'toimg', 'emojimix', 'attp', 'ttp', 'take', 'steal', 'smeme', 'wm', 'crop', 'circle']
  },
  {
    id: 'ai',
    name: '🤖 AI',
    emoji: '🤖',
    color: '#45B7D1',
    image: 'https://i.ibb.co/ai.png',
    description: 'AI chatbots, image generation & smart tools',
    commands: ['ai', 'gpt', 'chatgpt', 'gemini', 'bard', 'blackbox', 'imagine', 'dalle', 'stable', 'aiart', 'aivoice', 'aicode']
  },
  {
    id: 'games',
    name: '🎮 Games',
    emoji: '🎮',
    color: '#96CEB4',
    image: 'https://i.ibb.co/games.png',
    description: 'Fun games, quizzes & entertainment',
    commands: ['roll', 'flip', 'rps', 'slot', 'quiz', 'trivia', 'truth', 'dare', '8ball', 'love', 'ship', 'rate', 'roast', 'simp', 'gay']
  },
  {
    id: 'tools',
    name: '🔧 Tools',
    emoji: '🔧',
    color: '#FFEAA7',
    image: 'https://i.ibb.co/tools.png',
    description: 'Calculators, converters & utility tools',
    commands: ['calc', 'translate', 'tts', 'weather', 'define', 'wiki', 'ss', 'qr', 'readqr', 'short', 'currency', 'ocr', 'reminder', 'poll']
  },
  {
    id: 'group',
    name: '👥 Group',
    emoji: '👥',
    color: '#DDA0DD',
    image: 'https://i.ibb.co/group.png',
    description: 'Group management & admin tools',
    commands: ['kick', 'add', 'promote', 'demote', 'mute', 'unmute', 'hidetag', 'tagall', 'antilink', 'welcome', 'warn', 'groupinfo']
  },
  {
    id: 'fun',
    name: '🎭 Fun',
    emoji: '🎭',
    color: '#FFB6C1',
    image: 'https://i.ibb.co/fun.png',
    description: 'Jokes, quotes, memes & entertainment',
    commands: ['joke', 'quote', 'fact', 'meme', 'pickup', 'insult', 'compliment', 'advice', 'riddle', 'lyrics', 'anime', 'waifu', 'neko']
  },
  {
    id: 'search',
    name: '🔍 Search',
    emoji: '🔍',
    color: '#87CEEB',
    image: 'https://i.ibb.co/search.png',
    description: 'Search Google, YouTube, images & more',
    commands: ['google', 'youtube', 'image', 'gif', 'playstore', 'github', 'npm', 'imdb', 'movie', 'anime_search', 'manga']
  },
  {
    id: 'image',
    name: '🖼️ Image',
    emoji: '🖼️',
    color: '#98D8C8',
    image: 'https://i.ibb.co/image.png',
    description: 'Image editing, filters & effects',
    commands: ['blur', 'removebg', 'enhance', 'cartoon', 'pixelate', 'invert', 'grayscale', 'sepia', 'rotate', 'mirror', 'wanted', 'jail']
  },
  {
    id: 'audio',
    name: '🔊 Audio',
    emoji: '🔊',
    color: '#F0E68C',
    image: 'https://i.ibb.co/audio.png',
    description: 'Audio effects, filters & conversions',
    commands: ['bass', 'blown', 'slow', 'fast', 'reverse', 'nightcore', 'earrape', 'deep', 'robot', 'chipmunk', '8d', 'echo']
  },
  {
    id: 'primbon',
    name: '🔮 Primbon',
    emoji: '🔮',
    color: '#9B59B6',
    image: 'https://i.ibb.co/primbon.png',
    description: 'Fortune telling, zodiac & horoscope',
    commands: ['zodiac', 'horoscope', 'tarot', 'shio', 'artinama', 'jodoh', 'ramalan', 'mimpi', 'numerology', 'fengshui']
  },
  {
    id: 'owner',
    name: '👑 Owner',
    emoji: '👑',
    color: '#E74C3C',
    image: 'https://i.ibb.co/owner.png',
    description: 'Bot owner management commands',
    commands: ['addprem', 'delprem', 'ban', 'unban', 'broadcast', 'setname', 'setbio', 'restart', 'shutdown', 'mode', 'eval', 'exec']
  }
];

/**
 * Generate main carousel menu with category cards
 */
export function generateCarouselMenu() {
  const now = new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
  
  // Header
  let menu = `
╭─────────────────────────╮
│   🎓 *${config.botName}*   
│   _${config.edition}_      
╰─────────────────────────╯

📊 *${menuCategories.length} Categories* | *200+ Commands*
⏰ ${now}

━━━━━━━━━━━━━━━━━━━━━━━━━

`;

  // Category cards in a grid-like format
  for (let i = 0; i < menuCategories.length; i += 2) {
    const cat1 = menuCategories[i];
    const cat2 = menuCategories[i + 1];
    
    menu += `┌──────────┬──────────┐\n`;
    menu += `│ ${cat1.emoji} *${cat1.id.toUpperCase().padEnd(6)}* │`;
    if (cat2) {
      menu += ` ${cat2.emoji} *${cat2.id.toUpperCase().padEnd(6)}* │\n`;
    } else {
      menu += `          │\n`;
    }
    menu += `│ .${cat1.id.padEnd(8)} │`;
    if (cat2) {
      menu += ` .${cat2.id.padEnd(8)} │\n`;
    } else {
      menu += `          │\n`;
    }
    menu += `└──────────┴──────────┘\n`;
  }

  menu += `
━━━━━━━━━━━━━━━━━━━━━━━━━

💡 *Quick Commands:*
.menu - This menu
.help <cmd> - Command help
.<category> - Category menu

👤 Owner: ${config.ownerDisplayName}
🌐 Repo: github.com/scholar-md
`;

  return menu.trim();
}

/**
 * Generate a single category card menu
 */
export function generateCategoryMenu(categoryId) {
  const cat = menuCategories.find(c => c.id === categoryId);
  if (!cat) return null;
  
  let menu = `
╭─────────────────────────╮
│  ${cat.emoji} *${cat.name.toUpperCase()}*
│  _${cat.description}_
╰─────────────────────────╯

`;

  // Commands list
  cat.commands.forEach((cmd, i) => {
    menu += `.${cmd}\n`;
  });

  menu += `
━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Type .help <cmd> for usage
🔙 Type .menu for main menu
`;

  return menu.trim();
}

/**
 * Generate interactive button menu (WhatsApp buttons)
 */
export function generateButtonMenu() {
  const buttons = menuCategories.slice(0, 3).map(cat => ({
    buttonId: `.${cat.id}`,
    buttonText: { displayText: `${cat.emoji} ${cat.name}` },
    type: 1
  }));
  
  return {
    text: `🎓 *${config.botName}*\n\n_Choose a category:_`,
    footer: config.edition,
    buttons,
    headerType: 1
  };
}

/**
 * Generate list menu (WhatsApp sections)
 */
export function generateListMenu() {
  const sections = [{
    title: "📋 Command Categories",
    rows: menuCategories.map(cat => ({
      title: `${cat.emoji} ${cat.name}`,
      rowId: `.${cat.id}`,
      description: cat.description
    }))
  }];
  
  return {
    text: `🎓 *${config.botName}*\n\n_Select a category to view commands_`,
    footer: config.edition,
    title: "📋 Menu",
    buttonText: "🔽 Open Menu",
    sections
  };
}

/**
 * Generate visual card for a category (with image)
 */
export function generateCategoryCard(categoryId) {
  const cat = menuCategories.find(c => c.id === categoryId);
  if (!cat) return null;
  
  return {
    image: { url: cat.image },
    caption: `
${cat.emoji} *${cat.name.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━

${cat.description}

*Commands (${cat.commands.length}):*
${cat.commands.map(c => `• .${c}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━
📌 .help <cmd> for usage
🔙 .menu for main menu
    `.trim()
  };
}

export default {
  menuCategories,
  generateCarouselMenu,
  generateCategoryMenu,
  generateButtonMenu,
  generateListMenu,
  generateCategoryCard
};
