import { useState, useCallback } from 'react';
import metaverseService from '../services/metaverseService';

export default function useMetaverseConnection() {
    const [connectionState, setConnectionState] = useState({
        status: 'disconnected', // 'connecting', 'connected', 'error'
        error: null
    });

    const connect = useCallback(async () => {
        if (connectionState.status === 'connecting' || connectionState.status === 'connected') {
            return;
        }

        setConnectionState(prev => ({ ...prev, status: 'connecting', error: null }));

        try {
            const client = await metaverseService.initialize();
            
            if (!client) {
                throw new Error('메타버스 서비스 연결에 실패했습니다.');
            }

            setConnectionState(prev => ({ ...prev, status: 'connected', error: null }));
            return client;

        } catch (error) {
            const errorMessage = error.message || '메타버스 연결에 실패했습니다. 서버 상태를 확인해주세요.';
            setConnectionState(prev => ({ 
                ...prev, 
                status: 'error', 
                error: errorMessage 
            }));
            metaverseService.disconnect();
            throw error;
        }
    }, [connectionState.status]);

    const disconnect = useCallback(() => {
        metaverseService.disconnect();
        setConnectionState({ status: 'disconnected', error: null });
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