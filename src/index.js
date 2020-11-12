const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
let userToken = "";


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  let tags = {};
  let files = [];
  let assoc = {};

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    icon: __dirname + '/img/icon.ico',
		webPreferences: {
			nodeIntegration: true
		}
  });
  mainWindow.removeMenu()

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '/tokenPage/token.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  ipcMain.on("token-register", (event, args)=>{
    userToken = args
  })
  ipcMain.on("token-ask", (event, args)=>{
    event.reply("token-give", userToken);
  })

  ipcMain.on("token-end", ()=>{
    mainWindow.loadFile(path.join(__dirname, '/tagsPage/tags.html'));
  })

  ipcMain.on("tags-end", (event, args)=>{
    tags = args
    mainWindow.loadFile(path.join(__dirname, '/filesPage/files.html'));
    //console.log("received files ! " + JSON.stringify(tags))
  })
  
  ipcMain.on("files-end", (event, args)=>{
    files = args
    mainWindow.loadFile(path.join(__dirname, '/comparePage/compare.html'));
    //console.log("received tags ! " + JSON.stringify(tags))
  });


  ipcMain.on("compare-end", (event, args)=>{
    assoc = args
    mainWindow.loadFile(path.join(__dirname, '/buildPage/build.html'));
    //console.log("received association table ! " + JSON.stringify(assoc))
  })


  ipcMain.on("tags-ask", (event, args)=>{
    event.reply("tags-give", tags);
  })

  ipcMain.on("files-ask", (event, args)=>{
    event.reply("files-give", files);
  })
  
  ipcMain.on("assoc-ask", (event, args)=>{
    event.reply("assoc-give", assoc);
  })

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
