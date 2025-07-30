import * as PIXI from 'pixi.js'
import { SLOT_CONFIG, type SymbolType } from '../utils/constants'

export default class Symbol {
  public sprite: PIXI.Sprite
  public symbolType: SymbolType
  private symbolId: string

  constructor(texture: PIXI.Texture, symbolType: SymbolType) {
    this.symbolType = symbolType
    this.symbolId = crypto.randomUUID()

    this.sprite = new PIXI.Sprite(texture)
    this.setupSprite()
  }

  private setupSprite(): void {
    this.sprite.width = SLOT_CONFIG.SYMBOL_WIDTH
    this.sprite.height = SLOT_CONFIG.SYMBOL_HEIGHT
    this.sprite.anchor.set(0.5)

    // No tinting needed since we're using actual symbol textures
    this.sprite.tint = 0xffffff
  }

  public setPosition(x: number, y: number): void {
    this.sprite.x = x
    this.sprite.y = y
  }

  public updateTexture(texture: PIXI.Texture, symbolType: SymbolType): void {
    this.sprite.texture = texture
    this.symbolType = symbolType
    // Keep white tint for actual symbol textures
    this.sprite.tint = 0xffffff
  }

  public getId(): string {
    return this.symbolId
  }

  public destroy(): void {
    this.sprite.destroy()
  }
}
