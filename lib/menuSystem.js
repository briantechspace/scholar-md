/**
 * 🎠 SCHOLAR MD CAROUSEL MENU SYSTEM
 * Beautiful swipeable cards with proper categories
 * 
 * Creator: Brian Tech Space
 * Collaborator: Eduqariz
 */

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

export const BOT_CONFIG = {
  name: 'SCHOLAR MD',
  version: '2.0.0',
  menuImage: 'https://files.catbox.moe/zsc2mx.jpg',
  channelJid: '120363424485406730@newsletter',
  creator: {
    name: 'Brian Tech Space',
    role: '👨‍💻 Creator & Lead Developer',
    emoji: '🚀'
  },
  collaborator: {
    name: 'Eduqariz', 
    role: '🤝 Collaborator & Partner',
    emoji: '💡'
  }
};

// ═══════════════════════════════════════════════════════════════════
// DECORATIVE ELEMENTS
// ═══════════════════════════════════════════════════════════════════

const FLOWERS = ['🌸', '🌺', '🌹', '🌷', '💐', '🌻', '🌼', '💮', '🏵️', '🪷', '🌿', '🍀'];
const SPARKLES = ['✨', '💫', '⭐', '🌟', '❋', '❊', '❁', '✿'];

// Unique arrows for commands
const ARROWS = {
  default: '➣',
  owner: '⚡',
  presence: '◈',
  group: '◆',
  downloader: '⤵',
  sticker: '✦',
  ai: '⚙',
  tools: '✧',
  fun: '★',
  search: '◉',
  audio: '♪',
  image: '◐',
  primbon: '☽',
  converter: '↻',
  info: '●'
};

// ═══════════════════════════════════════════════════════════════════
// TIME-BASED GREETINGS
// ═══════════════════════════════════════════════════════════════════

