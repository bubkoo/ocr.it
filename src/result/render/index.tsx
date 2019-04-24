import React from 'react'
import classnames from 'classnames'
import { ipcRenderer, clipboard, remote } from 'electron'
import { toBase64Sync } from '../../utils'
import {
  RESULT_WINDOW_UPDATE,
  RESULT_WINDOW_SHOW,
  RESULT_WINDOW_TOGGLE_IMAGE,
  RESULT_WINDOW_TOGGLE_PINNED,
} from '../../actions'
import {
  RecognitionResult,
  getLastRecognitionResult,
  setLastRecognitionResult,
  ResultWindowOptions,
  getResultWindowOptions,
  setResultWindowOptions,
} from '../../persists'
import * as icons from './icons'
import './index.less'

export default class Root extends React.Component<Root.Props, Root.State> {
  testDiv: HTMLDivElement

  constructor(props: Root.Props) {
    super(props)
    this.state = {
      data: getLastRecognitionResult(),
      options: getResultWindowOptions(),
    }

    ipcRenderer.on(RESULT_WINDOW_UPDATE, () => {
      const data = getLastRecognitionResult()
      this.setState({ data }, () => {
        this.measureText(data.result || [])
      })
    })

    ipcRenderer.on(RESULT_WINDOW_TOGGLE_IMAGE, () => {
      this.setState({ options: getResultWindowOptions() })
    })
  }

  measureText(texts: string[]) {
    this.testDiv.innerHTML = texts.join('<br>')
    ipcRenderer.send(RESULT_WINDOW_SHOW, {
      width: this.testDiv.clientWidth + 16,
      height: this.testDiv.clientHeight + 8,
    })
    this.testDiv.innerHTML = ''
  }

  handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const data = getLastRecognitionResult()
    data.result = e.target.value.split('\n')
    setLastRecognitionResult(data)
    this.setState({ data })
  }

  toggleContinuously = () => {
    const options = {
      ...this.state.options,
      continuously: !this.state.options.continuously,
    }
    this.setState({ options })
    setResultWindowOptions(options)
  }

  toggleImage = () => {
    const options = {
      ...this.state.options,
      showImage: !this.state.options.showImage,
    }
    this.setState({ options })
    setResultWindowOptions(options)
    ipcRenderer.send(RESULT_WINDOW_TOGGLE_IMAGE)
  }

  togglePinned = () => {
    const options = {
      ...this.state.options,
      pinned: !this.state.options.pinned,
    }
    this.setState({ options })
    setResultWindowOptions(options)
    ipcRenderer.send(RESULT_WINDOW_TOGGLE_PINNED)
  }

  copyToClipboard = () => {
    clipboard.writeText(this.state.data.result.join('\n'))
    new remote.Notification({
      title: 'ocr.it',
      body: 'Recognition result was copied',
      sound: 'Basso',
    }).show()
  }

  refTest = (elem: HTMLDivElement) => {
    this.testDiv = elem
  }

  renderImage() {
    const { data, options } = this.state
    if (options.showImage) {
      const url = data.path ? `data:image/png;base64,${toBase64Sync(data.path)}` : ''
      return (
        <div className="result-image">
          <div
            className="result-image-inner"
            style={{ backgroundImage: `url('${url}')` }}
          />
        </div>
      )
    }
  }

  renderOptions() {
    const { options } = this.state
    return (
      <div className="result-options">
        <div className="toolbar">
          <i className="icon copy" onClick={this.copyToClipboard}>
            <span className="tooltip">Copy to Clipboard</span>
            {icons.copy()}
          </i>
        </div>
        <div className="toolbar">
          <i
            onClick={this.toggleContinuously}
            className={classnames('icon', { checked: options.continuously })}
          >
            <span className="tooltip right">Continuously recognize</span>
            {icons.continuously()}
          </i>
          <i
            onClick={this.toggleImage}
            className={classnames('icon', { checked: options.showImage })}
          >
            <span className="tooltip right">Toggle Image</span>
            {icons.image()}
          </i>
          <i
            onClick={this.togglePinned}
            className={classnames('icon pin', { checked: options.pinned })}
          >
            <span className="tooltip right">Toggle Pinned</span>
            {
              icons.pin()
            }
          </i>
        </div>
      </div>
    )
  }

  render() {
    const { data } = this.state

    return (
      <React.Fragment>
        <div id="test" ref={this.refTest} />
        <div className="result-wrap">
          {this.renderImage()}
          <div className="result-text">
            <textarea
              value={data.result.join('\n')}
              onChange={this.handleTextChange}
            />
            {this.renderOptions()}
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export namespace Root {
  export interface Props { }
  export interface State {
    data: RecognitionResult,
    options: ResultWindowOptions
  }
}
