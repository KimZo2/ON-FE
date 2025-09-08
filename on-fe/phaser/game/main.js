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

// 화면 크기 자동 계산 함수
const getOptimalSize = () => {
    if (typeof window === 'undefined') {
        return { width: 1920, height: 1080 };
    }

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 16:9 비율 유지하면서 화면에 맞추기
    const aspectRatio = 16 / 9;
    
    let gameWidth, gameHeight;
    
    if (screenWidth / screenHeight > aspectRatio) {
        // 화면이 더 넓은 경우 (세로를 기준으로 맞춤)
        gameHeight = screenHeight;
        gameWidth = gameHeight * aspectRatio;
    } else {
        // 화면이 더 높은 경우 (가로를 기준으로 맞춤)
        gameWidth = screenWidth;
        gameHeight = gameWidth / aspectRatio;
    }
    
    // 최소/최대 크기 제한
    gameWidth = Math.max(800, Math.min(gameWidth, 1920));
    gameHeight = Math.max(450, Math.min(gameHeight, 1080));
    
    return { width: Math.floor(gameWidth), height: Math.floor(gameHeight) };
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
            Boot,
            Preloader,
            MainMenu,
            Game,
            GameOver,
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

    // 창 크기 변경시 게임 크기도 자동 조정
    const handleResize = () => {
        const { width, height } = getOptimalSize();
        if (game && game.scale) {
            game.scale.resize(width, height);
        }
    };

    // 리사이즈 이벤트 리스너 추가
    if (typeof window !== 'undefined') {
        window.addEventListener('resize', handleResize);
        
        // 게임 종료시 이벤트 리스너 정리
        const originalDestroy = game.destroy;
        game.destroy = function(...args) {
            window.removeEventListener('resize', handleResize);
            return originalDestroy.apply(this, args);
        };
    }

    return game;
}

export default StartGame;
