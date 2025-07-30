import * as PIXI from 'pixi.js'
import { Button } from '../core/abstracts/Button'

export default class SpinButton extends Button {
  private static readonly BUTTON_WIDTH = 150
  private static readonly BUTTON_HEIGHT = 60
  private static readonly BUTTON_COLOR = 0x4caf50
  private static readonly BUTTON_HOVER_COLOR = 0x45a049
  private static readonly BUTTON_DISABLED_COLOR = 0x999999
  private static readonly BORDER_COLOR = 0x2e7d32
  private static readonly TEXT_COLOR = 0xffffff

  private isSpinning: boolean = false
  private buttonText: PIXI.Text

  constructor() {
    super()
    this.buttonText = new PIXI.Text()
    this.init()
  }

  private init(): void {
    this.createButton()
    this.createText()
    this.setupInteractivity()
  }

  private createButton(): void {
    this.graphics = new PIXI.Graphics()
    this.updateButtonVisual()
    this.addChild(this.graphics)
  }

  private createText(): void {
    this.buttonText.text = 'SPIN'
    this.buttonText.style = {
      fontSize: 24,
      fontWeight: 'bold',
      fill: SpinButton.TEXT_COLOR,
      fontFamily: 'Arial'
    }
    this.buttonText.anchor.set(0.5)
    this.addChild(this.buttonText)
  }

  private setupInteractivity(): void {
    this.interactive = true
    this.cursor = 'pointer'

    this.on('pointerdown', this.onPointerDown.bind(this))
    this.on('pointerup', this.onPointerUp.bind(this))
    this.on('pointerupoutside', this.onPointerUp.bind(this))
    this.on('pointerover', this.onPointerOver.bind(this))
    this.on('pointerout', this.onPointerOut.bind(this))
  }

  private onPointerDown(): void {
    if (!this.isSpinning) {
      this.isPressed = true
      this.updateButtonVisual()
    }
  }

  private onPointerUp(): void {
    if (this.isPressed && !this.isSpinning) {
      this.isPressed = false
      this.updateButtonVisual()
      this.onClick()
    }
  }

  private onPointerOver(): void {
    if (!this.isSpinning) {
      this.isHovered = true
      this.updateButtonVisual()
    }
  }

  private onPointerOut(): void {
    this.isHovered = false
    this.isPressed = false
    this.updateButtonVisual()
  }

  private updateButtonVisual(): void {
    this.graphics.clear()

    let buttonColor = SpinButton.BUTTON_COLOR
    let scale = 1

    if (this.isSpinning) {
      buttonColor = SpinButton.BUTTON_DISABLED_COLOR
      this.cursor = 'default'
    } else if (this.isPressed) {
      buttonColor = this.darkenColor(SpinButton.BUTTON_COLOR, 0.8)
      scale = 0.95
    } else if (this.isHovered) {
      buttonColor = SpinButton.BUTTON_HOVER_COLOR
    }

    this.graphics.roundRect(
      -SpinButton.BUTTON_WIDTH / 2,
      -SpinButton.BUTTON_HEIGHT / 2,
      SpinButton.BUTTON_WIDTH,
      SpinButton.BUTTON_HEIGHT,
      10
    )
    this.graphics.fill(buttonColor)
    this.graphics.stroke({ color: SpinButton.BORDER_COLOR, width: 3 })

    this.scale.set(scale)
  }

  private darkenColor(color: number, factor: number): number {
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff

    return ((r * factor) << 16) | ((g * factor) << 8) | (b * factor)
  }

  public setSpinning(spinning: boolean): void {
    this.isSpinning = spinning
    this.interactive = !spinning

    if (spinning) {
      this.buttonText.text = 'SPINNING...'
      this.buttonText.style.fontSize = 18
    } else {
      this.buttonText.text = 'SPIN'
      this.buttonText.style.fontSize = 24
    }

    this.updateButtonVisual()
  }

  public isButtonSpinning(): boolean {
    return this.isSpinning
  }
}
