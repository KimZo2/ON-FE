import { useState, useCallback, useEffect } from 'react';
import metaverseService from '../services/metaverseService';

export default function useMetaverseChat(userId, playerName) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // 채팅 메시지 콜백 등록
        const handleChatMessage = (messageData) => {
            const newMessage = {
                id: Date.now() + Math.random(),
                text: messageData.message,
                playerName: messageData.playerName,
                timestamp: new Date(),
                isOwn: messageData.userId === userId
            };
            
            setMessages(prev => [...prev.slice(-19), newMessage]); // 최근 20개만 유지
        };

        metaverseService.setChatMessageCallback(handleChatMessage);

        return () => {
            metaverseService.setChatMessageCallback(null);
        };
    }, [userId]);

    const sendMessage = useCallback((message) => {
        if (!message || !message.trim()) return;
        
        const messageData = {
            userId,
            playerName,
            message: message.trim(),
            timestamp: new Date().toISOString()
        };

        metaverseService.sendChatMessage(messageData);
    }, [userId, playerName]);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        sendMessage,
        clearMessages
    };
}