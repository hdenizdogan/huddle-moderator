/**
 * Huddle Moderator - Main Application Logic
 * Handles speaker management, timer, and theme switching
 */

// ===================================
// STATE MANAGEMENT
// ===================================

const AppState = (() => {
  const DEFAULT_TIMER = 120; // 2 minutes
  const STORAGE_KEY = 'huddleModerator';
  const THEME_KEY = 'huddleTheme';

  let speakers = [];
  let activeIndex = 0;
  let timerInterval = null;
  let timeLeft = DEFAULT_TIMER;
  let isTimerRunning = false;
  let enablePersistence = true;

  // Load state from localStorage
  const loadState = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        speakers = parsed.speakers || [];
        activeIndex = parsed.activeIndex || 0;
        timeLeft = parsed.timeLeft || DEFAULT_TIMER;
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  };

  // Save state to localStorage
  const saveState = () => {
    if (!enablePersistence) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        speakers,
        activeIndex,
        timeLeft
      }));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  };

  // Load theme preference
  const loadTheme = () => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored) {
        return stored;
      }
      // Default to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  };

  // Save theme preference
  const saveTheme = (theme) => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  };

  // Public API
  return {
    loadState,
    saveState,
    loadTheme,
    saveTheme,
    getSpeakers: () => speakers,
    setSpeakers: (newSpeakers) => { speakers = newSpeakers; saveState(); },
    addSpeaker: (name) => {
      const speaker = {
        id: Date.now(),
        name: name.trim()
      };
      speakers.push(speaker);
      saveState();
      return speaker;
    },
    removeSpeaker: (id) => {
      speakers = speakers.filter(s => s.id !== id);
      if (activeIndex >= speakers.length && activeIndex > 0) {
        activeIndex--;
      }
      saveState();
    },
    shuffleSpeakers: () => {
      for (let i = speakers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [speakers[i], speakers[j]] = [speakers[j], speakers[i]];
      }
      activeIndex = 0;
      saveState();
    },
    getActiveIndex: () => activeIndex,
    setActiveIndex: (index) => { activeIndex = index; saveState(); },
    nextSpeaker: () => {
      if (speakers.length === 0) return null;
      activeIndex = (activeIndex + 1) % speakers.length;
      saveState();
      return speakers[activeIndex];
    },
    getTimer: () => timeLeft,
    setTimer: (seconds) => { timeLeft = seconds; },
    decrementTimer: () => { timeLeft--; },
    resetTimer: () => { timeLeft = DEFAULT_TIMER; },
    isRunning: () => isTimerRunning,
    setRunning: (running) => { isTimerRunning = running; },
    getTimerInterval: () => timerInterval,
    setTimerInterval: (interval) => { timerInterval = interval; },
    getDefaultTimer: () => DEFAULT_TIMER,
    togglePersistence: (enabled) => { enablePersistence = enabled; }
  };
})();

// ===================================
// UI COMPONENTS
// ===================================

