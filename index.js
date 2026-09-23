// ===== Timer functionality =====
var startButton = document.getElementById("start");
var stopButton = document.getElementById("stop");
var resetButton = document.getElementById("reset");
var timerDisplay = document.getElementById("timer");
var timerState = document.getElementById("timer-state");
var ringProgress = document.getElementById("ring-progress");
var sessionDotsEl = document.getElementById("session-dots");
var modeTabs = document.querySelectorAll(".mode-tab");
var toastEl = document.getElementById("toast");

var alarmAudio = new Audio("sounds/bell.mp3");

var MODES = {
  focus: { seconds: 1500, label: "Focus session", ring: "mode-focus" },
  short: { seconds: 300, label: "Short break", ring: "mode-short" },
  long: { seconds: 900, label: "Long break", ring: "mode-long" }
};

var RING_CIRCUMFERENCE = 2 * Math.PI * 126;
ringProgress.style.strokeDasharray = RING_CIRCUMFERENCE.toFixed(2);

var currentMode = "focus";
var totalTimeInSeconds = MODES[currentMode].seconds;
var sessionDuration = MODES[currentMode].seconds;
var timerInterval;
var timerIsRunning = false;
var completedFocusSessions = 0;
var toastTimeout;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(function () {
    toastEl.classList.remove("show");
  }, 3500);
}

function renderSessionDots() {
  var cycle = completedFocusSessions % 4;
  sessionDotsEl.innerHTML = "";
  for (var i = 0; i < 4; i++) {
    var dot = document.createElement("span");
    dot.className = "dot" + (i < cycle ? " filled" : "");
    sessionDotsEl.appendChild(dot);
  }
}

function updateRing() {
  var fraction = sessionDuration > 0 ? totalTimeInSeconds / sessionDuration : 0;
  var offset = RING_CIRCUMFERENCE * (1 - fraction);
  ringProgress.style.strokeDashoffset = offset.toFixed(2);
}

function showTime() {
  var minutes = Math.floor(totalTimeInSeconds / 60);
  var seconds = totalTimeInSeconds % 60;
  var timeString = minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0");
  timerDisplay.textContent = timeString;
  document.title = timeString + " – Pomodoro Timer";
  updateRing();
}

function setMode(mode, options) {
  var silent = options && options.silent;
  currentMode = mode;
  sessionDuration = MODES[mode].seconds;
  totalTimeInSeconds = sessionDuration;

  modeTabs.forEach(function (tab) {
    var isActive = tab.getAttribute("data-mode") === mode;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  ringProgress.classList.remove("mode-focus", "mode-short", "mode-long");
  ringProgress.classList.add(MODES[mode].ring);

  timerState.textContent = timerIsRunning ? MODES[mode].label + " in progress" : "Ready when you are";
  showTime();

  if (!silent) {
    clearInterval(timerInterval);
    timerIsRunning = false;
  }
}

function startTimer() {
  if (timerIsRunning) return;
  timerIsRunning = true;
  timerState.textContent = MODES[currentMode].label + " in progress";

  timerInterval = setInterval(function () {
    if (totalTimeInSeconds > 0) {
      totalTimeInSeconds -= 1;
      showTime();
    } else {
      clearInterval(timerInterval);
      timerIsRunning = false;
      alarmAudio.play().catch(function () {});

      if (currentMode === "focus") {
        completedFocusSessions += 1;
        renderSessionDots();
        var nextMode = completedFocusSessions % 4 === 0 ? "long" : "short";
        showToast("Focus session complete! Time for a " + (nextMode === "long" ? "long" : "short") + " break.");
        setMode(nextMode, { silent: true });
      } else {
        showToast("Break's over! Ready for another focus session?");
        setMode("focus", { silent: true });
      }
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerIsRunning = false;
  timerState.textContent = "Paused";
  alarmAudio.pause();
  alarmAudio.currentTime = 0;
}

function resetTimer() {
  clearInterval(timerInterval);
  timerIsRunning = false;
  totalTimeInSeconds = sessionDuration;
  timerState.textContent = "Ready when you are";
  showTime();
  alarmAudio.pause();
  alarmAudio.currentTime = 0;
}

modeTabs.forEach(function (tab) {
  tab.addEventListener("click", function () {
    setMode(tab.getAttribute("data-mode"));
  });
});

startButton.addEventListener("click", startTimer);
stopButton.addEventListener("click", stopTimer);
resetButton.addEventListener("click", resetTimer);

renderSessionDots();
setMode(currentMode, { silent: true });

// ===== Ambient sound system =====
var soundFiles = {
  original: "sounds/original.mp3",
  lofi: "sounds/lofi.mp3",
  library: "sounds/library.mp3",
  rain: "sounds/rain.mp3",
  nature: "sounds/nature.mp3",
  fireplace: "sounds/fireplace.mp3"
};

var audioElements = {};
var soundsUnlocked = false;

for (var key in soundFiles) {
  var audio = new Audio(soundFiles[key]);
  audio.loop = true;
  audio.volume = 0;
  audioElements[key] = audio;
}

document.addEventListener("click", function () {
  if (!soundsUnlocked) {
    for (var key in audioElements) {
      audioElements[key].play().catch(function () {});
      audioElements[key].pause();
    }
    soundsUnlocked = true;
  }
});

var sliders = document.querySelectorAll('input[type="range"]');

for (var i = 0; i < sliders.length; i++) {
  var slider = sliders[i];
  slider.min = 0;
  slider.max = 1;
  slider.step = 0.01;
  slider.value = 0;

  slider.addEventListener("input", function (event) {
    var soundKey = event.target.getAttribute("data-sound");
    var volume = parseFloat(event.target.value);
    var audio = audioElements[soundKey];

    if (audio) {
      audio.volume = volume;
      if (volume > 0 && audio.paused) {
        audio.play().catch(function () {});
      } else if (volume === 0) {
        audio.pause();
      }
    }

    var percent = (event.target.value - event.target.min) / (event.target.max - event.target.min) * 100;
    event.target.style.background = "linear-gradient(to right, #4facfe 0%, #00f2fe " + percent + "%, rgba(255,255,255,0.15) " + percent + "%)";
  });
}

// ===== Fullscreen toggle logic =====
var fullscreenButton = document.getElementById("fullscreen");
var fullscreenWrapper = document.getElementById("fullscreen-wrapper");

fullscreenButton.addEventListener("click", function () {
  if (!document.fullscreenElement) {
    fullscreenWrapper.requestFullscreen().then(function () {
      fullscreenWrapper.classList.add("fullscreen-mode");
    });
  } else {
    document.exitFullscreen().then(function () {
      fullscreenWrapper.classList.remove("fullscreen-mode");
    });
  }
});
