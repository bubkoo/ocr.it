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
  const themeColor = isDarkMode ? '#ffffff' : '#191919'
  const ctx = canvas.getContext('2d')!
  const centerX = 22
  const centerY = 22
  const radius = 18
  const deg = Math.PI / 180
  const sDeg = startDeg * deg
  const eDeg = stopDeg * deg

  ctx.clearRect(0, 0, centerX * 2, centerY * 2)
  ctx.fillStyle = themeColor

  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.beginPath()
  ctx.arc(0, 0, radius, sDeg, eDeg)

  ctx.save()
  ctx.rotate(eDeg) // 旋转至起始角度
  ctx.moveTo(radius, 0) // 移动到终点，准备连接终点与圆心
  ctx.lineTo(0, 0) // 连接到圆心

  ctx.restore() // 还原

  ctx.rotate(sDeg) // 旋转至起点角度
  ctx.lineTo(radius, 0) // 从圆心连接到起点
  ctx.closePath()

  ctx.restore() // 还原到最初保存的状态
  ctx.fill()

  // 外圆
  ctx.beginPath()
  ctx.strokeStyle = themeColor
  ctx.lineWidth = 2
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.stroke()

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
