const RESOURCE_NAME = typeof GetParentResourceName === 'function' ? GetParentResourceName() : 'blazee-notify';

const state = {
    maxVisible: 5,
    defaultPosition: 'top-right',
    queue: [],
    active: new Map(),
    audio: null
};

const typeIcons = {
    success: '<path d="M20 6 9 17l-5-5"></path>',
    error: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
    warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
    info: '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path>',
    dispatch: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="M8 11h8"></path><path d="M12 7v8"></path>',
    system: '<path d="M12 2v4"></path><path d="M12 18v4"></path><path d="m4.93 4.93 2.83 2.83"></path><path d="m16.24 16.24 2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="m4.93 19.07 2.83-2.83"></path><path d="m16.24 7.76 2.83-2.83"></path>',
    announcement: '<path d="m3 11 18-5v12L3 13z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>',
    money: '<rect width="20" height="14" x="2" y="5" rx="2"></rect><circle cx="12" cy="12" r="3"></circle><path d="M6 9h.01"></path><path d="M18 15h.01"></path>',
    staff: '<path d="M16 21v-2a4 4 0 0 0-8 0v2"></path><circle cx="12" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
};

const labels = {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    message: 'Message',
    dispatch: 'Dispatch',
    system: 'System',
    announcement: 'Announcement',
    money: 'Money',
    staff: 'Staff'
};

const soundPresets = {
    success: { wave: 'sine', frequencies: [440, 660, 880], length: 0.32, gain: 0.07 },
    error: { wave: 'sawtooth', frequencies: [180, 116], length: 0.34, gain: 0.055 },
    warning: { wave: 'triangle', frequencies: [520, 390], length: 0.3, gain: 0.06 },
    info: { wave: 'sine', frequencies: [620, 830], length: 0.22, gain: 0.052 },
    message: { wave: 'triangle', frequencies: [560, 740], length: 0.25, gain: 0.048 },
    dispatch: { wave: 'square', frequencies: [740, 520, 740], length: 0.42, gain: 0.043 },
    system: { wave: 'sine', frequencies: [330, 550, 770], length: 0.3, gain: 0.045 },
    announcement: { wave: 'triangle', frequencies: [392, 587, 784], length: 0.42, gain: 0.06 },
    money: { wave: 'sine', frequencies: [784, 988, 1175], length: 0.34, gain: 0.05 },
    staff: { wave: 'triangle', frequencies: [466, 622, 932], length: 0.34, gain: 0.05 }
};

function stackFor(position) {
    const stack = document.querySelector(`[data-position="${position}"]`);
    return stack || document.querySelector(`[data-position="${state.defaultPosition}"]`);
}

function escapeText(value) {
    const div = document.createElement('div');
    div.textContent = value == null ? '' : String(value);
    return div.innerHTML;
}

