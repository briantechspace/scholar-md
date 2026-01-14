/**
 * Scholar MD - Bot Configuration
 * Centralized configuration management
 */

export default {
  // Bot Information
  bot: {
    name: 'Scholar MD',
    version: '2.0.0',
    prefix: '.',
    owner: ['254700000000@s.whatsapp.net'], // Add your number
    support: 'https://wa.me/254700000000',
    website: 'https://scholarmd.com'
  },

  // Features Toggle
  features: {
    autoRead: true,
    autoTyping: true,
    antiCall: true,
    antiSpam: true,
    welcomeMessage: true,
    levelSystem: true,
    economy: true,
    games: true,
    premium: true
  },

  // Limits
  limits: {
    daily: {
      free: 50,
      premium: 500
    },
    download: {
      maxSize: 100, // MB
      maxDuration: 600 // seconds
    },
    group: {
      maxWarn: 3
    }
  },

  // Messages
  messages: {
    wait: '⏳ _Processing your request..._',
    error: '❌ _An error occurred. Please try again._',
    success: '✅ _Success!_',
    premium: '⭐ _This is a premium feature._',
    owner: '🚫 _This command is owner only._',
    group: '👥 _This command can only be used in groups._',
    private: '📱 _This command can only be used in private chat._',
    admin: '🛡️ _This command requires admin privileges._',
    botAdmin: '🤖 _I need to be admin to do this._',
    banned: '🚫 _You are banned from using this bot._',
    maintenance: '🔧 _Bot is under maintenance. Please try again later._'
  },

  // API Keys (Add your own)
  apis: {
    openai: process.env.OPENAI_API_KEY || '',
    gemini: process.env.GEMINI_API_KEY || '',
    removebg: process.env.REMOVEBG_API_KEY || '',
    weather: process.env.WEATHER_API_KEY || '',
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID || '',
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ''
    },
    mpesa: {
      consumerKey: process.env.MPESA_CONSUMER_KEY || '',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
      shortCode: process.env.MPESA_SHORTCODE || '',
      passKey: process.env.MPESA_PASSKEY || ''
    }
  },

  // Premium Plans
  premium: {
    plans: [
      { id: 'daily', name: 'Daily', days: 1, price: 20 },
      { id: 'weekly', name: 'Weekly', days: 7, price: 100 },
      { id: 'monthly', name: 'Monthly', days: 30, price: 300 },
      { id: 'yearly', name: 'Yearly', days: 365, price: 2500 }
    ],
    features: [
      'Unlimited downloads',
      'AI without limits',
      'Priority support',
      'Exclusive commands',
      'No ads',
      'Custom stickers'
    ]
  },

  // Cooldowns (in seconds)
  cooldowns: {
    default: 5,
    ai: 10,
    download: 15,
    game: 30,
    daily: 86400, // 24 hours
    weekly: 604800, // 7 days
    monthly: 2592000 // 30 days
  },

  // Categories
  categories: {
    downloader: { emoji: '📥', name: 'Downloader' },
    sticker: { emoji: '🎨', name: 'Sticker' },
    ai: { emoji: '🤖', name: 'AI' },
    games: { emoji: '🎮', name: 'Games' },
    tools: { emoji: '🔧', name: 'Tools' },
    group: { emoji: '👥', name: 'Group' },
    fun: { emoji: '🎭', name: 'Fun' },
    search: { emoji: '🔍', name: 'Search' },
    image: { emoji: '🖼️', name: 'Image' },
    audio: { emoji: '🔊', name: 'Audio' },
    primbon: { emoji: '🔮', name: 'Primbon' },
    owner: { emoji: '👑', name: 'Owner' }
  },

  // Logging
  logging: {
    enabled: true,
    level: 'info', // debug, info, warn, error
    file: true,
    console: true
  }
};
