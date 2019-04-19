import React from 'react'
import Mousetrap from 'mousetrap'
import 'mousetrap/plugins/record/mousetrap-record.min.js'
import { ipcRenderer } from 'electron'
import { config } from '../../config'
import { SHORTCUTS_CHANGED } from '../../actions'
import { GlobalShortcuts, getGlobalShortcuts, setGlobalShortcuts } from '../../persists'
import './shortcut.less'

export class Shortcut extends React.Component<Shortcut.Props, Shortcut.State> {
  state = {
    shortcuts: getGlobalShortcuts(),
    recordingKey: '',
    resetHovering: false,
    cancelHovering: false,
  }

  update(shortcuts: GlobalShortcuts) {
    this.setState({
      shortcuts,
      recordingKey: '',
      resetHovering: false,
      cancelHovering: false,
    })

    setGlobalShortcuts(shortcuts)
    ipcRenderer.send(SHORTCUTS_CHANGED)
  }

  clearShortcut(name: string) {
    const shortcuts = {
      ...this.state.shortcuts,
      [name]: '',
    }
    this.update(shortcuts)
  }

  startRecord(name: string) {
    this.setState({ recordingKey: name }),
      (Mousetrap as any).record(this.endRecord.bind(this, name))
  }

  cancelRecord() {
    this.setState({ recordingKey: '' })
  }

  endRecord(name: string, sequence: string[]) {
    const shortcut = sequence.join('+')
    console.log(shortcut)
    if (
      shortcut.indexOf('enter') >= 0 ||
      shortcut.indexOf('enter') >= 0 ||
      shortcut.indexOf('capslock') >= 0 ||
      shortcut.indexOf('tab') >= 0 ||
      shortcut.indexOf('fn') >= 0 ||
      shortcut.indexOf('backspace') >= 0
    ) {
      setTimeout(
        () => {
          (Mousetrap as any).record(this.endRecord.bind(this, name))
        },
        0,
      )
      return
    }

    const shortcuts = {
      ...this.state.shortcuts,
      [name]: shortcut,
    }

    this.update(shortcuts)
  }

  resetShortcut(name: string) {
    const shortcuts = {
      ...this.state.shortcuts,
      [name]: (config.defaultShortcuts as any)[name],
    }

    this.update(shortcuts)
  }

  onCancelMouseEnter() {
    this.setState({ cancelHovering: true })
  }

  onCancelMouseLeave() {
    this.setState({ cancelHovering: false })
  }

  onResetMouseEnter() {
    this.setState({ resetHovering: true })
  }

  onResetMouseLeave() {
    this.setState({ resetHovering: false })
  }

  render() {
    const { shortcuts, recordingKey, cancelHovering, resetHovering } = this.state
    return (
      <React.Fragment>
        <div className="shortcut-item">
          <label>Capture screen</label>
          <div className="inner">
            {
              recordingKey === 'captureScreen' ? (
                <React.Fragment>
                  <button className="text recording">
                    {
                      !cancelHovering ? 'Type Shortcut' : 'Cancel'
                    }
                  </button>
                  <button
                    onClick={this.cancelRecord.bind(this, 'captureScreen')}
                    onMouseEnter={this.onCancelMouseEnter.bind(this)}
                    onMouseLeave={this.onCancelMouseLeave.bind(this)}
                  >
                    ⎋
                  </button>
                </React.Fragment>
              ) : shortcuts.captureScreen ? (
                <React.Fragment>
                  <button onClick={this.startRecord.bind(this, 'captureScreen')}>
                    {Shortcut.shortcutToSymbol(shortcuts.captureScreen)}
                  </button>
                  <button onClick={this.clearShortcut.bind(this, 'captureScreen')}>✕</button>
                </React.Fragment>
              ) : <React.Fragment>
                    <button
                      onClick={this.startRecord.bind(this, 'captureScreen')}
                      className="text"
                    >
                      {
                        resetHovering ? 'Reset to Default' : 'Click to Record Shortcut'
                      }
                    </button>
                    <button
                      onClick={this.resetShortcut.bind(this, 'captureScreen')}
                      onMouseEnter={this.onResetMouseEnter.bind(this)}
                      onMouseLeave={this.onResetMouseLeave.bind(this)}
                    >
                      ↻
                    </button>
                  </React.Fragment>
            }
          </div>
        </div>
        <div className="shortcut-item">
          <label>Show recognition result</label>
          <div className="inner">
            {
              recordingKey === 'showRecognitionResult' ? (
                <React.Fragment>
                  <button className="text recording">
                    {
                      !cancelHovering ? 'Type Shortcut' : 'Cancel'
                    }
                  </button>
                  <button
                    onClick={this.cancelRecord.bind(this, 'showRecognitionResult')}
                    onMouseEnter={this.onCancelMouseEnter.bind(this)}
                    onMouseLeave={this.onCancelMouseLeave.bind(this)}
                  >
                    ⎋
                  </button>
                </React.Fragment>
              ) : shortcuts.showRecognitionResult ? (
                <React.Fragment>
                  <button onClick={this.startRecord.bind(this, 'showRecognitionResult')}>
                    {Shortcut.shortcutToSymbol(shortcuts.showRecognitionResult)}
                  </button>
                  <button onClick={this.clearShortcut.bind(this, 'showRecognitionResult')}>
                    ✕
                  </button>
                </React.Fragment>
              ) : <React.Fragment>
                    <button
                      onClick={this.startRecord.bind(this, 'showRecognitionResult')}
                      className="text"
                    >
                      {
                        resetHovering ? 'Reset to Default' : 'Click to Record Shortcut'
                      }
                    </button>
                    <button
                      onClick={this.resetShortcut.bind(this, 'showRecognitionResult')}
                      onMouseEnter={this.onResetMouseEnter.bind(this)}
                      onMouseLeave={this.onResetMouseLeave.bind(this)}
                    >
                      ↻
                    </button>
                  </React.Fragment>
            }
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export module Shortcut {
  export interface Props { }
  export interface State {
    shortcuts: GlobalShortcuts,
    recordingKey: string,
    resetHovering: boolean,
    cancelHovering: boolean,
  }

  export function shortcutToSymbol(shortcut: string) {
    return shortcut
      .replace('meta', 'CmdOrCtrl')
      .replace('CmdOrCtrl', '⌘')
      .replace(/Cmd/i, '⌘')
      .replace(/Ctrl/i, '⌃')
      .replace(/Shift/i, '⇧')
      .replace(/Alt/i, '⌥')
      .replace(/\+/g, '')
      .toUpperCase()
  }
}
