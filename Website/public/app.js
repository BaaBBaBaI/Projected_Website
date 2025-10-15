
// Minesweeper game initialization mginit
const minesweeperCSS = document.createElement('link');
minesweeperCSS.rel = 'stylesheet';
minesweeperCSS.href = 'apps/Minesweeper/minesweeper.css';
document.head.appendChild(minesweeperCSS);
// end of mginit


const goBtn = document.getElementById('goBtn');
const desktop = document.getElementById('desktop');
let windowCounter = 0;
const activeWindows = new Map();

async function checkIfMobile() {
    try {
        const response = await fetch('/api/check-mobile');
        const isMobile = await response.text();
        return isMobile === 'true';
    } catch (error) {
    console.error('Cannot fetch check-mobile', error);}
}


function updateClock() {
    const clockElement = document.getElementById('clock');
    const currentTime = new Date();

    let hours = currentTime.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');

    clockElement.textContent = `${hours}:${minutes} ${ampm}`;
}


setInterval(updateClock, 1000);
updateClock();


const openMenuButton = document.getElementById('openmenu');
const startMenu = document.getElementById('startMenu');

// Toggle menu function
function toggleMenu(e) {
    e.stopPropagation();
    startMenu.classList.toggle('active');
}

// Close menu when clicking outside
function closeMenu(e) {
    if (startMenu.classList.contains('active') &&
        !startMenu.contains(e.target) &&
        e.target !== openMenuButton) {
        startMenu.classList.remove('active');
    }
}


openMenuButton.addEventListener('click', toggleMenu);
document.addEventListener('click', closeMenu);



const minesweeperBtn = document.getElementById('minesweeperBtn');
if (minesweeperBtn) {
    minesweeperBtn.addEventListener('click', () => {
        createMinesweeperWindow();
        if (startMenu.classList.contains('active')) {
            startMenu.classList.remove('active');
        }
    });
}


// --- Help Popup ---
async function helpPopup() {
    try {
        const win = document.createElement('div');
        win.className = 'window';
        win.style.left = `${Math.random() * (window.innerWidth - 500) + 50}px`;
        win.style.top = `${Math.random() * (window.innerHeight - 400) + 50}px`;

        win.innerHTML = `
      <div class="title-bar">
        <span>Help</span>
        <button class="close-button">✖</button>
      </div>
      <div class="window-content">
        <p>Press the button for a cute cat!</p>
        <p>That's all really &#128568;</p>
      </div>
    `;

        desktop.appendChild(win);

        win.querySelector('.close-button').addEventListener('click', () => {
            win.remove();
        });

        makeDraggable(win);

    } catch (e) {
        console.error("Failed to create help popup:", e);
    }
}

// --- Cat Popup ---
async function createCatPopup() {
    try {
        const windowId = ++windowCounter;
        const response = await fetch('https://api.thecatapi.com/v1/images/search');
        const data = await response.json();
        const catImageUrl = data[0].url;



        const win = document.createElement('div');
        win.className = 'window';
        win.dataset.windowId = windowId;
        win.style.width = '600px';
        win.style.left = `${Math.random() * (window.innerWidth - 600) + 50}px`;
        win.style.top = `${Math.random() * (window.innerHeight - 500) + 50}px`;
        win.innerHTML = `
            <div class="title-bar">
                <span class="title-bar-text">Cute Kitty №${windowId}</span>
                <div class="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Maximize"></button>
                    <button aria-label="Close"></button>
                </div>
            </div>
            
            <div class="window-body">
                <menu role="tablist">
                    <button aria-selected="true" aria-controls="cat">Cat</button>
                    <button aria-controls="info">Info</button>
                </menu>
                
                <article role="tabpanel" id="cat">
                    <img src="${catImageUrl}" alt="Random Cat">
                </article>
                
                <article role="tabpanel" hidden id="info">
                    <h3>Generate a cat!</h3>
                    <p>
                      This is my first mini app that is placed within Windows XP style website. I think future apps would be posted this way as well!
                    </p>
                    <p>
                      Learn more at <a href="https://github.com/BaaBBaBaI" target="_blank">my GitHub page.</a>
                    </p>
                </article>
            </div>
        `;

        desktop.appendChild(win);

        desktop.appendChild(win);

        initializeTabs(win);

        createTaskbarButton(windowId, win, `Kitty №${windowId}`, 'assets/catpng.png');


        // Store window reference
        activeWindows.set(windowId, { element: win, minimized: false, maximized: false, originalStyle: {
                width: win.style.width,
                height: win.style.height,
                left: win.style.left,
                top: win.style.top
            } });

        // Close button
        win.querySelector('.title-bar-controls button[aria-label=Close]').onclick = () => {
            win.remove();
            removeTaskbarButton(windowId);
            activeWindows.delete(windowId);
        };

        // Minimize button
        win.querySelector('.title-bar-controls button[aria-label=Minimize]').onclick = () => {
            minimizeWindow(windowId);
        };

        win.querySelector('.title-bar-controls button[aria-label=Maximize]').onclick = () => {

            maximizeWindow(windowId);
        }

        if (await checkIfMobile()) {

            maximizeWindow(windowId);
        }

        makeDraggable(win);
    } catch (error) {
        console.error('Error fetching cat image:', error);
        alert('Error fetching cat image');
    }
}

