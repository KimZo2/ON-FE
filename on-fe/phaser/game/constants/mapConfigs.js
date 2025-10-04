// 맵 타일 타입
export const TILE_TYPES = {
    GROUND: 0,
    WALL: 1,
    DESK: 3,
    BLACKBOARD: 4,
    TREE: 5,
    WATER: 6,
    BENCH: 7
};

// 타일 색상
export const TILE_COLORS = {
    [TILE_TYPES.GROUND]: 0xf5f5dc,      // 베이지 색 바닥
    [TILE_TYPES.WALL]: 0x8b4513,        // 갈색 벽
    [TILE_TYPES.DESK]: 0xdeb887,        // 나무색 책상
    [TILE_TYPES.BLACKBOARD]: 0x2f4f2f,  // 어두운 초록색 칠판
    [TILE_TYPES.TREE]: 0x228b22,        // 초록색 나무
    [TILE_TYPES.WATER]: 0x4682b4,       // 파란색 물
    [TILE_TYPES.BENCH]: 0xcd853f        // 갈색 벤치
};

// 강의실 맵 생성 함수 (50x50 크기)
const createClassroomMap = () => {
    const width = 50;
    const height = 50;
    const map = [];

    // 맵 초기화 (모두 바닥으로)
    for (let y = 0; y < height; y++) {
        map[y] = new Array(width).fill(TILE_TYPES.GROUND);
    }

    // 외벽 생성
    for (let x = 0; x < width; x++) {
        map[0][x] = TILE_TYPES.WALL; // 상단 벽
        map[height - 1][x] = TILE_TYPES.WALL; // 하단 벽
    }
    for (let y = 0; y < height; y++) {
        map[y][0] = TILE_TYPES.WALL; // 좌측 벽
        map[y][width - 1] = TILE_TYPES.WALL; // 우측 벽
    }

    // 칠판 생성 (상단 중앙, 10타일 너비)
    const blackboardStartX = Math.floor(width / 2) - 5; // 10타일 너비
    const blackboardY = 2;
    for (let x = blackboardStartX; x < blackboardStartX + 10; x++) {
        map[blackboardY][x] = TILE_TYPES.BLACKBOARD;
        map[blackboardY + 1][x] = TILE_TYPES.BLACKBOARD;
    }

    // 왼쪽 좌석 배치 (4x4 그룹들)
    const leftSeatStartX = 10;
    const seatStartY = 10;
    const seatSpacing = 8; // 좌석 그룹 간 간격

    for (let group = 0; group < 4; group++) {
        const groupY = seatStartY + (group * seatSpacing);
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                map[groupY + row][leftSeatStartX + col] = TILE_TYPES.DESK;
            }
        }
    }

    // 오른쪽 좌석 배치 (4x4 그룹들)
    const rightSeatStartX = width - 14; // 오른쪽에서 10타일 + 4타일 좌석
    for (let group = 0; group < 4; group++) {
        const groupY = seatStartY + (group * seatSpacing);
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                map[groupY + row][rightSeatStartX + col] = TILE_TYPES.DESK;
            }
        }
    }

    return map;
};

// 강의실 맵 설정
export const CLASSROOM_MAP = {
    name: 'classroom',
    width: 50,
    height: 50,
    tileSize: 32,
    data: createClassroomMap(),
    // 칠판 텍스트 설정
    blackboardText: {
        text: 'Woori FISA',
        x: 25, // 중앙 (width / 2)
        y: 2.5,  // 칠판 위치
        style: {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }
    }
};

// 공원 맵 설정
export const PARK_MAP = {
    name: 'park',
    width: 25,
    height: 18,
    tileSize: 32,
    data: [
        // 외벽 (울타리)
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        // 상단 나무 영역
        [1,0,5,5,0,0,0,0,5,5,0,0,0,0,0,5,5,0,0,0,0,5,5,0,1],
        [1,0,5,5,0,0,0,0,5,5,0,0,0,0,0,5,5,0,0,0,0,5,5,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        // 중앙 연못
        [1,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,6,6,6,6,6,6,6,6,6,6,6,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        // 벤치 영역
        [1,0,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,7,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,7,7,0,0,0,0,0,0,0,0,0,7,7,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        // 하단 나무 영역
        [1,0,5,5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,0,1],
        [1,0,5,5,0,0,0,0,5,5,0,0,0,0,0,5,5,0,0,0,0,5,5,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]  // 외벽
    ]
};

// 맵 타입 목록
export const MAP_TYPES = {
    CLASSROOM: CLASSROOM_MAP,
    PARK: PARK_MAP
};

// 타일이 충돌 가능한지 확인
export const isCollidableTile = (tileType) => {
    return tileType === TILE_TYPES.WALL ||
           tileType === TILE_TYPES.DESK ||
           tileType === TILE_TYPES.TREE ||
           tileType === TILE_TYPES.WATER ||
           tileType === TILE_TYPES.BENCH;
};

// 타일이 벽인지 확인
export const isWallTile = (tileType) => {
    return tileType === TILE_TYPES.WALL;
};

// 타일이 상호작용 가능한 객체인지 확인
export const isInteractableTile = (tileType) => {
    return tileType === TILE_TYPES.DESK ||
           tileType === TILE_TYPES.BENCH;
};
