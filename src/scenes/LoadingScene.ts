import * as PIXI from 'pixi.js'
import { Scene } from '../core/abstracts/Scene'

export default class LoadingScene extends Scene {
  private static readonly LOADING_SCENE_COLOR = 0xadd8e6
  private static readonly START_BUTTON_COLOR = 0xfff8f0
  private static readonly START_BUTTON_BORDER = 0x177c9d
  private static readonly START_BUTTON_TEXT_COLOR = 0x000000

  private onComplete: () => void
  private buttonContainer!: PIXI.Container
  private loadingText!: PIXI.Text
  private isLoading: boolean = false

  constructor(app: PIXI.Application, onComplete: () => void) {
    super(app)
    this.onComplete = onComplete
  }

  public init(): void {
    this.app.stage.addChild(this.container)
    this.createGameField()
    this.createLoadingText()
    this.createStartButton()
  }

  private createGameField(): void {
    this.gameField = new PIXI.Graphics()
    this.gameField.rect(0, 0, this.app.screen.width, this.app.screen.height)
    this.gameField.fill(LoadingScene.LOADING_SCENE_COLOR)
    this.container.addChild(this.gameField)
  }

  private createLoadingText(): void {
    this.loadingText = new PIXI.Text({
      text: 'Simple Slots Game',
      style: {
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0x2c3e50,
        fontFamily: 'Arial'
      }
    })

    this.loadingText.anchor.set(0.5)
    this.loadingText.x = this.app.screen.width / 2
    this.loadingText.y = this.app.screen.height / 2 - 100

    this.container.addChild(this.loadingText)
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
    this.buttonContainer.y = this.app.screen.height / 2 + 50

    this.buttonContainer.interactive = true
    this.buttonContainer.cursor = 'pointer'
    this.buttonContainer.on('pointerdown', e => {
      e.stopPropagation()
      this.handleStartClick()
    })

    this.buttonContainer.addChild(button)
    this.buttonContainer.addChild(buttonText)

    this.container.addChild(this.buttonContainer)
  }

  private handleStartClick(): void {
    if (this.isLoading) return

    this.isLoading = true
    this.updateButtonState(true)

    // Just call the completion callback - loading will happen in Game
    this.onComplete()
  }

  private updateButtonState(loading: boolean): void {
    const button = this.buttonContainer.children[0] as PIXI.Graphics
    const buttonText = this.buttonContainer.children[1] as PIXI.Text

    if (loading) {
      // Disable button
      button.clear()
      button.roundRect(-100, -50, 200, 100, 10)
      button.fill(0x999999)
      button.stroke({ color: 0x666666, width: 2 })

      buttonText.text = 'LOADING...'
      buttonText.style.fontSize = 20

      this.buttonContainer.interactive = false
      this.buttonContainer.cursor = 'default'

      // Update loading text
      this.loadingText.text = 'Loading game resources...'
    } else {
      // Re-enable button
      button.clear()
      button.roundRect(-100, -50, 200, 100, 10)
      button.fill(LoadingScene.START_BUTTON_COLOR)
      button.stroke({ color: LoadingScene.START_BUTTON_BORDER, width: 2 })

      buttonText.text = 'START GAME'
      buttonText.style.fontSize = 24

      this.buttonContainer.interactive = true
      this.buttonContainer.cursor = 'pointer'

      // Reset loading text
      this.loadingText.text = 'Simple Slots Game'
    }
  }

  protected updateGameField(newWidth: number, newHeight: number): void {
    if (this.gameField) {
      this.gameField.clear()
      this.gameField.rect(0, 0, newWidth, newHeight)
      this.gameField.fill(LoadingScene.LOADING_SCENE_COLOR)
    }
  }

  public onResize(newWidth: number, newHeight: number): void {
    this.updateGameField(newWidth, newHeight)

    // Recalculate positions
    this.loadingText.x = newWidth / 2
    this.loadingText.y = newHeight / 2 - 100

    this.buttonContainer.x = newWidth / 2
    this.buttonContainer.y = newHeight / 2 + 50
  }
}
