import { useState, useCallback } from 'react';
import metaverseService from '../services/metaverseService';
import { useMetaverseContext } from '../contexts/MetaverseContext';

export default function useMetaverseConnection() {
    // TODO: 내부 상태 생성이 아닌, Context로 사용하기
    // const [connectionState, setConnectionState] = useState({
    //     status: 'disconnected', // 'connecting', 'connected', 'error'
    //     error: null
    // });
    const { connectionState, dispatch } = useMetaverseContext();

    const connect = useCallback(async () => {
        if (connectionState.status === 'connecting' || connectionState.status === 'connected') {
            return;
        }

        dispatch({ type: 'SET_CONNECTION_STATE', payload: { status: 'connecting', error: null } });

        try {
            const client = await metaverseService.initialize();
            
            if (!client) {
                throw new Error('메타버스 서비스 연결에 실패했습니다.');
            }

            dispatch({ type: 'SET_CONNECTION_STATE', payload: { status: 'connected', error: null } });
            return client;

        } catch (error) {
            const errorMessage = error.message || '메타버스 연결에 실패했습니다. 서버 상태를 확인해주세요.';
            dispatch({ type: 'SET_CONNECTION_STATE', payload: { status: 'error', error: errorMessage } });
            metaverseService.disconnect();
            throw error;
        }
    }, [connectionState.status]);

    const disconnect = useCallback(() => {
        metaverseService.disconnect();
        dispatch({ type: 'SET_CONNECTION_STATE', payload: { status: 'disconnected', error: null } });
    }, []);

    const isConnected = useCallback(() => {
        return connectionState.status === 'connected' && metaverseService.isConnected();
    }, [connectionState.status]);

    return {
        connectionState,
        connect,
        disconnect,
        isConnected
    };
}