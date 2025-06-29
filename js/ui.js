// UI Manager - Handles all DOM manipulation and UI updates
class UIManager {
    constructor() {
        this.elements = {};
        this.initializeElements();
    }

    initializeElements() {
        this.elements = {
            chantButton: document.getElementById('chantButton'),
            setGoalButton: document.getElementById('setGoalButton'),
            themeToggle: document.getElementById('themeToggle'),
            goalInput: document.getElementById('goalInput'),

            // Reset buttons (including new reset round button)
            resetBeadsButton: document.getElementById('resetBeadsButton'),
            resetRoundButton: document.getElementById('resetRoundButton'),
            resetAllButton: document.getElementById('resetAllButton'),
            clearEverythingButton: document.getElementById('clearEverythingButton'),

            // Modern audio controls
            voiceSelect: document.getElementById('voiceSelect'),
            testVoiceButton: document.getElementById('testVoiceButton'),
            speedSlider: document.getElementById('speedSlider'),
            speedValue: document.getElementById('speedValue'),
            beadSoundToggle: document.getElementById('beadSoundToggle'),
            notificationToggle: document.getElementById('notificationToggle'),
            voiceChantingToggle: document.getElementById('voiceChantingToggle'),

            // Audio status icons
            beadSoundIcon: document.getElementById('beadSoundIcon'),
            notificationIcon: document.getElementById('notificationIcon'),
            voiceChantingIcon: document.getElementById('voiceChantingIcon'),
            voiceChantingStatus: document.getElementById('voiceChantingStatus'),

            // Scroll functionality
            scrollButton: document.getElementById('scrollButton'),

            // Legacy audio control buttons (if they exist)
            toggleBeadSoundButton: document.getElementById('toggleBeadSoundButton'),
            toggleRoundSoundButton: document.getElementById('toggleRoundSoundButton'),
            selectChantVoiceButton: document.getElementById('selectChantVoiceButton'),

            // Audio status elements (legacy)
            beadSoundLabel: document.getElementById('beadSoundLabel'),
            beadSoundStatus: document.getElementById('beadSoundStatus'),
            roundSoundIcon: document.getElementById('roundSoundIcon'),
            roundSoundLabel: document.getElementById('roundSoundLabel'),
            roundSoundStatus: document.getElementById('roundSoundStatus'),
            selectedVoiceStatus: document.getElementById('selectedVoiceStatus'),

            // Display elements
            todayCount: document.getElementById('todayCount'),
            streakCount: document.getElementById('streakCount'),
            totalCount: document.getElementById('totalCount'),
            currentRound: document.getElementById('currentRound'),
            beadCount: document.getElementById('beadCount'),
            beadProgress: document.getElementById('beadProgress'),
            progressCircle: document.getElementById('progressCircle'),
            goalDisplay: document.getElementById('goalDisplay'),
            activityList: document.getElementById('activityList')
        };
    }

    updateStats(todayCount, streak, totalRounds) {
        if (this.elements.todayCount) this.elements.todayCount.textContent = todayCount;
        if (this.elements.streakCount) this.elements.streakCount.textContent = streak;
        if (this.elements.totalCount) this.elements.totalCount.textContent = totalRounds;
        if (this.elements.currentRound) this.elements.currentRound.textContent = todayCount;
    }

    updateBeadDisplay(currentBeads) {
        if (this.elements.beadCount) {
            this.elements.beadCount.textContent = `${currentBeads}/108`;
        }

        if (this.elements.beadProgress) {
            const percentage = (currentBeads / 108) * 100;
            this.elements.beadProgress.style.width = `${percentage}%`;
        }
    }

    updateGoalDisplay(dailyGoal) {
        if (this.elements.goalDisplay) {
            this.elements.goalDisplay.textContent = dailyGoal;
        }

        if (this.elements.goalInput && this.elements.goalInput.value !== dailyGoal.toString()) {
            this.elements.goalInput.value = dailyGoal;
        }
    }

    updateProgressCircle(progress) {
        if (this.elements.progressCircle) {
            const circumference = 2 * Math.PI * 50; // radius = 50
            const offset = circumference - (progress / 100) * circumference;
            this.elements.progressCircle.style.strokeDashoffset = offset;
        }
    }

    getDailyGoalInput() {
        return this.elements.goalInput ? parseInt(this.elements.goalInput.value) : 16;
    }

    addChantButtonFeedback() {
        if (this.elements.chantButton) {
            this.elements.chantButton.classList.add('scale-95');
            setTimeout(() => {
                this.elements.chantButton.classList.remove('scale-95');
            }, 150);
        }
    }

