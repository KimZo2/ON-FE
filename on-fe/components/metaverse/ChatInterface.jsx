'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatInterface({ onSendMessage, messages = [], currentPlayerId }) {
    const [message, setMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    
    // props로 받은 messages를 사용
    const chatHistory = messages;
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

    // props로 메시지를 받으므로 addReceivedMessage 함수는 더 이상 필요없음

    if (isMinimized) {
        return (
            <div className="fixed bottom-[1rem] left-[5rem] z-50">
                <button
                    onClick={toggleMinimize}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-[1.3rem] py-[1rem] rounded-lg shadow-lg transition duration-200 flex items-center"
                >
                    <svg className="w-[2.5rem] h-[2.5rem] mr-[0.5rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="fixed bottom-[1rem] left w-[40rem] bg-black bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg z-50">
            {/* 채팅 헤더 */}
            <div className="flex items-center justify-between p-[1rem] border-b border-gray-600">
                <div className="flex items-center">
                    <svg className="w-[2rem] h-[2rem] text-blue-400 mr-[0.5rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-white font-medium">채팅</h3>
                </div>
                <button
                    onClick={toggleMinimize}
                    className="text-gray-400 hover:text-white transition duration-200"
                >
                    <svg className="w-[2rem] h-[2rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* 채팅 히스토리 */}
            <div 
                ref={chatHistoryRef}
                className="h-[25rem] overflow-y-auto p-[1rem] ml-[5rem] space-y-[1rem] scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600"
            >
                {chatHistory.length === 0 ? (
                    <div className="text-gray-400 text-center py-[3rem]">
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
                                className={`break-words whitespace-pre-wrap px-[1rem] py-[1rem] rounded-lg ${
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
                                <div className={`text-base mt-1 ${msg.isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 메시지 입력 */}
            <div className="p-[1rem] border-t border-gray-600">
                <div className="flex space-x-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        className="flex-1 bg-gray-700 text-white placeholder-gray-400 p-[1rem] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                        maxLength={200}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md transition duration-200"
                    >
                        <svg className="w-[2rem] h-[2rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
                <div className="text-base text-gray-400 mt-1">
                    Enter로 전송 • 최대 200자
                </div>
            </div>
        </div>
    );
}