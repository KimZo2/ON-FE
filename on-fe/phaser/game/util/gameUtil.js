// 화면 크기 자동 계산 함수
export const getOptimalSize = () => {
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