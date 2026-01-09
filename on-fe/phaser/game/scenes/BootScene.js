import { CHARACTERS } from '@/constants/CHARACTERS';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.setPath('/assets');

    // localStorage에서 선택한 캐릭터 ID 가져오기 (기본값: 0)
    const selectedCharacterId = parseInt(localStorage.getItem('selectedCharacterId') ?? '0', 10);
    const selectedCharacter = CHARACTERS[selectedCharacterId] ?? CHARACTERS[0];

    this.load.spritesheet('player', selectedCharacter.image, {
      frameWidth: 64,
      frameHeight: 64
    });

    this.load.image('ground', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#90EE90" stroke="#228B22" stroke-width="1"/>
      </svg>
    `));

    this.load.image('wall', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#8B4513" stroke="#654321" stroke-width="1"/>
      </svg>
    `));

    this.load.image('water', 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" fill="#4169E1" stroke="#191970" stroke-width="1"/>
      </svg>
    `));
  }

  create() {
    this.scene.start('MetaverseScene');
  }
}
