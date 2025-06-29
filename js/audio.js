// Audio Manager - Handles sound effects and voice selection
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.settings = {
            beadSoundEnabled: true,
            roundSoundEnabled: true,
            selectedVoice: 'prabhupada',
            playbackRate: 1.4,
            notificationsEnabled: true,
            voiceChantingEnabled: true  // New setting for voice + alert combination
        };

        // File-based voices - updated to match available sound files
        this.voices = {
            prabhupada: { name: 'Prabhupada', src: 'assets/sounds/provupad.mp3' },
            girl: { name: 'Girl Voice', src: 'assets/sounds/girl.wav' },
            // Synthetic voices for when no audio files are selected
            classic: { name: 'Classic Tone', frequency: 800 },
            gentle: { name: 'Gentle Bell', frequency: 523.25 },
            deep: { name: 'Deep Om', frequency: 261.63 },
            tibetan: { name: 'Tibetan Bowl', frequency: 660 },
            crystal: { name: 'Crystal Chime', frequency: 1047 }
        };

        // Speed options like in the provided code
        this.speeds = [
            {label: "1.00", value: 1},
            {label: "1.25", value: 1.25},
            {label: "1.40", value: 1.4},
            {label: "1.50", value: 1.5},
            {label: "1.70", value: 1.7}
        ];

        this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('audioSettings');
            if (saved) {
                const parsedSettings = JSON.parse(saved);
                // Merge with defaults to ensure all properties exist
                this.settings = {
                    beadSoundEnabled: true,
                    roundSoundEnabled: true,
                    selectedVoice: 'prabhupada',
                    playbackRate: 1.4,
                    notificationsEnabled: true,
                    voiceChantingEnabled: true,
                    ...parsedSettings
                };
                console.log('Audio settings loaded from localStorage:', this.settings);
            } else {
                console.log('No saved audio settings found, using defaults:', this.settings);
                // Save defaults to localStorage
                this.saveSettings();
            }
        } catch (error) {
            console.warn('Could not load audio settings:', error);
            // Reset to defaults on error
            this.settings = {
                beadSoundEnabled: true,
                roundSoundEnabled: true,
                selectedVoice: 'prabhupada',
                playbackRate: 1.4,
                notificationsEnabled: true,
                voiceChantingEnabled: true
            };
            this.saveSettings();
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('audioSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.warn('Could not save audio settings:', error);
        }
    }

    // Enhanced playChantSound to support proper voice selection
    playChantSound() {
        console.log('=== CHANT SOUND START ===');
        console.log('Current settings:', this.settings);

        // If bead sound is disabled, don't play anything
        if (!this.settings.beadSoundEnabled) {
            console.log('❌ Bead sound disabled, not playing anything');
            return;
        }

        const selectedVoice = this.voices[this.settings.selectedVoice];
        console.log('🎵 Selected voice:', this.settings.selectedVoice, selectedVoice);

        // Check voice chanting setting - this determines HOW we play, not WHAT we play
        if (this.settings.voiceChantingEnabled) {
            console.log('🔊 Voice chanting enabled - playing selected voice');
            this.playSelectedVoice();
        } else {
            console.log('🔕 Voice chanting disabled - playing alert only');
            this.playDefaultAlert();
        }
        console.log('=== CHANT SOUND END ===');
    }

    // NEW METHOD: Play only the selected voice (no additional alert)
    playSelectedVoice() {
        const voice = this.voices[this.settings.selectedVoice];
        console.log('🎼 Playing selected voice:', voice, 'at speed:', this.settings.playbackRate);

        if (voice && voice.src) {
            // Play audio file
            console.log('📁 Playing audio file:', voice.src);
            this.playVoiceFile(voice.src, this.settings.playbackRate);
        } else if (voice && voice.frequency) {
            // Play synthetic voice
            console.log('🎛️ Playing synthetic voice at frequency:', voice.frequency);
            this.playSyntheticVoice(voice.frequency);
        } else {
            console.warn('⚠️ Voice not found:', this.settings.selectedVoice, 'falling back to default alert');
            this.playDefaultAlert();
        }
    }

    playVoiceFile(src, playbackRate = 1) {
        console.log('Attempting to play voice file:', src, 'at rate:', playbackRate);

        // Ensure we have a valid playback rate
        const validPlaybackRate = Math.max(0.5, Math.min(2.0, playbackRate || 1));

        try {
            const audio = new Audio(src);

            // Set playback rate after audio can play
            audio.addEventListener('canplaythrough', () => {
                try {
                    audio.playbackRate = validPlaybackRate;
                    console.log('Playback rate set to:', validPlaybackRate);
                } catch (error) {
                    console.warn('Could not set playback rate:', error);
                }
            });

            // Add event listeners for debugging
            audio.addEventListener('loadstart', () => console.log('Audio loading started'));
            audio.addEventListener('canplay', () => console.log('Audio can play'));
            audio.addEventListener('error', (e) => {
                console.error('Audio error:', e);
                console.error('Error details:', e.target.error);
                // Fallback to synthetic voice
                this.playSyntheticVoice(800);
            });

            // Play the audio
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('Voice file played successfully');
                }).catch(error => {
                    console.warn('Could not play voice file:', error);
                    // Fallback to synthetic voice
                    this.playSyntheticVoice(800);
                });
            }
        } catch (error) {
            console.warn('Audio playback error:', error);
            // Fallback to synthetic voice
            this.playSyntheticVoice(800);
        }
    }

    playSyntheticVoice(frequency) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.warn('Synthetic audio error:', error);
        }
    }

    // Play notification sound for round completion
    playNotification() {
        console.log('playNotification called with settings:', this.settings);

        if (!this.settings.notificationsEnabled || !this.settings.roundSoundEnabled) {
            console.log('Notifications disabled, not playing notification');
            return;
        }

        try {
            // Since you don't have announce.wav, use a synthetic celebration sound
            this.playCelebrationSound();
        } catch (error) {
            console.warn('Notification sound error:', error);
        }
    }

    // New method to play a celebration sound for round completion
    playCelebrationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Play a sequence of tones to create a celebration effect
            const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C octave

            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                    oscillator.type = 'sine';

                    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 0.3);
                }, index * 150); // Stagger the notes
            });
        } catch (error) {
            console.warn('Celebration sound error:', error);
            // Fallback to simple notification sound
            this.playSyntheticVoice(1200);
        }
    }

    playDefaultAlert(volume = 0.6) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Use a pleasant default frequency
            oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            console.warn('Default alert sound error:', error);
        }
    }

    getVoices() {
        return this.voices;
    }

    getSpeeds() {
        return this.speeds;
    }

    setVoice(voiceKey) {
        if (this.voices[voiceKey]) {
            this.settings.selectedVoice = voiceKey;
            this.saveSettings();
        }
    }

    setPlaybackRate(rate) {
        this.settings.playbackRate = parseFloat(rate);
        this.saveSettings();
    }

    toggleNotifications() {
        this.settings.notificationsEnabled = !this.settings.notificationsEnabled;
        this.saveSettings();
        return this.settings.notificationsEnabled;
    }

    toggleBeadSound() {
        this.settings.beadSoundEnabled = !this.settings.beadSoundEnabled;
        this.saveSettings();
        return this.settings.beadSoundEnabled;
    }

    toggleRoundSound() {
        this.settings.roundSoundEnabled = !this.settings.roundSoundEnabled;
        this.saveSettings();
        return this.settings.roundSoundEnabled;
    }

    toggleVoiceChanting() {
        this.settings.voiceChantingEnabled = !this.settings.voiceChantingEnabled;
        this.saveSettings();
        return this.settings.voiceChantingEnabled;
    }

    // Enhanced test voice method that uses current UI settings
    testVoice(voiceKey = null) {
        const voiceToTest = voiceKey || this.settings.selectedVoice;
        const voice = this.voices[voiceToTest];

        console.log('=== TESTING VOICE ===');
        console.log('🎤 Testing voice:', voiceToTest, voice);
        console.log('⚡ Current speed:', this.settings.playbackRate);

        if (voice && voice.src) {
            // Test audio file with current speed setting
            console.log('📁 Testing audio file:', voice.src, 'at speed:', this.settings.playbackRate);
            this.playVoiceFile(voice.src, this.settings.playbackRate);
        } else if (voice && voice.frequency) {
            // Test synthetic voice
            console.log('🎛️ Testing synthetic voice at frequency:', voice.frequency);
            this.playSyntheticVoice(voice.frequency);
        } else {
            console.warn('⚠️ Voice not found for testing:', voiceToTest);
            // Fallback to default alert
            this.playDefaultAlert();
        }
        console.log('=== TEST COMPLETE ===');
    }

    // Get current settings for UI initialization
    getSettings() {
        return { ...this.settings };
    }
}

export default AudioManager;
