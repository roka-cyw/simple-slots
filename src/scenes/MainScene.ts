import * as PIXI from 'pixi.js'

import { Scene } from '../core/abstracts/Scene'

export default class MainScene extends Scene {
  private static readonly GRASS_COLOR = 0x4caf50

  private gameLoopFn?: (ticker: PIXI.Ticker) => void

  constructor(app: PIXI.Application) {
    super(app)
  }

  public init(): void {
    this.app.stage.addChild(this.container)
    this.createGameField()

    this.startGameLoop()
  }

  private startGameLoop(): void {
    // ticker here
  }

  private createGameField(): void {
    this.gameField = new PIXI.Graphics()
    this.gameField.rect(0, 0, this.app.screen.width, this.app.screen.height)
    this.gameField.fill(MainScene.GRASS_COLOR)
    this.container.addChild(this.gameField)
  }

  protected updateGameField(newWidth: number, newHeight: number): void {
    if (this.gameField) {
      this.gameField.clear() // Destroy old graphic
      this.gameField.rect(0, 0, newWidth, newHeight)
      this.gameField.fill(MainScene.GRASS_COLOR)
    }
  }

  public onResize(newWidth: number, newHeight: number): void {
    this.updateGameField(newWidth, newHeight)
  }

  public destroy(): void {
    // Delete game loop
    if (this.gameLoopFn) {
      this.app.ticker.remove(this.gameLoopFn)
      this.gameLoopFn = undefined
    }

    super.destroy()
  }
}
