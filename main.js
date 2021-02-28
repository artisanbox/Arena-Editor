const electron = require('electron')
const {app, BrowserWindow, Menu} = require('electron')
let win = null
const gotTheLock = app.requestSingleInstanceLock()
const ipcMain = require('electron').ipcMain;
const path = require("path")

function createWindow() {
    // 创建浏览器窗口
    win = new BrowserWindow({
      width: 800,
      height: 620,
      show: false,
      frame: false,
      transparent: true,
      maximizable: false,
      resizable: false,
      backgroundColor: '#00000000',
      useContentSize: true,
      icon: path.join(__dirname, 'favicon.png'),
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
      },
     
    })
    
    win.once('ready-to-show', () => {
        console.log("ready to show")
        win.show()
        // 检查是否存在需要直接打开的文件，有的话就直接打开
        if (preFilePath) {
            win.webContents.send('dock-file', [preFilePath])
        }
    })

    // 并且为你的应用加载 index.html
    win.loadFile('arena.html')

    // 打开开发者工具
    // win.webContents.openDevTools()
    
    // 取消默认菜单
    Menu.setApplicationMenu(null)

    ipcMain.on('asynchronous-message', function(event, arg) {
        console.log(arg);
        win.focus()
        if (arg == 'copy') {
            win.webContents.copy()
            console.log("win.webContents.copy()", win.webContents.copy())
        } else if (arg == 'paste') {
            win.webContents.paste()
        } else if (arg == 'cut') {
            win.webContents.cut()
        }
        
        event.sender.send('asynchronous-reply', '操作完毕');
    });

    let bool = false
    let channel = 'main-process-messages'
    win.on('close', function(event) {
        //在应用程序开始关闭它的窗口的时候被触发
        console.log('close start')
        if (bool == false) {
            event.preventDefault()
        } 
        win.webContents.send(channel, 'beforeCopy');
        ipcMain.on('main-process-messages', function(event, arg) {
            console.log(arg);
            if (arg == 'close') {
                channel = 'others'
                bool = true
                app.quit()
            }
        });
    })

    // id 为 1
    // console.log("id", win.webContents.id)
    ipcMain.on('min', function() {
        win.minimize();
    })
    //登录窗口最大化
    ipcMain.on('max', function() {
        if (win.isMaximized()) {
            //重新设置窗口客户端的宽高值（例如网页界面），这里win.setSize(x,y)并不生效。
            win.setContentSize(800, 620); 
            // 窗口居中
            win.center(); 
        } else {
            win.maximize(); 
        }
    })
    ipcMain.on('close', function() {
        win.close();
    })
}

let myTurtle = null
let myTurtlePage = function(code) {
    myTurtle = new BrowserWindow ({
        width: 630, 
        height: 520,
        show: false,
        maximizable: false,
        resizable: false,
        frame: false,
        icon: path.join(__dirname, 'favicon.png'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
    })

    // Menu.setApplicationMenu(null)
    myTurtle.loadFile("turtle.html");

    myTurtle.webContents.on('did-finish-load', function(){
        myTurtle.show()
        console.log("id", myTurtle.webContents.id)
        console.log("send")
        myTurtle.webContents.send('myTurtle-reply', code);
        ipcMain.on('myTurtle-reply', function(event, arg) {
            console.log(arg);
            if (arg != 'get-myTurtle-reply') {
                console.log('send twice')
                myTurtle.webContents.send('myTurtle-reply', code);
            }
        });
    });
    
    // myTurtle.webContents.openDevTools()
}
let myTurtleMessage = function() {
    ipcMain.on('myTurtle', function(event, arg) {
        console.log(arg)
        myTurtlePage(arg)       
    });

    ipcMain.on('turtle-min', function() {
        myTurtle.minimize();
    })

    ipcMain.on('turtle-max', function() {
        if (myTurtle.isMaximized()) {
            myTurtle.setContentSize(630, 520); 
            myTurtle.center(); 
        } else {
            myTurtle.maximize(); 
        }
    })

    ipcMain.on('turtle-close', function(event, arg) {
        console.log("close begin")
        if (myTurtle != null) {
            console.log("close")
            console.log("id", myTurtle.webContents.id)
            myTurtle.close()
        } 
    })
}

let about = null
let aboutPage = function() {
    about = new BrowserWindow ({
        width: 400, 
        height: 220,
        show: false,
        maximizable: false,
        resizable: false,
        frame: false,
        icon: path.join(__dirname, 'favicon.png'),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        },
    })

    // Menu.setApplicationMenu(null)
    about.loadFile("about.html");

    about.webContents.on('did-finish-load', function(){
        about.show()
        console.log("about id", about.webContents.id)
    });
    
    // about.webContents.openDevTools()
}
let aboutMessage = function() {
    ipcMain.on('about', function(event, arg) {
        console.log("about page open")
        aboutPage()       
    });

    ipcMain.on('about-min', function() {
        about.minimize();
    })

    ipcMain.on('about-close', function(event, arg) {
        console.log("about close begin")
        if (about != null) {
            console.log("about close")
            console.log("about id", about.webContents.id)
            about.close()
        } 
    })
}

let preFilePath = ''
let initApp = function() {
    // Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
    // 部分 API 在 ready 事件触发后才能使用。
    
    app.whenReady().then(function() {
        createWindow()
        
        // 打开文件事件（MacOS有效）
        app.on("open-file", (e, filePath) => {
            console.log("open-file: ", filePath);
            const fw = BrowserWindow.getFocusedWindow();
            if (fw) {
                fw.webContents.send("dock-file", [filePath]);
            } else {
                preFilePath = filePath
            }
        });
        if (process.platform ==='win32' && process.argv.length >= 2) {
            console.log('process argv:', process.argv)
            // windows系统当没有路径参数时这个位置默认有个.，需要加以判断
            preFilePath = process.argv[1] === '.' ? '' : process.argv[1]
        }
    })

    // Quit when all windows are closed, except on macOS. There, it's common
    // for applications and their menu bar to stay active until the user quits
    // explicitly with Cmd + Q.
    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
          app.quit()
        }
    })

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    // myTurtle page 事件处理
    myTurtleMessage()

    // about page 事件处理
    aboutMessage()
}

let __main = function() {
    // app.on('open-file', (event, path) => {
    //     win.webContents.send('dock-file', "-----hello");
    // });
    if (!gotTheLock) {
      app.quit()
    } else {
        app.on('second-instance', (event, commandLine, workingDirectory) => {
          // 当运行第二个实例时,将会聚焦到 win 这个窗口
          if (win) {
              if (win.isMinimized()) win.restore()
              win.focus()
          }
        })

        // 创建 win, 加载应用的其余部分, etc...
        initApp()
    }
}

__main()





// 您可以把应用程序其他的流程写在在此文件中
// 代码 也可以拆分成几个文件，然后用 require 导入

/*

{
  "name": "arena",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "electron .",
    "packager": "electron-packager ./ myapp --out ./OutApp --electron-version 11.0.0-beta.9 --overwrite --icon=./favicon.ico",
    "pack": " electron-builder --dir ",
    "dist": " electron-builder --win --x64",
    "postinstall": "electron-builder install-app-deps"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "electron": "^11.2.3"
  },
  "keywords": [],
  "description": "Arena 一款轻量级的 JS 编辑器",
  "build": {  
    "productName":"Arena",
    "appId": "com.juantu.vip",
    "copyright":"Juantu",
    "directories": { 
      "output": "build"
    }, 
    "win": {  
      "icon": "./favicon.ico"
    }  
  }
}

*/