function getTimeGreeting() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return {
      greeting: '🌅 Good Morning',
      emoji: '☀️',
      message: 'Rise and shine! Ready to explore?'
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: '🌤️ Good Afternoon',
      emoji: '🌞',
      message: 'Hope your day is going great!'
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: '🌆 Good Evening',
      emoji: '🌅',
      message: 'Winding down? Let me assist you!'
    };
  } else {
    return {
      greeting: '🌙 Good Night',
      emoji: '✨',
      message: 'Burning the midnight oil? I got you!'
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// MOTIVATIONAL QUOTES (Rotates every call)
// ═══════════════════════════════════════════════════════════════════

const MOTIVATIONAL_QUOTES = [
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
  { quote: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { quote: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { quote: "The future belongs to those who believe in their dreams.", author: "Eleanor Roosevelt" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { quote: "Your limitation—it's only your imagination.", author: "Unknown" },
  { quote: "Push yourself, because no one else will.", author: "Unknown" },
  { quote: "Great things never come from comfort zones.", author: "Unknown" },
  { quote: "The harder you work, the luckier you get.", author: "Gary Player" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { quote: "Strive for progress, not perfection.", author: "Unknown" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" }
];

function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

// ═══════════════════════════════════════════════════════════════════
// UPTIME CALCULATOR
// ═══════════════════════════════════════════════════════════════════

let startTime = Date.now();

function getUptime() {
  const uptime = Date.now() - startTime;
  const seconds = Math.floor(uptime / 1000) % 60;
  const minutes = Math.floor(uptime / (1000 * 60)) % 60;
  const hours = Math.floor(uptime / (1000 * 60 * 60)) % 24;
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  
  let result = '';
  if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m `;
  result += `${seconds}s`;
  
  return result.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 1: BOT INFO (Name, Uptime, Greeting, Quote)
// ═══════════════════════════════════════════════════════════════════

export function generateBotInfoCard(username = 'User') {
  const timeInfo = getTimeGreeting();
  const quote = getRandomQuote();
  const uptime = getUptime();
  const now = new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" });
  
  return `
🌸━━━━━━━━━━━━━━━━━━━━━🌸
┃                              ┃
┃   🎓 *SCHOLAR MD* 🎓         ┃
┃   _Smart WhatsApp Bot_       ┃
┃                              ┃
🌸━━━━━━━━━━━━━━━━━━━━━🌸

${timeInfo.greeting} ${timeInfo.emoji}
*${username}!* ${timeInfo.message}

╭🌹━━━━━━━━━━━━━━━━━━🌹╮
┃                              
┃  📊 *BOT STATUS*             
┃                              
┃  ⏱️ Uptime  : ${uptime}
┃  📦 Version : v${BOT_CONFIG.version}
┃  🎯 Commands: 200+           
┃  📅 Date    : ${now.split(',')[0]}
┃  ⏰ Time    : ${now.split(',')[1]?.trim() || ''}
┃                              
╰🌹━━━━━━━━━━━━━━━━━━🌹╯

╭💫━━━━━━━━━━━━━━━━━━💫╮
┃                              
┃  💭 *Quote of the Moment*    
┃                              
┃  _"${quote.quote}"_
┃                              
┃  — ${quote.author}           
┃                              
╰💫━━━━━━━━━━━━━━━━━━💫╯

     ➡️ *Swipe for commands*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 2: OWNER COMMANDS
// ═══════════════════════════════════════════════════════════════════

export function generateOwnerCard() {
  const commands = [
    'ping', 'alive', 'runtime', 'owner',
    'block', 'unblock', 'self', 'public',
    'setname', 'setbio', 'setpp',
    'broadcast', 'ban', 'unban',
    'addprem', 'delprem', 'restart',
    'shutdown', 'cleartmp', 'clearsession'
  ];
  
  return `
🌺━━━━━━━━━━━━━━━━━━━━━🌺
┃                              ┃
┃  👑 *OWNER COMMANDS* 👑      ┃
┃  _Bot Management & Control_  ┃
┃                              ┃
🌺━━━━━━━━━━━━━━━━━━━━━🌺

╭⚡━━━━━━━━━━━━━━━━━━⚡╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.owner} .${cmd}`).join('\n')}
┃                              
╰⚡━━━━━━━━━━━━━━━━━━⚡╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 3: PRESENCE FEATURES
// ═══════════════════════════════════════════════════════════════════

export function generatePresenceCard() {
  const commands = [
    'antidelete', 'autotyping', 'autorecording',
    'autoread', 'autoreact', 'autobio',
    'presence', 'online', 'offline',
    'antiviewonce', 'anticall', 'autoblock'
  ];
  
  return `
🌷━━━━━━━━━━━━━━━━━━━━━🌷
┃                              ┃
┃  🔮 *PRESENCE FEATURES* 🔮   ┃
┃  _Auto Actions & Privacy_    ┃
┃                              ┃
🌷━━━━━━━━━━━━━━━━━━━━━🌷

╭◈━━━━━━━━━━━━━━━━━━◈╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.presence} .${cmd}`).join('\n')}
┃                              
╰◈━━━━━━━━━━━━━━━━━━◈╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 4: GROUP FEATURES
// ═══════════════════════════════════════════════════════════════════

export function generateGroupCard() {
  const commands = [
    'kick', 'add', 'promote', 'demote',
    'mute', 'unmute', 'hidetag', 'tagall',
    'antilink', 'antispam', 'antitoxic',
    'welcome', 'goodbye', 'setwelcome',
    'setgoodbye', 'setgname', 'setgdesc',
    'setgpp', 'resetlink', 'groupinfo',
    'warn', 'warnings', 'clearwarns',
    'revoke', 'linkgroup', 'ephemeral'
  ];
  
  return `
🌻━━━━━━━━━━━━━━━━━━━━━🌻
┃                              ┃
┃  👥 *GROUP FEATURES* 👥      ┃
┃  _Admin Tools & Management_  ┃
┃                              ┃
🌻━━━━━━━━━━━━━━━━━━━━━🌻

╭◆━━━━━━━━━━━━━━━━━━◆╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.group} .${cmd}`).join('\n')}
┃                              
╰◆━━━━━━━━━━━━━━━━━━◆╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 5: DOWNLOADER
// ═══════════════════════════════════════════════════════════════════

export function generateDownloaderCard() {
  const commands = [
    'play', 'song', 'video', 'ytmp3',
    'ytmp4', 'ytsearch', 'tiktok', 'tiktokmp3',
    'instagram', 'igtv', 'igreels', 'facebook',
    'twitter', 'spotify', 'soundcloud',
    'mediafire', 'apk', 'pinterest',
    'gdrive', 'mega', 'capcut'
  ];
  
  return `
💐━━━━━━━━━━━━━━━━━━━━━💐
┃                              ┃
┃  📥 *DOWNLOADER* 📥          ┃
┃  _Media & File Downloads_    ┃
┃                              ┃
💐━━━━━━━━━━━━━━━━━━━━━💐

╭⤵━━━━━━━━━━━━━━━━━━⤵╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.downloader} .${cmd}`).join('\n')}
┃                              
╰⤵━━━━━━━━━━━━━━━━━━⤵╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 6: STICKER
// ═══════════════════════════════════════════════════════════════════

export function generateStickerCard() {
  const commands = [
    'sticker', 's', 'stickergif', 'stickervid',
    'toimg', 'tomp4', 'emojimix', 'attp',
    'ttp', 'take', 'steal', 'rename',
    'smeme', 'wm', 'crop', 'circle',
    'rounded', 'stickertoimg', 'colourattp'
  ];
  
  return `
🌼━━━━━━━━━━━━━━━━━━━━━🌼
┃                              ┃
┃  🎨 *STICKER MAKER* 🎨       ┃
┃  _Create Custom Stickers_    ┃
┃                              ┃
🌼━━━━━━━━━━━━━━━━━━━━━🌼

╭✦━━━━━━━━━━━━━━━━━━✦╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.sticker} .${cmd}`).join('\n')}
┃                              
╰✦━━━━━━━━━━━━━━━━━━✦╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 7: AI FEATURES
// ═══════════════════════════════════════════════════════════════════

export function generateAICard() {
  const commands = [
    'ai', 'gpt', 'chatgpt', 'gemini',
    'bard', 'blackbox', 'claude', 'llama',
    'imagine', 'dalle', 'stable', 'midjourney',
    'aiart', 'aivoice', 'aicode', 'aisummarize',
    'aiwrite', 'aitranslate'
  ];
  
  return `
💮━━━━━━━━━━━━━━━━━━━━━💮
┃                              ┃
┃  🤖 *AI FEATURES* 🤖         ┃
┃  _Smart AI Assistants_       ┃
┃                              ┃
💮━━━━━━━━━━━━━━━━━━━━━💮

╭⚙━━━━━━━━━━━━━━━━━━⚙╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.ai} .${cmd}`).join('\n')}
┃                              
╰⚙━━━━━━━━━━━━━━━━━━⚙╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 8: TOOLS & UTILITIES
// ═══════════════════════════════════════════════════════════════════

export function generateToolsCard() {
  const commands = [
    'calc', 'translate', 'trt', 'tts',
    'weather', 'define', 'wiki', 'ss',
    'qr', 'readqr', 'short', 'unshort',
    'currency', 'ocr', 'reminder', 'poll',
    'base64enc', 'base64dec', 'binary',
    'hex', 'randomnum', 'timer'
  ];
  
  return `
🏵️━━━━━━━━━━━━━━━━━━━━━🏵️
┃                              ┃
┃  🔧 *TOOLS & UTILS* 🔧       ┃
┃  _Handy Utilities_           ┃
┃                              ┃
🏵️━━━━━━━━━━━━━━━━━━━━━🏵️

╭✧━━━━━━━━━━━━━━━━━━✧╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.tools} .${cmd}`).join('\n')}
┃                              
╰✧━━━━━━━━━━━━━━━━━━✧╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 9: FUN & GAMES
// ═══════════════════════════════════════════════════════════════════

export function generateFunCard() {
  const commands = [
    'roll', 'flip', 'rps', 'slot',
    'quiz', 'trivia', 'truth', 'dare',
    '8ball', 'love', 'ship', 'rate',
    'roast', 'simp', 'gay', 'horny',
    'wasted', 'joke', 'quote', 'fact',
    'meme', 'pickup', 'insult', 'compliment',
    'advice', 'riddle', 'tictactoe', 'hangman'
  ];
  
  return `
🪷━━━━━━━━━━━━━━━━━━━━━🪷
┃                              ┃
┃  🎮 *FUN & GAMES* 🎮         ┃
┃  _Entertainment Zone_        ┃
┃                              ┃
🪷━━━━━━━━━━━━━━━━━━━━━🪷

╭★━━━━━━━━━━━━━━━━━━★╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.fun} .${cmd}`).join('\n')}
┃                              
╰★━━━━━━━━━━━━━━━━━━★╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 10: SEARCH
// ═══════════════════════════════════════════════════════════════════

