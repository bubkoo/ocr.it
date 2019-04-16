import { ipcMain, Event, Menu, BrowserWindow } from 'electron'
import { RESULT_WINDOW_SHOW_OPTION_MENU } from '../actions'
import { setRecognitionResultWindowOptions, getRecognitionResultWindowOptions } from '../persists'
import { pinWindow, toggleImage } from './window'

let menu: Menu

function createMenu() {
  const options = getRecognitionResultWindowOptions()
  menu = Menu.buildFromTemplate([
    {
      label: 'Show Image',
      accelerator: 'CmdOrCtrl+I',
      type: 'checkbox',
      checked: options.showImage,
      click: () => {
        const data = getRecognitionResultWindowOptions()
        setRecognitionResultWindowOptions({
          ...data,
          showImage: !data.showImage,
        })
        toggleImage()
      },
    },
    {
      label: 'Pin',
      accelerator: 'CmdOrCtrl+P',
      type: 'checkbox',
      checked: options.pinned,
      click: () => {
        const data = getRecognitionResultWindowOptions()
        setRecognitionResultWindowOptions({
          ...data,
          pinned: !data.pinned,
        })
        pinWindow()
      },
    },
  ])
}

function showMenu(window: BrowserWindow) {
  if (!menu) {
    createMenu()
  }

  menu.popup({ window })
}

ipcMain.on(RESULT_WINDOW_SHOW_OPTION_MENU, (event: Event) => {
  const window = BrowserWindow.fromWebContents(event.sender)
  showMenu(window)
})
