import { MetaverseScene } from './scenes/MetaverseScene';
import { getOptimalSize } from '@/phaser/game/util/gameUtil';

// Dynamic import for Phaser to avoid SSR issues
const getPhaser = () => {
    if (typeof window !== 'undefined') {
        return require('phaser');
    }
    return null;
};

// Dynamic config creation to avoid SSR issues
const createConfig = (Phaser) => {
    const { width, height } = getOptimalSize();
    
    return {
        type: Phaser.AUTO,
        width,
        height,
        parent: 'game-container',
        backgroundColor: '#028af8',
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            parent: 'game-container',
            width,
            height
        },
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [
            MetaverseScene
        ]
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