export function generateSearchCard() {
  const commands = [
    'google', 'youtube', 'ytsearch', 'image',
    'gif', 'playstore', 'github', 'npm',
    'imdb', 'movie', 'anime', 'manga',
    'lyrics', 'wallpaper', 'news', 'weather',
    'recipe', 'pinterest', 'reddit'
  ];
  
  return `
🌿━━━━━━━━━━━━━━━━━━━━━🌿
┃                              ┃
┃  🔍 *SEARCH* 🔍              ┃
┃  _Find Anything_             ┃
┃                              ┃
🌿━━━━━━━━━━━━━━━━━━━━━🌿

╭◉━━━━━━━━━━━━━━━━━━◉╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.search} .${cmd}`).join('\n')}
┃                              
╰◉━━━━━━━━━━━━━━━━━━◉╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 11: AUDIO EFFECTS
// ═══════════════════════════════════════════════════════════════════

export function generateAudioCard() {
  const commands = [
    'bass', 'blown', 'slow', 'fast',
    'reverse', 'nightcore', 'earrape', 'deep',
    'robot', 'chipmunk', '8d', 'echo',
    'treble', 'distort', 'vibrato', 'tremolo',
    'lowpass', 'highpass', 'toaudio', 'tomp3'
  ];
  
  return `
🍀━━━━━━━━━━━━━━━━━━━━━🍀
┃                              ┃
┃  🔊 *AUDIO EFFECTS* 🔊       ┃
┃  _Sound Manipulation_        ┃
┃                              ┃
🍀━━━━━━━━━━━━━━━━━━━━━🍀

╭♪━━━━━━━━━━━━━━━━━━♪╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.audio} .${cmd}`).join('\n')}
┃                              
╰♪━━━━━━━━━━━━━━━━━━♪╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 12: IMAGE EDITING
// ═══════════════════════════════════════════════════════════════════

