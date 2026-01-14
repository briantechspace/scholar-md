/**
 * Scholar MD - Frontend JavaScript
 */

// Category data
const categories = {
  downloader: {
    emoji: '📥',
    name: 'Downloader',
    description: 'Download from YouTube, TikTok, Instagram & more',
    commands: ['play', 'song', 'video', 'ytmp3', 'ytmp4', 'tiktok', 'instagram', 'facebook', 'twitter', 'spotify', 'mediafire', 'apk', 'pinterest', 'gdrive']
  },
  sticker: {
    emoji: '🎨',
    name: 'Sticker',
    description: 'Create stickers from images, videos & text',
    commands: ['sticker', 's', 'toimg', 'emojimix', 'attp', 'ttp', 'take', 'steal', 'smeme', 'wm', 'crop', 'circle']
  },
  ai: {
    emoji: '🤖',
    name: 'AI',
    description: 'AI chatbots, image generation & smart tools',
    commands: ['ai', 'gpt', 'chatgpt', 'gemini', 'bard', 'blackbox', 'imagine', 'dalle', 'stable', 'aiart', 'aivoice', 'aicode']
  },
  games: {
    emoji: '🎮',
    name: 'Games',
    description: 'Fun games, quizzes & entertainment',
    commands: ['roll', 'flip', 'rps', 'slot', 'quiz', 'trivia', 'truth', 'dare', '8ball', 'love', 'ship', 'rate', 'roast', 'simp']
  },
  tools: {
    emoji: '🔧',
    name: 'Tools',
    description: 'Calculators, converters & utility tools',
    commands: ['calc', 'translate', 'tts', 'weather', 'define', 'wiki', 'ss', 'qr', 'readqr', 'short', 'currency', 'ocr', 'reminder', 'poll']
  },
  group: {
    emoji: '👥',
    name: 'Group',
    description: 'Group management & admin tools',
    commands: ['kick', 'add', 'promote', 'demote', 'mute', 'unmute', 'hidetag', 'tagall', 'antilink', 'welcome', 'warn', 'groupinfo']
  },
  fun: {
    emoji: '🎭',
    name: 'Fun',
    description: 'Jokes, quotes, memes & entertainment',
    commands: ['joke', 'quote', 'fact', 'meme', 'pickup', 'insult', 'compliment', 'advice', 'riddle', 'lyrics', 'anime', 'waifu', 'neko']
  },
  search: {
    emoji: '🔍',
    name: 'Search',
    description: 'Search Google, YouTube, images & more',
    commands: ['google', 'youtube', 'image', 'gif', 'playstore', 'github', 'npm', 'imdb', 'movie', 'manga']
  },
  image: {
    emoji: '🖼️',
    name: 'Image',
    description: 'Image editing, filters & effects',
    commands: ['blur', 'removebg', 'enhance', 'cartoon', 'pixelate', 'invert', 'grayscale', 'sepia', 'rotate', 'mirror', 'wanted', 'jail']
  },
  audio: {
    emoji: '🔊',
    name: 'Audio',
    description: 'Audio effects, filters & conversions',
    commands: ['bass', 'blown', 'slow', 'fast', 'reverse', 'nightcore', 'earrape', 'deep', 'robot', 'chipmunk', '8d', 'echo']
  },
  primbon: {
    emoji: '🔮',
    name: 'Primbon',
    description: 'Fortune telling, zodiac & horoscope',
    commands: ['zodiac', 'horoscope', 'tarot', 'shio', 'artinama', 'jodoh', 'ramalan', 'mimpi', 'numerology', 'fengshui']
  },
  owner: {
    emoji: '👑',
    name: 'Owner',
    description: 'Bot owner management commands',
    commands: ['addprem', 'delprem', 'ban', 'unban', 'broadcast', 'setname', 'setbio', 'restart', 'shutdown', 'mode', 'eval', 'exec']
  }
};

// Show category modal
function showCategory(categoryId) {
  const cat = categories[categoryId];
  if (!cat) return;

  const modal = document.getElementById('commandModal');
  const title = document.getElementById('modalTitle');
  const content = document.getElementById('modalContent');

  title.innerHTML = `${cat.emoji} ${cat.name} Commands`;
  content.innerHTML = `
    <p class="text-gray-300 mb-4">${cat.description}</p>
    <div class="space-y-2">
      ${cat.commands.map(cmd => `
        <div class="bg-white/10 rounded-lg p-3 hover:bg-white/20 transition cursor-pointer">
          <code class="text-green-400">.${cmd}</code>
        </div>
      `).join('')}
    </div>
  `;

  modal.classList.remove('hidden');
}

// Close modal
function closeModal() {
  document.getElementById('commandModal').classList.add('hidden');
}

// Close modal on background click
document.getElementById('commandModal')?.addEventListener('click', (e) => {
  if (e.target.id === 'commandModal') {
    closeModal();
  }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Stats counter animation
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  const timer = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  // Animate stats on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('[data-count]');
        counters.forEach(counter => {
          const target = parseInt(counter.dataset.count);
          animateCounter(counter, target);
        });
        observer.unobserve(entry.target);
      }
    });
  });

  const statsSection = document.querySelector('#stats');
  if (statsSection) observer.observe(statsSection);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { categories, showCategory, closeModal };
}
