/**
 * Scholar MD - Owner Commands Plugin
 * Bot owner management commands
 */

export const category = {
  name: 'Owner',
  emoji: '👑',
  description: 'Bot owner management commands'
};

export const commands = {
  addprem: {
    description: 'Add premium user',
    usage: '.addprem @user <days>',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!msg.mentionedJid?.length) throw new Error('Tag a user to add premium!');
      
      const days = parseInt(args[0]) || 30;
      const userId = msg.mentionedJid[0];
      const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
      
      // Save to store
      store.premium = store.premium || {};
      store.premium[userId] = { expiry, addedBy: msg.sender };
      
      return `✅ *Premium Added*\n\n` +
             `👤 User: @${userId.split('@')[0]}\n` +
             `⏳ Duration: ${days} days\n` +
             `📅 Expires: ${new Date(expiry).toLocaleDateString()}`;
    }
  },

  delprem: {
    description: 'Remove premium user',
    usage: '.delprem @user',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!msg.mentionedJid?.length) throw new Error('Tag a user to remove premium!');
      
      const userId = msg.mentionedJid[0];
      
      if (store.premium) {
        delete store.premium[userId];
      }
      
      return `✅ Premium removed from @${userId.split('@')[0]}`;
    }
  },

  listprem: {
    description: 'List premium users',
    usage: '.listprem',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      
      const premium = store.premium || {};
      const users = Object.entries(premium);
      
      if (!users.length) return '📋 No premium users found.';
      
      const list = users.map(([id, data]) => {
        const daysLeft = Math.ceil((data.expiry - Date.now()) / (24 * 60 * 60 * 1000));
        return `• @${id.split('@')[0]} - ${daysLeft} days left`;
      }).join('\n');
      
      return `👑 *Premium Users*\n\n${list}`;
    }
  },

  ban: {
    description: 'Ban a user from using bot',
    usage: '.ban @user',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!msg.mentionedJid?.length) throw new Error('Tag a user to ban!');
      
      const userId = msg.mentionedJid[0];
      
      store.banned = store.banned || [];
      if (!store.banned.includes(userId)) {
        store.banned.push(userId);
      }
      
      return `🚫 *User Banned*\n\n@${userId.split('@')[0]} has been banned from using the bot.`;
    }
  },

  unban: {
    description: 'Unban a user',
    usage: '.unban @user',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!msg.mentionedJid?.length) throw new Error('Tag a user to unban!');
      
      const userId = msg.mentionedJid[0];
      
      if (store.banned) {
        store.banned = store.banned.filter(id => id !== userId);
      }
      
      return `✅ @${userId.split('@')[0]} has been unbanned.`;
    }
  },

  broadcast: {
    description: 'Broadcast message to all chats',
    usage: '.broadcast <message>',
    aliases: ['bc'],
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!args.length) throw new Error('Please provide a message to broadcast!');
      
      const message = args.join(' ');
      
      return {
        type: 'broadcast',
        message: `📢 *Broadcast*\n\n${message}\n\n_- Bot Owner_`
      };
    }
  },

  setname: {
    description: 'Set bot name/display name',
    usage: '.setname <name>',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!args.length) throw new Error('Please provide a name!');
      
      const name = args.join(' ');
      await sock.updateProfileName(name);
      
      return `✅ Bot name changed to: ${name}`;
    }
  },

  setbio: {
    description: 'Set bot bio/status',
    usage: '.setbio <bio>',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!args.length) throw new Error('Please provide a bio!');
      
      const bio = args.join(' ');
      await sock.updateProfileStatus(bio);
      
      return `✅ Bio updated to: ${bio}`;
    }
  },

  setpp: {
    description: 'Set bot profile picture',
    usage: '.setpp (reply to image)',
    aliases: ['setprofilepic'],
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!msg.quotedMessage?.imageMessage) throw new Error('Reply to an image!');
      
      return { type: 'setProfilePicture', caption: '✅ Profile picture updated!' };
    }
  },

  restart: {
    description: 'Restart the bot',
    usage: '.restart',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      
      await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Restarting bot...' });
      
      process.exit(0);
    }
  },

  shutdown: {
    description: 'Shutdown the bot',
    usage: '.shutdown',
    aliases: ['die'],
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      
      await sock.sendMessage(msg.key.remoteJid, { text: '👋 Bot shutting down...' });
      
      process.exit(1);
    }
  },

  mode: {
    description: 'Set bot mode (public/private)',
    usage: '.mode <public/private>',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      
      const mode = args[0]?.toLowerCase();
      if (!['public', 'private'].includes(mode)) {
        throw new Error('Usage: .mode <public/private>');
      }
      
      store.mode = mode;
      
      return `✅ Bot mode set to: ${mode.toUpperCase()}\n\n` +
             (mode === 'private' ? '🔒 Only owner can use the bot now.' : '🔓 Everyone can use the bot now.');
    }
  },

  eval: {
    description: 'Execute JavaScript code',
    usage: '.eval <code>',
    aliases: ['$', 'ev'],
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!args.length) throw new Error('Please provide code to execute!');
      
      const code = args.join(' ');
      
      try {
        let result = eval(code);
        if (typeof result !== 'string') {
          result = require('util').inspect(result, { depth: 2 });
        }
        return `✅ *Result:*\n\`\`\`\n${result}\n\`\`\``;
      } catch (error) {
        return `❌ *Error:*\n\`\`\`\n${error.message}\n\`\`\``;
      }
    }
  },

  exec: {
    description: 'Execute shell command',
    usage: '.exec <command>',
    aliases: ['shell', '$'],
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!args.length) throw new Error('Please provide a command!');
      
      const { exec } = await import('child_process');
      const command = args.join(' ');
      
      return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            resolve(`❌ *Error:*\n\`\`\`\n${error.message}\n\`\`\``);
          } else {
            resolve(`✅ *Output:*\n\`\`\`\n${stdout || stderr || 'No output'}\n\`\`\``);
          }
        });
      });
    }
  },

  join: {
    description: 'Join a group via invite link',
    usage: '.join <link>',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!args.length) throw new Error('Please provide a group invite link!');
      
      const link = args[0];
      const code = link.split('/').pop();
      
      await sock.groupAcceptInvite(code);
      return '✅ Successfully joined the group!';
    }
  },

  leave: {
    description: 'Leave current group',
    usage: '.leave',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, isGroup }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!isGroup) throw new Error('This command can only be used in groups!');
      
      await sock.sendMessage(msg.key.remoteJid, { text: '👋 Goodbye!' });
      await sock.groupLeave(msg.key.remoteJid);
      
      return null;
    }
  },

  block: {
    description: 'Block a user',
    usage: '.block @user',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!msg.mentionedJid?.length) throw new Error('Tag a user to block!');
      
      await sock.updateBlockStatus(msg.mentionedJid[0], 'block');
      return `🚫 Blocked @${msg.mentionedJid[0].split('@')[0]}`;
    }
  },

  unblock: {
    description: 'Unblock a user',
    usage: '.unblock @user',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!msg.mentionedJid?.length) throw new Error('Tag a user to unblock!');
      
      await sock.updateBlockStatus(msg.mentionedJid[0], 'unblock');
      return `✅ Unblocked @${msg.mentionedJid[0].split('@')[0]}`;
    }
  },

  clearcache: {
    description: 'Clear bot cache',
    usage: '.clearcache',
    aliases: ['cc'],
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      
      // Clear various caches
      if (global.gc) global.gc();
      
      return '✅ Cache cleared!';
    }
  },

  setprefix: {
    description: 'Set bot command prefix',
    usage: '.setprefix <prefix>',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!args.length) throw new Error('Please provide a prefix!');
      
      const prefix = args[0];
      if (prefix.length > 3) throw new Error('Prefix must be 3 characters or less!');
      
      store.prefix = prefix;
      
      return `✅ Prefix changed to: ${prefix}`;
    }
  },

  addowner: {
    description: 'Add another owner',
    usage: '.addowner @user',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!msg.mentionedJid?.length) throw new Error('Tag a user to add as owner!');
      
      const userId = msg.mentionedJid[0];
      
      store.owners = store.owners || [];
      if (!store.owners.includes(userId)) {
        store.owners.push(userId);
      }
      
      return `✅ @${userId.split('@')[0]} has been added as owner.`;
    }
  },

  delowner: {
    description: 'Remove an owner',
    usage: '.delowner @user',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      if (!msg.mentionedJid?.length) throw new Error('Tag a user to remove as owner!');
      
      const userId = msg.mentionedJid[0];
      
      if (store.owners) {
        store.owners = store.owners.filter(id => id !== userId);
      }
      
      return `✅ @${userId.split('@')[0]} has been removed from owners.`;
    }
  },

  listowners: {
    description: 'List all bot owners',
    usage: '.listowners',
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      
      const owners = store.owners || [];
      
      if (!owners.length) return '📋 No additional owners configured.';
      
      const list = owners.map(id => `• @${id.split('@')[0]}`).join('\n');
      return `👑 *Bot Owners*\n\n${list}`;
    }
  },

  maintenance: {
    description: 'Toggle maintenance mode',
    usage: '.maintenance [on/off]',
    aliases: ['mtn'],
    ownerOnly: true,
    execute: async (sock, msg, args, { isOwner, store }) => {
      if (!isOwner) throw new Error('Owner only command!');
      
      const mode = args[0]?.toLowerCase();
      
      if (mode === 'on') {
        store.maintenance = true;
        return '🔧 Maintenance mode enabled. Only owners can use the bot.';
      } else if (mode === 'off') {
        store.maintenance = false;
        return '✅ Maintenance mode disabled.';
      } else {
        store.maintenance = !store.maintenance;
        return store.maintenance ? '🔧 Maintenance mode enabled.' : '✅ Maintenance mode disabled.';
      }
    }
  }
};

export default { category, commands };
