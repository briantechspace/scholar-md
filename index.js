const app = require("./server");
const { startBot } = require("./bot");

const PORT = process.env.PORT || 3000;

// Start HTTP server first
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Start bot in idle mode (no pairing yet)
startBot();
