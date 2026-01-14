/**
 * Scholar MD - Fun Commands Plugin
 * Jokes, quotes, memes & entertainment
 */

export const category = {
  name: 'Fun',
  emoji: '🎭',
  description: 'Jokes, quotes, memes & entertainment'
};

export const commands = {
  joke: {
    description: 'Get a random joke',
    usage: '.joke',
    execute: async (sock, msg, args) => {
      const jokes = [
        "Why don't scientists trust atoms? Because they make up everything!",
        "I told my wife she was drawing her eyebrows too high. She looked surprised.",
        "Why did the scarecrow win an award? He was outstanding in his field!",
        "I'm reading a book about anti-gravity. It's impossible to put down!",
        "Why don't eggs tell jokes? They'd crack each other up!",
        "What do you call a fake noodle? An impasta!",
        "Why did the bicycle fall over? Because it was two-tired!",
        "What do you call a bear with no teeth? A gummy bear!",
        "Why did the coffee file a police report? It got mugged!",
        "What do you call a sleeping dinosaur? A dino-snore!"
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return `😂 *Random Joke*\n\n${joke}`;
    }
  },

  dadjoke: {
    description: 'Get a dad joke',
    usage: '.dadjoke',
    execute: async (sock, msg, args) => {
      const jokes = [
        "I'm afraid for the calendar. Its days are numbered.",
        "My wife said I should do lunges to stay in shape. That would be a big step forward.",
        "Why do fathers take an extra pair of socks when they go golfing? In case they get a hole in one!",
        "I used to hate facial hair, but then it grew on me.",
        "What do you call a fish without eyes? A fsh!",
        "I only know 25 letters of the alphabet. I don't know y.",
        "What did the ocean say to the beach? Nothing, it just waved.",
        "Why couldn't the bicycle stand up by itself? It was two tired!"
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return `👨 *Dad Joke*\n\n${joke}`;
    }
  },

  quote: {
    description: 'Get an inspirational quote',
    usage: '.quote',
    execute: async (sock, msg, args) => {
      const quotes = [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
        { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
        { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
        { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
        { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
      ];
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      return `💭 *Quote of the Day*\n\n_"${quote.text}"_\n\n— ${quote.author}`;
    }
  },

  fact: {
    description: 'Get a random fact',
    usage: '.fact',
    execute: async (sock, msg, args) => {
      const facts = [
        "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!",
        "Octopuses have three hearts and blue blood.",
        "A day on Venus is longer than a year on Venus.",
        "Bananas are berries, but strawberries aren't.",
        "The shortest war in history lasted 38-45 minutes between Britain and Zanzibar.",
        "A group of flamingos is called a 'flamboyance'.",
        "The inventor of the Pringles can is buried in one.",
        "Cows have best friends and get stressed when separated.",
        "There are more possible iterations of a game of chess than atoms in the observable universe.",
        "A jiffy is an actual unit of time: 1/100th of a second."
      ];
      const fact = facts[Math.floor(Math.random() * facts.length)];
      return `🧠 *Random Fact*\n\n${fact}`;
    }
  },

  meme: {
    description: 'Get a random meme',
    usage: '.meme',
    execute: async (sock, msg, args) => {
      // Returns meme image URL - actual implementation would fetch from API
      return { type: 'image', url: 'https://api.example.com/meme', caption: '😂 Random Meme' };
    }
  },

  pickup: {
    description: 'Get a pickup line',
    usage: '.pickup',
    execute: async (sock, msg, args) => {
      const lines = [
        "Are you a magician? Because whenever I look at you, everyone else disappears.",
        "Do you have a map? Because I just got lost in your eyes.",
        "Are you a parking ticket? Because you've got 'fine' written all over you.",
        "Is your name Google? Because you have everything I've been searching for.",
        "Are you a bank loan? Because you've got my interest.",
        "Do you believe in love at first sight, or should I walk by again?",
        "If you were a vegetable, you'd be a cute-cumber.",
        "Are you a wifi signal? Because I'm feeling a connection."
      ];
      const line = lines[Math.floor(Math.random() * lines.length)];
      return `💕 *Pickup Line*\n\n${line}`;
    }
  },

  insult: {
    description: 'Get a funny insult',
    usage: '.insult [@user]',
    execute: async (sock, msg, args) => {
      const insults = [
        "You're not stupid; you just have bad luck thinking.",
        "I'd agree with you but then we'd both be wrong.",
        "You're like a cloud. When you disappear, it's a beautiful day.",
        "I'm not saying I hate you, but I would unplug your life support to charge my phone.",
        "You're proof that evolution can go in reverse.",
        "If I wanted to hear from someone like you, I'd watch a nature documentary about sloths.",
        "You're not completely useless. You can always serve as a bad example.",
        "I'd explain it to you, but I left my crayons at home."
      ];
      const insult = insults[Math.floor(Math.random() * insults.length)];
      const target = msg.mentionedJid?.[0] ? `@${msg.mentionedJid[0].split('@')[0]}` : 'You';
      return `🔥 ${target}, ${insult.toLowerCase()}`;
    }
  },

  compliment: {
    description: 'Get a compliment',
    usage: '.compliment [@user]',
    execute: async (sock, msg, args) => {
      const compliments = [
        "You're more fun than bubble wrap!",
        "You're like sunshine on a rainy day.",
        "You have the best laugh!",
        "You're someone's reason to smile.",
        "You bring out the best in other people.",
        "Your perspective is refreshing.",
        "You're more helpful than you realize.",
        "You've got a great sense of humor!"
      ];
      const compliment = compliments[Math.floor(Math.random() * compliments.length)];
      const target = msg.mentionedJid?.[0] ? `@${msg.mentionedJid[0].split('@')[0]}` : 'You';
      return `✨ ${target}, ${compliment.toLowerCase()}`;
    }
  },

  advice: {
    description: 'Get random advice',
    usage: '.advice',
    execute: async (sock, msg, args) => {
      const advices = [
        "Don't compare your chapter 1 to someone else's chapter 20.",
        "Take a break when you need it. Rest is productive.",
        "The best time to start was yesterday. The second best time is now.",
        "Learn to say no without explaining yourself.",
        "Your mental health is more important than your career.",
        "Not everyone will understand your journey, and that's okay.",
        "Drink more water. Seriously.",
        "It's okay to not be okay sometimes."
      ];
      const advice = advices[Math.floor(Math.random() * advices.length)];
      return `💡 *Random Advice*\n\n${advice}`;
    }
  },

  riddle: {
    description: 'Get a riddle',
    usage: '.riddle',
    execute: async (sock, msg, args) => {
      const riddles = [
        { q: "What has keys but no locks?", a: "A piano" },
        { q: "What can travel around the world while staying in a corner?", a: "A stamp" },
        { q: "What has hands but can't clap?", a: "A clock" },
        { q: "What has a head and a tail but no body?", a: "A coin" },
        { q: "What gets wetter the more it dries?", a: "A towel" },
        { q: "What can you catch but not throw?", a: "A cold" },
        { q: "What has many teeth but can't bite?", a: "A comb" },
        { q: "What can fill a room but takes up no space?", a: "Light" }
      ];
      const riddle = riddles[Math.floor(Math.random() * riddles.length)];
      return `🧩 *Riddle*\n\n${riddle.q}\n\n_Reply with .answer to see the answer!_\n\n||${riddle.a}||`;
    }
  },

  lyrics: {
    description: 'Search for song lyrics',
    usage: '.lyrics <song name>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a song name!\nUsage: .lyrics Shape of You');
      const query = args.join(' ');
      // Actual implementation would search lyrics API
      return `🎵 *Searching lyrics for:* ${query}\n\n_Fetching from lyrics database..._`;
    }
  },

  anime: {
    description: 'Get random anime info',
    usage: '.anime [name]',
    execute: async (sock, msg, args) => {
      // Actual implementation would fetch from anime API
      return { type: 'image', caption: '🎌 *Random Anime*\n\n_Fetching anime info..._' };
    }
  },

  waifu: {
    description: 'Get a waifu image',
    usage: '.waifu',
    execute: async (sock, msg, args) => {
      return { type: 'image', url: 'https://api.waifu.pics/sfw/waifu', caption: '💕 *Waifu*' };
    }
  },

  neko: {
    description: 'Get a neko image',
    usage: '.neko',
    execute: async (sock, msg, args) => {
      return { type: 'image', url: 'https://api.waifu.pics/sfw/neko', caption: '🐱 *Neko*' };
    }
  },

  hug: {
    description: 'Hug someone',
    usage: '.hug @user',
    execute: async (sock, msg, args) => {
      if (!msg.mentionedJid?.length) throw new Error('Tag someone to hug!');
      const target = msg.mentionedJid[0].split('@')[0];
      return { type: 'image', url: 'https://api.waifu.pics/sfw/hug', caption: `🤗 *@${msg.sender.split('@')[0]} hugs @${target}*`, mentions: msg.mentionedJid };
    }
  },

  slap: {
    description: 'Slap someone',
    usage: '.slap @user',
    execute: async (sock, msg, args) => {
      if (!msg.mentionedJid?.length) throw new Error('Tag someone to slap!');
      const target = msg.mentionedJid[0].split('@')[0];
      return { type: 'image', url: 'https://api.waifu.pics/sfw/slap', caption: `👋 *@${msg.sender.split('@')[0]} slaps @${target}*`, mentions: msg.mentionedJid };
    }
  },

  pat: {
    description: 'Pat someone',
    usage: '.pat @user',
    execute: async (sock, msg, args) => {
      if (!msg.mentionedJid?.length) throw new Error('Tag someone to pat!');
      const target = msg.mentionedJid[0].split('@')[0];
      return { type: 'image', url: 'https://api.waifu.pics/sfw/pat', caption: `🥰 *@${msg.sender.split('@')[0]} pats @${target}*`, mentions: msg.mentionedJid };
    }
  },

  kiss: {
    description: 'Kiss someone',
    usage: '.kiss @user',
    execute: async (sock, msg, args) => {
      if (!msg.mentionedJid?.length) throw new Error('Tag someone to kiss!');
      const target = msg.mentionedJid[0].split('@')[0];
      return { type: 'image', url: 'https://api.waifu.pics/sfw/kiss', caption: `💋 *@${msg.sender.split('@')[0]} kisses @${target}*`, mentions: msg.mentionedJid };
    }
  },

  punch: {
    description: 'Punch someone',
    usage: '.punch @user',
    execute: async (sock, msg, args) => {
      if (!msg.mentionedJid?.length) throw new Error('Tag someone to punch!');
      const target = msg.mentionedJid[0].split('@')[0];
      return { type: 'image', url: 'https://api.waifu.pics/sfw/punch', caption: `👊 *@${msg.sender.split('@')[0]} punches @${target}*`, mentions: msg.mentionedJid };
    }
  },

  cuddle: {
    description: 'Cuddle someone',
    usage: '.cuddle @user',
    execute: async (sock, msg, args) => {
      if (!msg.mentionedJid?.length) throw new Error('Tag someone to cuddle!');
      const target = msg.mentionedJid[0].split('@')[0];
      return { type: 'image', url: 'https://api.waifu.pics/sfw/cuddle', caption: `🥰 *@${msg.sender.split('@')[0]} cuddles @${target}*`, mentions: msg.mentionedJid };
    }
  },

  bonk: {
    description: 'Bonk someone',
    usage: '.bonk @user',
    execute: async (sock, msg, args) => {
      if (!msg.mentionedJid?.length) throw new Error('Tag someone to bonk!');
      const target = msg.mentionedJid[0].split('@')[0];
      return { type: 'image', url: 'https://api.waifu.pics/sfw/bonk', caption: `🔨 *@${msg.sender.split('@')[0]} bonks @${target}*`, mentions: msg.mentionedJid };
    }
  },

  cry: {
    description: 'Cry reaction',
    usage: '.cry',
    execute: async (sock, msg, args) => {
      return { type: 'image', url: 'https://api.waifu.pics/sfw/cry', caption: '😢 *Crying...*' };
    }
  },

  dance: {
    description: 'Dance reaction',
    usage: '.dance',
    execute: async (sock, msg, args) => {
      return { type: 'image', url: 'https://api.waifu.pics/sfw/dance', caption: '💃 *Dancing!*' };
    }
  },

  happy: {
    description: 'Happy reaction',
    usage: '.happy',
    execute: async (sock, msg, args) => {
      return { type: 'image', url: 'https://api.waifu.pics/sfw/happy', caption: '😊 *Happy!*' };
    }
  }
};

export default { category, commands };
