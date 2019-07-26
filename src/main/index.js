import { app, BrowserWindow, globalShortcut, Menu, Tray, nativeImage } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let tray = null;
let platform_darwin = process.platform === "darwin";
const winURL = process.env.NODE_ENV === 'development' ?
    `http://localhost:9080` :
    `file://${__dirname}/index.html`
let trayIcon = null;

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 715,
        useContentSize: true,
        width: 602,
        resizable: false,
        fullscreenable: false,
        maximizable: false,
        frame: false,
        fullscreen: false
    })
    //mainWindow.webContents.openDevTools() //打开调试
    mainWindow.loadURL(winURL)
    mainWindow.on('closed', () => {
        mainWindow = null
    })

    //console.log(require('path').join(__dirname, 'tray'))
    let tpIcon = '256x256.png'
    if(platform_darwin){
      tpIcon = 'tp.png';
    }
    if (process.env.NODE_ENV === 'development') {
        trayIcon = require('path').resolve(__dirname, '../../build/icons/'+tpIcon);
    } else {
        trayIcon = require('path').resolve(__dirname, '../../../build/icons/'+tpIcon);
    }

    const nimage = nativeImage.createFromPath(trayIcon);
    tray = new Tray(nimage);
    //tray.setHighlightMode('always')

    // mainWindow.on('close', (event) => {
    //     mainWindow.hide();
    //     mainWindow.setSkipTaskbar(true);
    //     event.preventDefault();
    // });
    // mainWindow.on('show', () => {
    //     tray.setHighlightMode('always')
    // })
    // mainWindow.on('hide', () => {
    //     tray.setHighlightMode('never')
    // })
    const contextMenu = Menu.buildFromTemplate([{
        label: '显示',
        click: () => {
            mainWindow.show();
        }
    }, {
        label: '最小化',
        click: () => {
            mainWindow.hide();
        }
    }, {
        label: '退出',
        click: () => {
            mainWindow = null;
            app.quit()
        }
    }])
    if (!platform_darwin) {
        tray.setContextMenu(contextMenu)
    }
    tray.setToolTip('hostadmin')
    tray.on('click', () => { //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
        let winVisible = mainWindow.isVisible()
        if (winVisible) {
            mainWindow.hide()
        } else {
            mainWindow.show()
        }
        //mainWindow.isVisible() ? mainWindow.setSkipTaskbar(false) : mainWindow.setSkipTaskbar(true);
    })
    if (platform_darwin) {
        mainWindow.on('show', () => {
            tray.setContextMenu(contextMenu)
        })
        mainWindow.on('hide', () => {
            tray.setContextMenu(null)
        })
    }

}
app.on('ready', () => {
    createWindow();
    registerCmd();
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('browser-window-focus', (e, cmd) => {
    //console.log('focus')
    registerCmd();
})

function registerCmd() {
    if (platform_darwin) {
        let contents = mainWindow.webContents;
        globalShortcut.register("CommandOrControl+C", () => {
            contents.copy();
        });
        globalShortcut.register("CommandOrControl+V", () => {
            contents.paste();
        });
        globalShortcut.register("CommandOrControl+A", () => {
            contents.selectAll();
        });
        globalShortcut.register("CommandOrControl+X", () => {
            contents.cut();
        });
        globalShortcut.register("CommandOrControl+Z", () => {
            contents.undo();
        });
        globalShortcut.register("CommandOrControl+Y", () => {
            contents.redo();
        });
    }
}

function unRegisterCmd() {
    if (platform_darwin) {
        let contents = mainWindow.webContents;
        globalShortcut.unregister('CommandOrControl+A');
        globalShortcut.unregister('CommandOrControl+X');
        globalShortcut.unregister('CommandOrControl+C');
        globalShortcut.unregister('CommandOrControl+V');
        globalShortcut.unregister('CommandOrControl+Z');
        globalShortcut.unregister('CommandOrControl+Y');
    }
}
app.on('browser-window-blur', () => {
    //console.log('blur')
    unRegisterCmd();
})
app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    } else {
        mainWindow.show()
    }
})
var fs = require('fs')

var _path = '/etc/hosts'
if (process.platform === 'win32') {
    _path = 'c:\\Windows\\System32\\drivers\\etc\\hosts'
}

const saveHost = (data) => {
    var t = fs.writeFileSync(_path, data, 'utf8')
    return t
}
app.saveHost = saveHost

fs.watch(_path, function(event, filename) {
    if (event === 'change') {
        mainWindow.webContents.send('hostsChange', '1')
    }
})

const readHost = () => {
    var t = fs.readFileSync(_path, 'utf8')
    return t
}
app.readHost = readHost

const myMinimize = () => {
    mainWindow.hide();
    return trayIcon;
}
app.myMinimize = myMinimize
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */