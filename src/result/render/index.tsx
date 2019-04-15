import React from 'react'
import { ipcRenderer } from 'electron'
import { GET_LAST_RECOGNITION_RESULT } from '../../actions'
import {
  RecognitionResult,
  getLastRecognitionResult,
  RecognitionResultWindowOptions,
  getRecognitionResultWindowOptions,
  // setRecognitionResultWindowOptions,
} from '../../persists'

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
  }

  render() {
    const { data } = this.state

    return (
      <div>
        <div>Path:{data.path}</div>
        <textarea value={data.result.join('\n')} />
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
