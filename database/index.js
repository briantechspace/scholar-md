/**
 * Scholar MD - Database Manager
 * Handles data persistence with JSON files
 */

import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'database', 'data');

// Ensure database directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

class Database {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DB_DIR, `${name}.json`);
    this.data = this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        return JSON.parse(fs.readFileSync(this.filePath, 'utf-8'));
      }
    } catch (error) {
      console.error(`Error loading ${this.name}:`, error);
    }
    return {};
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error(`Error saving ${this.name}:`, error);
    }
  }

  get(key) {
    return this.data[key];
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
    return value;
  }

  has(key) {
    return key in this.data;
  }

  delete(key) {
    if (key in this.data) {
      delete this.data[key];
      this.save();
      return true;
    }
    return false;
  }

  keys() {
    return Object.keys(this.data);
  }

  values() {
    return Object.values(this.data);
  }

  entries() {
    return Object.entries(this.data);
  }

  clear() {
    this.data = {};
    this.save();
  }

  size() {
    return Object.keys(this.data).length;
  }
}

// Database collections
export const users = new Database('users');
export const groups = new Database('groups');
export const premium = new Database('premium');
export const banned = new Database('banned');
export const settings = new Database('settings');
export const stats = new Database('stats');

// Helper functions
export function getUser(userId) {
  let user = users.get(userId);
  if (!user) {
    user = {
      id: userId,
      name: '',
      registered: false,
      premium: false,
      xp: 0,
      level: 1,
      money: 0,
      bank: 0,
      daily: 0,
      weekly: 0,
      monthly: 0,
      warnings: 0,
      banned: false,
      role: 'user',
      createdAt: Date.now()
    };
    users.set(userId, user);
  }
  return user;
}

export function updateUser(userId, data) {
  const user = getUser(userId);
  Object.assign(user, data);
  users.set(userId, user);
  return user;
}

export function getGroup(groupId) {
  let group = groups.get(groupId);
  if (!group) {
    group = {
      id: groupId,
      name: '',
      welcome: false,
      welcomeMsg: 'Welcome to the group, @user!',
      goodbye: false,
      goodbyeMsg: 'Goodbye, @user!',
      antilink: false,
      antispam: false,
      nsfw: false,
      muted: false,
      modOnly: false,
      warns: {},
      createdAt: Date.now()
    };
    groups.set(groupId, group);
  }
  return group;
}

export function updateGroup(groupId, data) {
  const group = getGroup(groupId);
  Object.assign(group, data);
  groups.set(groupId, group);
  return group;
}

export function isPremium(userId) {
  const user = premium.get(userId);
  if (!user) return false;
  if (user.expiry && user.expiry < Date.now()) {
    premium.delete(userId);
    return false;
  }
  return true;
}

export function isBanned(userId) {
  return banned.has(userId);
}

export function addXP(userId, amount = 10) {
  const user = getUser(userId);
  user.xp += amount;
  
  // Level up check
  const xpNeeded = user.level * 100;
  if (user.xp >= xpNeeded) {
    user.level++;
    user.xp = user.xp - xpNeeded;
  }
  
  users.set(userId, user);
  return user;
}

export function incrementStat(key) {
  const current = stats.get(key) || 0;
  stats.set(key, current + 1);
  return current + 1;
}

export default {
  users,
  groups,
  premium,
  banned,
  settings,
  stats,
  getUser,
  updateUser,
  getGroup,
  updateGroup,
  isPremium,
  isBanned,
  addXP,
  incrementStat
};
