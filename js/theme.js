// Theme Manager - Handles dark/light mode switching
class ThemeManager {
    constructor() {
        this.themeKey = 'theme';
        this.superAmoledKey = 'superAmoled';
        this.initialize();
    }

    initialize() {
        const savedTheme = localStorage.getItem(this.themeKey) || 'dark';
        const superAmoledEnabled = localStorage.getItem(this.superAmoledKey) === 'true';
        this.applyTheme(savedTheme);
        this.applySuperAmoled(superAmoledEnabled);

        // Set up Super AMOLED toggle
        const superAmoledToggle = document.getElementById('superAmoledToggle');
        if (superAmoledToggle) {
            superAmoledToggle.checked = superAmoledEnabled;
            superAmoledToggle.addEventListener('change', (e) => {
                this.toggleSuperAmoled(e.target.checked);
            });
        }
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

    applySuperAmoled(enabled) {
        const html = document.documentElement;

        if (enabled) {
            html.classList.add('super-amoled');
        } else {
            html.classList.remove('super-amoled');
        }

        localStorage.setItem(this.superAmoledKey, enabled.toString());
    }

    toggleSuperAmoled(enabled) {
        this.applySuperAmoled(enabled);
        return enabled;
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

    isSuperAmoledEnabled() {
        return localStorage.getItem(this.superAmoledKey) === 'true';
    }
}

export default ThemeManager;
