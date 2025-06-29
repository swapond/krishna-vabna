// Storage Manager - Handles all localStorage operations
class StorageManager {
    constructor() {
        this.storageKey = 'krishnaChanting';
    }

    getDefaultData() {
        return {
            totalRounds: 0,
            dailyGoal: 16,
            streak: 0,
            lastChantDate: null,
            dailyHistory: {},
            recentActivity: [],
            currentBeads: 0
        };
    }

    loadData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            const loadedData = saved ? { ...this.getDefaultData(), ...JSON.parse(saved) } : this.getDefaultData();
            return loadedData;
        } catch (error) {
            console.error('Error loading data:', error);
            return this.getDefaultData();
        }
    }

    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    clearAllData() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }

    clearEverythingExceptTheme() {
        try {
            // Preserve the theme setting
            const savedTheme = localStorage.getItem('theme');

            // Clear all localStorage
            localStorage.clear();

            // Restore the theme
            if (savedTheme) {
                localStorage.setItem('theme', savedTheme);
            }

            return true;
        } catch (error) {
            console.error('Error clearing everything:', error);
            return false;
        }
    }

    exportData(data) {
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `krishna-chanting-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    importData(jsonData) {
        try {
            return JSON.parse(jsonData);
        } catch (error) {
            throw new Error('Invalid JSON format');
        }
    }
}

export default StorageManager;
