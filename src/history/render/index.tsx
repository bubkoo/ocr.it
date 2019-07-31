import React from 'react'
import classnames from 'classnames'
import { ipcRenderer } from 'electron'
import {
  HistoryItem,
  getHistoryRecognitions,
  removeHistoryRecognitionItem,
} from '../../persists'
import {
  HISTORY_WINDOW_BLUR,
  HISTORY_WINDOW_FOCUS,
  HISTORY_WINDOW_UPDATE,
} from '../../actions'
import './index.less'

ipcRenderer.on(HISTORY_WINDOW_BLUR, () => {
  if (!document.body.classList.contains('nofocus')) {
    document.body.classList.add('nofocus')
  }
})

ipcRenderer.on(HISTORY_WINDOW_FOCUS, () => {
  document.body.classList.remove('nofocus')
})

export default class History extends React.Component<History.Props, History.State> {
  constructor(props: History.Props) {
    super(props)
    const items = getHistoryRecognitions()
    this.state = {
      items,
      selectedKey: items && items[0] && items[0].path || '',
    }

    ipcRenderer.on(HISTORY_WINDOW_UPDATE, () => {
      this.setState({
        items: getHistoryRecognitions(),
      })
    })
  }

  handleItemClick(path: string) {
    this.setState({ selectedKey: path })
  }

  handleItemDelete(item: HistoryItem, index: number, e: Event) {
    e.stopPropagation()
    removeHistoryRecognitionItem(item)

    const items = this.state.items.filter(it => it.path !== item.path)
    this.setState({ items })
    if (item.path === this.state.selectedKey) {
      if (index <= items.length - 1) {
        this.setState({ selectedKey: items[index].path })
      } else {
        this.setState({ selectedKey: items[items.length - 1].path })
      }
    }
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
    const selectedItem = selectedKey
      ? items.find(item => item.path === selectedKey)
      : null

    console.log(items)

    return (
      <div className="history-wrap">
        <div className="history-title">Recogniztion History</div>
        <div className="history-inner">
          <div className="history-side">
            <div className="history-list">
              {
                items.map((item: HistoryItem, index: number) => (
                  <div
                    className={
                      classnames(
                        'history-list-item',
                        { selected: selectedKey === item.path },
                      )
                    }
                    key={item.path}
                    onClick={this.handleItemClick.bind(this, item.path)}
                  >
                    <div className="thumb">
                      {this.renderImg(item.base64!)}
                    </div>
                    <div className="detail">
                      <div className="text">{item.result.join(' ')}</div>
                      <div className="datetime">
                        {new Date(item.datetime).toUTCString()}
                      </div>
                    </div>
                    <div
                      className="delete"
                      onClick={this.handleItemDelete.bind(this, item, index)}
                    >
                      <svg
                        viewBox="0 0 482.428 482.429"
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path
                          // tslint:disable-next-line
                          d="M381.163 57.799h-75.094C302.323 25.316 274.686 0 241.214 0c-33.471 0-61.104 25.315-64.85 57.799h-75.098c-30.39 0-55.111 24.728-55.111 55.117v2.828c0 23.223 14.46 43.1 34.83 51.199v260.369c0 30.39 24.724 55.117 55.112 55.117h210.236c30.389 0 55.111-24.729 55.111-55.117V166.944c20.369-8.1 34.83-27.977 34.83-51.199v-2.828c0-30.39-24.723-55.118-55.111-55.118zm-139.949-31.66c19.037 0 34.927 13.645 38.443 31.66h-76.879c3.515-18.016 19.406-31.66 38.436-31.66zm134.091 401.173c0 15.978-13 28.979-28.973 28.979H136.096c-15.973 0-28.973-13.002-28.973-28.979V170.861h268.182v256.451zm34.83-311.568c0 15.978-13 28.979-28.973 28.979H101.266c-15.973 0-28.973-13.001-28.973-28.979v-2.828c0-15.978 13-28.979 28.973-28.979h279.897c15.973 0 28.973 13.001 28.973 28.979v2.828z"
                        />
                        <path
                          // tslint:disable-next-line
                          d="M171.144 422.863c7.218 0 13.069-5.853 13.069-13.068V262.641c0-7.216-5.852-13.07-13.069-13.07-7.217 0-13.069 5.854-13.069 13.07v147.154c-.001 7.217 5.851 13.068 13.069 13.068zM241.214 422.863c7.218 0 13.07-5.853 13.07-13.068V262.641c0-7.216-5.854-13.07-13.07-13.07-7.217 0-13.069 5.854-13.069 13.07v147.154c0 7.217 5.851 13.068 13.069 13.068zM311.284 422.863c7.217 0 13.068-5.853 13.068-13.068V262.641c0-7.216-5.852-13.07-13.068-13.07-7.219 0-13.07 5.854-13.07 13.07v147.154c-.001 7.217 5.853 13.068 13.07 13.068z"
                        />
                      </svg>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <div className="history-preview">
            <div className="history-preview-image">
              {
                selectedItem && selectedItem.base64 &&
                this.renderImg(selectedItem.base64)
              }
            </div>
            <div className="history-preview-text">
              {selectedItem && selectedItem.result.join('\n')}
            </div>
          </div>
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
