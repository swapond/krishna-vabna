// Theme Manager - Handles dark/light mode switching
class ThemeManager {
    constructor() {
        this.themeKey = 'theme';
        this.initialize();
    }

    initialize() {
        const savedTheme = localStorage.getItem(this.themeKey) || 'dark';
        this.applyTheme(savedTheme);
    }

    applyTheme(theme) {
        const html = document.documentElement;
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle?.querySelector('i');

        if (theme === 'light') {
            html.classList.remove('dark');
            if (themeIcon) themeIcon.className = 'fas fa-sun text-lg';
        } else {
            html.classList.add('dark');
            if (themeIcon) themeIcon.className = 'fas fa-moon text-lg';
        }

        localStorage.setItem(this.themeKey, theme);
    }

    toggleTheme() {
        const html = document.documentElement;
        const newTheme = html.classList.contains('dark') ? 'light' : 'dark';
        this.applyTheme(newTheme);
        return newTheme;
    }

    getCurrentTheme() {
        return localStorage.getItem(this.themeKey) || 'dark';
    }
}

export default ThemeManager;
