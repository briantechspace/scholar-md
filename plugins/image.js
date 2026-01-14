/**
 * Scholar MD - Image Commands Plugin
 * Image editing, filters & effects
 */

export const category = {
  name: 'Image',
  emoji: '🖼️',
  description: 'Image editing, filters & effects'
};

export const commands = {
  blur: {
    description: 'Blur an image',
    usage: '.blur [level]',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      const level = parseInt(args[0]) || 5;
      return { type: 'image', effect: 'blur', level, caption: `🌫️ *Blurred* (Level: ${level})` };
    }
  },

  removebg: {
    description: 'Remove background from image',
    usage: '.removebg',
    aliases: ['rmbg', 'nobg'],
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'removebg', caption: '✂️ *Background Removed*' };
    }
  },

  enhance: {
    description: 'Enhance image quality',
    usage: '.enhance',
    aliases: ['hd', 'upscale'],
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'enhance', caption: '✨ *Image Enhanced*' };
    }
  },

  cartoon: {
    description: 'Convert to cartoon style',
    usage: '.cartoon',
    aliases: ['cartoonify'],
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'cartoon', caption: '🎨 *Cartoon Style*' };
    }
  },

  pixelate: {
    description: 'Pixelate an image',
    usage: '.pixelate [size]',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      const size = parseInt(args[0]) || 10;
      return { type: 'image', effect: 'pixelate', size, caption: `🟦 *Pixelated* (Size: ${size})` };
    }
  },

  invert: {
    description: 'Invert image colors',
    usage: '.invert',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'invert', caption: '🔄 *Colors Inverted*' };
    }
  },

  grayscale: {
    description: 'Convert to grayscale',
    usage: '.grayscale',
    aliases: ['gray', 'bw'],
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'grayscale', caption: '⬛ *Grayscale*' };
    }
  },

  sepia: {
    description: 'Apply sepia filter',
    usage: '.sepia',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'sepia', caption: '🟤 *Sepia Filter*' };
    }
  },

  rotate: {
    description: 'Rotate an image',
    usage: '.rotate <degrees>',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      const degrees = parseInt(args[0]) || 90;
      return { type: 'image', effect: 'rotate', degrees, caption: `🔄 *Rotated ${degrees}°*` };
    }
  },

  mirror: {
    description: 'Mirror/flip an image',
    usage: '.mirror [h/v]',
    aliases: ['flip'],
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      const direction = args[0]?.toLowerCase() === 'v' ? 'vertical' : 'horizontal';
      return { type: 'image', effect: 'mirror', direction, caption: `🪞 *Mirrored (${direction})*` };
    }
  },

  wanted: {
    description: 'Create wanted poster',
    usage: '.wanted',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'wanted', caption: '🤠 *WANTED*' };
    }
  },

  jail: {
    description: 'Put image behind bars',
    usage: '.jail',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'jail', caption: '🔒 *Behind Bars*' };
    }
  },

  wasted: {
    description: 'Add GTA wasted effect',
    usage: '.wasted',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'wasted', caption: '💀 *WASTED*' };
    }
  },

  triggered: {
    description: 'Add triggered effect',
    usage: '.triggered',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'video', effect: 'triggered', caption: '😤 *TRIGGERED*' };
    }
  },

  rainbow: {
    description: 'Add rainbow effect',
    usage: '.rainbow',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'video', effect: 'rainbow', caption: '🌈 *Rainbow Effect*' };
    }
  },

  brightness: {
    description: 'Adjust brightness',
    usage: '.brightness <-100 to 100>',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      const level = parseInt(args[0]) || 20;
      return { type: 'image', effect: 'brightness', level, caption: `☀️ *Brightness: ${level > 0 ? '+' : ''}${level}*` };
    }
  },

  contrast: {
    description: 'Adjust contrast',
    usage: '.contrast <-100 to 100>',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      const level = parseInt(args[0]) || 20;
      return { type: 'image', effect: 'contrast', level, caption: `🌓 *Contrast: ${level > 0 ? '+' : ''}${level}*` };
    }
  },

  saturate: {
    description: 'Adjust saturation',
    usage: '.saturate <0 to 200>',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      const level = parseInt(args[0]) || 150;
      return { type: 'image', effect: 'saturate', level, caption: `🎨 *Saturation: ${level}%*` };
    }
  },

  resize: {
    description: 'Resize an image',
    usage: '.resize <width> [height]',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      if (!args.length) throw new Error('Usage: .resize 500 500');
      const width = parseInt(args[0]);
      const height = parseInt(args[1]) || width;
      return { type: 'image', effect: 'resize', width, height, caption: `📐 *Resized to ${width}x${height}*` };
    }
  },

  crop: {
    description: 'Crop an image',
    usage: '.crop <width> <height>',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      if (args.length < 2) throw new Error('Usage: .crop 500 500');
      const width = parseInt(args[0]);
      const height = parseInt(args[1]);
      return { type: 'image', effect: 'crop', width, height, caption: `✂️ *Cropped to ${width}x${height}*` };
    }
  },

  circle: {
    description: 'Make image circular',
    usage: '.circle',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'circle', caption: '⭕ *Circular Image*' };
    }
  },

  blur_face: {
    description: 'Blur faces in image',
    usage: '.blur_face',
    aliases: ['blurface', 'censor'],
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'blur_face', caption: '👤 *Faces Blurred*' };
    }
  },

  sharpen: {
    description: 'Sharpen an image',
    usage: '.sharpen',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'sharpen', caption: '🔪 *Image Sharpened*' };
    }
  },

  oil: {
    description: 'Oil painting effect',
    usage: '.oil',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'oil', caption: '🎨 *Oil Painting Effect*' };
    }
  },

  sketch: {
    description: 'Pencil sketch effect',
    usage: '.sketch',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'sketch', caption: '✏️ *Pencil Sketch*' };
    }
  },

  emboss: {
    description: 'Emboss effect',
    usage: '.emboss',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'emboss', caption: '🏛️ *Emboss Effect*' };
    }
  },

  edge: {
    description: 'Edge detection',
    usage: '.edge',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'edge', caption: '📊 *Edge Detection*' };
    }
  },

  negative: {
    description: 'Create negative',
    usage: '.negative',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'negative', caption: '🎞️ *Negative*' };
    }
  },

  vintage: {
    description: 'Vintage filter',
    usage: '.vintage',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'vintage', caption: '📷 *Vintage Filter*' };
    }
  },

  aesthetic: {
    description: 'Aesthetic filter',
    usage: '.aesthetic',
    requiresMedia: 'image',
    execute: async (sock, msg, args) => {
      if (!msg.quotedMessage?.imageMessage && !msg.message?.imageMessage) {
        throw new Error('Reply to an image or send an image with the command!');
      }
      return { type: 'image', effect: 'aesthetic', caption: '✨ *Aesthetic Filter*' };
    }
  }
};

export default { category, commands };
