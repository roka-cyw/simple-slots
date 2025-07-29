import * as PIXI from 'pixi.js'

export abstract class Scene {
  protected app: PIXI.Application
  protected container: PIXI.Container
  protected gameField!: PIXI.Graphics

  constructor(app: PIXI.Application) {
    this.app = app
    this.container = new PIXI.Container()
  }

  public abstract init(): void

  protected updateGameField(newWidth: number, newHeight: number): void {}

  public onResize(newWidth: number, newHeight: number): void {}

  public getContainer(): PIXI.Container {
    return this.container
  }

  public destroy(): void {
    console.log(`Destroying scene: ${this.constructor.name}`)

    this.container.removeFromParent()
    this.container.destroy()
  }
}
