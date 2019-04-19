import React from 'react'
import { remote } from 'electron'
import { getStoredValue, persists, persistKeys } from '../../persists'
import './general.less'

export class General extends React.Component<General.Props, General.State> {

  state = {
    autoLaunch: getStoredValue<boolean>(persistKeys.autoLaunch),
    muteScreenshot: getStoredValue<boolean>(persistKeys.muteScreenshot),
    copyResultToClipboard: getStoredValue<boolean>(persistKeys.copyResultToClipboard),
  }

  handleAutoLunchChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const autoLaunch = e.target.checked
    persists.set(persistKeys.autoLaunch, autoLaunch)
    remote.app.setLoginItemSettings({ openAtLogin: autoLaunch })
    this.setState({ autoLaunch })
  }

  handleMuteChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const muteScreenshot = e.target.checked
    persists.set(persistKeys.muteScreenshot, muteScreenshot)
    this.setState({ muteScreenshot })
  }

  handleCopyChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const copyResultToClipboard = e.target.checked
    persists.set(persistKeys.copyResultToClipboard, copyResultToClipboard)
    this.setState({ copyResultToClipboard })
  }

  render() {
    return (
      <React.Fragment>
        <div className="general-item">
          <label>
            <input
              type="checkbox"
              checked={this.state.autoLaunch}
              onChange={this.handleAutoLunchChanged}
            />
            <span>Launch on system startup</span>
          </label>
        </div>
        <div className="general-item">
          <label>
            <input
              type="checkbox"
              checked={this.state.copyResultToClipboard}
              onChange={this.handleCopyChanged}
            />
            <span>Copy result to clipboard</span>
          </label>
        </div>
        <div className="general-item">
          <label>
            <input
              type="checkbox"
              checked={this.state.muteScreenshot}
              onChange={this.handleMuteChanged}
            />
            <span>Mute when capture screen</span>
          </label>
        </div>
      </React.Fragment>
    )
  }
}

export module General {
  export interface Props { }
  export interface State {
    autoLaunch: boolean,
    muteScreenshot: boolean,
    copyResultToClipboard: boolean,
  }
}
