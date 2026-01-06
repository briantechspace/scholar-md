require("./server");

// Only start bot if file exists
try {
  const { startBot } = require("./bot");
  if (typeof startBot === "function") {
    startBot();
  }
} catch (e) {
  console.log("Bot not started (bot.js missing or disabled)");
}
