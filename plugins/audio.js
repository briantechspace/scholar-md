/**
 * Scholar MD - Audio Commands Plugin
 * Audio effects, filters & conversions
 */

export const category = {
  name: 'Audio',
  emoji: '🔊',
  description: 'Audio effects, filters & conversions'
};

export const commands = {
  bass: {
    description: 'Add bass boost to audio',
    usage: '.bass [level]',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      const level = args[0] || '10';
      return { type: 'audio', effect: 'bass', level, caption: `🔊 *Bass Boosted* (Level: ${level})` };
    }
  },

  blown: {
    description: 'Add blown/distortion effect',
    usage: '.blown',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'blown', caption: '💥 *Blown Effect Applied*' };
    }
  },

  slow: {
    description: 'Slow down audio',
    usage: '.slow [rate]',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      const rate = args[0] || '0.75';
      return { type: 'audio', effect: 'slow', rate, caption: `🐢 *Slowed* (Rate: ${rate}x)` };
    }
  },

  fast: {
    description: 'Speed up audio',
    usage: '.fast [rate]',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      const rate = args[0] || '1.5';
      return { type: 'audio', effect: 'fast', rate, caption: `⚡ *Sped Up* (Rate: ${rate}x)` };
    }
  },

  reverse: {
    description: 'Reverse audio',
    usage: '.reverse',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'reverse', caption: '⏪ *Reversed Audio*' };
    }
  },

  nightcore: {
    description: 'Apply nightcore effect',
    usage: '.nightcore',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'nightcore', caption: '🌙 *Nightcore Effect*' };
    }
  },

  earrape: {
    description: 'Apply earrape effect (loud)',
    usage: '.earrape',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'earrape', caption: '⚠️ *Earrape Effect* (WARNING: LOUD!)' };
    }
  },

  deep: {
    description: 'Add deep/low pitch effect',
    usage: '.deep',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'deep', caption: '🎵 *Deep Voice Effect*' };
    }
  },

  robot: {
    description: 'Add robot voice effect',
    usage: '.robot',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'robot', caption: '🤖 *Robot Voice Effect*' };
    }
  },

  chipmunk: {
    description: 'Add chipmunk voice effect',
    usage: '.chipmunk',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'chipmunk', caption: '🐿️ *Chipmunk Voice Effect*' };
    }
  },

  '8d': {
    description: 'Add 8D audio effect',
    usage: '.8d',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: '8d', caption: '🎧 *8D Audio Effect*\n\n_Use headphones for best experience!_' };
    }
  },

  echo: {
    description: 'Add echo effect',
    usage: '.echo',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'echo', caption: '🔊 *Echo Effect*' };
    }
  },

  volume: {
    description: 'Adjust audio volume',
    usage: '.volume <1-200>',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      const level = parseInt(args[0]) || 100;
      if (level < 1 || level > 200) throw new Error('Volume must be between 1 and 200!');
      return { type: 'audio', effect: 'volume', level, caption: `🔊 *Volume: ${level}%*` };
    }
  },

  pitch: {
    description: 'Change audio pitch',
    usage: '.pitch <-12 to 12>',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      const semitones = parseInt(args[0]) || 0;
      if (semitones < -12 || semitones > 12) throw new Error('Pitch must be between -12 and 12!');
      return { type: 'audio', effect: 'pitch', semitones, caption: `🎵 *Pitch: ${semitones > 0 ? '+' : ''}${semitones} semitones*` };
    }
  },

  trim: {
    description: 'Trim audio',
    usage: '.trim <start> <end>',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      if (args.length < 2) throw new Error('Usage: .trim <start_seconds> <end_seconds>\nExample: .trim 10 30');
      const [start, end] = args.map(Number);
      return { type: 'audio', effect: 'trim', start, end, caption: `✂️ *Trimmed* (${start}s - ${end}s)` };
    }
  },

  tovoice: {
    description: 'Convert audio to voice note',
    usage: '.tovoice',
    aliases: ['tovn', 'ptt'],
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'voice', caption: '🎤 *Converted to Voice Note*' };
    }
  },

  toaudio: {
    description: 'Convert voice note to audio',
    usage: '.toaudio',
    aliases: ['tomp3'],
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to a voice note!');
      return { type: 'audio', asDocument: true, caption: '🎵 *Converted to Audio*' };
    }
  },

  ringtone: {
    description: 'Search for ringtones',
    usage: '.ringtone <query>',
    execute: async (sock, msg, args) => {
      if (!args.length) throw new Error('Please provide a search query!\nUsage: .ringtone iphone');
      const query = args.join(' ');
      // Actual implementation would search ringtone API
      return { type: 'audio', caption: `🔔 *Ringtone*\n\nQuery: ${query}` };
    }
  },

  voicechanger: {
    description: 'Change voice characteristics',
    usage: '.voicechanger <male/female/child>',
    aliases: ['vc'],
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      const type = args[0]?.toLowerCase() || 'male';
      const validTypes = ['male', 'female', 'child'];
      if (!validTypes.includes(type)) throw new Error(`Invalid type! Use: ${validTypes.join(', ')}`);
      return { type: 'audio', effect: 'voicechanger', voiceType: type, caption: `🎭 *Voice Changed to ${type}*` };
    }
  },

  normalize: {
    description: 'Normalize audio levels',
    usage: '.normalize',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'normalize', caption: '📊 *Audio Normalized*' };
    }
  },

  denoise: {
    description: 'Remove noise from audio',
    usage: '.denoise',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      return { type: 'audio', effect: 'denoise', caption: '🔇 *Noise Removed*' };
    }
  },

  fade: {
    description: 'Add fade in/out to audio',
    usage: '.fade <in/out> <seconds>',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.audioMessage) throw new Error('Reply to an audio message!');
      const type = args[0]?.toLowerCase() || 'in';
      const seconds = parseInt(args[1]) || 3;
      return { type: 'audio', effect: 'fade', fadeType: type, seconds, caption: `🎵 *Fade ${type} (${seconds}s)*` };
    }
  },

  merge: {
    description: 'Merge two audio files',
    usage: '.merge',
    requiresMedia: 'audio',
    execute: async (sock, msg, args) => {
      throw new Error('To merge audio:\n1. Send first audio\n2. Reply to it with second audio\n3. Reply to second with .merge');
    }
  }
};

export default { category, commands };
