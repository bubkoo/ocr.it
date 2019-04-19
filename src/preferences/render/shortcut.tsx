import React from 'react'
import { ipcRenderer } from 'electron'
import { config } from '../../config'
import { SHORTCUTS_CHANGED } from '../../actions'
import { GlobalShortcuts, getGlobalShortcuts, setGlobalShortcuts } from '../../persists'
import { ShortcutEditor } from './shortcut-editor'
import './shortcut.less'

export class Shortcut extends React.Component<Shortcut.Props, Shortcut.State> {
  state = {
    shortcuts: getGlobalShortcuts(),
    recordingKey: '',
  }

  onStartRecord(name: string) {
    this.setState({ recordingKey: name })
  }

  onStopRecord() {
    this.setState({ recordingKey: '' })
  }

  onChange(name: string, shortcut: string) {
    const shortcuts = {
      ...this.state.shortcuts,
      [name]: shortcut,
    }

    setGlobalShortcuts(shortcuts)
    ipcRenderer.send(SHORTCUTS_CHANGED)

    this.setState({
      shortcuts,
      recordingKey: '',
    })
  }

  render() {
    const { shortcuts, recordingKey } = this.state
    return (
      <React.Fragment>
        <div className="shortcut-item">
          <label>Capture screen</label>
          <div className="inner">
            <ShortcutEditor
              value={shortcuts.captureScreen}
              raw={config.defaultShortcuts.captureScreen}
              recording={recordingKey === 'captureScreen'}
              onChange={this.onChange.bind(this, 'captureScreen')}
              onStartRecord={this.onStartRecord.bind(this, 'captureScreen')}
              onStopRecord={this.onStopRecord.bind(this, 'captureScreen')}
            />
          </div>
        </div>
        <div className="shortcut-item">
          <label>Show recognition result</label>
          <div className="inner">
            <ShortcutEditor
              value={shortcuts.showRecognitionResult}
              raw={config.defaultShortcuts.showRecognitionResult}
              recording={recordingKey === 'showRecognitionResult'}
              onChange={this.onChange.bind(this, 'showRecognitionResult')}
              onStartRecord={this.onStartRecord.bind(this, 'showRecognitionResult')}
              onStopRecord={this.onStopRecord.bind(this, 'showRecognitionResult')}
            />
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
