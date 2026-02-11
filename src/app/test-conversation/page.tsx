'use client';

import { useState } from 'react';
import { ConversationManager } from '@/lib/ConversationManager';
import type { SessionSummary } from '@/types/health';

export default function TestConversation() {
    const [manager] = useState(() => new ConversationManager());
    const [messages, setMessages] = useState<Array<{ sender: string; text: string }>>([]);
    const [input, setInput] = useState('');
    const [summary, setSummary] = useState<SessionSummary | null>(null);
    const [started, setStarted] = useState(false);

    const start = () => {
        const opening = manager.startSession();
        setMessages([{ sender: 'Avatar', text: opening }]);
        setStarted(true);
    };

    const send = () => {
        if (!input.trim()) return;

        const response = manager.processUserResponse(input);
        setMessages(prev => [
            ...prev,
            { sender: 'You', text: input },
            { sender: 'Avatar', text: response.textToSpeak }
        ]);

        if (response.isFinished && response.summary) {
            setSummary(response.summary);
        }

        setInput('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">
                    🧪 Test Conversation Manager (No HeyGen Needed)
                </h1>

                {!started ? (
                    <button
                        onClick={start}
                        className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700"
                    >
                        Start Health Assessment
                    </button>
                ) : (
                    <>
                        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6 h-96 overflow-y-auto">
                            {messages.map((msg, i) => (
                                <div key={i} className={`mb-4 ${msg.sender === 'You' ? 'text-right' : ''}`}>
                                    <div className={`inline-block px-4 py-2 rounded-2xl ${msg.sender === 'You'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                        }`}>
                                        <div className="font-bold text-xs mb-1 opacity-70">{msg.sender}</div>
                                        <div className="whitespace-pre-wrap">{msg.text}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {!summary ? (
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && send()}
                                    placeholder="Type your answer..."
                                    className="flex-1 px-6 py-4 rounded-2xl border-2 border-slate-200 focus:border-blue-500 outline-none"
                                />
                                <button
                                    onClick={send}
                                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700"
                                >
                                    Send
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-lg p-8">
                                <h2 className="text-2xl font-bold mb-4">📊 Health Summary</h2>
                                <pre className="bg-slate-50 p-4 rounded-xl overflow-auto text-sm">
                                    {summary.summaryText}
                                </pre>
                                <div className="mt-6">
                                    <h3 className="font-bold mb-2">Recommendations:</h3>
                                    <ul className="list-disc pl-6">
                                        {summary.recommendations.map((rec, i) => (
                                            <li key={i} className="mb-2">{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
