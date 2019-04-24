import React from 'react'
import classnames from 'classnames'
import { ipcRenderer } from 'electron'
import {
  HistoryItem,
  getHistoryRecognitions,
} from '../../persists'
import {
  HISTORY_WINDOW_UPDATE,
} from '../../actions'
import './index.less'

export default class History extends React.Component<History.Props, History.State> {
  constructor(props: History.Props) {
    super(props)
    console.log(getHistoryRecognitions())
    this.state = {
      items: getHistoryRecognitions(),
    }

    ipcRenderer.on(HISTORY_WINDOW_UPDATE, () => {
      this.setState({
        items: getHistoryRecognitions(),
      })
    })
  }

  handleItemClick(key: string) {
    this.setState({ selectedKey: key })
  }

  renderImg(dataURL: string) {
    return (
      <div
        className="img"
        style={{ backgroundImage: `url('data:image/png;base64,${dataURL}')` }}
      />
    )
  }

  render() {
    const { items, selectedKey } = this.state

    return (
      <div className="history-wrap">
        <div className="history-list">
          {
            items.map((item: HistoryItem) => (
              <div
                className={classnames('history-list-item', { selected: selectedKey === item.path })}
                key={item.path}
                onClick={this.handleItemClick.bind(this, item.path)}
              >
                <div className="thumb">
                  {this.renderImg(item.path)}
                </div>
                <div className="detail">
                  <div className="text">{item.result.join(' ')}</div>
                  <div className="datetime">{new Date(item.datetime).toUTCString()}</div>
                </div>
              </div>
            ))
          }
        </div>
        <div className="history-preview">
          <div className="history-preview-image">img</div>
          <div className="history-preview-text">text</div>
        </div>
      </div>
    )
  }
}

export namespace History {
  export interface Props { }
  export interface State {
    items: HistoryItem[],
    selectedKey?: string,
  }
}
