// Improved Egg Timer App: User-friendly & Accessible

const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds'); // NEW
const countdownDisplay = document.getElementById('countdown');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const alarmSound = document.getElementById('alarmSound');
const presetBtns = document.querySelectorAll('.preset-btn');
const darkModeToggle = document.getElementById('darkModeToggle');
const alarmSelect = document.getElementById('alarmSelect');
const progressBar = document.getElementById('progressBar');
const container = document.querySelector('.container');

const alarmSounds = {
  alarm_clock: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
  bell: "https://actions.google.com/sounds/v1/bells/bell_ring.ogg",
  digital_watch_alarm: "https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg"
};

let timer;
let totalSeconds = (parseInt(minutesInput.value, 10) || 0) * 60 + (parseInt(secondsInput.value, 10) || 0); // UPDATED
let remainingSeconds = totalSeconds;
let isRunning = false;
let finished = false;

// Accessibility: Focus management
function focusFirstButton() {
  startBtn.focus();
}

// User-friendly: Update display and progress bar
function updateDisplay(seconds) {
  const min = String(Math.floor(seconds / 60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');
  countdownDisplay.textContent = `${min}:${sec}`;
  updateProgressBar();
}

// User-friendly: Progress bar
function updateProgressBar() {
  let percent = 0;
  if (totalSeconds > 0) {
    percent = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  }
  progressBar.style.width = `${percent}%`;
  // Accessibility: Add aria-valuenow, aria-valuemax, aria-valuemin
  progressBar.setAttribute('aria-valuenow', percent);
  progressBar.setAttribute('aria-valuemax', 100);
  progressBar.setAttribute('aria-valuemin', 0);

  // Change color based on time left
  progressBar.classList.remove('yellow', 'red');
  if (totalSeconds > 0) {
    const ratio = remainingSeconds / totalSeconds;
    if (ratio <= 0.33) {
      progressBar.classList.add('red');
    } else if (ratio <= 0.66) {
      progressBar.classList.add('yellow');
    }
    // Default is green (no class needed)
  }
}

// User-friendly: Button state management
function updateButtonStates() {
  startBtn.disabled = isRunning || finished;
  pauseBtn.disabled = !isRunning || finished;
  resetBtn.disabled = (!isRunning && remainingSeconds === totalSeconds) || finished;
  presetBtns.forEach(btn => {
    btn.disabled = isRunning;
  });
  minutesInput.disabled = isRunning;
  alarmSelect.disabled = isRunning;
}

// User-friendly: Timer finished feedback
function showTimerFinished() {
  container.classList.add('timer-finished');
  setTimeout(() => {
    container.classList.remove('timer-finished');
  }, 3000);
}

// Timer logic
function startTimer() {
  if (isRunning || finished) return;
  isRunning = true;
  updateButtonStates();
  timer = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateDisplay(remainingSeconds);
    } else {
      clearInterval(timer);
      isRunning = false;
      finished = true;
      updateButtonStates();
      setAlarmSound(); // Ensure correct sound is set before playing
      alarmSound.play();
      showTimerFinished();
      focusFirstButton();
    }
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(timer);
  isRunning = false;
  updateButtonStates();
}

// Get total seconds from minutes and seconds input, with validation
function getInputTime() {
  let min = parseInt(minutesInput.value, 10);
  let sec = parseInt(secondsInput.value, 10);

  // Validation: ensure numeric and non-negative
  if (isNaN(min) || min < 0) min = 0;
  if (isNaN(sec) || sec < 0) sec = 0;
  if (sec > 59) sec = 59;

  minutesInput.value = min;
  secondsInput.value = sec;

  return min * 60 + sec;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  finished = false;
  remainingSeconds = getInputTime(); // UPDATED
  totalSeconds = remainingSeconds;
  updateDisplay(remainingSeconds);
  updateButtonStates();
  container.classList.remove('timer-finished');
}

// Preset buttons
presetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    minutesInput.value = btn.getAttribute('data-minutes');
    secondsInput.value = 0; // Reset seconds for presets
    resetTimer();
  });
});

// Input change
minutesInput.addEventListener('change', resetTimer);
secondsInput.addEventListener('change', resetTimer); // NEW

// Button events
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Dark mode toggle
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', darkModeToggle.checked);
});

// Alarm sound select
function setAlarmSound() {
  const selected = alarmSelect.value;
  alarmSound.src = alarmSounds[selected];
}
alarmSelect.addEventListener('change', setAlarmSound);

// Accessibility: Keyboard navigation for preset buttons
presetBtns.forEach(btn => {
  btn.setAttribute('tabindex', '0');
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      btn.click();
    }
  });
});

// Accessibility: Keyboard navigation for dark mode toggle
darkModeToggle.setAttribute('tabindex', '0');
darkModeToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    darkModeToggle.checked = !darkModeToggle.checked;
    darkModeToggle.dispatchEvent(new Event('change'));
  }
});

// Accessibility: Countdown display focusable
countdownDisplay.setAttribute('tabindex', '0');

// Initialize alarm sound and display
setAlarmSound();
updateDisplay(remainingSeconds);
updateButtonStates();