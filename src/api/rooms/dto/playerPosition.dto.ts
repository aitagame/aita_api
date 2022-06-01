export class PlayerPositionDto {
  id: number;

  keys: string[];

  direction: number;

  x: number;

  y: number;

  time?: number;

  clientTime?: number;
  
  serverTime?: number;
} 