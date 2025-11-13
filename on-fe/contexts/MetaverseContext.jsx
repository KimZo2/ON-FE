'use client';

import React, { createContext, useContext, useReducer, useMemo } from 'react';

// 초기 상태
const initialState = {
    connectionStatus: 'disconnected', // 'connecting', 'connected', 'error'
    error: null,
    player: null,
    onlineCount: 0,
    chatMessages: [],
    gameInstance: null,
    currentScene: null,
    isGameReady: false
};

// 액션 타입
const ActionTypes = {
    // 연결 관련
    CONNECT_REQUEST: 'CONNECT_REQUEST',
    CONNECT_SUCCESS: 'CONNECT_SUCCESS', 
    CONNECT_FAILED: 'CONNECT_FAILED',
    DISCONNECT: 'DISCONNECT',

    // 플레이어 관련
    SET_PLAYER: 'SET_PLAYER',
    UPDATE_ONLINE_COUNT: 'UPDATE_ONLINE_COUNT',

    // 채팅 관련
    ADD_CHAT_MESSAGE: 'ADD_CHAT_MESSAGE',
    CLEAR_CHAT_MESSAGES: 'CLEAR_CHAT_MESSAGES',

    // 게임 관련
    SET_GAME_INSTANCE: 'SET_GAME_INSTANCE',
    SET_CURRENT_SCENE: 'SET_CURRENT_SCENE',
    SET_GAME_READY: 'SET_GAME_READY',

    // 에러 관련
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR'
};

// 리듀서
const metaverseReducer = (state, action) => {
    switch (action.type) {
        case ActionTypes.CONNECT_REQUEST:
            return {
                ...state,
                connectionStatus: 'connecting',
                error: null
            };

        case ActionTypes.CONNECT_SUCCESS:
            return {
                ...state,
                connectionStatus: 'connected',
                error: null,
                player: action.payload
            };

        case ActionTypes.CONNECT_FAILED:
            return {
                ...state,
                connectionStatus: 'error',
                error: action.payload
            };

        case ActionTypes.DISCONNECT:
            return {
                ...initialState,
                connectionStatus: 'disconnected'
            };

        case ActionTypes.SET_PLAYER:
            return {
                ...state,
                player: action.payload
            };

        case ActionTypes.UPDATE_ONLINE_COUNT:
            return {
                ...state,
                onlineCount: action.payload
            };

        case ActionTypes.ADD_CHAT_MESSAGE: {
            const messageTimestamp = action.payload?.timestamp
                ? new Date(action.payload.timestamp)
                : new Date();

            const newMessage = {
                id: Date.now() + Math.random(),
                ...action.payload,
                timestamp: messageTimestamp
            };
            
            return {
                ...state,
                chatMessages: [...state.chatMessages, newMessage].slice(-200)
            };
        }

        case ActionTypes.CLEAR_CHAT_MESSAGES:
            return {
                ...state,
                chatMessages: []
            };

        case ActionTypes.SET_GAME_INSTANCE:
            return {
                ...state,
                gameInstance: action.payload
            };

        case ActionTypes.SET_CURRENT_SCENE:
            return {
                ...state,
                currentScene: action.payload
            };

        case ActionTypes.SET_GAME_READY:
            return {
                ...state,
                isGameReady: action.payload
            };

        case ActionTypes.SET_ERROR:
            return {
                ...state,
                error: action.payload
            };

        case ActionTypes.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        default:
            return state;
    }
};

// 컨텍스트 생성
const MetaverseContext = createContext();

// Provider 컴포넌트
export const MetaverseProvider = ({ children }) => {
    const [state, dispatch] = useReducer(metaverseReducer, initialState);

    // 액션 크리에이터들
    const actions = useMemo(() => ({
        // 연결 관련 액션
        connectRequest: () => dispatch({ type: ActionTypes.CONNECT_REQUEST }),
        
        connectSuccess: (playerData) => dispatch({ 
            type: ActionTypes.CONNECT_SUCCESS, 
            payload: playerData 
        }),
        
        connectFailed: (error) => dispatch({ 
            type: ActionTypes.CONNECT_FAILED, 
            payload: error 
        }),
        
        disconnect: () => dispatch({ type: ActionTypes.DISCONNECT }),

        // 플레이어 관련 액션
        setPlayer: (playerData) => dispatch({ 
            type: ActionTypes.SET_PLAYER, 
            payload: playerData 
        }),

        updateOnlineCount: (count) => dispatch({ 
            type: ActionTypes.UPDATE_ONLINE_COUNT, 
            payload: count 
        }),

        // 채팅 관련 액션
        addChatMessage: (messageData) => dispatch({ 
            type: ActionTypes.ADD_CHAT_MESSAGE, 
            payload: messageData 
        }),

        clearChatMessages: () => dispatch({ type: ActionTypes.CLEAR_CHAT_MESSAGES }),

        // 게임 관련 액션
        setGameInstance: (gameInstance) => dispatch({ 
            type: ActionTypes.SET_GAME_INSTANCE, 
            payload: gameInstance 
        }),

        setCurrentScene: (scene) => dispatch({ 
            type: ActionTypes.SET_CURRENT_SCENE, 
            payload: scene 
        }),

        setGameReady: (isReady) => dispatch({ 
            type: ActionTypes.SET_GAME_READY, 
            payload: isReady 
        }),

        // 에러 관련 액션
        setError: (error) => dispatch({ 
            type: ActionTypes.SET_ERROR, 
            payload: error 
        }),

        clearError: () => dispatch({ type: ActionTypes.CLEAR_ERROR })
    }), []);

    const value = useMemo(() => ({
        state,
        actions
    }), [state, actions]);

    return (
        <MetaverseContext.Provider value={value}>
            {children}
        </MetaverseContext.Provider>
    );
};

// 커스텀 훅
export const useMetaverseContext = () => {
    const context = useContext(MetaverseContext);
    if (!context) {
        throw new Error('useMetaverseContext must be used within a MetaverseProvider');
    }
    return context;
};

// 개별 상태 접근을 위한 편의 훅들
export const useMetaverseConnection = () => {
    const { state } = useMetaverseContext();
    return {
        connectionStatus: state.connectionStatus,
        error: state.error,
        isConnected: state.connectionStatus === 'connected',
        isConnecting: state.connectionStatus === 'connecting'
    };
};

export const useMetaversePlayer = () => {
    const { state } = useMetaverseContext();
    return {
        player: state.player,
        onlineCount: state.onlineCount
    };
};

export const useMetaverseChat = () => {
    const { state } = useMetaverseContext();
    return {
        messages: state.chatMessages
    };
};

export const useMetaverseGame = () => {
    const { state } = useMetaverseContext();
    return {
        gameInstance: state.gameInstance,
        currentScene: state.currentScene,
        isGameReady: state.isGameReady
    };
};
