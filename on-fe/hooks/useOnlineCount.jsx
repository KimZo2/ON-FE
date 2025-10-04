import { useState, useEffect } from 'react';
import metaverseService from '../services/metaverseService';

export default function useOnlineCount() {
    const [onlineCount, setOnlineCount] = useState(0);

    useEffect(() => {
        // 온라인 카운트 콜백 등록
        metaverseService.setOnlineCountCallback(setOnlineCount);

        return () => {
            metaverseService.setOnlineCountCallback(null);
        };
    }, []);

    return onlineCount;
}