import React from 'react'
import { ipcRenderer, shell } from 'electron'
import { SERVICE_CONFIG_CHANGED } from '../../actions'
import { Input } from './input'
import {
  BaiduAuthInfo,
  getBaiduAuthInfoRaw,
  setBaiduAuthInfo,
  getGoogleAPIKey,
  setGoogleAPIKey,
  TencentAuthInfo,
  getTencentAuthInfo,
  setTencentAuthInfo,
} from '../../persists'
import './service.less'

export class Service extends React.Component<Service.Props, Service.State> {
  state = {
    googleAPIKey: getGoogleAPIKey(),
    baiduAuthInfo: getBaiduAuthInfoRaw(),
    tencentAuthInfo: getTencentAuthInfo(),
  }

  update() {
    ipcRenderer.send(SERVICE_CONFIG_CHANGED)
  }

  onBaiduAuthInfoChanged = (key: string, value: string) => {
    setBaiduAuthInfo({
      ...this.state.baiduAuthInfo,
      [key]: value,
    })
    this.update()
  }

  onGoogleAPIKeyChanged = (value: string) => {
    setGoogleAPIKey(value)
    this.update()
  }

  onTencentAuthInfoChanged = (key: string, value: string) => {
    setTencentAuthInfo({
      ...this.state.tencentAuthInfo,
      [key]: value,
    })
    this.update()
  }

  gotoGoogle = () => {
    shell.openExternal(
      'https://console.cloud.google.com/apis/api/vision.googleapis.com/',
    )
  }

  gotoBaidu = () => {
    shell.openExternal(
      'https://console.bce.baidu.com/ai/#/ai/ocr/overview/index',
    )
  }

  gotoTencent = () => {
    shell.openExternal('https://console.cloud.tencent.com/ai/ocr/general')
  }

  render() {
    const { googleAPIKey, baiduAuthInfo, tencentAuthInfo } = this.state

    return (
      <React.Fragment>
        <div className="service-item">
          <div className="engine">
            <span>Baidu</span>
            <i onClick={this.gotoBaidu}>Get a Free App Secret</i>
          </div>
          <div className="box">
            <label>
              <span>APP Key</span>
              <Input
                value={baiduAuthInfo.appKey}
                onChange={this.onBaiduAuthInfoChanged.bind(this, 'appKey')}
              />
            </label>
            <label>
              <span>APP Secret</span>
              <Input
                value={baiduAuthInfo.appSecret}
                onChange={this.onBaiduAuthInfoChanged.bind(this, 'appSecret')}
              />
            </label>
          </div>
        </div>
        <div className="service-item">
          <div className="engine">
            <span>Google</span>
            <i onClick={this.gotoGoogle}>Get a Free API Key</i>
          </div>
          <div className="box">
            <label>
              <span>API Key</span>
              <Input
                value={googleAPIKey}
                onChange={this.onGoogleAPIKeyChanged}
              />
            </label>
          </div>
        </div>
        <div className="service-item">
          <div className="engine">
            <span>Tencent</span>
            <i onClick={this.gotoTencent}>Get a Free Secret Key</i>
          </div>
          <div className="box">
            <label>
              <span>Secret ID</span>
              <Input
                value={tencentAuthInfo.secretId}
                onChange={this.onTencentAuthInfoChanged.bind(this, 'secretId')}
              />
            </label>
            <label>
              <span>Secret Key</span>
              <Input
                value={tencentAuthInfo.secretKey}
                onChange={this.onTencentAuthInfoChanged.bind(this, 'secretKey')}
              />
            </label>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export module Service {
  export interface Props {}
  export interface State {
    baiduAuthInfo: BaiduAuthInfo
    googleAPIKey: string
    tencentAuthInfo: TencentAuthInfo
  }
}
