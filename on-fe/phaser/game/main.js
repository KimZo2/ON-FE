import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { MainMenu } from './scenes/MainMenu';
import { MetaverseScene } from './scenes/MetaverseScene';
import { Preloader } from './scenes/Preloader';

// Dynamic import for Phaser to avoid SSR issues
const getPhaser = () => {
    if (typeof window !== 'undefined') {
        return require('phaser');
    }
    return null;
};

// Dynamic config creation to avoid SSR issues
const createConfig = (Phaser) => ({
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        Game,
        GameOver,
        MetaverseScene
    ]
});

const StartGame = (parent) => {
    const Phaser = getPhaser();
    
    if (!Phaser) {
        console.error('Phaser is not available');
        return null;
    }

    const config = createConfig(Phaser);
    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
