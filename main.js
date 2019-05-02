const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const Store = require("electron-store")
const path = require('path')
const url = require('url')

// SET ENV
process.env.NODE_ENV = 'development';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let addWindow
const store = new Store();

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "BLYNK-Desktop Client",
        webPreferences: {
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
        // Insert menu
    Menu.setApplicationMenu(mainMenu)

    // Open the DevTools.
    //win.webContents.openDevTools()

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow()
    }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: 'Add Project',
        webPreferences: {
            nodeIntegration: true
        }
    });
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addProject.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Handle garbage collection
    addWindow.on('close', function() {
        addWindow = null;
    });
}



// Catch project:add
ipcMain.on('project:add', function(e, token) {
    win.webContents.send('project:add', token);
    addWindow.close();

    tokens = store.get("tokens") || []
    tokens = [...tokens, token]
    console.log(tokens)
    store.set("tokens", tokens)
    tokens = null
});





// Create menu template
const mainMenuTemplate = [
    // Each object is a dropdown
    {
        label: 'File',
        submenu: [{
                label: 'Add Project',
                accelerator: process.platform == 'darwin' ? 'Command+T' : 'Ctrl+Q',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear Items',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
];


// Add developer tools option if in dev
if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [{
                role: 'reload'
            },
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            }
        ]
    })
}