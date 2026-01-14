/**
 * Scholar MD - Primbon Commands Plugin
 * Fortune telling, zodiac & horoscope
 */

export const category = {
  name: 'Primbon',
  emoji: '🔮',
  description: 'Fortune telling, zodiac & horoscope'
};

const zodiacData = {
  aries: { symbol: '♈', dates: 'Mar 21 - Apr 19', element: 'Fire' },
  taurus: { symbol: '♉', dates: 'Apr 20 - May 20', element: 'Earth' },
  gemini: { symbol: '♊', dates: 'May 21 - Jun 20', element: 'Air' },
  cancer: { symbol: '♋', dates: 'Jun 21 - Jul 22', element: 'Water' },
  leo: { symbol: '♌', dates: 'Jul 23 - Aug 22', element: 'Fire' },
  virgo: { symbol: '♍', dates: 'Aug 23 - Sep 22', element: 'Earth' },
  libra: { symbol: '♎', dates: 'Sep 23 - Oct 22', element: 'Air' },
  scorpio: { symbol: '♏', dates: 'Oct 23 - Nov 21', element: 'Water' },
  sagittarius: { symbol: '♐', dates: 'Nov 22 - Dec 21', element: 'Fire' },
  capricorn: { symbol: '♑', dates: 'Dec 22 - Jan 19', element: 'Earth' },
  aquarius: { symbol: '♒', dates: 'Jan 20 - Feb 18', element: 'Air' },
  pisces: { symbol: '♓', dates: 'Feb 19 - Mar 20', element: 'Water' }
};

const chineseZodiac = {
  rat: { years: [2020, 2008, 1996, 1984, 1972], traits: 'Quick-witted, resourceful, kind' },
  ox: { years: [2021, 2009, 1997, 1985, 1973], traits: 'Diligent, dependable, strong' },
  tiger: { years: [2022, 2010, 1998, 1986, 1974], traits: 'Brave, confident, competitive' },
  rabbit: { years: [2023, 2011, 1999, 1987, 1975], traits: 'Gentle, elegant, responsible' },
  dragon: { years: [2024, 2012, 2000, 1988, 1976], traits: 'Confident, intelligent, enthusiastic' },
  snake: { years: [2025, 2013, 2001, 1989, 1977], traits: 'Enigmatic, intelligent, wise' },
  horse: { years: [2026, 2014, 2002, 1990, 1978], traits: 'Animated, active, energetic' },
  goat: { years: [2027, 2015, 2003, 1991, 1979], traits: 'Calm, gentle, sympathetic' },
  monkey: { years: [2028, 2016, 2004, 1992, 1980], traits: 'Sharp, smart, curiosity' },
  rooster: { years: [2029, 2017, 2005, 1993, 1981], traits: 'Observant, hardworking, confident' },
  dog: { years: [2030, 2018, 2006, 1994, 1982], traits: 'Loyal, honest, faithful' },
  pig: { years: [2031, 2019, 2007, 1995, 1983], traits: 'Compassionate, generous, diligent' }
};

