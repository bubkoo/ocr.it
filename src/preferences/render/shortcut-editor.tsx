import React from 'react'
import Mousetrap from 'mousetrap'
import 'mousetrap/plugins/record/mousetrap-record.min.js'

export class ShortcutEditor extends React.Component<ShortcutEditor.Props, ShortcutEditor.State> {
  constructor(props: ShortcutEditor.Props) {
    super(props)
    this.state = {
      value: props.value,
      hovering: false,
    }
  }

  triggerChange(value: string) {
    this.props.onChange(value)
  }

  onStartRecord = () => {
    this.props.onStartRecord(),
      (Mousetrap as any).record(this.endRecord.bind(this))
  }

  onStopRecord = () => {
    this.props.onStopRecord()
  }

  endRecord(sequence: string[]) {
    const shortcut = sequence.join('+')
    console.log(shortcut)
    if (
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

    this.setState({ value: shortcut })
    this.triggerChange(shortcut)
  }

  clearShortcut = () => {
    this.setState({ value: '' })
    this.triggerChange('')
  }

  resetShortcut = () => {
    this.setState({ value: this.props.raw })
    this.triggerChange(this.props.raw)
  }

  onMouseEnter = () => {
    this.setState({ hovering: true })
  }

  onMouseLeave = () => {
    this.setState({ hovering: false })
  }

  render() {
    if (this.props.recording) {
      return (
        <React.Fragment>
          <button className="text recording">
            {
              !this.state.hovering ? 'Type Shortcut' : 'Cancel'
            }
          </button>
          <button
            onClick={this.onStopRecord}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
          >
            ⎋
          </button>
        </React.Fragment>
      )
    }

    if (this.state.value) {
      return (
        <React.Fragment>
          <button onClick={this.onStartRecord}>
            {ShortcutEditor.shortcutToSymbol(this.state.value)}
          </button>
          <button onClick={this.clearShortcut}>✕</button>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <button
          onClick={this.onStartRecord.bind(this, 'showRecognitionResult')}
          className="text"
        >
          {
            this.state.hovering ? 'Reset to Default' : 'Click to Record Shortcut'
          }
        </button>
        <button
          onClick={this.resetShortcut}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
        >
          ↻
        </button>
      </React.Fragment>
    )
  }

}

export namespace ShortcutEditor {
  export interface Props {
    value: string,
    raw: string,
    recording: boolean,
    onChange: (value: string) => void,
    onStartRecord: () => void,
    onStopRecord: () => void,
  }

  export interface State {
    value: string,
    hovering: boolean,
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
