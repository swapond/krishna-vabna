// Data Utilities - Helper functions for data manipulation and calculations
class DataUtils {
    static getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    static getTodayCount(dailyHistory) {
        const today = this.getTodayKey();
        return dailyHistory[today] || 0;
    }

    static updateStreak(data) {
        const today = this.getTodayKey();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayKey = yesterday.toISOString().split('T')[0];

        if (data.lastChantDate === yesterdayKey || data.lastChantDate === today) {
            // Continue streak
            if (data.lastChantDate !== today) {
                data.streak++;
            }
        } else if (data.lastChantDate !== today) {
            // Reset streak
            data.streak = 1;
        }

        data.lastChantDate = today;
        return data;
    }

    static createActivity(message, type) {
        return {
            message,
            type,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    static addActivity(data, message, type) {
        const activity = this.createActivity(message, type);
        data.recentActivity.unshift(activity);

        // Keep only last 10 activities
        if (data.recentActivity.length > 10) {
            data.recentActivity = data.recentActivity.slice(0, 10);
        }

        return data;
    }

    static validateGoal(goal) {
        const numGoal = parseInt(goal);
        return numGoal >= 1 && numGoal <= 64 ? numGoal : null;
    }

    static calculateProgress(current, total) {
        return total > 0 ? current / total : 0;
    }

    static resetCurrentProgress(data) {
        // Clear current session data, preserve historical data
        const today = this.getTodayKey();

        // Clear today's rounds only
        data.dailyHistory[today] = 0;

        // Clear recent activity but keep a few items for context
        data.recentActivity = data.recentActivity.slice(0, 2);

        // Reset current beads
        data.currentBeads = 0;

        return data;
    }
}

export default DataUtils;
