import * as PIXI from 'pixi.js'

export abstract class Button extends PIXI.Container {
  protected graphics!: PIXI.Graphics
  protected isPressed: boolean = false
  protected isHovered: boolean = false

  public onButtonClick?: () => void

  constructor() {
    super()
  }

  protected onClick(): void {
    this.onButtonClick?.()
  }

  public setOnClick(callback: () => void): void {
    this.onButtonClick = callback
  }
}