export function generateImageCard() {
  const commands = [
    'blur', 'removebg', 'enhance', 'cartoon',
    'pixelate', 'invert', 'grayscale', 'sepia',
    'rotate', 'flip', 'mirror', 'brightness',
    'contrast', 'sharpen', 'saturate', 'wanted',
    'jail', 'triggered', 'wasted', 'circle',
    'resize', 'crop', 'compress', 'hd'
  ];
  
  return `
🌹━━━━━━━━━━━━━━━━━━━━━🌹
┃                              ┃
┃  🖼️ *IMAGE EDITING* 🖼️       ┃
┃  _Photo Manipulation_        ┃
┃                              ┃
🌹━━━━━━━━━━━━━━━━━━━━━🌹

╭◐━━━━━━━━━━━━━━━━━━◐╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.image} .${cmd}`).join('\n')}
┃                              
╰◐━━━━━━━━━━━━━━━━━━◐╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 13: PRIMBON / FORTUNE
// ═══════════════════════════════════════════════════════════════════

export function generatePrimbonCard() {
  const commands = [
    'zodiac', 'horoscope', 'tarot', 'shio',
    'artinama', 'jodoh', 'jodohname', 'ramalan',
    'nasib', 'keberuntungan', 'mimpi', 'karakter',
    'weton', 'numerology', 'fengshui', 'palmistry'
  ];
  
  return `
🌺━━━━━━━━━━━━━━━━━━━━━🌺
┃                              ┃
┃  🔮 *PRIMBON* 🔮             ┃
┃  _Fortune & Mystical_        ┃
┃                              ┃
🌺━━━━━━━━━━━━━━━━━━━━━🌺

╭☽━━━━━━━━━━━━━━━━━━☽╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.primbon} .${cmd}`).join('\n')}
┃                              
╰☽━━━━━━━━━━━━━━━━━━☽╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 14: CONVERTERS
// ═══════════════════════════════════════════════════════════════════

