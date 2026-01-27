import { useState, useCallback, useEffect } from 'react';
import metaverseService from '../services/metaverseService';
import { useMetaverseContext } from '../contexts/MetaverseContext';

export default function useMetaverseChat(userId, playerName) {

    // hook에서는 context의 상태와 액션을 사용
    const [chatMessages, setMessages] = useMetaverseContext();

    // TODO: 채팅 메시지 수신 로직 주석 해제 필요
    // useEffect(() => {
    //     // 채팅 메시지 콜백 등록
    //     const handleChatMessage = (messageData) => {
    //         const newMessage = {
    //             id: Date.now() + Math.random(),
    //             text: messageData.content || messageData.message,
    //             playerName: messageData.nickname || messageData.playerName,
    //             timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date(),
    //             isOwn: messageData.userId === userId
    //         };
            
    //         setMessages(prev => [...prev, newMessage].slice(-200));
    //     };

    //     metaverseService.setChatMessageCallback(handleChatMessage);

    //     return () => {
    //         metaverseService.setChatMessageCallback(null);
    //     };
    // }, [userId]);

    const sendMessage = useCallback((message) => {
        if (!message || !message.trim()) return;
        
        metaverseService.sendChatMessage(message.trim());
    }, []);

    const clearMessages = useCallback(() => {
        setMessages({type: 'CLEAR_CHAT_MESSAGES'});
    }, [setMessages]);

    return {
        messages: chatMessages,
        sendMessage,
        clearMessages
    };
}
