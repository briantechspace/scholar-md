/**
 * Scholar MD - Search Commands Plugin
 * Search Google, YouTube, images & more
 */

export const category = {
  name: 'Search',
  emoji: '🔍',
  description: 'Search Google, YouTube, images & more'
};

export const commands = {
  google: {
    description: 'Search Google',
    usage: '.google <query>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .google what is AI');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `🔍 *Google Search Results*\n\n` +
             `📝 Query: ${query}\n` +
             `🔗 Link: https://www.google.com/search?q=${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  },

  youtube: {
    description: 'Search YouTube',
    usage: '.youtube <query>',
    aliases: ['yt'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .youtube music video');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `📺 *YouTube Search*\n\n` +
             `📝 Query: ${query}\n` +
             `🔗 Link: https://www.youtube.com/results?search_query=${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  },

  image: {
    description: 'Search for images',
    usage: '.image <query>',
    aliases: ['img', 'gimage'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .image cats');
      const query = args.join(' ');
      // Actual implementation would search image API
      return { type: 'image', caption: `🖼️ *Image Search*\n\nQuery: ${query}` };
    }
  },

  gif: {
    description: 'Search for GIFs',
    usage: '.gif <query>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .gif dancing');
      const query = args.join(' ');
      // Actual implementation would search GIPHY API
      return { type: 'video', caption: `🎬 *GIF Search*\n\nQuery: ${query}` };
    }
  },

  playstore: {
    description: 'Search Play Store',
    usage: '.playstore <app name>',
    aliases: ['ps', 'gplay'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide an app name!\nUsage: .playstore WhatsApp');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `📱 *Play Store Search*\n\n` +
             `📝 App: ${query}\n` +
             `🔗 Link: https://play.google.com/store/search?q=${encodedQuery}&c=apps\n\n` +
             `_Click the link to view results_`;
    }
  },

  github: {
    description: 'Search GitHub',
    usage: '.github <query>',
    aliases: ['gh'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .github whatsapp bot');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `🐙 *GitHub Search*\n\n` +
             `📝 Query: ${query}\n` +
             `🔗 Link: https://github.com/search?q=${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  },

  npm: {
    description: 'Search NPM packages',
    usage: '.npm <package>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a package name!\nUsage: .npm axios');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `📦 *NPM Search*\n\n` +
             `📝 Package: ${query}\n` +
             `🔗 Link: https://www.npmjs.com/search?q=${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  },

  imdb: {
    description: 'Search IMDB',
    usage: '.imdb <movie/show>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a movie/show name!\nUsage: .imdb Inception');
      const query = args.join(' ');
      // Actual implementation would fetch from OMDB API
      return `🎬 *IMDB Search*\n\n` +
             `📝 Title: ${query}\n\n` +
             `_Searching IMDB database..._`;
    }
  },

  movie: {
    description: 'Get movie information',
    usage: '.movie <title>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a movie title!\nUsage: .movie The Dark Knight');
      const query = args.join(' ');
      // Actual implementation would fetch from movie API
      return `🎥 *Movie Info*\n\n` +
             `📝 Title: ${query}\n\n` +
             `_Fetching movie details..._`;
    }
  },

  manga: {
    description: 'Search for manga',
    usage: '.manga <title>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a manga title!\nUsage: .manga One Piece');
      const query = args.join(' ');
      // Actual implementation would search manga API
      return `📚 *Manga Search*\n\n` +
             `📝 Title: ${query}\n\n` +
             `_Searching manga database..._`;
    }
  },

  recipe: {
    description: 'Search for recipes',
    usage: '.recipe <food>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a food name!\nUsage: .recipe pizza');
      const query = args.join(' ');
      // Actual implementation would search recipe API
      return `🍳 *Recipe Search*\n\n` +
             `📝 Dish: ${query}\n\n` +
             `_Searching recipes..._`;
    }
  },

  news: {
    description: 'Get latest news',
    usage: '.news [topic]',
    execute: async (sock, msg, args) => {
      const topic = args.length ? args.join(' ') : 'top headlines';
      // Actual implementation would fetch from news API
      return `📰 *Latest News*\n\n` +
             `📝 Topic: ${topic}\n\n` +
             `_Fetching news articles..._`;
    }
  },

  wallpaper: {
    description: 'Search wallpapers',
    usage: '.wallpaper <query>',
    aliases: ['wall'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .wallpaper nature');
      const query = args.join(' ');
      // Actual implementation would search wallpaper API
      return { type: 'image', caption: `🖼️ *Wallpaper*\n\nQuery: ${query}` };
    }
  },

  pinterest: {
    description: 'Search Pinterest',
    usage: '.pinterest <query>',
    aliases: ['pin'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .pinterest aesthetic');
      const query = args.join(' ');
      // Actual implementation would search Pinterest API
      return { type: 'image', caption: `📌 *Pinterest*\n\nQuery: ${query}` };
    }
  },

  spotify: {
    description: 'Search Spotify',
    usage: '.spotify <song/artist>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .spotify Shape of You');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `🎵 *Spotify Search*\n\n` +
             `📝 Query: ${query}\n` +
             `🔗 Link: https://open.spotify.com/search/${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  },

  soundcloud: {
    description: 'Search SoundCloud',
    usage: '.soundcloud <query>',
    aliases: ['sc'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .soundcloud lofi');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `🔊 *SoundCloud Search*\n\n` +
             `📝 Query: ${query}\n` +
             `🔗 Link: https://soundcloud.com/search?q=${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  },

  reddit: {
    description: 'Search Reddit',
    usage: '.reddit <query>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .reddit programming memes');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `🔴 *Reddit Search*\n\n` +
             `📝 Query: ${query}\n` +
             `🔗 Link: https://www.reddit.com/search/?q=${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  },

  twitter: {
    description: 'Search Twitter/X',
    usage: '.twitter <query>',
    aliases: ['x'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .twitter trending');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `🐦 *Twitter/X Search*\n\n` +
             `📝 Query: ${query}\n` +
             `🔗 Link: https://twitter.com/search?q=${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  },

  tiktoksearch: {
    description: 'Search TikTok',
    usage: '.tiktoksearch <query>',
    aliases: ['ttsearch'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .tiktoksearch dance');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `🎵 *TikTok Search*\n\n` +
             `📝 Query: ${query}\n` +
             `🔗 Link: https://www.tiktok.com/search?q=${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  },

  stackoverflow: {
    description: 'Search Stack Overflow',
    usage: '.stackoverflow <query>',
    aliases: ['so', 'stack'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .stackoverflow javascript array');
      const query = args.join(' ');
      const encodedQuery = encodeURIComponent(query);
      return `💻 *Stack Overflow Search*\n\n` +
             `📝 Query: ${query}\n` +
             `🔗 Link: https://stackoverflow.com/search?q=${encodedQuery}\n\n` +
             `_Click the link to view results_`;
    }
  }
};

export default { category, commands };
