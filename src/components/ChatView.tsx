import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Send, User, Bot, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatView() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const chatEndRef = useRef<HTMLDivElement>(null)

    // Load all available keys from env
    const apiKeys = useMemo(() => {
        const keys = [
            import.meta.env.VITE_GROQ_API_KEY,
            import.meta.env.VITE_GROQ_API_KEY_2,
            import.meta.env.VITE_GROQ_API_KEY_3,
            import.meta.env.VITE_GROQ_API_KEY_4,
            import.meta.env.VITE_GROQ_API_KEY_5
        ].filter(k => k && k.length > 10) as string[]
        return keys
    }, [])

    const [currentKeyIndex, setCurrentKeyIndex] = useState(0)

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async (text?: string) => {
        const contentToSend = text || input
        if (!contentToSend.trim() || isLoading) return

        if (apiKeys.length === 0) {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Configuration Error: No API Keys found. Please set VITE_GROQ_API_KEY in your .env file.' }])
            return
        }

        const userMessage: Message = { role: 'user', content: contentToSend }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        // Rotation logic: try current key, if fail, try next
        const tryFetch = async (attempt = 0): Promise<void> => {
            if (attempt >= apiKeys.length) {
                setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error: All API keys exhausted or rate limited. Please try again later.' }]);
                setIsLoading(false)
                return
            }

            const keyIndex = (currentKeyIndex + attempt) % apiKeys.length
            const activeKey = apiKeys[keyIndex]

            try {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${activeKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            {
                                role: 'system',
                                content: `You are ModelScope AI — a Senior AI Research Engineer and Intelligence System.
                            
Your goal is to provide comprehensive, deep, and structured analysis of AI models for the user's specific use case.

Guidelines:
1. **Deep Analysis**: Go beyond surface-level stats. Explain *why* a model is good for the task (architecture, training data focus, etc.).
2. **Structured Comparison**: Use **Markdown Tables** to compare models on key metrics:
   - Reasoning Capability
   - Coding Proficiency
   - Context Window
   - Pricing / Cost Efficiency
   - Licensing (Open Weights vs Proprietary)
3. **Actionable Recommendation**: Conclude with a clear recommendation: "Use [Model X] for [Task A], usage [Model Y] for [Task B]".
4. **Formatting**: Use explicit headings, bullet points, and bold text for readability.
5. **Tone**: Authoritative, technical yet accessible, and helpful.`
                            },
                            ...messages,
                            userMessage
                        ],
                        temperature: 0.7,
                        max_tokens: 1024,
                        stream: true
                    })
                });

                if (!response.ok) {
                    if (response.status === 429 || response.status === 401) {
                        console.warn(`Key ${keyIndex} failed (${response.status}), trying next key...`)
                        await tryFetch(attempt + 1)
                        return
                    }
                    throw new Error(`Groq API Error: ${response.statusText}`)
                }

                // Success - update index for next time to distribute load
                setCurrentKeyIndex((prev) => (prev + 1) % apiKeys.length)

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let assistantContent = '';

                setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

                while (reader) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6);
                            if (data === '[DONE]') break;
                            try {
                                const json = JSON.parse(data);
                                const text = json.choices[0].delta.content || '';
                                assistantContent += text;
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    newMessages[newMessages.length - 1].content = assistantContent;
                                    return newMessages;
                                });
                            } catch (e) { }
                        }
                    }
                }
                setIsLoading(false)

            } catch (error) {
                console.error(error);
                // If network error, maybe try next key?
                await tryFetch(attempt + 1)
            }
        }

        await tryFetch()
    }

    return (
        <div className="h-[calc(100vh-140px)] flex items-center justify-center p-4">
            <div className="w-full max-w-5xl h-full flex gap-6">

                {/* Main Chat Container */}
                <div className="flex-1 flex flex-col bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl shadow-black/5 dark:shadow-black/50 overflow-hidden relative transition-colors duration-300">

                    {/* Chat Header */}
                    <div className="h-16 border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-6 bg-gray-50/50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-violet to-accent-magenta flex items-center justify-center shadow-lg shadow-accent-violet/20">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-gray-900 dark:text-white">ModelScope Assistant</h2>
                                <p className="text-[10px] text-primary dark:text-accent-cyan flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-accent-cyan animate-pulse" /> Online • Llama 3.3 70B</p>
                            </div>
                        </div>
                        <button onClick={() => setMessages([])} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" title="Clear Chat">
                            <Sparkles className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10 hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-white/20">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-[fadeIn_0.5s_ease-out_forwards]">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-accent-violet/20 blur-3xl rounded-full" />
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-violet to-accent-magenta flex items-center justify-center border border-white/10 shadow-xl dark:shadow-2xl relative z-10">
                                        <Bot className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                <div className="space-y-2 max-w-md">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">How can I help you?</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">I can analyze your requirements and recommend the perfect AI models for your project.</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                                    {[
                                        'Best model for coding python?',
                                        'Compare GPT-4o vs Claude 3.5',
                                        'Cheapest vision model?',
                                        'High performance reasoning?'
                                    ].map((q, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(q)}
                                            className="p-4 rounded-xl bg-white border border-gray-200 dark:bg-white/[0.03] dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.08] hover:border-accent-violet/30 transition-all text-left group shadow-sm dark:shadow-none"
                                        >
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-white transition-colors">{q}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-4 ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
                                >
                                    {m.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0 mt-1">
                                            <Bot className="w-4 h-4 text-primary dark:text-accent-violet" />
                                        </div>
                                    )}

                                    <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'assistant'
                                        ? 'bg-white border border-gray-200 dark:bg-white/[0.03] dark:border-white/5 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm dark:shadow-none'
                                        : 'bg-accent-violet text-white shadow-lg shadow-accent-violet/20 rounded-tr-none'
                                        }`}>
                                        <div className={`prose prose-sm max-w-none ${m.role === 'assistant' ? 'dark:prose-invert' : 'prose-invert text-white'}`}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                                        </div>
                                    </div>

                                    {m.role === 'user' && (
                                        <div className="w-8 h-8 rounded-lg bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center shrink-0 mt-1">
                                            <User className="w-4 h-4 text-accent-violet" />
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                        {isLoading && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 justify-start">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary dark:text-accent-violet" />
                                </div>
                                <div className="flex gap-1 items-center h-8 px-4 rounded-2xl bg-white border border-gray-200 dark:bg-white/[0.03] dark:border-white/5 rounded-tl-none">
                                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                        <div className="relative flex items-center gap-3 bg-white border border-gray-200 dark:bg-white/[0.05] dark:border-white/10 rounded-xl p-2 pr-2 focus-within:border-accent-violet/40 focus-within:bg-gray-50 dark:focus-within:bg-white/[0.08] transition-all shadow-sm dark:shadow-none">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask follow-up..."
                                className="flex-1 bg-transparent border-none focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-3 h-10"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isLoading || !input.trim()}
                                className="w-10 h-10 rounded-lg bg-accent-violet hover:bg-accent-violet/90 disabled:opacity-50 disabled:hover:bg-accent-violet text-white flex items-center justify-center transition-all shadow-md dark:shadow-none"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-2 text-center">
                            <p className="text-[10px] text-gray-400 dark:text-gray-500">AI can make mistakes. Verify important information.</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
