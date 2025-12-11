// =================================================================
// CORE GAME LOGIC: ENDING DATA AND TRIGGER SYSTEM
// =================================================================

const ENDINGS_DATA = [
    // Ending 1: Main Goal (Expected)
    { id: 1, title: "The Simple Win", description: "You followed instructions. Congratulations on being predictable.", trigger: "door_clicked" },
    
    // Ending 2: Time Sink (Unexpected)
    { id: 2, title: "The Patient Test Subject", description: "You stood there for a full minute, proving patience is a virtue, or possibly boredom.", trigger: "afk_timer" },

    // Ending 3: Hidden Trigger (Unexpected)
    { id: 3, title: "The Floor is Lava... Eventually", description: "You stepped on the same spot too many times. The test chamber found you highly repetitive.", trigger: "floor_stomp" },
    
    // Ending 4: Meta Ending (Unexpected)
    { id: 4, title: "The Console Peek", description: "You looked behind the curtain! The simulation cannot handle that kind of self-awareness.", trigger: "devtools_open" },
    
    // Ending 5: Wrong Click (Unexpected)
    { id: 5, title: "The Useless Terminal", description: "The terminal explicitly said 'DO NOT USE.' You chose poorly.", trigger: "terminal_click" },
];

// --- DOM ELEMENTS ---
const welcomeScreen = document.getElementById('welcome-screen');
const startButton = document.getElementById('start-button');
const gameContainer = document.getElementById('game-container');
const redDoor = document.getElementById('red-door');
const uselessTerminal = document.getElementById('useless-terminal');
const floorSwitch = document.getElementById('floor-switch');
const endingScreen = document.getElementById('ending-screen');
const endingTitle = document.getElementById('ending-title');
const endingDescription = document.getElementById('ending-description');

// --- GAME STATE ---
let endingsFound = new Set();
let floorStompCount = 0;
let isGameActive = false;
let inactivityTimer;

// --- CORE FUNCTIONS ---

function resetGame() {
    isGameActive = false;
    floorStompCount = 0;
    // Clear the inactivity timer
    if (inactivityTimer) clearInterval(inactivityTimer);
    // Show the welcome screen for the next attempt
    welcomeScreen.classList.remove('hidden');
    welcomeScreen.style.opacity = 1;
    gameContainer.classList.remove('active');
}

function displayEnding(endingID) {
    if (!isGameActive) return; // Prevent triggers before the game starts
    isGameActive = false;
    
    const ending = ENDINGS_DATA.find(e => e.id === endingID);
    
    // In a full game, you'd check endingsFound and send data to a server here.
    endingsFound.add(endingID); 
    
    // Update the UI
    endingTitle.textContent = ending.title;
    endingDescription.textContent = ending.description;
    endingScreen.classList.remove('hidden');
    endingScreen.style.opacity = 1;

    // Reset the game after a delay
    setTimeout(() => {
        endingScreen.style.opacity = 0;
        endingScreen.classList.add('hidden');
        resetGame();
    }, 5000);
}

// --- EVENT LISTENERS (Triggers) ---

// 1. Start Button
startButton.addEventListener('click', () => {
    welcomeScreen.style.opacity = 0;
    welcomeScreen.classList.add('hidden');
    gameContainer.classList.add('active');
    isGameActive = true;
    startInactivityTimer();
});

// 2. Ending 1: Main Objective Click
redDoor.addEventListener('click', () => {
    if (isGameActive) {
        displayEnding(1);
    }
});

// 3. Ending 2: AFK Timer (30 seconds)
function startInactivityTimer() {
    // Check every 5 seconds if the game is active and the player has been still
    let lastActivityTime = Date.now();
    
    const activityCheck = () => {
        if (!isGameActive) return;

        // Check for any input activity to reset the timer
        document.addEventListener('mousemove', resetActivity, { once: true });
        document.addEventListener('keydown', resetActivity, { once: true });
        document.addEventListener('click', resetActivity, { once: true });

        const currentTime = Date.now();
        if (currentTime - lastActivityTime > 30000) { // 30 seconds
            displayEnding(2);
        }
    };

    const resetActivity = () => {
        lastActivityTime = Date.now();
        // Re-attach listeners for the next check
        document.removeEventListener('mousemove', resetActivity);
        document.removeEventListener('keydown', resetActivity);
        document.removeEventListener('click', resetActivity);
    };

    // The interval only calls the check function
    inactivityTimer = setInterval(activityCheck, 5000); 
}


// 4. Ending 3: Floor Stomp (Touch the invisible trigger 10 times)
floorSwitch.addEventListener('mouseover', () => {
    if (isGameActive) {
        // We use mouseover/mouseout to simulate stepping on and off a spot
        floorStompCount++;
        if (floorStompCount >= 10) {
            displayEnding(3);
        }
    }
});
floorSwitch.addEventListener('mouseout', () => {
    // Decrement the count slightly, adding a time factor could make this more realistic
});


// 5. Ending 4: Console Peek (Meta Ending)
const threshold = 160; // Common screen size detection threshold
let devtoolsOpen = false;

window.addEventListener('resize', () => {
    if (isGameActive && window.outerWidth - window.innerWidth > threshold) {
        if (!devtoolsOpen) {
            devtoolsOpen = true;
            displayEnding(4);
        }
    } else {
        devtoolsOpen = false;
    }
});


// 6. Ending 5: Useless Terminal Click
uselessTerminal.addEventListener('click', () => {
    if (isGameActive) {
        displayEnding(5);
    }
});
