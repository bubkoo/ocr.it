import { remote } from 'electron'

function setOSTheme() {
  const theme = remote.systemPreferences.isDarkMode() ? 'dark' : 'light'
  window.localStorage.os_theme = theme

  if (window.__setTheme) {
    window.__setTheme()
  }
}

if (process.platform === 'darwin') {
  remote.systemPreferences.subscribeNotification(
    'AppleInterfaceThemeChangedNotification',
    setOSTheme,
  )

  setOSTheme()
}
