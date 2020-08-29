import React from 'react'
import classnames from 'classnames'
import { ipcRenderer } from 'electron'
import {
  PREFERENCES_WINDOW_BLUR,
  PREFERENCES_WINDOW_FOCUS,
  PREFERENCES_WINDOW_UPDATE_SIZE,
} from '../../actions'
import { switcho, command, chip } from './icons'
import { General } from './general'
import { Service } from './service'
import { Shortcut } from './shortcut'
import './index.less'

ipcRenderer.on(PREFERENCES_WINDOW_BLUR, () => {
  if (!document.body.classList.contains('nofocus')) {
    document.body.classList.add('nofocus')
  }
})

ipcRenderer.on(PREFERENCES_WINDOW_FOCUS, () => {
  document.body.classList.remove('nofocus')
})

export default class Root extends React.Component<Root.Props, Root.State> {
  state = {
    activeTab: 'General' as Root.ActiveTab,
  }

  navs = [
    { name: 'General', icon: switcho, width: 240, height: 200 },
    { name: 'Shortcut', icon: command, width: 280, height: 224 },
    { name: 'Service', icon: chip, width: 500, height: 408 },
  ]

  componentDidMount() {
    this.updateWindowSize()
  }

  updateWindowSize(activeTab: Root.ActiveTab = 'General') {
    const map: any = {}
    this.navs.forEach((item) => (map[item.name] = item))
    const { width, height } = map[activeTab]
    ipcRenderer.send(PREFERENCES_WINDOW_UPDATE_SIZE, { width, height })
  }

  handleNavChange(activeTab: Root.ActiveTab) {
    this.updateWindowSize(activeTab)
    this.setState({ activeTab })
  }

  render() {
    const { activeTab } = this.state
    return (
      <div className="wrap">
        <div className="title">{activeTab}</div>
        <div className="navbar">
          {this.navs.map((nav) => (
            <button
              key={nav.name}
              className={classnames('navbar-item', nav.name.toLowerCase(), {
                active: nav.name === activeTab,
              })}
              tabIndex={-1}
              onClick={this.handleNavChange.bind(this, nav.name)}
            >
              {nav.icon()}
              <span className="label">{nav.name}</span>
            </button>
          ))}
        </div>
        <div className="content">
          {activeTab === 'General' && <General />}
          {activeTab === 'Shortcut' && <Shortcut />}
          {activeTab === 'Service' && <Service />}
        </div>
      </div>
    )
  }
}

export namespace Root {
  export interface Props {}
  export type ActiveTab = 'General' | 'Shortcut' | 'Service'
  export interface State {
    activeTab: ActiveTab
  }
}
