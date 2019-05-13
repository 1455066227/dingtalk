import open from './open'
import download from './download'
import openEmail from './openEmail'
import rememberMe from './rememberMe'
import winOperation from './winOperation'
import notifyMessage from './notifyMessage'
import { ipcRenderer, webFrame, app } from 'electron'
import fs from 'fs'
import path from 'path'
import './css.styl'
import globalConfig from '../../main/config'

class MainWinInjector {
  constructor () {
    // timer循环数据
    this.callback = []
    this.timer = setInterval(() => {
      this.callback.forEach(item => item())
    }, 1000)
    this.init()
  }

  // 初始化
  init () {
    ipcRenderer.on('dom-ready', () => {
      ipcRenderer.send('online', navigator.onLine)
      if (!navigator.onLine) {
        return
      }
      this.injectJs()
    })
  }

  // 注入JS
  injectJs () {
    this.setZoomLevel()
    /**
     * 插入窗口操作按钮
     * 关闭/最大化/最小化
     */
    // this.winOperation()
    // let settings = this.readSetting()()
    // console.log(settings)
    // if (!settings.nativeTitleBar) {
    //   this.winOperation()
    // }
    /**
     * 检测是否需要插入记住我选项
     */
    this.rememberMe()

    /**
     * 劫持window.open
     */

    this.open()

    /**
     * 检测是否有未读消息
     * 发送未读消息条数到主进程
     */
    this.notifyMessage()

    /**
     * 打开邮箱界面
     */
    this.openEmail()
    /**
     * 文件下载监听
     */
    this.download()
  }

  readSetting () {
    const filename = path.join(app.getPath('userData'), 'setting.json')
    return new Promise((resolve, reject) => {
      fs.readFile(filename, (err, data) => {
        if (err) return reject(err)
        try {
          const setting = JSON.parse(data)
          if (typeof setting.keymap['shortcut-capture'] === 'string') {
            setting.keymap['shortcut-capture'] = setting.keymap['shortcut-capture'].split('+')
          }
          resolve({ ...globalConfig, ...setting })
        } catch (e) {
          resolve(globalConfig)
        }
      })
    })
  }

  // 设置缩放等级
  setZoomLevel () {
    // 设置缩放限制
    webFrame.setZoomFactor(100)
    webFrame.setZoomLevel(0)
    webFrame.setVisualZoomLevelLimits(1, 1)
  }

  setTimer (callback) {
    this.callback.push(callback)
  }

  // 插入窗口操作按钮
  winOperation () {
    winOperation(this)
  }

  // 插入记住我选项
  rememberMe () {
    rememberMe(this)
  }

  // 消息通知发送到主进程
  notifyMessage () {
    notifyMessage(this)
  }

  // 打开邮箱
  openEmail () {
    openEmail(this)
  }

  // 文件下载劫持
  download () {
    download(this)
  }

  // window.open重写
  open () {
    open(this)
  }
}

new MainWinInjector()