// Minesweeper window
async function createMinesweeperWindow() {
    try {
        const windowId = ++windowCounter;



        const win = document.createElement('div');
        win.className = 'window';
        win.dataset.windowId = windowId;
        win.style.width = 'auto';
        win.style.left = `${Math.random() * (window.innerWidth - 400) + 50}px`;
        win.style.top = `${Math.random() * (window.innerHeight - 500) + 50}px`;

        win.innerHTML = `
            <div class="title-bar">
                <span class="title-bar-text">Minesweeper</span>
                <div class="title-bar-controls">
                    <button aria-label="Minimize"></button>
                    <button aria-label="Maximize"></button>
                    <button aria-label="Close"></button>
                </div>
            </div>
            
            <div class="window-body">
                <div class="minesweeper-container"></div>
            </div>
        `;

        desktop.appendChild(win);

        createTaskbarButton(windowId, win, `Minesweeper`, 'assets/minesweeper.png');

        // Load and initialize Minesweeper
        await loadScript('apps/Minesweeper/minesweeper.js');
        const container = win.querySelector('.minesweeper-container');
        const game = new MinesweeperGame(container, 'Beginner');

        // Store game reference
        activeWindows.set(windowId, {
            element: win,
            minimized: false,
            maximized: false,
            game: game,
            originalStyle: {
                height: win.style.height,
                width: win.style.width,
                left: win.style.left,
                top: win.style.top
            }
        });

        // Close button
        win.querySelector('.title-bar-controls button[aria-label=Close]').onclick = () => {
            game.destroy(); // Clean up timer
            win.remove();
            removeTaskbarButton(windowId);
            activeWindows.delete(windowId);
        };

        // Minimize button
        win.querySelector('.title-bar-controls button[aria-label=Minimize]').onclick = () => {
            minimizeWindow(windowId);
        };

        // Maximize button
        win.querySelector('.title-bar-controls button[aria-label=Maximize]').onclick = () => {
            maximizeWindow(windowId);
        };

        if (await checkIfMobile()) {

            maximizeWindow(windowId);
        }

        // Dragging functionality
        makeDraggable(win);
    } catch (error) {
        console.error('Error creating Minesweeper:', error);
    }
}

// Load Script
function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

function initializeTabs(windowElement) {
    const tabButtons = windowElement.querySelectorAll('menu[role="tablist"] button');
    const tabPanels = windowElement.querySelectorAll('article[role="tabpanel"]');

    tabButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Remove active state from all tabs
            tabButtons.forEach(btn => btn.setAttribute('aria-selected', 'false'));

            // Hide all panels
            tabPanels.forEach(panel => {
                panel.setAttribute('hidden', '');
                panel.style.display = 'none'; // Force hide
            });

            // Add active state to clicked tab
            button.setAttribute('aria-selected', 'true');

            // Show the target panel
            const targetId = button.getAttribute('aria-controls');
            const targetPanel = windowElement.querySelector(`#${targetId}`);
            if (targetPanel) {
                targetPanel.removeAttribute('hidden');
                targetPanel.style.display = 'block'; // Force show
            }
        });
    });
}

