/**
 * 🎮 GAMES COMMANDS
 * Fun games and entertainment
 */

import { config } from '../config.js';

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export const category = {
  name: "Games",
  emoji: "🎮",
  description: "Fun games, quizzes & entertainment"
};

export const commands = {
  roll: {
    desc: "Roll a dice",
    usage: ".roll [max]",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const max = parseInt(args[0]) || 6;
      const result = Math.floor(Math.random() * max) + 1;
      await sock.sendMessage(sender, { text: `🎲 *Dice Roll*\n\nYou rolled: *${result}* (1-${max})` });
    }
  },

  flip: {
    desc: "Flip a coin",
    usage: ".flip",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const result = Math.random() < 0.5 ? "Heads 🪙" : "Tails 🪙";
      await sock.sendMessage(sender, { text: `🪙 *Coin Flip*\n\nResult: *${result}*` });
    }
  },

  rps: {
    desc: "Rock Paper Scissors",
    usage: ".rps <rock/paper/scissors>",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const choices = ['rock', 'paper', 'scissors'];
      const userChoice = args[0]?.toLowerCase();
      
      if (!choices.includes(userChoice)) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .rps <rock/paper/scissors>\n\n📌 Example: .rps rock" 
        });
      }
      
      const botChoice = pick(choices);
      let result;
      
      if (userChoice === botChoice) result = "Draw! 🤝";
      else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) result = "You Win! 🎉";
      else result = "You Lose! 😔";
      
      const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
      await sock.sendMessage(sender, { 
        text: `🎮 *Rock Paper Scissors*\n\nYou: ${emojis[userChoice]} ${userChoice}\nBot: ${emojis[botChoice]} ${botChoice}\n\n*${result}*` 
      });
    }
  },

  slot: {
    desc: "Slot machine",
    usage: ".slot",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '🔔', '⭐'];
      const s1 = pick(symbols), s2 = pick(symbols), s3 = pick(symbols);
      
      let result = "Try again! 😔";
      if (s1 === s2 && s2 === s3) result = "JACKPOT! 🎉💰";
      else if (s1 === s2 || s2 === s3 || s1 === s3) result = "Nice! Two match! 🎊";
      
      await sock.sendMessage(sender, { 
        text: `🎰 *Slot Machine*\n\n╔═══════════╗\n║ ${s1} │ ${s2} │ ${s3} ║\n╚═══════════╝\n\n*${result}*` 
      });
    }
  },

  quiz: {
    desc: "Random quiz",
    usage: ".quiz",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const quizzes = [
        { q: "What is the capital of France?", a: "Paris" },
        { q: "What is 15 x 8?", a: "120" },
        { q: "What planet is closest to the Sun?", a: "Mercury" },
        { q: "What is the largest ocean?", a: "Pacific" }
      ];
      const quiz = pick(quizzes);
      await sock.sendMessage(sender, { 
        text: `❓ *Quiz Time!*\n\n${quiz.q}\n\n_Reply with your answer!_\n\n||Answer: ${quiz.a}||` 
      });
    }
  },

  trivia: {
    desc: "Trivia game",
    usage: ".trivia",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      return commands.quiz.handler(sock, sender, args, msg);
    }
  },

  truth: {
    desc: "Truth question",
    usage: ".truth",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const truths = [
        "What's the most embarrassing thing you've ever done?",
        "What's your biggest fear?",
        "Have you ever lied to your best friend?",
        "What's the last lie you told?",
        "What's your biggest secret?"
      ];
      await sock.sendMessage(sender, { text: `🤔 *Truth*\n\n${pick(truths)}` });
    }
  },

  dare: {
    desc: "Dare challenge",
    usage: ".dare",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const dares = [
        "Send a voice note singing your favorite song!",
        "Change your profile picture to something funny for 1 hour!",
        "Send the last photo in your gallery!",
        "Text someone you haven't talked to in months!",
        "Post something embarrassing on your status!"
      ];
      await sock.sendMessage(sender, { text: `😈 *Dare*\n\n${pick(dares)}` });
    }
  },

  "8ball": {
    desc: "Magic 8 Ball",
    usage: ".8ball <question>",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .8ball <question>\n\n📌 Example: .8ball Will I be rich?" 
        });
      }
      const answers = [
        "Yes, definitely! ✅", "It is certain ✅", "Without a doubt ✅",
        "Most likely 🤔", "Ask again later ⏳", "Cannot predict now 🔮",
        "Don't count on it ❌", "My sources say no ❌", "Very doubtful ❌"
      ];
      await sock.sendMessage(sender, { 
        text: `🎱 *Magic 8 Ball*\n\n❓ ${args.join(' ')}\n\n🔮 ${pick(answers)}` 
      });
    }
  },

  love: {
    desc: "Love calculator",
    usage: ".love <name1> <name2>",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      if (args.length < 2) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .love <name1> <name2>\n\n📌 Example: .love John Jane" 
        });
      }
      const percentage = Math.floor(Math.random() * 101);
      const hearts = '❤️'.repeat(Math.floor(percentage / 10)) + '🖤'.repeat(10 - Math.floor(percentage / 10));
      await sock.sendMessage(sender, { 
        text: `💕 *Love Calculator*\n\n👤 ${args[0]}\n💗 ${args[1]}\n\n${hearts}\n\n*${percentage}% Compatible!*` 
      });
    }
  },

  ship: {
    desc: "Ship two people",
    usage: ".ship @user1 @user2",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned || mentioned.length < 2) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .ship @user1 @user2\n\n📌 Mention two users" 
        });
      }
      const percentage = Math.floor(Math.random() * 101);
      await sock.sendMessage(sender, { 
        text: `⛵ *Ship*\n\n@${mentioned[0].split('@')[0]} ❤️ @${mentioned[1].split('@')[0]}\n\n*${percentage}% Match!*`,
        mentions: mentioned 
      });
    }
  },

  rate: {
    desc: "Rate something",
    usage: ".rate <thing>",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      if (!args.length) {
        return sock.sendMessage(sender, { 
          text: "❌ *Usage:* .rate <thing>\n\n📌 Example: .rate my coding skills" 
        });
      }
      const rating = Math.floor(Math.random() * 11);
      const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);
      await sock.sendMessage(sender, { 
        text: `📊 *Rating*\n\n"${args.join(' ')}"\n\n${stars}\n\n*${rating}/10*` 
      });
    }
  },

  roast: {
    desc: "Roast someone",
    usage: ".roast @user",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const roasts = [
        "You're like a cloud. When you disappear, it's a beautiful day! ☁️",
        "I'd agree with you but then we'd both be wrong! 🤷",
        "You're not stupid; you just have bad luck thinking! 🤔",
        "I'm not insulting you, I'm describing you! 📝"
      ];
      await sock.sendMessage(sender, { text: `🔥 *Roast*\n\n${pick(roasts)}` });
    }
  },

  simp: {
    desc: "Simp meter",
    usage: ".simp @user",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const percentage = Math.floor(Math.random() * 101);
      await sock.sendMessage(sender, { text: `😍 *Simp Meter*\n\n${'🥺'.repeat(Math.floor(percentage/10))}\n\n*${percentage}% Simp!*` });
    }
  },

  gay: {
    desc: "Gay meter",
    usage: ".gay @user",
    category: "games",
    handler: async (sock, sender, args, msg) => {
      const percentage = Math.floor(Math.random() * 101);
      await sock.sendMessage(sender, { text: `🏳️‍🌈 *Gay Meter*\n\n*${percentage}%*\n\n_This is just for fun!_` });
    }
  }
};

export default { category, commands };
