import React from 'react'
import { ipcRenderer } from 'electron'
import { toBase64Sync } from '../../utils'
import {
  GET_LAST_RECOGNITION_RESULT,
  RESULT_WINDOW_TOGGLE_IMAGE,
  RESULT_WINDOW_SHOW_OPTION_MENU,
} from '../../actions'
import {
  RecognitionResult,
  getLastRecognitionResult,
  setLastRecognitionResult,
  RecognitionResultWindowOptions,
  getRecognitionResultWindowOptions,
} from '../../persists'
import './index.less'

export default class Root extends React.Component<Root.Props, Root.State> {
  constructor(props: Root.Props) {
    super(props)
    this.state = {
      data: getLastRecognitionResult(),
      options: getRecognitionResultWindowOptions(),
    }

    ipcRenderer.on(GET_LAST_RECOGNITION_RESULT, () => {
      this.setState({ data: getLastRecognitionResult() })
    })

    ipcRenderer.on(RESULT_WINDOW_TOGGLE_IMAGE, () => {
      this.setState({ options: getRecognitionResultWindowOptions() })
    })
  }

  handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const data = getLastRecognitionResult()
    data.result = e.target.value.split('\n')
    setLastRecognitionResult(data)
    this.setState({ data })
  }

  handleOptionsClick = () => {
    ipcRenderer.send(RESULT_WINDOW_SHOW_OPTION_MENU)
  }

  renderImage() {
    const { data, options } = this.state
    if (options.showImage) {
      const url = data.path ? `data:image/png;base64,${toBase64Sync(data.path)}` : ''
      return (
        <div className="result-image">
          <div className="result-image-inner">
            <img src={url} srcSet={`${url} 2x`} />
          </div>
        </div>
      )
    }
  }

  // tslint:disable:max-line-length
  renderOptions() {
    return (
      <div className="result-options">
        <i className="icon" onClick={this.handleOptionsClick}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false">
            <path d="M30 16c4.411 0 8-3.589 8-8s-3.589-8-8-8-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6zM30 44c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6zM30 22c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z" />
          </svg>
        </i>
      </div>
    )
  }

  render() {
    const { data } = this.state

    return (
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
    )
  }
}

export namespace Root {
  export interface Props { }
  export interface State {
    data: RecognitionResult,
    options: RecognitionResultWindowOptions
  }
}
