import * as PIXI from 'pixi.js'
import { Scene } from '../core/abstracts/Scene'
import SlotMachine from '../entities/SlotMachine'
import SpinButton from '../entities/SpinButton'

export default class MainScene extends Scene {
  private static readonly BACKGROUND_COLOR = 0x2c3e50

  private slotMachine!: SlotMachine
  private spinButton!: SpinButton
  private gameLoopFn?: (ticker: PIXI.Ticker) => void

  constructor(app: PIXI.Application) {
    super(app)
  }

  public async init(): Promise<void> {
    this.app.stage.addChild(this.container)
    this.createGameField()
    this.createSlotMachine()
    this.createSpinButton()
    this.startGameLoop()
  }

  private createGameField(): void {
    this.gameField = new PIXI.Graphics()
    this.gameField.rect(0, 0, this.app.screen.width, this.app.screen.height)
    this.gameField.fill(MainScene.BACKGROUND_COLOR)
    this.container.addChild(this.gameField)
  }

  private createSlotMachine(): void {
    this.slotMachine = new SlotMachine()

    // Position slot machine in center of screen
    this.slotMachine.container.x = this.app.screen.width / 2
    this.slotMachine.container.y = this.app.screen.height / 2 - 50

    this.container.addChild(this.slotMachine.container)
  }

  private createSpinButton(): void {
    this.spinButton = new SpinButton()

    // Position spin button below slot machine
    this.spinButton.x = this.app.screen.width / 2
    this.spinButton.y = this.app.screen.height - 100

    // Set button click handler
    this.spinButton.setOnClick(() => {
      this.handleSpinButtonClick()
    })

    this.container.addChild(this.spinButton)
  }

  private async handleSpinButtonClick(): Promise<void> {
    if (this.slotMachine.isSpinning()) return

    this.spinButton.setSpinning(true)

    try {
      await this.slotMachine.startSpin()
    } catch (error) {
      console.error('Error during spin:', error)
    } finally {
      this.spinButton.setSpinning(false)
    }
  }

  private startGameLoop(): void {
    this.gameLoopFn = () => {
      // Update slot machine animation
      this.slotMachine.update()
    }

    this.app.ticker.add(this.gameLoopFn)
  }

  protected updateGameField(newWidth: number, newHeight: number): void {
    if (this.gameField) {
      this.gameField.clear()
      this.gameField.rect(0, 0, newWidth, newHeight)
      this.gameField.fill(MainScene.BACKGROUND_COLOR)
    }
  }

  public onResize(newWidth: number, newHeight: number): void {
    this.updateGameField(newWidth, newHeight)

    // Reposition slot machine
    if (this.slotMachine) {
      this.slotMachine.container.x = newWidth / 2
      this.slotMachine.container.y = newHeight / 2 - 50
    }

    // Reposition spin button
    if (this.spinButton) {
      this.spinButton.x = newWidth / 2
      this.spinButton.y = newHeight - 100
    }
  }

  public destroy(): void {
    // Remove game loop
    if (this.gameLoopFn) {
      this.app.ticker.remove(this.gameLoopFn)
      this.gameLoopFn = undefined
    }

    // Destroy game objects
    if (this.slotMachine) {
      this.slotMachine.destroy()
    }

    if (this.spinButton) {
      this.spinButton.destroy()
    }

    super.destroy()
  }
}
