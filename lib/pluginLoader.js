/**
 * 🔌 PLUGIN LOADER
 * Dynamically loads all plugins from the plugins folder
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Store all loaded commands and categories
export const allCommands = {};
export const categories = {};

/**
 * Load all plugins from the plugins directory
 */
export async function loadPlugins() {
  const pluginsDir = path.join(__dirname, '../plugins');
  
  if (!fs.existsSync(pluginsDir)) {
    console.log('📁 Creating plugins directory...');
    fs.mkdirSync(pluginsDir, { recursive: true });
    return;
  }
  
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
  
  console.log(`📦 Loading ${files.length} plugins...`);
  
  for (const file of files) {
    try {
      const plugin = await import(`../plugins/${file}`);
      
      if (plugin.category) {
        categories[plugin.category.name.toLowerCase()] = plugin.category;
      }
      
      if (plugin.commands) {
        for (const [name, cmd] of Object.entries(plugin.commands)) {
          allCommands[name] = {
            ...cmd,
            plugin: file.replace('.js', '')
          };
        }
      }
      
      console.log(`  ✅ Loaded: ${file} (${Object.keys(plugin.commands || {}).length} commands)`);
    } catch (err) {
      console.log(`  ❌ Failed: ${file} - ${err.message}`);
    }
  }
  
  console.log(`\n📊 Total: ${Object.keys(allCommands).length} commands in ${Object.keys(categories).length} categories\n`);
}

/**
 * Get all category information
 */
export function getCategories() {
  return Object.values(categories);
}

/**
 * Get commands by category
 */
export function getCommandsByCategory(categoryName) {
  return Object.entries(allCommands)
    .filter(([, cmd]) => cmd.category === categoryName.toLowerCase())
    .map(([name, cmd]) => ({ name, ...cmd }));
}

/**
 * Get command info
 */
export function getCommand(name) {
  return allCommands[name] || null;
}

/**
 * Check if command exists
 */
export function hasCommand(name) {
  return name in allCommands;
}

export default {
  loadPlugins,
  getCategories,
  getCommandsByCategory,
  getCommand,
  hasCommand,
  allCommands,
  categories
};
