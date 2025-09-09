'use client';

import { useState } from 'react';

export default function MetaverseLoginForm({ onConnect, connectionStatus, error, playerName: initialPlayerName }) {
    const [playerName, setPlayerName] = useState(initialPlayerName || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        onConnect(playerName);
    };

    const isConnecting = connectionStatus === 'connecting';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-purple-900">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-8 max-w-md w-full mx-4">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-white mb-2">메타버스 입장</h1>
                    <p className="text-blue-200">가상 세계에서 다른 사용자들과 만나보세요!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="playerName" className="block text-sm font-medium text-blue-200 mb-2">
                            플레이어 이름
                        </label>
                        <input
                            type="text"
                            id="playerName"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="이름을 입력해주세요"
                            className="w-full px-3 py-2 bg-white bg-opacity-20 border border-blue-300 rounded-md text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            maxLength={20}
                            disabled={isConnecting}
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-400 text-red-200 px-3 py-2 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isConnecting || !playerName.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-md transition duration-200"
                    >
                        {isConnecting ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                연결 중...
                            </div>
                        ) : (
                            '메타버스 입장'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-blue-300">
                    <p>• 실시간 멀티플레이어 지원</p>
                    <p>• 채팅 및 상호작용 가능</p>
                    <p>• 가상 세계 탐험</p>
                </div>
            </div>
        </div>
    );
}