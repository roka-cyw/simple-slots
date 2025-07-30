import * as PIXI from 'pixi.js'
import LoadingScene from '../scenes/LoadingScene'
import MainScene from '../scenes/MainScene'
import ResourceManager from './ResourceManager'

type Scene = LoadingScene | MainScene

export default class Game {
  private static readonly BLACK_WINDOW = 0x000000

  public app: PIXI.Application
  private container: HTMLElement
  private currentScene: LoadingScene | MainScene | null = null
  private resourceManager: ResourceManager

  constructor() {
    this.container = document.getElementById('game')!
    this.app = new PIXI.Application()
    this.resourceManager = ResourceManager.getInstance()
  }

  public async init(): Promise<void> {
    await this.app.init({
      width: Math.floor(this.container.clientWidth),
      height: Math.floor(this.container.clientHeight),
      backgroundColor: Game.BLACK_WINDOW
    })

    this.container.appendChild(this.app.canvas as HTMLCanvasElement)
    this.setupResize()
    this.setupDebugger()

    this.startLoadingScene()
  }

  private startLoadingScene(): void {
    this.currentScene = new LoadingScene(this.app, () => {
      this.switchToMainScene()
    })

    this.currentScene.init()
  }

  private async startMainScene(): Promise<void> {
    this.currentScene = new MainScene(this.app)
    await this.currentScene.init()
  }

  private switchToMainScene(): void {
    // Destroy current scene first
    this.currentScene?.destroy()

    // Load resources and start main scene
    this.loadResourcesAndStartMain()
  }

  private async loadResourcesAndStartMain(): Promise<void> {
    try {
      console.log('Loading resources...')
      await this.resourceManager.loadSymbols()
      console.log('Resources loaded successfully')

      await this.startMainScene()
    } catch (error) {
      console.error('Failed to load resources:', error)
      // TODO: Show error screen here
    }
  }

  private setupResize(): void {
    window.addEventListener('resize', () => {
      const newWidth = Math.floor(this.container.clientWidth)
      const newHeight = Math.floor(this.container.clientHeight)

      this.app.renderer.resize(newWidth, newHeight)

      // Notify current scene about resize
      ;(this.currentScene as Scene)?.onResize(newWidth, newHeight)
    })
  }

  private setupDebugger(): void {
    ;(globalThis as any).__PIXI_APP__ = this.app
  }
}
