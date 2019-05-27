const { app, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron')
const Store = require("electron-store")
const path = require('path')
const url = require('url')
const https = require("https")


// SET ENV
process.env.NODE_ENV = 'development';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
let addProjectWindow
let addDeviceTokenWindow
const store = new Store();
var lastId = 0

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

    updateProjects()

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


function createAddProjectWindow() {
    addProjectWindow = new BrowserWindow({
        width: 400,
        height: 400,
        title: 'Add Project',
        parent: win,
        modal: true,
        center: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    addProjectWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addProject.html'),
        protocol: 'file:',
        slashes: true
    }))

    // Handle garbage collection
    addProjectWindow.on('close', function() {
        addProjectWindow = null;
    })
}

function createAddDeviceTokenWindow(id) {
    addDeviceTokenWindow = new BrowserWindow({
        width: 400,
        height: 250,
        title: 'Add Device Token',
        parent: win,
        modal: true,
        center: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    addDeviceTokenWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addDeviceToken.html'),
        protocol: 'file:',
        slashes: true
    }))

    lastId = id


    // Handle garbage collection
    addDeviceTokenWindow.on('close', function() {
        addProjectWindow = null;
    })
}

global.createAddDeviceTokenWindow = createAddDeviceTokenWindow

// Catch project:add
ipcMain.on('project:add', function(e, access) {
    addProjectWindow.close();
    accesses = store.get("accesses") || []
    accesses = [...accesses, access]
    store.set("accesses", accesses)
    accesses = null
    updateProjects()
})

// Catch device:addToken
ipcMain.on('device:addToken', function(e, token, id) {
    addDeviceTokenWindow.close();
    devices = store.get("devices") || []
    devices[lastId].token = token
    store.set("devices", devices)
    devices = null
})


function updateProjects() {
    accesses = store.get("accesses")
    projects = []
    store.set("projects", projects)

    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0; //TODO: make more secure

    for (let index = 0; index < accesses.length; index++) {
        const access = accesses[index]
        https.get("https://" + access.url + ":" + access.port + "/" + access.token + "/project", (resp) => {
            let data = ""

            resp.on("data", (chunk) => {
                data += chunk
            })
            resp.on("end", () => {
                projects = store.get("projects") || []
                projects = [...projects, JSON.parse(data)]
                store.set("projects", projects)
            })
        }).on("error", (err) => {
            console.log("Error: " + err.message)
        })
    }
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 1;
}




// Create menu template
const mainMenuTemplate = [
    // Each object is a dropdown
    {
        label: 'File',
        submenu: [{
                label: 'Add Project',
                //accelerator: process.platform == 'darwin' ? 'Command+T' : 'Ctrl+T',
                click() {
                    createAddProjectWindow();
                }
            },
            {
                label: 'Add Token',
                //accelerator: process.platform == 'darwin' ? 'Command+T' : 'Ctrl+T',
                click() {
                    createAddDeviceTokenWindow();
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
    },
    {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]
    }
];

if (process.platform == 'darwin') {
    mainMenuTemplate.unshift({
        label: "Blynk-Desktop",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); } }
        ]
    });
}

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

module.exports = createAddDeviceTokenWindow