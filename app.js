// Main Application - Orchestrates all modules
import StorageManager from './js/storage.js';
import UIManager from './js/ui.js';
import ThemeManager from './js/theme.js';
import AudioManager from './js/audio.js';
import DialogManager from './js/dialog.js';
import DataUtils from './js/dataUtils.js';

class ChantingTracker {
    constructor() {
        // Initialize all managers
        this.storage = new StorageManager();
        this.ui = new UIManager();
        this.theme = new ThemeManager();
        this.audio = new AudioManager();
        this.dialog = new DialogManager();

        // Application state
        this.currentBeads = 0;
        this.currentRounds = 0;
        this.isCompletingRound = false;

        // Load data and initialize
        this.data = this.storage.loadData();
        this.currentBeads = this.data.currentBeads || 0;
        this.dailyGoal = this.data.dailyGoal;

        this.bindEvents();
        this.updateDisplay();
        this.initializeAudioControls();
        this.initializeAutoScroll();
        this.initializeGoalSlider();
    }

    bindEvents() {
        // Main chanting action
        this.ui.elements.chantButton.addEventListener('click', () => this.chantBead());

        // Goal setting with slider
        this.ui.elements.goalSlider?.addEventListener('input', () => this.handleGoalSliderChange());

        // Theme toggle
        this.ui.elements.themeToggle.addEventListener('click', () => this.theme.toggleTheme());

        // Reset buttons
        this.ui.elements.resetBeadsButton.addEventListener('click', () => this.resetBeads());
        this.ui.elements.resetRoundButton?.addEventListener('click', () => this.resetRound());
        this.ui.elements.resetAllButton.addEventListener('click', () => this.resetAll());
        this.ui.elements.clearEverythingButton.addEventListener('click', () => this.clearEverything());

        // Enhanced keyboard controls like in provided code
        document.addEventListener('keyup', (e) => {
            if (e.key === 'Enter' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                this.chantBead();
            }
        });

        // Spacebar for chanting (existing)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                this.chantBead();
            }
        });

        // Scroll button functionality
        this.ui.elements.scrollButton?.addEventListener('click', () => this.scrollToCounter());

        // Collapsible options functionality
        this.initializeCollapsibleSections();
    }

    initializeCollapsibleSections() {
        // Options toggle
        const toggleOptionsBtn = document.getElementById('toggleOptionsBtn');
        const advancedOptions = document.getElementById('advancedOptions');
        const optionsChevron = document.getElementById('optionsChevron');

        if (toggleOptionsBtn && advancedOptions) {
            toggleOptionsBtn.addEventListener('click', () => {
                const isHidden = advancedOptions.classList.contains('hidden');
                if (isHidden) {
                    advancedOptions.classList.remove('hidden');
                    optionsChevron.classList.add('rotate-180');
                    toggleOptionsBtn.querySelector('span').textContent = 'Less';
                } else {
                    advancedOptions.classList.add('hidden');
                    optionsChevron.classList.remove('rotate-180');
                    toggleOptionsBtn.querySelector('span').textContent = 'More';
                }
            });
        }

        // Voice settings visibility based on voice toggle
        this.updateVoiceSettingsVisibility();
    }

    updateVoiceSettingsVisibility() {
        const voiceToggle = document.getElementById('voiceChantingToggle');
        const voiceSettings = document.getElementById('voiceSettings');

        if (voiceToggle && voiceSettings) {
            const updateVisibility = () => {
                if (voiceToggle.checked) {
                    voiceSettings.classList.remove('hidden');
                } else {
                    voiceSettings.classList.add('hidden');
                }
            };

            // Set initial visibility
            updateVisibility();

            // Update visibility when toggle changes
            voiceToggle.addEventListener('change', updateVisibility);
        }
    }

    chantBead() {
        if (this.isCompletingRound) return;

        this.currentBeads++;
        this.ui.addChantButtonFeedback();
        this.audio.playChantSound();
        this.updateBeadDisplay();
        this.saveData();

        // Auto-scroll to counter like in provided code
        this.autoScrollToCounter();

        // Auto-complete round when 108 beads are reached
        if (this.currentBeads >= 108 && !this.isCompletingRound) {
            this.isCompletingRound = true;
            setTimeout(() => this.completeRound(), 500);
        }
    }

    completeRound() {
        // Reset beads and increment round
        this.currentBeads = 0;
        this.currentRounds++;
        this.isCompletingRound = false;

        // Update data
        const today = DataUtils.getTodayKey();
        this.data.dailyHistory[today] = (this.data.dailyHistory[today] || 0) + 1;
        this.data.totalRounds++;

        // Update streak
        DataUtils.updateStreak(this.data);

        // Add activity and save
        DataUtils.addActivity(this.data, `Completed round ${DataUtils.getTodayCount(this.data.dailyHistory)}`, 'round');
        this.saveData();
        this.updateDisplay();

        // Show completion feedback and play notification
        this.ui.showRoundCompletion();
        this.ui.showMessage('Round completed! 🙏', 'success');
        this.audio.playNotification();

        // Check if daily goal is reached
        if (DataUtils.getTodayCount(this.data.dailyHistory) >= this.data.dailyGoal) {
            this.showGoalAchieved();
        }
    }

    // New method: Reset only rounds (like in provided code)
    resetRound() {
        this.dialog.showConfirmDialog(
            'Reset Completed Rounds?\n\nThis will clear all rounds you\'ve completed today while keeping your current bead progress intact. Your overall statistics and streak will remain unchanged.',
            () => {
                const today = DataUtils.getTodayKey();
                const roundsToReset = this.data.dailyHistory[today] || 0;

                this.data.dailyHistory[today] = 0;
                this.data.totalRounds = Math.max(0, this.data.totalRounds - roundsToReset);
                this.currentRounds = 0;

                DataUtils.addActivity(this.data, 'Reset completed rounds', 'reset');
                this.saveData();
                this.updateDisplay();
                this.ui.showMessage('Rounds reset!', 'success');
            },
            'warning'
        );
    }

    // Auto-scroll functionality like in provided code
    autoScrollToCounter() {
        const counterElement = this.ui.elements.chantButton;
        if (counterElement) {
            counterElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    scrollToCounter() {
        const counterElement = this.ui.elements.chantButton;
        if (counterElement) {
            const targetPosition = counterElement.getBoundingClientRect().top;
            window.scrollBy({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    initializeAutoScroll() {
        // Auto scroll to counter on page load like in provided code
        window.addEventListener('load', () => {
            const counterElement = this.ui.elements.chantButton;
            if (counterElement) {
                const offset = counterElement.getBoundingClientRect().top;
                window.scrollBy({
                    top: offset,
                    behavior: 'smooth'
                });
            }
        });
    }

    initializeAudioControls() {
        // Get current audio settings
        const audioSettings = this.audio.getSettings();
        console.log('Initializing audio controls with settings:', audioSettings);

        // Update UI with loaded settings - this is crucial for page refresh
        this.ui.updateAudioSettings(audioSettings);

        // Setup test voice button
        this.ui.setupTestVoiceButton(this.audio);

        // Setup modern control event listeners
        this.setupModernAudioControls();

        // Force a UI update after a short delay to ensure DOM is ready
        setTimeout(() => {
            this.ui.updateAudioSettings(audioSettings);
            console.log('Audio controls initialized and UI updated');
        }, 100);
    }

    setupModernAudioControls() {
        // Voice selector
        if (this.ui.elements.voiceSelect) {
            this.ui.elements.voiceSelect.addEventListener('change', (e) => {
                this.audio.setVoice(e.target.value);
                this.ui.showMessage(`Voice changed to ${this.audio.voices[e.target.value].name}`, 'success');
            });
        }

        // Speed slider (replacing radio buttons)
        if (this.ui.elements.speedSlider) {
            this.ui.elements.speedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                this.audio.setPlaybackRate(speed);
                this.ui.updateSpeedDisplay(speed);
                this.ui.showMessage(`Speed changed to ${speed}×`, 'success');
            });
        }

        // Voice chanting toggle (new feature)
        if (this.ui.elements.voiceChantingToggle) {
            this.ui.elements.voiceChantingToggle.addEventListener('change', (e) => {
                const enabled = this.audio.toggleVoiceChanting();
                this.ui.updateVoiceChantingToggle(enabled);
                this.ui.showMessage(`Voice chanting ${enabled ? 'enabled' : 'disabled'}`, 'success');
            });
        }

        // Bead sound toggle
        if (this.ui.elements.beadSoundToggle) {
            this.ui.elements.beadSoundToggle.addEventListener('change', (e) => {
                const enabled = this.audio.toggleBeadSound();
                this.ui.updateBeadSoundToggle(enabled);
                this.ui.showMessage(`Bead sounds ${enabled ? 'enabled' : 'disabled'}`, 'success');
            });
        }

        // Notification toggle
        if (this.ui.elements.notificationToggle) {
            this.ui.elements.notificationToggle.addEventListener('change', (e) => {
                const enabled = this.audio.toggleNotifications();
                this.ui.updateNotificationToggle(enabled);
                this.ui.showMessage(`Notifications ${enabled ? 'enabled' : 'disabled'}`, 'success');
            });
        }
    }

    // Remove duplicate methods and keep only the modern ones
    setupVoiceSelector() {
        // This is now handled by setupModernAudioControls
        console.log('Legacy voice selector setup - using modern controls instead');
    }

    setupSpeedSelector() {
        // This is now handled by setupModernAudioControls
        console.log('Legacy speed selector setup - using modern controls instead');
    }

    setupNotificationToggle() {
        // This is now handled by setupModernAudioControls
        console.log('Legacy notification toggle setup - using modern controls instead');
    }

    setDailyGoal() {
        const newGoal = DataUtils.validateGoal(this.ui.getDailyGoalInput());

        if (newGoal) {
            this.data.dailyGoal = newGoal;
            this.dailyGoal = newGoal;
            DataUtils.addActivity(this.data, `Set daily goal to ${newGoal} rounds`, 'goal');
            this.saveData();
            this.updateDisplay();
            this.ui.showMessage('Daily goal updated!', 'success');
        } else {
            this.ui.showMessage('Please enter a goal between 1 and 64 rounds', 'error');
        }
    }

    handleGoalSliderChange() {
        const sliderValue = parseInt(this.ui.elements.goalSlider.value);
        const goalValues = [1, 4, 8, 16, 32, 48, 64];
        const newGoal = goalValues[sliderValue];

        // Update the display value immediately
        if (this.ui.elements.goalDisplayValue) {
            this.ui.elements.goalDisplayValue.textContent = newGoal;
        }

        // Update the goal marks highlighting
        this.updateGoalMarks(newGoal);

        // Save the new goal
        this.data.dailyGoal = newGoal;
        this.dailyGoal = newGoal;
        DataUtils.addActivity(this.data, `Set daily goal to ${newGoal} rounds`, 'goal');
        this.saveData();
        this.updateDisplay();

        // Show feedback message
        this.ui.showMessage(`Daily goal set to ${newGoal} rounds`, 'success');
    }

    updateGoalMarks(selectedValue) {
        const goalMarks = document.querySelectorAll('.goal-mark');
        goalMarks.forEach(mark => {
            const value = parseInt(mark.dataset.value);
            if (value === selectedValue) {
                mark.classList.add('font-semibold', 'text-krishna-orange');
                mark.classList.remove('text-gray-400');
            } else {
                mark.classList.remove('font-semibold', 'text-krishna-orange');
                mark.classList.add('text-gray-400');
            }
        });
    }

    initializeGoalSlider() {
        // Set initial slider position based on current goal
        const goalValues = [1, 4, 8, 16, 32, 48, 64];
        const currentGoal = this.data.dailyGoal;
        const sliderPosition = goalValues.indexOf(currentGoal);

        if (this.ui.elements.goalSlider && sliderPosition !== -1) {
            this.ui.elements.goalSlider.value = sliderPosition;
        }

        // Update initial display
        if (this.ui.elements.goalDisplayValue) {
            this.ui.elements.goalDisplayValue.textContent = currentGoal;
        }

        // Update goal marks
        this.updateGoalMarks(currentGoal);
    }

    updateDisplay() {
        const todayCount = DataUtils.getTodayCount(this.data.dailyHistory);
        const progress = DataUtils.calculateProgress(todayCount, this.data.dailyGoal);

        this.ui.updateStats(todayCount, this.data.streak, this.data.totalRounds);
        this.ui.updateGoalDisplay(this.data.dailyGoal);
        this.ui.updateProgressCircle(progress);
        this.updateBeadDisplay();
        this.ui.updateActivityList(this.data.recentActivity);
    }

    updateBeadDisplay() {
        this.ui.updateBeadDisplay(this.currentBeads);
    }

    showGoalAchieved() {
        this.ui.showGoalAchievement();
        this.ui.showMessage(`🎉 Daily goal of ${this.data.dailyGoal} rounds achieved!`, 'success');
    }

    resetBeads() {
        this.dialog.showConfirmDialog(
            'Reset Current Bead Count?\n\nThis will clear your current bead progress (0-108) without affecting completed rounds or your overall statistics. Use this if you need to restart your current round.',
            () => {
                this.currentBeads = 0;
                this.data.currentBeads = 0;
                DataUtils.addActivity(this.data, 'Cleared bead count', 'reset');
                this.saveData();
                this.updateDisplay();
                this.ui.showMessage('Beads cleared!', 'success');
            },
            'warning'
        );
    }

    resetAll() {
        this.dialog.showConfirmDialog(
            'Reset Today\'s Progress?\n\nThis will clear today\'s completed rounds and current bead count, giving you a fresh start for today. Your historical data, streak, and total lifetime rounds will be preserved.',
            () => {
                // Reset current progress but preserve historical data
                this.currentBeads = 0;
                DataUtils.resetCurrentProgress(this.data);
                DataUtils.addActivity(this.data, 'Reset current progress', 'reset');
                this.saveData();
                this.updateDisplay();
                this.ui.showMessage('Current progress cleared! Streak & total preserved.', 'success');
            },
            'warning'
        );
    }

    clearEverything() {
        this.dialog.showConfirmDialog(
            'Permanent Data Reset?\n\nThis will permanently delete ALL your chanting data including:\n• All completed rounds\n• Historical statistics\n• Activity history\n• Daily streaks\n\nOnly your theme preference will be preserved. This action cannot be undone.',
            () => {
                // Clear everything except theme
                this.storage.clearEverythingExceptTheme();

                // Reset application state to defaults
                this.data = this.storage.getDefaultData();
                this.currentBeads = 0;
                this.currentRounds = 0;
                this.isCompletingRound = false;
                this.dailyGoal = this.data.dailyGoal;

                // Save the fresh data and update display
                this.saveData();
                this.updateDisplay();
                this.ui.showMessage('Everything cleared! Theme preserved.', 'success');
            },
            'danger'
        );
    }

    saveData() {
        this.data.currentBeads = this.currentBeads;
        this.storage.saveData(this.data);
    }

    // Export/Import functionality
    exportData() {
        this.storage.exportData(this.data);
    }

    importData(jsonData) {
        try {
            const importedData = this.storage.importData(jsonData);
            this.data = { ...this.data, ...importedData };
            this.saveData();
            this.updateDisplay();
            this.ui.showMessage('Data imported successfully!', 'success');
        } catch (error) {
            this.ui.showMessage('Error importing data. Please check the file format.', 'error');
        }
    }

    toggleBeadSound() {
        const isEnabled = this.audio.toggleBeadSound();
        this.ui.updateBeadSoundStatus(isEnabled);
        this.ui.showMessage(`Bead sound ${isEnabled ? 'enabled' : 'disabled'}`, 'success');
    }

    toggleRoundSound() {
        const isEnabled = this.audio.toggleRoundSound();
        this.ui.updateRoundSoundStatus(isEnabled);
        this.ui.showMessage(`Round sound ${isEnabled ? 'enabled' : 'disabled'}`, 'success');
    }

    showVoiceSelector() {
        const voices = this.audio.getAvailableVoices();
        const currentVoice = this.audio.getCurrentVoice();

        // Create a simple voice selection dialog
        this.dialog.showConfirmDialog(
            `Select chanting voice:\n\nCurrent: ${currentVoice.name}\n\nAvailable voices:\n${voices.map((v, i) => `${i + 1}. ${v.name}`).join('\n')}\n\nClick a voice to test and select:`,
            () => {
                // For now, cycle to next voice
                const currentIndex = voices.findIndex(v => v.key === currentVoice.key);
                const nextIndex = (currentIndex + 1) % voices.length;
                const newVoice = voices[nextIndex];

                this.audio.setVoice(newVoice.key);
                this.audio.testVoice(newVoice.key);
                this.ui.updateSelectedVoice(newVoice.name);
                this.ui.showMessage(`Voice changed to ${newVoice.name}`, 'success');
            },
            'warning'
        );
    }

    // Initialize audio UI on startup
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chantingTracker = new ChantingTracker();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    .celebration {
        animation: celebration 0.5s ease-in-out;
    }
    
    @keyframes celebration {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .scale-95 {
        transform: scale(0.95);
    }
    
    /* Light mode styles */
    html:not(.dark) {
        color-scheme: light;
    }
    
    html:not(.dark) body {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        color: rgb(30 41 59);
        min-height: 100vh;
    }
    
    html:not(.dark) .bg-gray-900 {
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%) !important;
    }
    
    html:not(.dark) header {
        background: rgba(255, 255, 255, 0.85) !important;
        backdrop-filter: blur(20px);
        border-color: rgba(203, 213, 225, 0.6) !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    html:not(.dark) .stats-card,
    html:not(.dark) [class*="bg-gray-800"] {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 1px solid rgba(203, 213, 225, 0.6) !important;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    
    html:not(.dark) .bg-gray-800\/50 {
        background: rgba(255, 255, 255, 0.85) !important;
        backdrop-filter: blur(20px);
        border-color: rgba(203, 213, 225, 0.6) !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    
    html:not(.dark) .bg-gray-800\/30 {
        background: rgba(255, 255, 255, 0.9) !important;
        border: 1px solid rgba(203, 213, 225, 0.6) !important;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    }
    
    html:not(.dark) .bg-gray-700 {
        background: rgba(248, 250, 252, 0.95) !important;
        border-color: rgba(203, 213, 225, 0.8) !important;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    html:not(.dark) .bg-gray-700:hover {
        background: rgba(241, 245, 249, 1) !important;
        border-color: rgba(148, 163, 184, 0.6) !important;
    }
    
    html:not(.dark) .bg-gray-600:hover {
        background: rgba(226, 232, 240, 1) !important;
    }
    
    html:not(.dark) .text-white {
        color: rgb(30 41 59) !important;
    }
    
    html:not(.dark) .text-gray-400 {
        color: rgb(100 116 139) !important;
    }
    
    html:not(.dark) .text-gray-500 {
        color: rgb(100 116 139) !important;
    }
    
    html:not(.dark) .border-gray-700 {
        border-color: rgba(203, 213, 225, 0.6) !important;
    }
    
    html:not(.dark) .border-gray-700\/50 {
        border-color: rgba(203, 213, 225, 0.4) !important;
    }
    
    html:not(.dark) .border-gray-600 {
        border-color: rgba(148, 163, 184, 0.6) !important;
    }
    
    html:not(.dark) .stats-card {
        background: rgba(255, 255, 255, 0.95) !important;
        border: 1px solid rgba(203, 213, 225, 0.5) !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        backdrop-filter: blur(10px);
    }
    
    html:not(.dark) .text-white\/30 {
        color: rgba(30, 41, 59, 0.4) !important;
    }
    
    html:not(.dark) .text-white\/80 {
        color: rgba(30, 41, 59, 0.85) !important;
    }
    
    html:not(.dark) .text-white\/90 {
        color: rgba(30, 41, 59, 0.95) !important;
    }
    
    html:not(.dark) input[type="number"] {
        background: rgba(255, 255, 255, 0.9) !important;
        color: rgb(30 41 59) !important;
        border-color: rgba(203, 213, 225, 0.7) !important;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    }
    
    html:not(.dark) input[type="number"]:focus {
        border-color: #FF6B35 !important;
        outline: none;
        box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.15), inset 0 1px 2px rgba(0, 0, 0, 0.05);
        background: rgba(255, 255, 255, 1) !important;
    }
    
    /* Light mode chanting card - keep the beautiful gradient! */
    html:not(.dark) #chantButton {
        box-shadow: 0 20px 25px -5px rgba(255, 107, 53, 0.25), 0 10px 10px -5px rgba(255, 107, 53, 0.1);
    }
    
    html:not(.dark) #chantButton:hover {
        box-shadow: 0 25px 30px -5px rgba(255, 107, 53, 0.3), 0 15px 15px -5px rgba(255, 107, 53, 0.15);
    }
    
    html:not(.dark) #chantButton .text-white {
        color: rgb(255 255 255) !important;
    }
    
    html:not(.dark) #chantButton .text-white\/30 {
        color: rgba(255, 255, 255, 0.4) !important;
    }
    
    html:not(.dark) #chantButton .text-white\/80 {
        color: rgba(255, 255, 255, 0.85) !important;
    }
    
    html:not(.dark) #chantButton .text-white\/90 {
        color: rgba(255, 255, 255, 0.95) !important;
    }
    
    /* Light mode control buttons */
    html:not(.dark) #resetBeadsButton {
        background: linear-gradient(135deg, #f59e0b, #d97706) !important;
        color: rgb(255 255 255) !important;
        border: none !important;
        box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.3);
    }
    
    html:not(.dark) #resetBeadsButton:hover {
        background: linear-gradient(135deg, #d97706, #b45309) !important;
        box-shadow: 0 6px 8px -1px rgba(245, 158, 11, 0.4);
        transform: translateY(-1px);
    }
    
    html:not(.dark) #resetAllButton {
        background: linear-gradient(135deg, #dc2626, #991b1b) !important;
        color: rgb(255 255 255) !important;
        border: none !important;
        box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.3);
    }
    
    html:not(.dark) #resetAllButton:hover {
        background: linear-gradient(135deg, #991b1b, #7f1d1d) !important;
        box-shadow: 0 6px 8px -1px rgba(220, 38, 38, 0.4);
        transform: translateY(-1px);
    }
    
    html:not(.dark) #setGoalButton {
        background: linear-gradient(135deg, #FF6B35, #F7931E) !important;
        color: rgb(255 255 255) !important;
        border: none !important;
        box-shadow: 0 4px 6px -1px rgba(255, 107, 53, 0.3);
    }
    
    html:not(.dark) #setGoalButton:hover {
        background: linear-gradient(135deg, #F7931E, #e8850e) !important;
        box-shadow: 0 6px 8px -1px rgba(255, 107, 53, 0.4);
        transform: translateY(-1px);
    }
    
    /* Light mode clear everything button */
    html:not(.dark) #clearEverythingButton {
        background: linear-gradient(135deg, #9333ea, #7c3aed) !important;
        color: rgb(255 255 255) !important;
        border: none !important;
        box-shadow: 0 4px 6px -1px rgba(147, 51, 234, 0.3);
    }
    
    html:not(.dark) #clearEverythingButton:hover {
        background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
        box-shadow: 0 6px 8px -1px rgba(147, 51, 234, 0.4);
        transform: translateY(-1px);
    }
    
    /* Light mode popup dialog */
    html:not(.dark) .bg-gray-900\/95 {
        background: rgba(255, 255, 255, 0.95) !important;
        border-color: rgba(203, 213, 225, 0.8) !important;
        backdrop-filter: blur(20px);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }
    
    html:not(.dark) .bg-gray-700\/80 {
        background: rgba(241, 245, 249, 0.9) !important;
        color: rgb(30 41 59) !important;
        border: 1px solid rgba(203, 213, 225, 0.6);
    }
    
    html:not(.dark) .bg-gray-700\/80:hover {
        background: rgba(226, 232, 240, 1) !important;
        border-color: rgba(148, 163, 184, 0.8);
    }
    
    html:not(.dark) .bg-gray-600\/80 {
        background: rgba(241, 245, 249, 0.9) !important;
        color: rgb(30 41 59) !important;
    }
    
    html:not(.dark) .bg-gray-600\/80:hover {
        background: rgba(226, 232, 240, 1) !important;
    }
    
    /* Light mode popup text colors - more specific selectors */
    html:not(.dark) .bg-gray-900\/95 .text-white {
        color: rgb(30 41 59) !important;
    }
    
    html:not(.dark) .bg-gray-900\/95 .text-gray-300 {
        color: rgb(75 85 99) !important;
    }
    
    html:not(.dark) .bg-gray-900\/95 .text-gray-400 {
        color: rgb(107 114 128) !important;
    }
    
    /* Light mode popup icons - fix icon colors */
    html:not(.dark) .text-red-400 {
        color: rgb(239 68 68) !important;
    }
    
    html:not(.dark) .text-amber-400 {
        color: rgb(245 158 11) !important;
    }
    
    html:not(.dark) .text-blue-400 {
        color: rgb(59 130 246) !important;
    }
    
    /* Light mode popup icon backgrounds */
    html:not(.dark) .from-red-500\/20 {
        background: linear-gradient(to bottom right, rgba(239, 68, 68, 0.15), rgba(220, 38, 38, 0.15)) !important;
    }
    
    html:not(.dark) .from-amber-500\/20 {
        background: linear-gradient(to bottom right, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.15)) !important;
    }
    
    html:not(.dark) .from-blue-500\/20 {
        background: linear-gradient(to bottom right, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.15)) !important;
    }
    
    /* Light mode popup confirm buttons - ensure they keep gradients */
    html:not(.dark) .bg-gradient-to-r.from-red-500 {
        background: linear-gradient(to right, #ef4444, #dc2626) !important;
        color: rgb(255 255 255) !important;
    }
    
    html:not(.dark) .bg-gradient-to-r.from-krishna-orange {
        background: linear-gradient(to right, #FF6B35, #F7931E) !important;
        color: rgb(255 255 255) !important;
    }

    /* Light mode quick control button styles */
    html:not(.dark) .bg-amber-50 {
        background-color: rgb(254 252 232) !important;
    }
    
    html:not(.dark) .hover\\:bg-amber-100:hover {
        background-color: rgb(254 243 199) !important;
    }
    
    html:not(.dark) .bg-purple-50 {
        background-color: rgb(250 245 255) !important;
    }
    
    html:not(.dark) .hover\\:bg-purple-100:hover {
        background-color: rgb(243 232 255) !important;
    }
    
    html:not(.dark) .bg-blue-50 {
        background-color: rgb(239 246 255) !important;
    }
    
    html:not(.dark) .hover\\:bg-blue-100:hover {
        background-color: rgb(219 234 254) !important;
    }
    
    html:not(.dark) .bg-red-600 {
        background-color: rgb(220 38 38) !important;
    }
    
    html:not(.dark) .hover\\:bg-red-700:hover {
        background-color: rgb(185 28 28) !important;
    }
    
    /* Light mode button borders */
    html:not(.dark) .border-amber-200 {
        border-color: rgb(254 215 170) !important;
    }
    
    html:not(.dark) .hover\\:border-amber-300:hover {
        border-color: rgb(252 191 73) !important;
    }
    
    html:not(.dark) .border-purple-200 {
        border-color: rgb(233 213 255) !important;
    }
    
    html:not(.dark) .hover\\:border-purple-300:hover {
        border-color: rgb(196 181 253) !important;
    }
    
    html:not(.dark) .border-blue-200 {
        border-color: rgb(191 219 254) !important;
    }
    
    html:not(.dark) .hover\\:border-blue-300:hover {
        border-color: rgb(147 197 253) !important;
    }
    
    html:not(.dark) .border-red-600 {
        border-color: rgb(220 38 38) !important;
    }
    
    html:not(.dark) .hover\\:border-red-700:hover {
        border-color: rgb(185 28 28) !important;
    }
`;
document.head.appendChild(style);
