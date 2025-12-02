# Huddle Moderator

A modern, accessible web application for managing speaker order during huddles. Built with vanilla HTML, CSS, and JavaScript—no frameworks or external dependencies. Runs perfectly on GitHub Pages.

## ✨ Features

- **Speaker Management**: Add, remove, and manage speakers in real-time
- **Shuffle & Sort**: Randomize speaker order with a single click
- **Sequential Navigation**: Move to the next speaker with automatic timer reset
- **Manual Timer**: Fully manual 2-minute timer with start, pause, and reset controls
- **Light/Dark Mode**: Toggle between light and dark themes with system preference detection
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Persistent State**: Speakers and settings saved to browser localStorage (optional)
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **GitHub Pages Ready**: Deploy instantly with zero configuration

## 🎯 Use Cases

- **Standup Meetings**: Manage speaking order for team huddles
- **Panel Discussions**: Control speaker rotation and track time
- **Class Presentations**: Organize student presentation order
- **Brainstorming Sessions**: Shuffle participation order dynamically

## 🚀 Quick Start

### Local Usage
1. Clone or download this repository
2. Open `index.html` in any modern web browser
3. Start adding speakers and managing your huddle

### Deploy to GitHub Pages

**Option 1: Direct Repository**
1. Fork or clone this repository to your GitHub account
2. Go to repository **Settings** → **Pages**
3. Set source to `main` branch
4. Your site will be live at: `https://<your-username>.github.io/huddle-moderator`

**Option 2: User/Organization Site**
1. Create a repository named `<your-username>.github.io`
2. Add `index.html`, `styles.css`, and `script.js` to the repo
3. Push to main branch
4. Visit: `https://<your-username>.github.io`

**Option 3: Project Subdirectory**
1. Push to any repository
2. Enable GitHub Pages in Settings
3. Access at: `https://<your-username>.github.io/<repo-name>`

## 📖 How to Use

### Adding Speakers
- Type a speaker name in the **"Add Speaker"** input field
- Press Enter or click the **"Add Speaker"** button
- Speakers appear in the queue list in order

### Managing the Queue
- **Shuffle**: Click the shuffle button to randomize speaker order
- **Next Speaker**: Click to move to the next speaker (auto-resets timer)
- **Remove**: Hover over a speaker card and click the ✕ button

### Timer Control
- **Start**: Click "Start" to begin counting down
- **Pause**: Click "Pause" to stop the timer
- **Reset**: Click "Reset" to return to 2:00
- **Keyboard Shortcut**: Press Space (when not in input field) to start/pause

### Theme
- Click the moon/sun icon in the header to toggle dark/light mode
- Theme preference is saved automatically

## 🎨 Design Features

### Modern UI Components
- Semantic, accessible HTML structure
- Responsive CSS Grid & Flexbox layouts
- Smooth animations and transitions
- Soft shadows and rounded corners
- Monospaced font timer for digital readability

### Color Scheme
- **Light Mode**: Clean, bright palette (#F5F7FA background, #111827 text)
- **Dark Mode**: Eye-friendly dark palette (#0F172A background, #F8FAFC text)
- **Accent**: Vibrant blue (#3B82F6) with hover/active states

### Responsive Breakpoints
- **Desktop** (1024px+): Full two-column layout
- **Tablet** (768px–1023px): Stacked sections
- **Mobile** (< 768px): Optimized single-column layout

## 💾 Data Persistence

Speakers and settings are automatically saved to browser **localStorage**:
- Speaker list persists across sessions
- Active speaker index is maintained
- Timer state is preserved (time-left, running status)
- Theme preference is saved
- **No data is sent to any server** (fully client-side)

To clear data: Open browser DevTools → Application → LocalStorage → Delete `huddleModerator`

## ♿ Accessibility

- **WCAG AA Color Contrast** (≥ 4.5:1 for text)
- **Keyboard Navigation**: Tab through controls, Enter/Space to activate
- **Focus Indicators**: Visible 2px blue outline
- **Screen Reader Support**: Announcements for speaker changes via `aria-live`
- **Semantic HTML**: Proper heading levels, labels, and roles
- **Monospaced Timer Font**: Easy to read at a glance

## 📁 Project Structure

```
huddle-moderator/
├── index.html       # Semantic structure & layout
├── styles.css       # Modern theme with tokens & responsive rules
├── script.js        # Event handlers, state management, logic
└── README.md        # This file
```

## 🛠️ Technical Details

### No External Dependencies
- Pure vanilla HTML5, CSS3, and JavaScript (ES6+)
- Zero npm packages, no build step required
- Fast load time (optimized for GitHub Pages)
- Works offline after initial load

### Design Tokens (CSS Variables)
```css
--color-bg: #f5f7fa              /* Background color */
--color-surface: #ffffff          /* Card/container backgrounds */
--color-text: #111827             /* Primary text color */
--color-accent: #3b82f6          /* Interactive elements */
--radius-md: 0.5rem              /* Border radius */
--shadow-md: 0 4px 6px ...       /* Subtle elevation */
--duration-base: 250ms           /* Animation timing */
```

### State Management
- Simple object-based state container
- Pure functions for updates
- localStorage integration for persistence
- Memory cleanup on page unload

## 🌙 Dark Mode

- Automatic detection of system preference (`prefers-color-scheme`)
- Manual toggle via header button
- Smooth transitions between themes
- All tokens adapted for both light and dark

## 🔧 Customization

### Change Default Timer
Edit `script.js`:
```javascript
const DEFAULT_TIMER = 120; // Change to desired seconds
```

### Modify Colors
Edit `styles.css` `:root` section:
```css
:root {
  --color-accent: #0078d4; /* Windows Blue */
  --color-bg: #ffffff;     /* Custom background */
}
```

### Adjust Animations
Edit CSS animation durations:
```css
--duration-base: 150ms;  /* Faster animations */
--easing: cubic-bezier(0.4, 0, 0.2, 1);
```

## 🐛 Browser Support

- **Chrome/Edge**: ✅ Latest 2 versions
- **Firefox**: ✅ Latest 2 versions
- **Safari**: ✅ Latest 2 versions
- **Mobile browsers**: ✅ iOS Safari, Chrome Android

## 📝 Version History

- **v2.0** (Dec 2025): Complete redesign with modern UI, dark mode, accessibility improvements
- **v1.0**: Original functional version

## 📄 License

See LICENSE file for details.

## 🤝 Contributing

Suggestions for improvements? Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Built for teams that huddle together.** 🎯