// Main button action
if (goBtn) {
    goBtn.addEventListener('click', () => {
        createCatPopup();
        // Close start menu if it's open
        if (startMenu.classList.contains('active')) {
            startMenu.classList.remove('active');
        }
    });

}


function createTaskbarButton(windowId, windowElement, title = 'Window', iconSrc = null) {
    const taskbarMiddle = document.querySelector('.taskbar-middle');
    const button = document.createElement('button');
    button.className = 'taskbar-window-button active';
    button.dataset.windowId = windowId;

    if (iconSrc) {
        const buttonImage = document.createElement('img');
        buttonImage.src = iconSrc;
        buttonImage.className = 'barImage';
        button.appendChild(buttonImage);
    }

    button.append(title);

    button.onclick = () => {
        const windowData = activeWindows.get(windowId);
        if (windowData.minimized) {
            restoreWindow(windowId);
        } else {
            minimizeWindow(windowId);
        }
    };

    taskbarMiddle.appendChild(button);
}


// Remove taskbar button
function removeTaskbarButton(windowId) {
    const button = document.querySelector(`.taskbar-window-button[data-window-id="${windowId}"]`);
    if (button) button.remove();
}

// Minimize window
function minimizeWindow(windowId) {
    const windowData = activeWindows.get(windowId);
    if (!windowData) return;

    windowData.element.style.display = 'none';
    windowData.minimized = true;

    const button = document.querySelector(`.taskbar-window-button[data-window-id="${windowId}"]`);
    if (button) button.classList.remove('active');
}

function maximizeWindow(windowId) {

    const windowData = activeWindows.get(windowId);
    if (!windowData) return;

    const win = windowData.element;

    if (windowData.maximized) {

        win.style.width = windowData.originalStyle.width;
        win.style.height = windowData.originalStyle.height;
        win.style.left = windowData.originalStyle.left;
        win.style.top = windowData.originalStyle.top;
        windowData.maximized = false;
    } else {
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 35px)';
        win.style.left = '0';
        win.style.top = '0';
        windowData.maximized = true;
    }



}

// Restore window
function restoreWindow(windowId) {
    const windowData = activeWindows.get(windowId);
    if (!windowData) return;

    windowData.element.style.display = 'block';
    windowData.minimized = false;

    const button = document.querySelector(`.taskbar-window-button[data-window-id="${windowId}"]`);
    if (button) button.classList.add('active');
}

// drag enable
function makeDraggable(win) {
    const titleBar = win.querySelector('.title-bar');
    let isDragging = false;
    let offsetX, offsetY;

    titleBar.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('close-button') ||
            e.target.classList.contains('minimize-button') ||
            e.target.hasAttribute('aria-label')) return;

        const windowId = parseInt(win.dataset.windowId);
        const windowData = activeWindows.get(windowId);
        if (windowData && windowData.maximized) return;

        isDragging = true;
        offsetX = e.clientX - win.offsetLeft;
        offsetY = e.clientY - win.offsetTop;
        titleBar.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            win.style.left = `${e.clientX - offsetX}px`;
            win.style.top = `${e.clientY - offsetY}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        titleBar.style.cursor = 'grab';
    });

}


// --- Drag and Drop for Windows ---
// function makeDraggable(element) {
//     const titleBar = element.querySelector('.title-bar');
//     let isDragging = false;
//     let offsetX, offsetY;
//     let highestZ = 10;
//
//     const startDrag = (e) => {
//         isDragging = true;
//         offsetX = e.clientX - element.offsetLeft;
//         offsetY = e.clientY - element.offsetTop;
//         highestZ++;
//         element.style.zIndex = highestZ;
//         titleBar.style.cursor = 'grabbing';
//         pauseEvent(e);
//     };
//
//     const stopDrag = () => {
//         isDragging = false;
//         titleBar.style.cursor = 'grab';
//     };
//
//     const doDrag = (e) => {
//         if (!isDragging) return;
//         element.style.left = `${e.clientX - offsetX}px`;
//         element.style.top = `${e.clientY - offsetY}px`;
//     };
//
//     titleBar.addEventListener('mousedown', startDrag);
//     document.addEventListener('mouseup', stopDrag);
//     document.addEventListener('mousemove', doDrag);
// }

function pauseEvent(e) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}
