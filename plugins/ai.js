/**
 * 🤖 AI COMMANDS
 * AI-powered features and chatbots
 */

import { config } from '../config.js';

export const category = {
  name: "AI",
  emoji: "🤖",
  description: "AI chatbots, image generation & smart tools"
};

export const commands = {
  ai: {
    desc: "Chat with AI",
    usage: ".ai <question>",
    example: ".ai What is the capital of Kenya?",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .ai <question>\n\n📌 Example: .ai What is the capital of Kenya?" 
        });
      }
      await sock.sendMessage(sender, { text: `🤖 *Thinking...*` });
    }
  },

  gpt: {
    desc: "Chat with GPT",
    usage: ".gpt <question>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      return commands.ai.handler(sock, sender, args, msg);
    }
  },

  chatgpt: {
    desc: "Chat with ChatGPT",
    usage: ".chatgpt <question>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      return commands.ai.handler(sock, sender, args, msg);
    }
  },

  gemini: {
    desc: "Chat with Gemini AI",
    usage: ".gemini <question>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .gemini <question>\n\n📌 Example: .gemini Explain quantum physics" 
        });
      }
      await sock.sendMessage(sender, { text: `💫 *Gemini thinking...*` });
    }
  },

  bard: {
    desc: "Chat with Bard",
    usage: ".bard <question>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      return commands.gemini.handler(sock, sender, args, msg);
    }
  },

  blackbox: {
    desc: "Chat with Blackbox AI",
    usage: ".blackbox <question>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .blackbox <question>\n\n📌 Example: .blackbox Write a Python function" 
        });
      }
      await sock.sendMessage(sender, { text: `⬛ *Blackbox AI processing...*` });
    }
  },

  imagine: {
    desc: "Generate AI image",
    usage: ".imagine <prompt>",
    example: ".imagine A cat wearing a hat",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .imagine <prompt>\n\n📌 Example: .imagine A sunset over mountains" 
        });
      }
      await sock.sendMessage(sender, { text: `🎨 *Generating image...*\n\nPrompt: ${args.join(' ')}` });
    }
  },

  dalle: {
    desc: "Generate with DALL-E",
    usage: ".dalle <prompt>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      return commands.imagine.handler(sock, sender, args, msg);
    }
  },

  stable: {
    desc: "Stable Diffusion",
    usage: ".stable <prompt>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      return commands.imagine.handler(sock, sender, args, msg);
    }
  },

  aiart: {
    desc: "AI Art generation",
    usage: ".aiart <prompt>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      return commands.imagine.handler(sock, sender, args, msg);
    }
  },

  aivoice: {
    desc: "AI voice generation",
    usage: ".aivoice <text>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .aivoice <text>\n\n📌 Example: .aivoice Hello, how are you?" 
        });
      }
      await sock.sendMessage(sender, { text: `🔊 *Generating voice...*` });
    }
  },

  aicode: {
    desc: "AI code generation",
    usage: ".aicode <description>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .aicode <description>\n\n📌 Example: .aicode bubble sort in python" 
        });
      }
      await sock.sendMessage(sender, { text: `💻 *Generating code...*` });
    }
  },

  aisummarize: {
    desc: "AI text summarization",
    usage: ".aisummarize <text>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .aisummarize <text>\n\n📌 Reply to a long text to summarize" 
        });
      }
      await sock.sendMessage(sender, { text: `📝 *Summarizing...*` });
    }
  },

  aitranslate: {
    desc: "AI translation",
    usage: ".aitranslate <lang> <text>",
    category: "ai",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .aitranslate <lang> <text>\n\n📌 Example: .aitranslate spanish Hello world" 
        });
      }
      await sock.sendMessage(sender, { text: `🌐 *Translating...*` });
    }
  }
};

export default { category, commands };
