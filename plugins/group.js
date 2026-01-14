/**
 * 👥 GROUP ADMIN COMMANDS
 * Group management tools
 */

import { config } from '../config.js';
import fs from 'fs';

const SETTINGS = "./settings.json";
const safeRead = (f, defaultValue = {}) => {
  try {
    return JSON.parse(fs.readFileSync(f, "utf8") || "{}");
  } catch {
    return defaultValue;
  }
};
const write = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 2));

export const category = {
  name: "Group",
  emoji: "👥",
  description: "Group management & admin tools"
};

export const commands = {
  kick: {
    desc: "Kick member from group",
    usage: ".kick @user",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .kick @user\n\n📌 Mention the user to kick" });
      }
      try {
        await sock.groupParticipantsUpdate(sender, mentioned, 'remove');
        await sock.sendMessage(sender, { text: `✅ Kicked ${mentioned.length} member(s)` });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to kick. Make sure bot is admin!" });
      }
    }
  },

  add: {
    desc: "Add member to group",
    usage: ".add <number>",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const number = args[0]?.replace(/[^0-9]/g, "");
      if (!number) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .add <number>\n\n📌 Example: .add 254712345678" });
      }
      try {
        await sock.groupParticipantsUpdate(sender, [`${number}@s.whatsapp.net`], 'add');
        await sock.sendMessage(sender, { text: `✅ Added ${number}` });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to add. User may have privacy settings enabled." });
      }
    }
  },

  promote: {
    desc: "Promote member to admin",
    usage: ".promote @user",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .promote @user\n\n📌 Mention the user to promote" });
      }
      try {
        await sock.groupParticipantsUpdate(sender, mentioned, 'promote');
        await sock.sendMessage(sender, { text: `✅ Promoted to admin!`, mentions: mentioned });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to promote!" });
      }
    }
  },

  demote: {
    desc: "Demote admin to member",
    usage: ".demote @user",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .demote @user\n\n📌 Mention the admin to demote" });
      }
      try {
        await sock.groupParticipantsUpdate(sender, mentioned, 'demote');
        await sock.sendMessage(sender, { text: `✅ Demoted from admin!`, mentions: mentioned });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to demote!" });
      }
    }
  },

  mute: {
    desc: "Mute group (admins only)",
    usage: ".mute",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        await sock.groupSettingUpdate(sender, 'announcement');
        await sock.sendMessage(sender, { text: `🔇 *Group Muted*\n\nOnly admins can send messages.` });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to mute!" });
      }
    }
  },

  unmute: {
    desc: "Unmute group",
    usage: ".unmute",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        await sock.groupSettingUpdate(sender, 'not_announcement');
        await sock.sendMessage(sender, { text: `🔊 *Group Unmuted*\n\nEveryone can send messages.` });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to unmute!" });
      }
    }
  },

  hidetag: {
    desc: "Tag all members silently",
    usage: ".hidetag <message>",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .hidetag <message>\n\n📌 Example: .hidetag Hello everyone!" });
      }
      try {
        const groupMetadata = await sock.groupMetadata(sender);
        const participants = groupMetadata.participants.map(p => p.id);
        await sock.sendMessage(sender, { text: args.join(' '), mentions: participants });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to send hidetag!" });
      }
    }
  },

  tagall: {
    desc: "Tag all members",
    usage: ".tagall <message>",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        const groupMetadata = await sock.groupMetadata(sender);
        const participants = groupMetadata.participants;
        let text = `📢 *Tag All*\n\n${args.join(' ') || 'Attention!'}\n\n`;
        text += participants.map(p => `@${p.id.split('@')[0]}`).join('\n');
        await sock.sendMessage(sender, { text, mentions: participants.map(p => p.id) });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to tag all!" });
      }
    }
  },

  antilink: {
    desc: "Toggle antilink",
    usage: ".antilink <on/off>",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mode = args[0]?.toLowerCase();
      if (!['on', 'off'].includes(mode)) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .antilink <on/off>\n\n📌 Example: .antilink on" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      settings.groups[sender].antilink = mode === 'on';
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Antilink ${mode === 'on' ? 'enabled' : 'disabled'}!` });
    }
  },

  welcome: {
    desc: "Set welcome message",
    usage: ".welcome <on/off/message>",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      if (!args.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .welcome <on/off/message>\n\n📌 Variables: {user}, {group}" });
      }
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      
      if (args[0].toLowerCase() === 'on') {
        settings.groups[sender].welcome = true;
        write(SETTINGS, settings);
        return sock.sendMessage(sender, { text: `✅ Welcome enabled!` });
      }
      if (args[0].toLowerCase() === 'off') {
        settings.groups[sender].welcome = false;
        write(SETTINGS, settings);
        return sock.sendMessage(sender, { text: `✅ Welcome disabled!` });
      }
      
      settings.groups[sender].welcome = true;
      settings.groups[sender].welcomeMsg = args.join(' ');
      write(SETTINGS, settings);
      await sock.sendMessage(sender, { text: `✅ Welcome message set!` });
    }
  },

  warn: {
    desc: "Warn a member",
    usage: ".warn @user",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned?.length) {
        return sock.sendMessage(sender, { text: "❌ *Usage:* .warn @user\n\n📌 Mention the user to warn" });
      }
      
      const settings = safeRead(SETTINGS, {});
      if (!settings.groups) settings.groups = {};
      if (!settings.groups[sender]) settings.groups[sender] = {};
      if (!settings.groups[sender].warnings) settings.groups[sender].warnings = {};
      
      const targetJid = mentioned[0];
      settings.groups[sender].warnings[targetJid] = (settings.groups[sender].warnings[targetJid] || 0) + 1;
      const warnCount = settings.groups[sender].warnings[targetJid];
      const maxWarns = settings.groups[sender].maxWarns || 3;
      
      write(SETTINGS, settings);
      
      if (warnCount >= maxWarns) {
        try {
          await sock.groupParticipantsUpdate(sender, [targetJid], 'remove');
          await sock.sendMessage(sender, { text: `⚠️ @${targetJid.split('@')[0]} kicked after ${warnCount} warnings!`, mentions: [targetJid] });
        } catch {
          await sock.sendMessage(sender, { text: `⚠️ @${targetJid.split('@')[0]} has ${warnCount}/${maxWarns} warnings!`, mentions: [targetJid] });
        }
      } else {
        await sock.sendMessage(sender, { text: `⚠️ @${targetJid.split('@')[0]} warned!\n\n📊 ${warnCount}/${maxWarns}`, mentions: [targetJid] });
      }
    }
  },

  groupinfo: {
    desc: "Get group info",
    usage: ".groupinfo",
    category: "group",
    handler: async (sock, sender, args, msg) => {
      if (!sender.endsWith('@g.us')) {
        return sock.sendMessage(sender, { text: "❌ This command only works in groups!" });
      }
      try {
        const meta = await sock.groupMetadata(sender);
        const admins = meta.participants.filter(p => p.admin).length;
        
        await sock.sendMessage(sender, { 
          text: `📊 *Group Info*\n\n📝 *Name:* ${meta.subject}\n👥 *Members:* ${meta.participants.length}\n👑 *Admins:* ${admins}\n📜 *Description:*\n${meta.desc || 'None'}` 
        });
      } catch {
        await sock.sendMessage(sender, { text: "❌ Failed to get group info!" });
      }
    }
  }
};

export default { category, commands };
