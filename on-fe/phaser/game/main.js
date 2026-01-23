import { BootScene } from './scenes/BootScene';
import { MetaverseScene } from './scenes/MetaverseScene';

// Dynamic import for Phaser to avoid SSR issues
const getPhaser = () => {
    if (typeof window !== 'undefined') {
        return require('phaser');
    }
    return null;
};

// Dynamic config creation to avoid SSR issues
const createConfig = (Phaser) => {
    
    return {
        type: Phaser.AUTO,
        parent: 'game-container',
        backgroundColor: '#028af8',
        scale: {
            // RESIZE로 변경함으로써 반응형 지원
            mode: Phaser.Scale.RESIZE,
            parent: 'game-container',
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [
            BootScene,
            MetaverseScene
        ],
        audio: {
          disableWebAudio: true
        }
    };
};

const StartGame = (parent) => {
    const Phaser = getPhaser();
    
    if (!Phaser) {
        console.error('Phaser is not available');
        return null;
    }

    const config = createConfig(Phaser);
    const game = new Phaser.Game({ ...config, parent });

    return game;
}

export default StartGame;