function iconMarkup(type) {
    const paths = typeIcons[type] || typeIcons.info;
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

function normalizeNotification(raw) {
    const notification = raw || {};
    const type = String(notification.type || 'info').toLowerCase();
    const duration = Number(notification.duration || 5500);

    return {
        id: notification.id || `blazee_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        type,
        title: notification.title || labels[type] || 'Notification',
        message: notification.message || '',
        duration: Number.isFinite(duration) ? Math.max(duration, 1200) : 5500,
        position: notification.position || state.defaultPosition,
        icon: notification.icon,
        image: notification.image,
        sound: notification.sound,
        volume: Number(notification.volume ?? 0.62),
        persistent: Boolean(notification.persistent),
        progress: notification.progress !== false,
        accent: notification.accent,
        metadata: Array.isArray(notification.metadata) ? notification.metadata : [],
        actions: Array.isArray(notification.actions) ? notification.actions : []
    };
}

function playSound(notification) {
    if (notification.sound === false) {
        return;
    }

    const preset = typeof notification.sound === 'string'
        ? soundPresets[notification.sound] || soundPresets[notification.type] || soundPresets.info
        : soundPresets[notification.type] || soundPresets.info;

    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audio = state.audio || new AudioContext();

        const now = state.audio.currentTime;
        const master = state.audio.createGain();
        const volume = Number.isFinite(notification.volume) ? notification.volume : 0.62;
        master.gain.setValueAtTime(Math.min(Math.max(volume, 0), 1) * preset.gain, now);
        master.gain.exponentialRampToValueAtTime(0.0001, now + preset.length);
        master.connect(state.audio.destination);

        preset.frequencies.forEach((frequency, index) => {
            const oscillator = state.audio.createOscillator();
            const gain = state.audio.createGain();
            const start = now + index * 0.075;
            const end = start + preset.length / preset.frequencies.length + 0.09;

            oscillator.type = preset.wave;
            oscillator.frequency.setValueAtTime(frequency, start);
            oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.025, end);
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(1, start + 0.018);
            gain.gain.exponentialRampToValueAtTime(0.0001, end);

            oscillator.connect(gain);
            gain.connect(master);
            oscillator.start(start);
            oscillator.stop(end + 0.03);
        });
    } catch (error) {
        // NUI audio can be blocked on first load in some builds; the UI still works.
    }
}

function buildMeta(metadata) {
    if (!metadata.length) {
        return '';
    }

    const pills = metadata.map((item) => {
        const label = item.label ? `<span class="meta-label">${escapeText(item.label)}</span>` : '';
        return `<span class="meta-pill">${label}<span>${escapeText(item.value ?? item)}</span></span>`;
    }).join('');

    return `<div class="notification-meta">${pills}</div>`;
}

function buildActions(notification) {
    if (!notification.actions.length) {
        return '';
    }

    const buttons = notification.actions.map((action, index) => {
        const label = escapeText(action.label || action.title || `Action ${index + 1}`);
        return `<button class="notification-action" data-action-index="${index}" type="button">${label}</button>`;
    }).join('');

    return `<div class="notification-actions">${buttons}</div>`;
}

function createNotification(raw) {
    const notification = normalizeNotification(raw);
    const element = document.createElement('article');
    element.className = `notification tone-${notification.type} ${notification.message ? '' : 'compact'}`;
    element.dataset.id = notification.id;
    element.style.setProperty('--duration', `${notification.duration}ms`);

    if (notification.accent) {
        element.style.setProperty('--accent', notification.accent);
    }

    const media = notification.image
        ? `<img class="notification-image" src="${escapeText(notification.image)}" alt="">`
        : `<div class="notification-icon">${notification.icon || iconMarkup(notification.type)}</div>`;

    const progress = notification.persistent || !notification.progress
        ? ''
        : '<div class="notification-progress"><span></span></div>';

    element.innerHTML = `
        ${media}
        <div class="notification-body">
            <div class="notification-header">
                <h2 class="notification-title">${escapeText(notification.title)}</h2>
                <span class="notification-type">${escapeText(labels[notification.type] || notification.type)}</span>
            </div>
            ${notification.message ? `<p class="notification-message">${escapeText(notification.message)}</p>` : ''}
            ${buildMeta(notification.metadata)}
            ${buildActions(notification)}
        </div>
        <button class="notification-close" type="button" aria-label="Close notification">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
            </svg>
        </button>
        ${progress}
    `;

    element.querySelector('.notification-close').addEventListener('click', () => removeNotification(notification.id));

    element.querySelectorAll('[data-action-index]').forEach((button) => {
        button.addEventListener('click', () => {
            const action = notification.actions[Number(button.dataset.actionIndex)];

            if (!action) {
                return;
            }

            if (action.event) {
                fetch(`https://${RESOURCE_NAME}/notificationAction`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                    body: JSON.stringify({
                        event: action.event,
                        server: Boolean(action.server),
                        args: action.args,
                        notificationId: notification.id
                    })
                }).catch(() => {});
            }

            if (action.close !== false) {
                removeNotification(notification.id);
            }
        });
    });

    notification.element = element;
    notification.timer = notification.persistent ? null : window.setTimeout(() => removeNotification(notification.id), notification.duration);

    return notification;
}

function activeCountFor(position) {
    let count = 0;

    state.active.forEach((notification) => {
        if (notification.position === position) {
            count += 1;
        }
    });

    return count;
}

function processQueue() {
    for (let index = 0; index < state.queue.length; index += 1) {
        const raw = state.queue[index];
        const position = raw.position || state.defaultPosition;

        if (activeCountFor(position) >= state.maxVisible) {
            continue;
        }

        state.queue.splice(index, 1);
        index -= 1;
        showNotification(raw);
    }
}

function showNotification(raw) {
    const notification = createNotification(raw);
    const position = notification.position || state.defaultPosition;

    if (activeCountFor(position) >= state.maxVisible) {
        state.queue.push(raw);
        return;
    }

    const stack = stackFor(position);
    stack.appendChild(notification.element);
    state.active.set(notification.id, notification);
    playSound(notification);
}

function removeNotification(id) {
    const notification = state.active.get(id);

    if (!notification) {
        return;
    }

    if (notification.timer) {
        clearTimeout(notification.timer);
    }

    notification.element.classList.add('leaving');
    state.active.delete(id);

    window.setTimeout(() => {
        notification.element.remove();
        processQueue();
    }, 280);
}

function clearNotifications() {
    state.queue.length = 0;
    [...state.active.keys()].forEach(removeNotification);
}

function configure(options = {}) {
    if (Number.isFinite(Number(options.maxVisible))) {
        state.maxVisible = Math.max(1, Number(options.maxVisible));
    }

    if (options.defaultPosition) {
        state.defaultPosition = options.defaultPosition;
    }
}

window.addEventListener('message', (event) => {
    const payload = event.data || {};

    if (payload.action === 'notify') {
        configure(payload.options);
        showNotification(payload.notification);
    }

    if (payload.action === 'close') {
        removeNotification(payload.id);
    }

    if (payload.action === 'clear') {
        clearNotifications();
    }

    if (payload.action === 'configure') {
        configure(payload.options);
    }
});

if (!window.invokeNative) {
    const demo = [
        {
            type: 'success',
            title: 'Showcase Ready',
            message: 'The notification stack is live.',
            metadata: [{ label: 'Mode', value: 'Browser Preview' }]
        },
        {
            type: 'dispatch',
            title: 'Priority Alert',
            message: 'Units requested near Vespucci Boulevard.',
            position: 'top-center',
            actions: [{ label: 'Set GPS' }, { label: 'Dismiss' }]
        },
        {
            type: 'money',
            title: 'Transfer Complete',
            message: '$12,750 has been added to your account.',
            position: 'bottom-right'
        }
    ];

    setTimeout(() => demo.forEach((item, index) => setTimeout(() => showNotification(item), index * 650)), 500);
}
