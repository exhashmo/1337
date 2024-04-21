// Global variables
let countdown = 10;
let tabId;
let userClickedOnPage = false;
let intervalId = -1;

// Event listener for page load
window.addEventListener("load", () => {
  // Event listener for click on the page
  const clickListener = () => {
    console.log("User clicked on the page");
    userClickedOnPage = true;
    // Remove the click event listener
    document.querySelector("body").removeEventListener("click", clickListener);
  };
  document.querySelector("body").addEventListener("click", clickListener);
});

// Check if the "check-in" is announced on the page
function isCheckInAnnounced() {
  const checkInPhrase =
    "New 'check-ins' spots will open soon. To be informed when some will open, you can follow us on twitter or like us on facebook";
  const bodyText = document.body.innerText || document.body.textContent;

  // Method 2: Using a CSS selector
  var captchaElement = document.querySelector(".g-recaptcha");
  var captchaExist = true;
  // Combine results
  if (!captchaElement) {
    var captchaExist = false;
  } else {
    console.log("No reCAPTCHA element found.");
  }

  return !bodyText.includes(checkInPhrase) || captchaExist;
}

// Disable all links in navigation except the "Check-in" link
function disableAllLinksExceptCheckIn() {
  const links = document.querySelectorAll("nav a");
  links.forEach((link) => {
    if (link.getAttribute("href") !== "/meetings") {
      link.setAttribute("href", "#");
    }
  });
}

// Play alarm sound
function playAlarm() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  oscillator.type = "sawtooth"; // Using a sawtooth waveform for a harsher sound
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // Higher frequency for a more attention-grabbing sound
  oscillator.connect(audioContext.destination);
  oscillator.start();
}

// Start countdown and perform actions accordingly
function startCountdown() {
  intervalId = setInterval(async () => {
    if (countdown == 9) {
      const link = document.querySelector("nav ul.nav li a[href='/meetings']");
      console.log("Refresh page");
      link.click();
    } else if (countdown == 0) {
      countdown = 10;
    } else if (countdown >= 6 && countdown <= 9) {
      if (isCheckInAnnounced()) {
        playAlarm();
        chrome.runtime.sendMessage({ badgeText: "OFF", tabId });
        clearInterval(intervalId);
        return;
      } else {
        console.log("No check-in announced");
      }
      disableAllLinksExceptCheckIn();
    }
    chrome.runtime.sendMessage({ badgeText: countdown + "", tabId });
    countdown--;
  }, 1000);
}

// Message listener for background script messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received from background script:", message);
  if (message.id) {
    tabId = message.id;
    return;
  }
  if (intervalId < 0 && message.action == "STARTorSTOP") {
    if (userClickedOnPage) {
      startCountdown();
    } else {
      alert("Before proceeding, please click ANYWHERE on the page FIRST.");
    }
  } else {
    chrome.runtime.sendMessage({ badgeText: "OFF", tabId });
    clearInterval(intervalId);
    intervalId = -1;
  }
});