export const commands = {
  zodiac: {
    description: 'Get zodiac sign info',
    usage: '.zodiac <sign>',
    execute: async (sock, msg, args) => {
      if (!args.length) {
        const signs = Object.keys(zodiacData).map(s => `${zodiacData[s].symbol} ${s}`).join('\n');
        return `🔮 *Available Zodiac Signs*\n\n${signs}\n\n_Usage: .zodiac aries_`;
      }
      const sign = args[0].toLowerCase();
      const data = zodiacData[sign];
      if (!data) throw new Error(`Unknown zodiac sign! Try: ${Object.keys(zodiacData).join(', ')}`);
      
      const fortunes = [
        'Great opportunities await you today!',
        'Focus on your relationships and connections.',
        'Financial success is on the horizon.',
        'Take time for self-care and reflection.',
        'A surprise awaits you this week!'
      ];
      
      return `${data.symbol} *${sign.toUpperCase()}*\n\n` +
             `📅 *Dates:* ${data.dates}\n` +
             `🌍 *Element:* ${data.element}\n` +
             `🔮 *Today:* ${fortunes[Math.floor(Math.random() * fortunes.length)]}\n\n` +
             `⭐ *Lucky Numbers:* ${Math.floor(Math.random() * 50) + 1}, ${Math.floor(Math.random() * 50) + 1}, ${Math.floor(Math.random() * 50) + 1}`;
    }
  },

  horoscope: {
    description: 'Get daily horoscope',
    usage: '.horoscope <sign>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide your zodiac sign!\nUsage: .horoscope leo');
      const sign = args[0].toLowerCase();
      if (!zodiacData[sign]) throw new Error(`Unknown zodiac sign! Try: ${Object.keys(zodiacData).join(', ')}`);
      
      const readings = [
        'The stars align in your favor today. Take bold steps toward your goals.',
        'Love is in the air. Pay attention to those around you.',
        'Career opportunities are knocking at your door. Be ready to seize them.',
        'Take care of your health. A walk in nature would do you good.',
        'Financial matters require your attention. Be wise with your decisions.',
        'Communication is key today. Express your feelings openly.',
        'Trust your intuition. It will guide you in the right direction.',
        'A pleasant surprise awaits you. Stay positive and open-minded.'
      ];
      
      return `🌟 *Daily Horoscope - ${sign.toUpperCase()}*\n\n` +
             `${readings[Math.floor(Math.random() * readings.length)]}\n\n` +
             `💫 *Mood:* ${['Happy', 'Romantic', 'Productive', 'Calm', 'Energetic'][Math.floor(Math.random() * 5)]}\n` +
             `🍀 *Lucky Color:* ${['Red', 'Blue', 'Green', 'Purple', 'Gold', 'Silver'][Math.floor(Math.random() * 6)]}`;
    }
  },

  tarot: {
    description: 'Draw a tarot card',
    usage: '.tarot',
    execute: async (sock, msg, args) => {
      const cards = [
        { name: 'The Fool', meaning: 'New beginnings, innocence, spontaneity' },
        { name: 'The Magician', meaning: 'Manifestation, resourcefulness, power' },
        { name: 'The High Priestess', meaning: 'Intuition, sacred knowledge, mystery' },
        { name: 'The Empress', meaning: 'Femininity, beauty, nature, abundance' },
        { name: 'The Emperor', meaning: 'Authority, structure, fatherhood' },
        { name: 'The Hierophant', meaning: 'Spiritual wisdom, tradition, conformity' },
        { name: 'The Lovers', meaning: 'Love, harmony, relationships, choices' },
        { name: 'The Chariot', meaning: 'Control, willpower, success, determination' },
        { name: 'Strength', meaning: 'Courage, patience, inner strength' },
        { name: 'The Hermit', meaning: 'Soul-searching, introspection, inner guidance' },
        { name: 'Wheel of Fortune', meaning: 'Change, cycles, fate, destiny' },
        { name: 'Justice', meaning: 'Fairness, truth, law, cause and effect' },
        { name: 'The Hanged Man', meaning: 'Pause, surrender, letting go, new perspectives' },
        { name: 'Death', meaning: 'Endings, change, transformation, transition' },
        { name: 'Temperance', meaning: 'Balance, moderation, patience, purpose' },
        { name: 'The Devil', meaning: 'Shadow self, attachment, addiction, restriction' },
        { name: 'The Tower', meaning: 'Sudden change, upheaval, chaos, revelation' },
        { name: 'The Star', meaning: 'Hope, faith, purpose, renewal, spirituality' },
        { name: 'The Moon', meaning: 'Illusion, fear, anxiety, subconscious' },
        { name: 'The Sun', meaning: 'Positivity, fun, warmth, success, vitality' },
        { name: 'Judgement', meaning: 'Judgement, rebirth, inner calling, absolution' },
        { name: 'The World', meaning: 'Completion, accomplishment, travel, integration' }
      ];
      
      const card = cards[Math.floor(Math.random() * cards.length)];
      const reversed = Math.random() > 0.7;
      
      return `🃏 *Tarot Reading*\n\n` +
             `━━━━━━━━━━━━━━\n` +
             `🎴 *${card.name}* ${reversed ? '(Reversed)' : ''}\n` +
             `━━━━━━━━━━━━━━\n\n` +
             `📜 *Meaning:*\n${card.meaning}\n\n` +
             `${reversed ? '⚠️ _Reversed cards suggest the opposite or blocked energy_' : '✨ _This card appears upright, its energy flows freely_'}`;
    }
  },

  shio: {
    description: 'Get Chinese zodiac',
    usage: '.shio <year>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a birth year!\nUsage: .shio 1998');
      const year = parseInt(args[0]);
      if (isNaN(year) || year < 1900 || year > 2100) throw new Error('Invalid year!');
      
      const animals = ['rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake', 'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig'];
      const index = (year - 1900) % 12;
      const animal = animals[index];
      const data = chineseZodiac[animal];
      
      const emojis = { rat: '🐀', ox: '🐂', tiger: '🐅', rabbit: '🐇', dragon: '🐉', snake: '🐍', horse: '🐴', goat: '🐐', monkey: '🐒', rooster: '🐓', dog: '🐕', pig: '🐖' };
      
      return `${emojis[animal]} *Chinese Zodiac - ${animal.toUpperCase()}*\n\n` +
             `📅 *Year:* ${year}\n` +
             `✨ *Traits:* ${data.traits}\n` +
             `🎯 *Compatible Years:* ${data.years.slice(0, 3).join(', ')}`;
    }
  },

  artinama: {
    description: 'Get meaning of a name',
    usage: '.artinama <name>',
    aliases: ['namemeaning'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a name!\nUsage: .artinama John');
      const name = args.join(' ');
      
      const traits = [
        'creative and imaginative',
        'strong-willed and determined',
        'kind-hearted and generous',
        'intelligent and analytical',
        'charismatic and sociable',
        'calm and peaceful',
        'adventurous and bold',
        'loyal and trustworthy'
      ];
      
      const origins = ['Hebrew', 'Greek', 'Latin', 'Arabic', 'Sanskrit', 'Celtic', 'Germanic', 'African'];
      const meanings = [
        'God is gracious',
        'Warrior of light',
        'Noble and brave',
        'Gift of God',
        'Bearer of peace',
        'Protector of mankind',
        'Beloved one',
        'Wise counselor'
      ];
      
      return `📛 *Name Analysis: ${name}*\n\n` +
             `🌍 *Origin:* ${origins[Math.floor(Math.random() * origins.length)]}\n` +
             `📖 *Meaning:* ${meanings[Math.floor(Math.random() * meanings.length)]}\n` +
             `✨ *Personality:* You are ${traits[Math.floor(Math.random() * traits.length)]}\n` +
             `🔢 *Lucky Number:* ${Math.floor(Math.random() * 9) + 1}`;
    }
  },

  jodoh: {
    description: 'Love compatibility check',
    usage: '.jodoh <name1> & <name2>',
    aliases: ['love', 'lovetest', 'match'],
    execute: async (sock, msg, args) => {
      const text = args.join(' ');
      if (!text.includes('&')) throw new Error('Usage: .jodoh John & Jane');
      
      const [name1, name2] = text.split('&').map(n => n.trim());
      if (!name1 || !name2) throw new Error('Please provide two names separated by &');
      
      const percentage = Math.floor(Math.random() * 101);
      let message, hearts;
      
      if (percentage >= 90) {
        message = 'A match made in heaven! 💍';
        hearts = '❤️❤️❤️❤️❤️';
      } else if (percentage >= 70) {
        message = 'Great compatibility! Keep it up! 💕';
        hearts = '❤️❤️❤️❤️🤍';
      } else if (percentage >= 50) {
        message = 'Good potential, work on communication! 💗';
        hearts = '❤️❤️❤️🤍🤍';
      } else if (percentage >= 30) {
        message = 'There might be some challenges ahead. 💔';
        hearts = '❤️❤️🤍🤍🤍';
      } else {
        message = 'Better as friends maybe? 🤔';
        hearts = '❤️🤍🤍🤍🤍';
      }
      
      return `💕 *Love Compatibility*\n\n` +
             `👤 ${name1}\n` +
             `💘\n` +
             `👤 ${name2}\n\n` +
             `${hearts}\n` +
             `📊 *Compatibility:* ${percentage}%\n\n` +
             `${message}`;
    }
  },

  ramalan: {
    description: 'Get fortune prediction',
    usage: '.ramalan',
    aliases: ['fortune'],
    execute: async (sock, msg, args) => {
      const predictions = [
        'Great fortune awaits you this week. Be ready to receive blessings!',
        'A new opportunity will present itself. Don\'t be afraid to take risks.',
        'Love is coming your way. Keep your heart open to new possibilities.',
        'Financial stability is within reach. Stay focused on your goals.',
        'Health and happiness will be yours. Take care of your body and mind.',
        'An old friend will bring unexpected news. Stay connected with loved ones.',
        'Success in your career is imminent. Your hard work is about to pay off.',
        'Travel plans may be in your future. Adventure calls!',
        'A creative project will flourish. Trust your artistic instincts.',
        'Inner peace will find you. Take time for meditation and reflection.'
      ];
      
      const categories = [
        { cat: 'Love', rating: Math.floor(Math.random() * 5) + 1 },
        { cat: 'Career', rating: Math.floor(Math.random() * 5) + 1 },
        { cat: 'Health', rating: Math.floor(Math.random() * 5) + 1 },
        { cat: 'Finance', rating: Math.floor(Math.random() * 5) + 1 }
      ];
      
      const stars = (n) => '⭐'.repeat(n) + '☆'.repeat(5 - n);
      
      return `🔮 *Your Fortune Today*\n\n` +
             `${predictions[Math.floor(Math.random() * predictions.length)]}\n\n` +
             `━━━━━━━━━━━━━━\n` +
             categories.map(c => `${c.cat}: ${stars(c.rating)}`).join('\n') +
             `\n━━━━━━━━━━━━━━\n\n` +
             `🍀 *Lucky Time:* ${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`;
    }
  },

  mimpi: {
    description: 'Dream interpretation',
    usage: '.mimpi <dream description>',
    aliases: ['dream'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please describe your dream!\nUsage: .mimpi flying in the sky');
      
      const interpretations = [
        'This dream suggests new beginnings and fresh opportunities in your life.',
        'Your subconscious is telling you to let go of past burdens.',
        'This represents your desire for freedom and independence.',
        'The dream indicates you are processing deep emotions.',
        'A sign of upcoming positive changes in your personal life.',
        'Your mind is working through recent challenges.',
        'This dream symbolizes growth and personal development.',
        'It represents your hidden desires and aspirations.'
      ];
      
      return `💭 *Dream Interpretation*\n\n` +
             `🌙 *Your Dream:* ${args.join(' ')}\n\n` +
             `📖 *Interpretation:*\n${interpretations[Math.floor(Math.random() * interpretations.length)]}\n\n` +
             `🔢 *Lucky Numbers:* ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}`;
    }
  },

  numerology: {
    description: 'Get numerology reading',
    usage: '.numerology <birthdate>',
    aliases: ['num'],
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide your birthdate!\nUsage: .numerology 15-08-1998');
      
      const dateStr = args[0];
      const parts = dateStr.split(/[-/]/);
      if (parts.length !== 3) throw new Error('Format: DD-MM-YYYY');
      
      const sum = parts.join('').split('').reduce((a, b) => a + parseInt(b), 0);
      let lifePathNumber = sum;
      while (lifePathNumber > 9 && lifePathNumber !== 11 && lifePathNumber !== 22) {
        lifePathNumber = lifePathNumber.toString().split('').reduce((a, b) => a + parseInt(b), 0);
      }
      
      const meanings = {
        1: 'Leadership, independence, individuality',
        2: 'Cooperation, sensitivity, balance',
        3: 'Creativity, self-expression, communication',
        4: 'Stability, practicality, hard work',
        5: 'Freedom, adventure, change',
        6: 'Responsibility, nurturing, harmony',
        7: 'Spirituality, introspection, wisdom',
        8: 'Power, success, material abundance',
        9: 'Humanitarianism, compassion, completion',
        11: 'Master Number - Intuition, spiritual insight',
        22: 'Master Number - Master builder, large-scale achievements'
      };
      
      return `🔢 *Numerology Reading*\n\n` +
             `📅 *Birthdate:* ${dateStr}\n` +
             `🌟 *Life Path Number:* ${lifePathNumber}\n\n` +
             `📖 *Meaning:*\n${meanings[lifePathNumber] || meanings[lifePathNumber % 9 || 9]}\n\n` +
             `✨ *Your number reveals your life purpose and natural talents*`;
    }
  },

  fengshui: {
    description: 'Get feng shui tips',
    usage: '.fengshui [element]',
    execute: async (sock, msg, args) => {
      const elements = {
        wood: { colors: 'Green, Brown', direction: 'East', season: 'Spring', tips: 'Add plants and wooden furniture' },
        fire: { colors: 'Red, Orange, Purple', direction: 'South', season: 'Summer', tips: 'Add candles and lights' },
        earth: { colors: 'Yellow, Brown, Beige', direction: 'Center', season: 'Late Summer', tips: 'Add ceramics and stones' },
        metal: { colors: 'White, Gray, Gold', direction: 'West', season: 'Autumn', tips: 'Add metal frames and decorations' },
        water: { colors: 'Blue, Black', direction: 'North', season: 'Winter', tips: 'Add fountains or aquariums' }
      };
      
      if (!args.length) {
        return `🏠 *Feng Shui Elements*\n\n` +
               Object.keys(elements).map(e => `• ${e.charAt(0).toUpperCase() + e.slice(1)}`).join('\n') +
               `\n\n_Usage: .fengshui wood_`;
      }
      
      const element = args[0].toLowerCase();
      const data = elements[element];
      if (!data) throw new Error(`Unknown element! Try: ${Object.keys(elements).join(', ')}`);
      
      return `🏠 *Feng Shui - ${element.toUpperCase()}*\n\n` +
             `🎨 *Colors:* ${data.colors}\n` +
             `🧭 *Direction:* ${data.direction}\n` +
             `🍂 *Season:* ${data.season}\n\n` +
             `💡 *Tips:* ${data.tips}`;
    }
  },

  palmistry: {
    description: 'Palm reading guide',
    usage: '.palmistry',
    execute: async (sock, msg, args) => {
      const lines = [
        { name: 'Heart Line', meaning: 'Represents love and emotional stability' },
        { name: 'Head Line', meaning: 'Represents intellect and reasoning' },
        { name: 'Life Line', meaning: 'Represents vitality and life changes' },
        { name: 'Fate Line', meaning: 'Represents career and destiny' }
      ];
      
      const selected = lines[Math.floor(Math.random() * lines.length)];
      
      return `✋ *Palm Reading*\n\n` +
             `━━━━━━━━━━━━━━\n` +
             `📍 *${selected.name}*\n` +
             `━━━━━━━━━━━━━━\n\n` +
             `📖 ${selected.meaning}\n\n` +
             `💭 _Send a photo of your palm for a detailed reading_`;
    }
  },

  biorhythm: {
    description: 'Calculate biorhythm',
    usage: '.biorhythm <birthdate>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Usage: .biorhythm DD-MM-YYYY');
      
      const physical = Math.floor(Math.random() * 201) - 100;
      const emotional = Math.floor(Math.random() * 201) - 100;
      const intellectual = Math.floor(Math.random() * 201) - 100;
      
      const bar = (val) => {
        const normalized = (val + 100) / 2;
        const filled = Math.round(normalized / 10);
        return '█'.repeat(filled) + '░'.repeat(10 - filled);
      };
      
      return `📊 *Biorhythm Analysis*\n\n` +
             `💪 *Physical:* ${physical > 0 ? '+' : ''}${physical}%\n` +
             `[${bar(physical)}]\n\n` +
             `❤️ *Emotional:* ${emotional > 0 ? '+' : ''}${emotional}%\n` +
             `[${bar(emotional)}]\n\n` +
             `🧠 *Intellectual:* ${intellectual > 0 ? '+' : ''}${intellectual}%\n` +
             `[${bar(intellectual)}]`;
    }
  }
};

export default { category, commands };