    showRoundCompletion() {
        if (this.elements.chantButton) {
            this.elements.chantButton.classList.add('celebration');
            setTimeout(() => {
                this.elements.chantButton.classList.remove('celebration');
            }, 500);
        }
    }

    showGoalAchievement() {
        // Create celebration effect
        const celebration = document.createElement('div');
        celebration.innerHTML = '🎉';
        celebration.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-6xl z-50 animate-bounce';
        document.body.appendChild(celebration);

        setTimeout(() => {
            celebration.remove();
        }, 3000);
    }

    showMessage(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 translate-x-full`;

        // Set color based on type
        switch (type) {
            case 'success':
                toast.className += ' bg-green-600';
                break;
            case 'error':
                toast.className += ' bg-red-600';
                break;
            case 'warning':
                toast.className += ' bg-yellow-600';
                break;
            default:
                toast.className += ' bg-blue-600';
        }

        toast.textContent = message;
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full');
        });

        // Remove after delay
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    updateActivityList(activities) {
        if (!this.elements.activityList) return;

        this.elements.activityList.innerHTML = '';

        if (!activities || activities.length === 0) {
            this.elements.activityList.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i class="fas fa-history text-2xl mb-3"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        activities.slice(0, 10).forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'bg-gray-800/30 rounded-lg p-4 flex items-center space-x-3';

            let iconClass = 'fas fa-circle';
            let iconColor = 'text-gray-400';

            switch (activity.type) {
                case 'round':
                    iconClass = 'fas fa-check-circle';
                    iconColor = 'text-green-400';
                    break;
                case 'goal':
                    iconClass = 'fas fa-target';
                    iconColor = 'text-blue-400';
                    break;
                case 'reset':
                    iconClass = 'fas fa-undo';
                    iconColor = 'text-yellow-400';
                    break;
            }

            activityElement.innerHTML = `
                <div class="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <i class="${iconClass} ${iconColor} text-sm"></i>
                </div>
                <div class="flex-1">
                    <p class="text-white text-sm">${activity.description}</p>
                    <p class="text-gray-400 text-xs">${this.formatActivityTime(activity.timestamp)}</p>
                </div>
            `;

            this.elements.activityList.appendChild(activityElement);
        });
    }

    formatActivityTime(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now - activityTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return activityTime.toLocaleDateString();
    }

    // Audio status update methods
    updateBeadSoundStatus(isEnabled) {
        // These elements might not exist in current UI, so check first
        if (this.elements.beadSoundStatus) {
            this.elements.beadSoundStatus.textContent = isEnabled ? 'ON' : 'OFF';
        }
        if (this.elements.beadSoundIcon) {
            this.elements.beadSoundIcon.className = isEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    }

    updateRoundSoundStatus(isEnabled) {
        if (this.elements.roundSoundStatus) {
            this.elements.roundSoundStatus.textContent = isEnabled ? 'ON' : 'OFF';
        }
        if (this.elements.roundSoundIcon) {
            this.elements.roundSoundIcon.className = isEnabled ? 'fas fa-bell' : 'fas fa-bell-slash';
        }
    }

    updateSelectedVoice(voiceName) {
        if (this.elements.selectedVoiceStatus) {
            this.elements.selectedVoiceStatus.textContent = voiceName;
        }
    }

    // New methods for modern UI controls
    updateAudioSettings(settings) {
        console.log('Updating UI with audio settings:', settings);

        // Update voice selector
        if (this.elements.voiceSelect && settings.selectedVoice) {
            this.elements.voiceSelect.value = settings.selectedVoice;
        }

        // Update speed slider and display
        if (this.elements.speedSlider && settings.playbackRate) {
            this.elements.speedSlider.value = settings.playbackRate;
            this.updateSpeedDisplay(settings.playbackRate);
        }

        // Update toggle switches and icons
        this.updateBeadSoundToggle(settings.beadSoundEnabled);
        this.updateNotificationToggle(settings.notificationsEnabled);
        this.updateVoiceChantingToggle(settings.voiceChantingEnabled);
    }

    updateSpeedDisplay(speed) {
        if (this.elements.speedValue) {
            this.elements.speedValue.textContent = `${speed}×`;
        }
    }

    updateBeadSoundToggle(isEnabled) {
        if (this.elements.beadSoundToggle) {
            this.elements.beadSoundToggle.checked = isEnabled;
        }
        if (this.elements.beadSoundIcon) {
            this.elements.beadSoundIcon.className = isEnabled
                ? 'fas fa-volume-up text-blue-600 dark:text-blue-400 text-sm'
                : 'fas fa-volume-mute text-gray-400 dark:text-gray-500 text-sm';
        }
    }

    updateNotificationToggle(isEnabled) {
        if (this.elements.notificationToggle) {
            this.elements.notificationToggle.checked = isEnabled;
        }
        if (this.elements.notificationIcon) {
            this.elements.notificationIcon.className = isEnabled
                ? 'fas fa-bell text-green-600 dark:text-green-400 text-sm'
                : 'fas fa-bell-slash text-gray-400 dark:text-gray-500 text-sm';
        }
    }

    updateVoiceChantingToggle(isEnabled) {
        if (this.elements.voiceChantingToggle) {
            this.elements.voiceChantingToggle.checked = isEnabled;
        }
        if (this.elements.voiceChantingIcon) {
            this.elements.voiceChantingIcon.className = isEnabled
                ? 'fas fa-microphone text-orange-600 dark:text-orange-400 text-sm'
                : 'fas fa-microphone-slash text-gray-400 dark:text-gray-500 text-sm';
        }
        if (this.elements.voiceChantingStatus) {
            this.elements.voiceChantingStatus.textContent = isEnabled ? 'On' : 'Off';
        }

        // Show/hide voice selection and speed control cards based on voice toggle
        this.toggleVoiceRelatedCards(isEnabled);
    }

    // New method to show/hide voice-related cards
    toggleVoiceRelatedCards(isEnabled) {
        const voiceSelectionCard = document.getElementById('voiceSelectionCard');
        const speedControlCard = document.getElementById('speedControlCard');

        if (voiceSelectionCard) {
            if (isEnabled) {
                voiceSelectionCard.style.display = 'block';
                // Add smooth animation
                voiceSelectionCard.style.opacity = '0';
                voiceSelectionCard.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    voiceSelectionCard.style.transition = 'all 0.3s ease';
                    voiceSelectionCard.style.opacity = '1';
                    voiceSelectionCard.style.transform = 'translateY(0)';
                }, 10);
            } else {
                voiceSelectionCard.style.transition = 'all 0.3s ease';
                voiceSelectionCard.style.opacity = '0';
                voiceSelectionCard.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    voiceSelectionCard.style.display = 'none';
                }, 300);
            }
        }

        if (speedControlCard) {
            if (isEnabled) {
                speedControlCard.style.display = 'block';
                // Add smooth animation with slight delay
                speedControlCard.style.opacity = '0';
                speedControlCard.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    speedControlCard.style.transition = 'all 0.3s ease';
                    speedControlCard.style.opacity = '1';
                    speedControlCard.style.transform = 'translateY(0)';
                }, 50);
            } else {
                speedControlCard.style.transition = 'all 0.3s ease';
                speedControlCard.style.opacity = '0';
                speedControlCard.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    speedControlCard.style.display = 'none';
                }, 300);
            }
        }
    }

    // Test voice functionality
    setupTestVoiceButton(audioManager) {
        if (this.elements.testVoiceButton) {
            this.elements.testVoiceButton.addEventListener('click', () => {
                // Get the currently selected voice from the dropdown
                const selectedVoice = this.elements.voiceSelect ? this.elements.voiceSelect.value : null;

                // Get the current speed from the slider (this was missing!)
                const currentSpeed = this.elements.speedSlider ? parseFloat(this.elements.speedSlider.value) : 1.4;

                console.log('🧪 TEST BUTTON CLICKED');
                console.log('📢 Selected voice from UI:', selectedVoice);
                console.log('🏃 Current speed from UI:', currentSpeed);

                // Update the audio manager settings with current UI values before testing
                if (selectedVoice) {
                    audioManager.setVoice(selectedVoice);
                }
                audioManager.setPlaybackRate(currentSpeed);

                // Now test with the updated settings
                audioManager.testVoice(selectedVoice);

                // Show feedback message
                const voiceName = audioManager.voices[selectedVoice]?.name || selectedVoice;
                this.showMessage(`Testing ${voiceName} at ${currentSpeed}× speed...`, 'info');
            });
        }
    }

    // Enhanced element validation
    validateElements() {
        const required = ['chantButton', 'todayCount', 'beadCount'];
        const missing = required.filter(key => !this.elements[key]);

        if (missing.length > 0) {
            console.warn('Missing required UI elements:', missing);
        }

        return missing.length === 0;
    }
}

export default UIManager;
