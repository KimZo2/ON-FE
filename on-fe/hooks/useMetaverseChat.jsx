import { useState, useCallback, useEffect } from 'react';
import metaverseService from '../services/metaverseService';

export default function useMetaverseChat(userId, playerName) {
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // 채팅 메시지 콜백 등록
        const handleChatMessage = (messageData) => {
            const newMessage = {
                id: Date.now() + Math.random(),
                text: messageData.content || messageData.message,
                playerName: messageData.nickname || messageData.playerName,
                timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
                isOwn: messageData.userId === userId
            };
            
            setMessages(prev => [...prev, newMessage].slice(-200));
        };

        metaverseService.setChatMessageCallback(handleChatMessage);

        return () => {
            metaverseService.setChatMessageCallback(null);
        };
    }, [userId]);

    const sendMessage = useCallback((message) => {
        if (!message || !message.trim()) return;
        
        metaverseService.sendChatMessage(message.trim());
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
