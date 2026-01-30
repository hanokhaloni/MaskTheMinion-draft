
import { GameObject } from './GameObject';
import { MaskType } from './types';

export class Mask extends GameObject {
  public active = true;
  constructor(x: number, y: number, public type: MaskType) {
    super(x, y, 12, '#ffffff');
  }
}