export function generateConverterCard() {
  const commands = [
    'toimg', 'tovid', 'tomp3', 'tomp4',
    'togif', 'tourl', 'tobase64', 'frombase64',
    'topdf', 'totext', 'toqr', 'fromqr',
    'compress', 'decompress', 'webp2png', 'png2webp'
  ];
  
  return `
🌷━━━━━━━━━━━━━━━━━━━━━🌷
┃                              ┃
┃  🔄 *CONVERTERS* 🔄          ┃
┃  _Format Conversion_         ┃
┃                              ┃
🌷━━━━━━━━━━━━━━━━━━━━━🌷

╭↻━━━━━━━━━━━━━━━━━━↻╮
┃                              
${commands.map(cmd => `┃  ${ARROWS.converter} .${cmd}`).join('\n')}
┃                              
╰↻━━━━━━━━━━━━━━━━━━↻╯

📝 _${commands.length} commands available_

     ➡️ *Swipe for more*
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// CARD 15: CREATOR & COLLABORATOR INFO
// ═══════════════════════════════════════════════════════════════════

export function generateCreatorCard() {
  const { creator, collaborator } = BOT_CONFIG;
  
  return `
✨━━━━━━━━━━━━━━━━━━━━━✨
┃                              ┃
┃  👥 *MEET THE TEAM* 👥       ┃
┃  _The Minds Behind Scholar_  ┃
┃                              ┃
✨━━━━━━━━━━━━━━━━━━━━━✨

╭🚀━━━━━━━━━━━━━━━━━━🚀╮
┃                              
┃   👨‍💻 *CREATOR*              
┃                              
┃   ${creator.emoji} *${creator.name}*
┃   ${creator.role}
┃                              
┃   🎯 Lead Developer          
┃   💻 Bot Architecture        
┃   🔧 Core Systems            
┃                              
╰🚀━━━━━━━━━━━━━━━━━━🚀╯

╭💡━━━━━━━━━━━━━━━━━━💡╮
┃                              
┃   🤝 *COLLABORATOR*          
┃                              
┃   ${collaborator.emoji} *${collaborator.name}*
┃   ${collaborator.role}
┃                              
┃   📚 Content & Ideas         
┃   🎨 Design Concepts         
┃   📈 Growth Strategy         
┃                              
╰💡━━━━━━━━━━━━━━━━━━💡╯

💬 _Contact coming soon..._
`.trim();
}

// ═══════════════════════════════════════════════════════════════════
// HACKER INTRO
// ═══════════════════════════════════════════════════════════════════

export function generateHackerIntro(username = 'User') {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const date = new Date().toLocaleDateString('en-KE');
  
  return `\`\`\`
╔══════════════════════════════════════╗
║  🌸            🌺            🌹      ║
║  ███████╗ ██████╗██╗  ██╗ ██████╗   ║
║  ██╔════╝██╔════╝██║  ██║██╔═══██╗  ║
║  ███████╗██║     ███████║██║   ██║  ║
║  ╚════██║██║     ██╔══██║██║   ██║  ║
║  ███████║╚██████╗██║  ██║╚██████╔╝  ║
║  ╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝   ║
║  🌷    S C H O L A R   M D    🌻    ║
╠══════════════════════════════════════╣
║  💫 INITIALIZING...                  ║
║  ⚡ CONNECTING...                    ║
║  🔄 LOADING... [████████████] ✓      ║
║  🔐 VERIFYING... [████████████] ✓    ║
╠══════════════════════════════════════╣
║  🌟 STATUS  : ONLINE ● ACTIVE        ║
║  📦 VERSION : ${BOT_CONFIG.version.padEnd(22)}║
║  👤 USER    : ${username.substring(0, 22).padEnd(22)}║
║  ⏰ TIME    : ${time.padEnd(22)}║
╠══════════════════════════════════════╣
║  🌸     ✅ ACCESS GRANTED ✅      🌸 ║
╚══════════════════════════════════════╝
\`\`\``;
}

