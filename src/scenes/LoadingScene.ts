import * as PIXI from 'pixi.js'

import { Scene } from '../core/abstracts/Scene'

export default class LoadingScene extends Scene {
  private static readonly LOADING_SCENE_COLOR = 0xadd8e6
  private static readonly START_BUTTON_COLOR = 0xfff8f0
  private static readonly START_BUTTON_BORDER = 0x177c9d
  private static readonly START_BUTTON_TEXT_COLOR = 0x000000

  private onComplete: () => void
  private buttonContainer!: PIXI.Container

  constructor(app: PIXI.Application, onComplete: () => void) {
    super(app)
    this.onComplete = onComplete
  }

  public init(): void {
    this.app.stage.addChild(this.container)
    this.createGameField()
    this.createStartButton()
  }

  private createGameField(): void {
    this.gameField = new PIXI.Graphics()
    this.gameField.rect(0, 0, this.app.screen.width, this.app.screen.height)
    this.gameField.fill(LoadingScene.LOADING_SCENE_COLOR)
    this.container.addChild(this.gameField)
  }

  private createStartButton(): void {
    this.buttonContainer = new PIXI.Container()

    const button = new PIXI.Graphics()
    button.roundRect(-100, -50, 200, 100, 10)
    button.fill(LoadingScene.START_BUTTON_COLOR)
    button.stroke({ color: LoadingScene.START_BUTTON_BORDER, width: 2 })

    const buttonText = new PIXI.Text({
      text: 'START GAME',
      style: {
        fontSize: 24,
        fontWeight: 'bold',
        fill: LoadingScene.START_BUTTON_TEXT_COLOR,
        fontFamily: 'Arial'
      }
    })

    buttonText.anchor.set(0.5)

    this.buttonContainer.x = this.app.screen.width / 2
    this.buttonContainer.y = this.app.screen.height / 2

    this.buttonContainer.interactive = true
    this.buttonContainer.cursor = 'pointer'
    this.buttonContainer.on('pointerdown', e => {
      e.stopPropagation()
      this.onComplete()
    })

    this.buttonContainer.addChild(button)
    this.buttonContainer.addChild(buttonText)

    this.container.addChild(this.buttonContainer)
  }

  protected updateGameField(newWidth: number, newHeight: number): void {
    if (this.gameField) {
      this.gameField.clear() // Destroy old graphic
      this.gameField.rect(0, 0, newWidth, newHeight)
      this.gameField.fill(LoadingScene.LOADING_SCENE_COLOR)
    }
  }

  public onResize(newWidth: number, newHeight: number): void {
    this.updateGameField(newWidth, newHeight)

    // Recalculate objects positions on the scene
    this.buttonContainer.x = newWidth / 2
    this.buttonContainer.y = newHeight / 2
  }
}
