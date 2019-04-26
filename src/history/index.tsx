import React from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import Root from './render'
import '../theme'
import './index.less'

render(
  <AppContainer>
    <Root />
  </AppContainer>,
  document.getElementById('root'),
)

if ((module as any).hot) {
  (module as any).hot.accept('./render', () => {
    const NextRoot = require('./render').default // tslint:disable-line
    render(
      <AppContainer>
        <NextRoot />
      </AppContainer>,
      document.getElementById('root'),
    )
  })
}