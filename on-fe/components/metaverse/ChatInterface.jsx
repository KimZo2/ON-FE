'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatInterface({ onSendMessage }) {
    const [message, setMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);
    const inputRef = useRef(null);
    const chatHistoryRef = useRef(null);

    useEffect(() => {
        // 채팅 히스토리가 업데이트될 때마다 스크롤을 아래로
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSendMessage = () => {
        if (message.trim() && onSendMessage) {
            const newMessage = {
                id: Date.now(),
                text: message.trim(),
                timestamp: new Date(),
                isOwn: true
            };

            // 로컬 채팅 히스토리에 추가
            setChatHistory(prev => [...prev.slice(-19), newMessage]); // 최근 20개만 유지

            onSendMessage(message.trim());
            setMessage('');
            
            // 입력창에 다시 포커스
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    // 새 메시지 수신 (부모 컴포넌트에서 호출할 수 있는 함수)
    const addReceivedMessage = (messageData) => {
        const newMessage = {
            id: Date.now() + Math.random(),
            text: messageData.message,
            playerName: messageData.playerName,
            timestamp: new Date(),
            isOwn: false
        };

        setChatHistory(prev => [...prev.slice(-19), newMessage]);
    };

    // 부모 컴포넌트가 이 함수에 접근할 수 있도록 useImperativeHandle 사용하거나
    // 전역 상태 관리를 사용할 수 있지만, 여기서는 간단하게 처리

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 z-50">
                <button
                    onClick={toggleMinimize}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg transition duration-200 flex items-center"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    채팅
                    {chatHistory.filter(msg => !msg.isOwn).length > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                            {chatHistory.filter(msg => !msg.isOwn && Date.now() - msg.timestamp.getTime() < 60000).length}
                        </span>
                    )}
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 w-80 bg-black bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg z-50">
            {/* 채팅 헤더 */}
            <div className="flex items-center justify-between p-3 border-b border-gray-600">
                <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-white font-medium">채팅</h3>
                </div>
                <button
                    onClick={toggleMinimize}
                    className="text-gray-400 hover:text-white transition duration-200"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* 채팅 히스토리 */}
            <div 
                ref={chatHistoryRef}
                className="h-48 overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
            >
                {chatHistory.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-4">
                        아직 메시지가 없습니다.<br />
                        다른 플레이어들과 대화해보세요!
                    </div>
                ) : (
                    chatHistory.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                    msg.isOwn
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-100'
                                }`}
                            >
                                {!msg.isOwn && (
                                    <div className="text-xs text-blue-300 mb-1">
                                        {msg.playerName}
                                    </div>
                                )}
                                <div>{msg.text}</div>
                                <div className={`text-xs mt-1 ${msg.isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 메시지 입력 */}
            <div className="p-3 border-t border-gray-600">
                <div className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                        maxLength={200}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                    Enter로 전송 • 최대 200자
                </div>
            </div>
        </div>
    );
}