// Check if we've already injected the timer script
if (window.countdownTimerInjected) {
  // If the timer exists but is hidden/removed, recreate it
  const existingTimer = document.getElementById('countdown-timer');
  if (!existingTimer || !document.body.contains(existingTimer)) {
    injectCountdownTimer();
  }
} else {
  // First time injection
  window.countdownTimerInjected = true;
  injectCountdownTimer();
}

// Function to inject our timer
function injectCountdownTimer() {
  // Create the style element if it doesn't exist
  if (!document.getElementById('countdown-timer-styles')) {
    const style = document.createElement('style');
    style.id = 'countdown-timer-styles';
    style.textContent = `
      .countdown-timer {
        position: fixed;
        top: 70px;
        right: 20px;
        z-index: 9999;
        width: 200px;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
        font-family: Arial, sans-serif;
        color: #202124;
        overflow: hidden;
        transition: opacity 0.3s, width 0.3s;
      }
      .countdown-timer.minimized {
        opacity: 0.7;
      }
      .countdown-timer:hover {
        opacity: 1;
      }
      .countdown-timer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #e1e3e6;
      }
      .countdown-timer-title {
        font-size: 14px;
        font-weight: 500;
        margin: 0;
      }
      .countdown-timer-controls {
        display: flex;
        gap: 8px;
      }
      .countdown-timer-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        color: #5f6368;
      }
      .countdown-timer-btn:hover {
        background-color: rgba(95, 99, 104, 0.1);
      }
      .countdown-timer-content {
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .countdown-timer-display {
        position: relative;
        width: 100px;
        height: 100px;
        margin-bottom: 12px;
      }
      .countdown-timer-text {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: bold;
        font-variant-numeric: tabular-nums;
      }
      .countdown-timer-ring {
        transform: rotate(-90deg);
      }
      .countdown-timer-inputs {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        width: 100%;
        margin-bottom: 12px;
      }
      .countdown-timer-input-group {
        display: flex;
        flex-direction: column;
      }
      .countdown-timer-input-group label {
        font-size: 12px;
        margin-bottom: 4px;
        color: #5f6368;
      }
      .countdown-timer-input-group input {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid #dadce0;
        border-radius: 4px;
        font-size: 14px;
        text-align: center;
      }
      .countdown-timer-buttons {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        width: 100%;
      }
      .countdown-timer-action {
        flex: 1;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .countdown-timer-start {
        background-color: #1a73e8;
        color: white;
        border: none;
      }
      .countdown-timer-start:hover {
        background-color: #1765cc;
      }
      .countdown-timer-pause {
        background-color: #f8f9fa;
        color: #1a73e8;
        border: 1px solid #dadce0;
      }
      .countdown-timer-pause:hover {
        background-color: #f1f3f4;
      }
      .countdown-timer-reset {
        background-color: #f8f9fa;
        color: #5f6368;
        border: 1px solid #dadce0;
      }
      .countdown-timer-reset:hover {
        background-color: #f1f3f4;
      }
      .countdown-timer.minimized .countdown-timer-content {
        display: none;
      }
      .countdown-timer.minimized .countdown-timer-mini {
        display: block;
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        padding: 4px 0;
      }
      .countdown-timer-mini {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Create the timer container
  const timer = document.createElement('div');
  timer.className = 'countdown-timer';
  timer.id = 'countdown-timer';
  document.body.appendChild(timer);

  // Set up timer state
  let isRunning = false;
  let minutes = 5;
  let seconds = 0;
  let timeLeft = minutes * 60 + seconds;
  let soundEnabled = true;
  let interval = null;
  let minimized = false;

  // Function to format time as MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Function to render the timer UI
  function renderTimer() {
    const totalTime = minutes * 60 + seconds;
    const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0;
    
    let progressColor = '#4ade80'; // green
    if (progress <= 66 && progress > 33) {
      progressColor = '#facc15'; // yellow
    } else if (progress <= 33) {
      progressColor = '#ef4444'; // red
    }

    timer.innerHTML = `
      <div class="countdown-timer-header">
        <h3 class="countdown-timer-title">Countdown</h3>
        <div class="countdown-timer-controls">
          <button class="countdown-timer-btn sound-btn" title="${soundEnabled ? 'Mute' : 'Unmute'}">
            ${soundEnabled ? 
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>' : 
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>'
            }
          </button>
          <button class="countdown-timer-btn minimize-btn" title="${minimized ? 'Expand' : 'Minimize'}">
            ${minimized ? 
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"></path><path d="M21 8h-3a2 2 0 0 1-2-2V3"></path><path d="M3 16h3a2 2 0 0 1 2 2v3"></path><path d="M16 21v-3a2 2 0 0 1 2-2h3"></path></svg>' : 
              '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"></path><path d="M21 8V5a2 2 0 0 0-2-2h-3"></path><path d="M3 16v3a2 2 0 0 0 2 2h3"></path><path d="M16 21h3a2 2 0 0 0 2-2v-3"></path></svg>'
            }
          </button>
          <button class="countdown-timer-btn close-btn" title="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      <div class="countdown-timer-mini">${formatTime(timeLeft)}</div>
      <div class="countdown-timer-content">
        <div class="countdown-timer-display">
          <svg class="countdown-timer-ring" width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="#e1e3e6" stroke-width="8"></circle>
            <circle cx="50" cy="50" r="45" fill="transparent" stroke="${progressColor}" stroke-width="8" 
              stroke-dasharray="282.7" stroke-dashoffset="${282.7 - (282.7 * progress) / 100}"></circle>
          </svg>
          <div class="countdown-timer-text">${formatTime(timeLeft)}</div>
        </div>
        
        ${!isRunning ? `
          <div class="countdown-timer-inputs">
            <div class="countdown-timer-input-group">
              <label for="timer-minutes">Minutes</label>
              <input type="number" id="timer-minutes" min="0" value="${minutes}">
            </div>
            <div class="countdown-timer-input-group">
              <label for="timer-seconds">Seconds</label>
              <input type="number" id="timer-seconds" min="0" max="59" value="${seconds}">
            </div>
          </div>
        ` : ''}
        
        <div class="countdown-timer-buttons">
          ${!isRunning ? `
            <button class="countdown-timer-action countdown-timer-start">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Start
            </button>
          ` : `
            <button class="countdown-timer-action countdown-timer-pause">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              Pause
            </button>
          `}
          <button class="countdown-timer-action countdown-timer-reset">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v6h6"></path><path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path><path d="M21 22v-6h-6"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path></svg>
            Reset
          </button>
        </div>
      </div>
    `;

    // Apply minimized class if needed
    if (minimized) {
      timer.classList.add('minimized');
    } else {
      timer.classList.remove('minimized');
    }

    // Set up event listeners
    setupEventListeners();
  }

  // Function to set up event listeners
  function setupEventListeners() {
    // Close button
    timer.querySelector('.close-btn').addEventListener('click', () => {
      // Just hide the timer instead of removing it completely
      timer.style.display = 'none';
      clearInterval(interval);
      
      // Reset the flag so we can create a new timer
      window.countdownTimerInjected = false;
    });

    // Minimize button
    timer.querySelector('.minimize-btn').addEventListener('click', () => {
      minimized = !minimized;
      renderTimer();
    });

    // Sound toggle
    timer.querySelector('.sound-btn').addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      renderTimer();
    });

    // Start button
    const startBtn = timer.querySelector('.countdown-timer-start');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        if (!isRunning) {
          if (timeLeft === 0) {
            timeLeft = minutes * 60 + seconds;
          }
          startTimer();
        }
      });
    }

    // Pause button
    const pauseBtn = timer.querySelector('.countdown-timer-pause');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        if (isRunning) {
          pauseTimer();
        }
      });
    }

    // Reset button
    timer.querySelector('.countdown-timer-reset').addEventListener('click', () => {
      resetTimer();
    });

    // Minutes input
    const minutesInput = timer.querySelector('#timer-minutes');
    if (minutesInput) {
      minutesInput.addEventListener('change', (e) => {
        minutes = parseInt(e.target.value) || 0;
        timeLeft = minutes * 60 + seconds;
        renderTimer();
      });
    }

    // Seconds input
    const secondsInput = timer.querySelector('#timer-seconds');
    if (secondsInput) {
      secondsInput.addEventListener('change', (e) => {
        seconds = parseInt(e.target.value) || 0;
        if (seconds >= 60) seconds = 59;
        timeLeft = minutes * 60 + seconds;
        renderTimer();
      });
    }
  }

  // Function to start the timer
  function startTimer() {
    isRunning = true;
    renderTimer();
    
    interval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        renderTimer();
      } else {
        pauseTimer();
        if (soundEnabled) {
          playAlarmSound();
        }
      }
    }, 1000);
  }

  // Function to pause the timer
  function pauseTimer() {
    isRunning = false;
    clearInterval(interval);
    renderTimer();
  }

  // Function to reset the timer
  function resetTimer() {
    pauseTimer();
    timeLeft = minutes * 60 + seconds;
    renderTimer();
  }

  // Function to play alarm sound
  function playAlarmSound() {
    // Create a simple beep sound using the Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.5;
    
    oscillator.start();
    
    // Beep pattern
    setTimeout(() => {
      oscillator.stop();
      const oscillator2 = audioContext.createOscillator();
      oscillator2.connect(gainNode);
      oscillator2.type = 'sine';
      oscillator2.frequency.value = 800;
      oscillator2.start();
      
      setTimeout(() => {
        oscillator2.stop();
        const oscillator3 = audioContext.createOscillator();
        oscillator3.connect(gainNode);
        oscillator3.type = 'sine';
        oscillator3.frequency.value = 800;
        oscillator3.start();
        
        setTimeout(() => {
          oscillator3.stop();
        }, 300);
      }, 500);
    }, 300);
  }

  // Make the timer draggable
  let isDragging = false;
  let offsetX, offsetY;

  timer.addEventListener('mousedown', (e) => {
    if (e.target.closest('.countdown-timer-btn') || e.target.closest('.countdown-timer-action') || e.target.closest('input')) {
      return;
    }
    
    isDragging = true;
    offsetX = e.clientX - timer.getBoundingClientRect().left;
    offsetY = e.clientY - timer.getBoundingClientRect().top;
    
    timer.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    
    timer.style.left = `${x}px`;
    timer.style.top = `${y}px`;
    timer.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    if (timer) {
      timer.style.cursor = 'grab';
    }
  });

  // Initial render
  renderTimer();
}
