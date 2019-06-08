'use strict'

import { app, BrowserWindow } from 'electron'

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

import { autoUpdater } from 'electron-updater'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let splash
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const splashURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080/#splash`
  : `file://${__dirname}/index.html#splash`

function sendStatusToSplash (text) {
  splash.webContents.send('splashMsg', text)
}

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 500,
    useContentSize: true,
    width: 750,
    icon: '',
    resizable: false,
    show: false
  })
  mainWindow.setMenuBarVisibility(false)
  mainWindow.setResizable(false)

  splash = new BrowserWindow({width: 240, height: 480, frame: false, alwaysOnTop: true, transparent: true, skipTaskbar: true})
  splash.loadURL(splashURL)
  mainWindow.loadURL(winURL)

  splash.webContents.once('dom-ready', function () {
    if (process.env.NODE_ENV !== 'development') {
      autoUpdater.checkForUpdates()
    } else {
      sendStatusToSplash('Razhroščevanje omogočeno!')
      setTimeout(function () {
        splash.destroy()
        mainWindow.show()
      }, 3789)
    }
  })

  splash.on('closed', () => {
    splash = null
  })

  mainWindow.on('closed', () => {
    splash = null
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

autoUpdater.on('checking-for-update', () => {
  sendStatusToSplash('Checking for update...')
})
autoUpdater.on('update-available', (info) => {
  sendStatusToSplash('Update available.')
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToSplash('Posodobitev ni potrebna.')
  splash.destroy()
  mainWindow.show()
})
autoUpdater.on('error', (err) => {
  sendStatusToSplash('NAPAKA. ' + err)
})
autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Prenašam ' + progressObj.percent + '%'
  sendStatusToSplash(logMessage)
})
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToSplash('Prenos končan!')
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