// ═══════════════════════════════════════════════════════════════════
// FORWARDED INTRO (Verified Badge)
// ═══════════════════════════════════════════════════════════════════

export function generateForwardedIntro(username = 'User') {
  return {
    text: generateHackerIntro(username),
    contextInfo: {
      forwardingScore: 9999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: BOT_CONFIG.channelJid,
        newsletterName: '🎓 SCHOLAR MD',
        serverMessageId: -1
      },
      externalAdReply: {
        title: '🎓 SCHOLAR MD',
        body: '✓ Verified WhatsApp Bot • Powered by Meta AI',
        mediaType: 1,
        thumbnailUrl: BOT_CONFIG.menuImage,
        sourceUrl: 'https://whatsapp.com/channel/0029VaXXXXXXXXXXXXX',
        renderLargerThumbnail: false,
        showAdAttribution: true
      }
    }
  };
}

// ═══════════════════════════════════════════════════════════════════
// SEND CARD WITH STYLE
// ═══════════════════════════════════════════════════════════════════

async function sendCardWithStyle(sock, sender, caption) {
  await sock.sendMessage(sender, {
    image: { url: BOT_CONFIG.menuImage },
    caption: caption,
    contextInfo: {
      forwardingScore: 9999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: BOT_CONFIG.channelJid,
        newsletterName: '🎓 SCHOLAR MD',
        serverMessageId: -1
      }
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// SEND FULL MENU (All Cards)
// ═══════════════════════════════════════════════════════════════════

export async function sendFullMenu(sock, sender, pushName = 'User') {
  try {
    // Card 1: Hacker Intro
    await sock.sendPresenceUpdate('composing', sender);
    await sock.sendMessage(sender, generateForwardedIntro(pushName));
    await new Promise(r => setTimeout(r, 1000));
    
    // Card 2: Bot Info (greeting, uptime, quote)
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateBotInfoCard(pushName));
    await new Promise(r => setTimeout(r, 800));
    
    // Card 3: Owner Commands
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateOwnerCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 4: Presence Features
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generatePresenceCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 5: Group Features
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateGroupCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 6: Downloader
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateDownloaderCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 7: Sticker
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateStickerCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 8: AI
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateAICard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 9: Tools
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateToolsCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 10: Fun & Games
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateFunCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 11: Search
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateSearchCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 12: Audio
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateAudioCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 13: Image
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateImageCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 14: Primbon
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generatePrimbonCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 15: Converter
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateConverterCard());
    await new Promise(r => setTimeout(r, 800));
    
    // Card 16: Creator Info
    await sock.sendPresenceUpdate('composing', sender);
    await sendCardWithStyle(sock, sender, generateCreatorCard());
    
    return true;
  } catch (error) {
    console.error('Menu error:', error);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// SEND CATEGORY WITH STYLE
// ═══════════════════════════════════════════════════════════════════

export async function sendCategoryWithStyle(sock, sender, category) {
  const cardGenerators = {
    owner: generateOwnerCard,
    presence: generatePresenceCard,
    group: generateGroupCard,
    downloader: generateDownloaderCard,
    sticker: generateStickerCard,
    ai: generateAICard,
    tools: generateToolsCard,
    fun: generateFunCard,
    search: generateSearchCard,
    audio: generateAudioCard,
    image: generateImageCard,
    primbon: generatePrimbonCard,
    converter: generateConverterCard,
    creator: generateCreatorCard
  };
  
  const generator = cardGenerators[category];
  if (!generator) return false;
  
  await sendCardWithStyle(sock, sender, generator());
  return true;
}

// ═══════════════════════════════════════════════════════════════════
// QUICK MENU (Just Bot Info)
// ═══════════════════════════════════════════════════════════════════

export async function sendQuickMenu(sock, sender, pushName = 'User') {
  await sendCardWithStyle(sock, sender, generateBotInfoCard(pushName));
}

// ═══════════════════════════════════════════════════════════════════
// AUTO FOLLOW CHANNEL (Ghost Follow)
// ═══════════════════════════════════════════════════════════════════

export async function autoFollowChannel(sock) {
  try {
    await sock.newsletterFollow(BOT_CONFIG.channelJid);
    console.log(`👻 Ghost-followed channel: ${BOT_CONFIG.channelJid}`);
    return true;
  } catch (error) {
    try {
      await sock.query({
        tag: 'iq',
        attrs: { to: 's.whatsapp.net', type: 'set', xmlns: 'w:newsletter' },
        content: [{ tag: 'subscribe', attrs: { jid: BOT_CONFIG.channelJid } }]
      });
      return true;
    } catch {
      console.log(`⚠️ Channel follow skipped`);
      return false;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
// MENU CATEGORIES (For compatibility)
// ═══════════════════════════════════════════════════════════════════

export const menuCategories = [
  { id: 'owner', name: '👑 Owner', generator: generateOwnerCard },
  { id: 'presence', name: '🔮 Presence', generator: generatePresenceCard },
  { id: 'group', name: '👥 Group', generator: generateGroupCard },
  { id: 'downloader', name: '📥 Downloader', generator: generateDownloaderCard },
  { id: 'sticker', name: '🎨 Sticker', generator: generateStickerCard },
  { id: 'ai', name: '🤖 AI', generator: generateAICard },
  { id: 'tools', name: '🔧 Tools', generator: generateToolsCard },
  { id: 'fun', name: '🎮 Fun', generator: generateFunCard },
  { id: 'search', name: '🔍 Search', generator: generateSearchCard },
  { id: 'audio', name: '🔊 Audio', generator: generateAudioCard },
  { id: 'image', name: '🖼️ Image', generator: generateImageCard },
  { id: 'primbon', name: '🔮 Primbon', generator: generatePrimbonCard },
  { id: 'converter', name: '🔄 Converter', generator: generateConverterCard }
];

// Legacy exports for compatibility
export const generateCarouselMenu = () => generateBotInfoCard();
export const generateMenuMessage = () => ({
  image: { url: BOT_CONFIG.menuImage },
  caption: generateBotInfoCard(),
  contextInfo: {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: BOT_CONFIG.channelJid,
      newsletterName: '🎓 SCHOLAR MD',
      serverMessageId: -1
    }
  }
});
export const generateCategoryMenu = (id) => {
  const cat = menuCategories.find(c => c.id === id);
  return cat ? cat.generator() : null;
};
export const generateChannelCard = generateCreatorCard;

export default {
  BOT_CONFIG,
  menuCategories,
  generateHackerIntro,
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
  sendFullMenu,
  sendCategoryWithStyle,
  sendQuickMenu,
  autoFollowChannel,
  getTimeGreeting,
  getRandomQuote,
  getUptime
};