const UI = (() => {
  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    const sign = seconds < 0 ? '-' : '';
    return `${sign}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Render speaker list
  const renderSpeakers = () => {
    const listEl = document.getElementById('speakersList');
    const emptyEl = document.getElementById('speakersEmpty');
    const speakers = AppState.getSpeakers();
    const activeIndex = AppState.getActiveIndex();

    listEl.innerHTML = '';

    if (speakers.length === 0) {
      emptyEl.classList.remove('speakers-empty--hidden');
      return;
    }

    emptyEl.classList.add('speakers-empty--hidden');

    speakers.forEach((speaker, index) => {
      const li = document.createElement('li');
      li.className = `speaker-item ${index === activeIndex ? 'active' : ''}`;
      li.setAttribute('data-speaker-id', speaker.id);

      li.innerHTML = `
        <span class="speaker-item__index">${index + 1}</span>
        <span class="speaker-item__name">${escapeHtml(speaker.name)}</span>
        <button class="speaker-item__remove" title="Remove speaker" aria-label="Remove ${escapeHtml(speaker.name)}">
          ✕
        </button>
      `;

      // Remove button handler
      li.querySelector('.speaker-item__remove').addEventListener('click', (e) => {
        e.stopPropagation();
        AppState.removeSpeaker(speaker.id);
        renderSpeakers();
      });

      listEl.appendChild(li);

      // Scroll active speaker into view
      if (index === activeIndex) {
        setTimeout(() => {
          li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 0);
      }
    });
  };

  // Update timer display
  const updateTimerDisplay = () => {
    const display = document.getElementById('timerDisplay');
    display.textContent = formatTime(AppState.getTimer());
  };

  // Update start/pause button text
  const updateStartPauseBtn = () => {
    const btn = document.getElementById('startPauseText');
    btn.textContent = AppState.isRunning() ? 'Pause' : 'Start';
  };

  // Announce active speaker to screen readers
  const announceSpeaker = (speakerName) => {
    const announcement = document.getElementById('activeSpeakerAnnouncement');
    announcement.textContent = `Now speaking: ${escapeHtml(speakerName)}`;
  };

  // Escape HTML to prevent XSS
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // Public API
  return {
    formatTime,
    renderSpeakers,
    updateTimerDisplay,
    updateStartPauseBtn,
    announceSpeaker,
    escapeHtml
  };
})();

// ===================================
// EVENT HANDLERS
// ===================================

const Events = (() => {
  let isProcessing = false;

  // Guard against double-click on action buttons
  const debounce = (callback, delay = 100) => {
    return () => {
      if (isProcessing) return;
      isProcessing = true;
      callback();
      setTimeout(() => { isProcessing = false; }, delay);
    };
  };

  // Add speaker form submit
  const handleAddSpeaker = (e) => {
    e.preventDefault();
    const textarea = document.getElementById('speakerInput');
    const text = textarea.value.trim();

    if (!text) {
      alert('Please enter at least one speaker name');
      textarea.focus();
      return;
    }

    // Split by lines and add each non-empty speaker
    const names = text.split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (names.length === 0) {
      alert('Please enter at least one speaker name');
      textarea.focus();
      return;
    }

    names.forEach(name => {
      AppState.addSpeaker(name);
    });

    textarea.value = '';
    textarea.focus();
    UI.renderSpeakers();
  };

  // Shuffle speakers
  const handleShuffle = debounce(() => {
    const speakers = AppState.getSpeakers();
    if (speakers.length < 2) {
      alert('Add at least 2 speakers to shuffle');
      return;
    }
    
    // Use dice value if available, otherwise default to 1
    const shuffleCount = parseInt(window.diceValue) || 1;
    for (let i = 0; i < shuffleCount; i++) {
      AppState.shuffleSpeakers();
    }
    UI.renderSpeakers();
  });

  // Next speaker
  const handleNext = debounce(() => {
    const speakers = AppState.getSpeakers();
    if (speakers.length === 0) {
      alert('Add a speaker first');
      return;
    }
    const nextSpeaker = AppState.nextSpeaker();
    if (nextSpeaker) {
      UI.announceSpeaker(nextSpeaker.name);
      // Reset timer when moving to next speaker
      const existingInterval = AppState.getTimerInterval();
      if (existingInterval) {
        clearInterval(existingInterval);
      }
      AppState.setTimerInterval(null);
      AppState.resetTimer();
      AppState.setRunning(false);
      UI.updateTimerDisplay();
      UI.updateStartPauseBtn();
      UI.renderSpeakers();
    }
  });

  // Start/Pause timer
  const handleToggleTimer = () => {
    const isRunning = AppState.isRunning();

    if (isRunning) {
      // Pause
      const existingInterval = AppState.getTimerInterval();
      if (existingInterval) {
        clearInterval(existingInterval);
      }
      AppState.setTimerInterval(null);
      AppState.setRunning(false);
    } else {
      // Start
      const existingInterval = AppState.getTimerInterval();
      if (existingInterval) {
        clearInterval(existingInterval);
      }
      
      const interval = setInterval(() => {
        AppState.decrementTimer();
        UI.updateTimerDisplay();
      }, 1000);
      AppState.setTimerInterval(interval);
      AppState.setRunning(true);
    }

    UI.updateStartPauseBtn();
  };

  // Reset timer
  const handleResetTimer = debounce(() => {
    const existingInterval = AppState.getTimerInterval();
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    AppState.setTimerInterval(null);
    AppState.setRunning(false);
    AppState.resetTimer();
    UI.updateTimerDisplay();
    UI.updateStartPauseBtn();
  });

  // Roll the dice
  const handleDiceRoll = () => {
    const diceEl = document.getElementById('dice');
    const resultEl = document.getElementById('diceResult');
    const valueEl = document.getElementById('diceValue');

    // Add rolling animation
    diceEl.classList.add('rolling');
    resultEl.style.display = 'none';

    // Roll the dice after animation starts
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      window.diceValue = roll;

      // Update display
      diceEl.classList.remove('rolling');
      valueEl.textContent = roll;
      resultEl.style.display = 'flex';
    }, 600);
  };

  // Clear all speakers
  const handleClearAll = () => {
    if (AppState.getSpeakers().length === 0) {
      alert('No speakers to clear');
      return;
    }
    
    if (confirm('Are you sure you want to clear all speakers?')) {
      const existingInterval = AppState.getTimerInterval();
      if (existingInterval) {
        clearInterval(existingInterval);
      }
      AppState.setSpeakers([]);
      AppState.setTimerInterval(null);
      AppState.setRunning(false);
      AppState.resetTimer();
      UI.renderSpeakers();
      UI.updateTimerDisplay();
      UI.updateStartPauseBtn();
    }
  };

  // Theme toggle
  const handleThemeToggle = () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', newTheme);
    AppState.saveTheme(newTheme);

    // Update icon
    const icon = document.querySelector('.theme-toggle__icon');
    icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  };

  // Initialize event listeners
  const init = () => {
    document.getElementById('addSpeakerForm').addEventListener('submit', handleAddSpeaker);
    document.getElementById('diceBtn').addEventListener('click', handleDiceRoll);
    document.getElementById('shuffleBtn').addEventListener('click', handleShuffle);
    document.getElementById('nextBtn').addEventListener('click', handleNext);
    document.getElementById('clearBtn').addEventListener('click', handleClearAll);
    document.getElementById('startPauseBtn').addEventListener('click', handleToggleTimer);
    document.getElementById('resetTimerBtn').addEventListener('click', handleResetTimer);
    document.getElementById('themeToggle').addEventListener('click', handleThemeToggle);

    // Keyboard shortcut: Enter to add speaker (handled by form submit)
    // Keyboard shortcut: Space to toggle timer
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && e.target !== document.getElementById('speakerInput')) {
        e.preventDefault();
        handleToggleTimer();
      }
    });
  };

  return { init };
})();

// ===================================
// UTILITIES
// ===================================

const Utils = (() => {
  const getDayOfWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    // Convert Sunday (0) to Monday (1) format
    const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek;
    return dayNumber;
  };

  const updateDayWidget = () => {
    const dayValue = document.getElementById('dayValue');
    const dayNumber = getDayOfWeek();
    const dayNames = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    const dayName = dayNames[dayNumber];
    dayValue.textContent = `${dayName} - Haftanın ${dayNumber}.günü`;
  };

  return { getDayOfWeek, updateDayWidget };
})();

// ===================================
// INITIALIZATION
// ===================================

document.addEventListener('DOMContentLoaded', () => {
  // Load state
  AppState.loadState();

  // Initialize dice value
  window.diceValue = 1;

  // Set initial theme
  const theme = AppState.loadTheme();
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('.theme-toggle__icon');
  icon.textContent = theme === 'dark' ? '☀️' : '🌙';

  // Update day of week widget
  Utils.updateDayWidget();

  // Initial render
  UI.renderSpeakers();
  UI.updateTimerDisplay();
  UI.updateStartPauseBtn();

  // Attach event handlers
  Events.init();

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(AppState.getTimerInterval());
    AppState.saveState();
  });
});
