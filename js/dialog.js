// Dialog Manager - Handles confirmation dialogs and modals
class DialogManager {
    constructor() {
        this.activeDialogs = [];
    }

    showConfirmDialog(message, onConfirm, type = 'warning') {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-3';

        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'bg-gray-900/95 backdrop-blur-lg rounded-2xl p-4 w-80 max-w-[90vw] mx-auto shadow-2xl border border-gray-600/50 transform scale-95 transition-all duration-300';

        // Icon based on type
        const iconClass = type === 'danger' ? 'fa-triangle-exclamation text-red-400' :
                         type === 'warning' ? 'fa-exclamation-circle text-amber-400' :
                         'fa-question-circle text-blue-400';

        dialog.innerHTML = `
            <div class="text-center">
                <div class="w-10 h-10 mx-auto mb-3 bg-gradient-to-br ${type === 'danger' ? 'from-red-500/20 to-red-600/20' : type === 'warning' ? 'from-amber-500/20 to-amber-600/20' : 'from-blue-500/20 to-blue-600/20'} rounded-xl flex items-center justify-center">
                    <i class="fas ${iconClass} text-base"></i>
                </div>
                <h3 class="text-sm font-semibold text-white mb-2">Confirm Action</h3>
                <p class="text-gray-300 mb-4 text-xs leading-relaxed">${message}</p>
                <div class="flex gap-2">
                    <button id="confirmCancel" class="flex-1 px-3 py-2 bg-gray-700/80 hover:bg-gray-600/80 text-white rounded-xl transition-all duration-200 text-xs font-medium backdrop-blur-sm">
                        Cancel
                    </button>
                    <button id="confirmOk" class="flex-1 px-3 py-2 ${type === 'danger' ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'bg-gradient-to-r from-krishna-orange to-krishna-gold hover:from-krishna-gold hover:to-krishna-orange'} text-white rounded-xl transition-all duration-200 text-xs font-medium shadow-lg">
                        Confirm
                    </button>
                </div>
                <div class="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <div class="w-1 h-1 bg-gray-400 rounded-full animate-pulse"></div>
                    <span>Auto clearing in <span id="countdown" class="font-mono">3</span>s</span>
                </div>
            </div>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            dialog.classList.remove('scale-95');
            dialog.classList.add('scale-100');
            overlay.classList.add('animate-in');
        });

        // Auto-dismiss countdown
        let countdown = 30;
        const countdownElement = dialog.querySelector('#countdown');
        const countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                closeDialog();
                onConfirm();
            }
        }, 1000);

        // Handle buttons
        const cancelBtn = dialog.querySelector('#confirmCancel');
        const okBtn = dialog.querySelector('#confirmOk');

        const closeDialog = () => {
            clearInterval(countdownInterval);
            dialog.classList.add('scale-95');
            dialog.classList.add('opacity-0');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 300);
        };

        cancelBtn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            closeDialog();
        });

        okBtn.addEventListener('click', () => {
            clearInterval(countdownInterval);
            closeDialog();
            onConfirm();
        });

        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                clearInterval(countdownInterval);
                closeDialog();
            }
        });

        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                clearInterval(countdownInterval);
                closeDialog();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
}

export default DialogManager;
