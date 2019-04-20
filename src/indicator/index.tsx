import { ipcRenderer, remote } from 'electron'
import {
  REQUEST_PROGRESS_INDICATOR,
  RESPONSE_PROGRESS_INDICATOR,
} from '../actions'
import '../theme'
import './index.less'

const root = document.getElementById('root')!
const canvas = document.createElement('canvas')
canvas.width = 44
canvas.height = 44

root.appendChild(canvas)

function sector(startDeg: number, stopDeg: number) {
  const isDarkMode = remote.systemPreferences.isDarkMode()
  const fill = isDarkMode ? '#ffffff' : '#191919'
  const ctx = canvas.getContext('2d')!
  const radius = 18
  const deg = Math.PI / 180
  const sDeg = startDeg * deg
  const eDeg = stopDeg * deg

  ctx.clearRect(0, 0, 44, 44)
  ctx.fillStyle = fill

  ctx.save()
  ctx.translate(22, 22) // 设置原点
  ctx.beginPath()
  ctx.arc(0, 0, radius, sDeg, eDeg) // 画出圆弧

  ctx.save() // 再次保存以备旋转
  ctx.rotate(eDeg) // 旋转至起始角度
  ctx.moveTo(radius, 0) // 移动到终点，准备连接终点与圆心
  ctx.lineTo(0, 0) // 连接到圆心

  ctx.restore() // 还原

  ctx.rotate(sDeg) // 旋转至起点角度
  ctx.lineTo(radius, 0) // 从圆心连接到起点
  ctx.closePath()

  ctx.restore() // 还原到最初保存的状态
  ctx.fill()

  return canvas.toDataURL('image/png')
}

ipcRenderer.on(REQUEST_PROGRESS_INDICATOR, (e: any, arg: any) => {
  const startDeg = -90
  const progress = ((arg.progress || 0) % 100) / 100
  const stopDeg = progress * 360 + 5 - 90
  ipcRenderer.send(RESPONSE_PROGRESS_INDICATOR, {
    image: sector(startDeg, stopDeg),
  })
})
