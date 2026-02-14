import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Play, Code, Settings, Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle, Copy, Clock, Zap, Eye, EyeOff, Key, ChevronDown } from 'lucide-react'
import modelsData from '../data/models.json'

type KeyStatus = 'idle' | 'checking' | 'valid' | 'invalid'

const PROVIDER_CONFIG: Record<string, { endpoint: string; keyPrefix: string; keyPlaceholder: string; freeUrl: string; authHeader: (k: string) => Record<string, string>; bodyTransform?: (body: any) => any }> = {
    'OpenAI': { endpoint: 'https://api.openai.com/v1/chat/completions', keyPrefix: 'sk-', keyPlaceholder: 'sk-...', freeUrl: 'platform.openai.com/api-keys', authHeader: k => ({ 'Authorization': `Bearer ${k}` }) },
    'Anthropic': { endpoint: 'https://api.anthropic.com/v1/messages', keyPrefix: 'sk-ant-', keyPlaceholder: 'sk-ant-...', freeUrl: 'console.anthropic.com', authHeader: k => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }), bodyTransform: (body: any) => ({ model: body.model, max_tokens: body.max_tokens, system: body.messages[0]?.content || '', messages: body.messages.slice(1), temperature: body.temperature, top_p: body.top_p }) },
    'Google': { endpoint: 'https://generativelanguage.googleapis.com/v1beta/models', keyPrefix: 'AI', keyPlaceholder: 'AIza...', freeUrl: 'aistudio.google.com/apikey', authHeader: k => ({}) },
    'Meta': { endpoint: 'https://api.groq.com/openai/v1/chat/completions', keyPrefix: 'gsk_', keyPlaceholder: 'gsk_... (via Groq)', freeUrl: 'console.groq.com/keys', authHeader: k => ({ 'Authorization': `Bearer ${k}` }) },
    'Mistral': { endpoint: 'https://api.mistral.ai/v1/chat/completions', keyPrefix: '', keyPlaceholder: 'Mistral API key', freeUrl: 'console.mistral.ai', authHeader: k => ({ 'Authorization': `Bearer ${k}` }) },
    'DeepSeek': { endpoint: 'https://api.deepseek.com/v1/chat/completions', keyPrefix: 'sk-', keyPlaceholder: 'sk-...', freeUrl: 'platform.deepseek.com', authHeader: k => ({ 'Authorization': `Bearer ${k}` }) },
    'Alibaba': { endpoint: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', keyPrefix: 'sk-', keyPlaceholder: 'sk-...', freeUrl: 'dashscope.console.aliyun.com', authHeader: k => ({ 'Authorization': `Bearer ${k}` }) },
    'xAI': { endpoint: 'https://api.x.ai/v1/chat/completions', keyPrefix: 'xai-', keyPlaceholder: 'xai-...', freeUrl: 'console.x.ai', authHeader: k => ({ 'Authorization': `Bearer ${k}` }) },
    'Cohere': { endpoint: 'https://api.cohere.ai/v1/chat', keyPrefix: '', keyPlaceholder: 'Cohere API key', freeUrl: 'dashboard.cohere.com', authHeader: k => ({ 'Authorization': `Bearer ${k}` }) },
    '01.AI': { endpoint: 'https://api.01.ai/v1/chat/completions', keyPrefix: '', keyPlaceholder: 'Yi API key', freeUrl: 'platform.01.ai', authHeader: k => ({ 'Authorization': `Bearer ${k}` }) },
    'Microsoft': { endpoint: 'https://api.groq.com/openai/v1/chat/completions', keyPrefix: 'gsk_', keyPlaceholder: 'gsk_... (via Groq)', freeUrl: 'console.groq.com/keys', authHeader: k => ({ 'Authorization': `Bearer ${k}` }) },
}

// Model name map for API calls
const modelApiNames: Record<string, string> = {
    'llama-3-3-70b': 'llama-3.3-70b-versatile', 'llama-3-1-8b': 'llama-3.1-8b-instant',
    'llama-3-1-405b': 'llama-3.1-70b-versatile', 'llama-3-2-vision': 'llama-3.2-11b-vision-preview',
    'mixtral-8x7b': 'mixtral-8x7b-32768', 'gemma2-9b': 'gemma2-9b-it', 'gemma2-27b': 'gemma2-9b-it',
    'phi-3-medium': 'llama-3.3-70b-versatile', 'gpt-4o': 'gpt-4o', 'gpt-4-turbo': 'gpt-4-turbo',
    'gpt-4o-mini': 'gpt-4o-mini', 'gpt-3-5-turbo': 'gpt-3.5-turbo', 'o1': 'o1', 'o1-mini': 'o1-mini',
    'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022', 'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-5-haiku': 'claude-3-5-haiku-20241022', 'claude-3-sonnet': 'claude-3-sonnet-20240229',
    'claude-3-haiku': 'claude-3-haiku-20240307',
    'gemini-2-0-flash': 'gemini-2.0-flash', 'gemini-1-5-pro': 'gemini-1.5-pro',
    'gemini-1-5-flash': 'gemini-1.5-flash', 'mistral-large': 'mistral-large-latest',
    'mistral-small': 'mistral-small-latest', 'mistral-nemo': 'open-mistral-nemo',
    'codestral': 'codestral-latest', 'deepseek-r1': 'deepseek-reasoner',
    'deepseek-v3': 'deepseek-chat', 'deepseek-coder-v2': 'deepseek-coder',
    'qwen-2-5-72b': 'qwen-turbo', 'qwen-2-5-coder': 'qwen-coder-turbo', 'qwq-32b': 'qwq-plus',
    'grok-2': 'grok-2', 'command-r-plus': 'command-r-plus', 'yi-lightning': 'yi-lightning',
}

const PRESETS = [
    { name: 'Code Generation', system: 'You are an expert programmer.', user: 'Write a function that finds the longest palindromic substring.' },
    { name: 'Creative Writing', system: 'You are a creative writer.', user: 'Write a short story about an AI that develops emotions.' },
    { name: 'Data Analysis', system: 'You are a data analyst.', user: 'Compare NoSQL vs SQL for a 10M user chat app.' },
    { name: 'Explain Concept', system: 'You are an expert teacher.', user: 'Explain transformer attention mechanisms simply.' },
]

export default function PlaygroundView() {
    const [selectedModelId, setSelectedModelId] = useState(modelsData.models[0].id)
    const selectedModel = modelsData.models.find(m => m.id === selectedModelId)!
    const provider = selectedModel.provider
    const providerCfg = PROVIDER_CONFIG[provider] || PROVIDER_CONFIG['OpenAI']

    const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
        let stored: Record<string, string> = {}
        try { stored = JSON.parse(localStorage.getItem('playground_keys') || '{}') } catch { }

        // Auto-fill Groq key if available in env
        const envKey = import.meta.env.VITE_GROQ_API_KEY
        if (envKey) {
            if (!stored['Meta']) stored['Meta'] = envKey
            if (!stored['Microsoft']) stored['Microsoft'] = envKey
        }
        return stored
    })
    const apiKey = apiKeys[provider] || ''
    const setApiKey = (key: string) => {
        const updated = { ...apiKeys, [provider]: key }
        setApiKeys(updated)
        localStorage.setItem('playground_keys', JSON.stringify(updated))
    }
    const [showApiKey, setShowApiKey] = useState(false)
    const [keyStatus, setKeyStatus] = useState<KeyStatus>('idle')

    const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.')
    const [userPrompt, setUserPrompt] = useState('')
    const [temperature, setTemperature] = useState(0.7)
    const [maxTokens, setMaxTokens] = useState(2048)
    const [topP, setTopP] = useState(1.0)
    const [stopSequences, setStopSequences] = useState('')

    const [response, setResponse] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [stats, setStats] = useState<{ time: number; model: string } | null>(null)
    const [error, setError] = useState('')
    const [showPresets, setShowPresets] = useState(false)

    // Check key validity when it changes
    useEffect(() => {
        if (apiKey.length < 5) { setKeyStatus('idle'); return }
        setKeyStatus(apiKey.length > 10 ? 'valid' : 'idle') // Simple length check — real validation happens on call
    }, [apiKey])

    // Group models by provider
    const groupedModels = useMemo(() => {
        const groups: Record<string, typeof modelsData.models> = {}
        modelsData.models.forEach(m => {
            if (!groups[m.provider]) groups[m.provider] = []
            groups[m.provider].push(m)
        })
        return groups
    }, [])

    const handleRun = async () => {
        if (!userPrompt.trim() || !apiKey || isLoading) return
        setIsLoading(true); setResponse(''); setError(''); setStats(null)
        const startTime = Date.now()
        const apiModelName = modelApiNames[selectedModelId] || selectedModelId

        try {
            let body: any = {
                model: apiModelName,
                messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
                temperature, max_tokens: maxTokens, top_p: topP, stream: true,
            }
            if (stopSequences.trim()) body.stop = stopSequences.split(',').map(s => s.trim()).filter(Boolean)

            const endpoint = providerCfg.endpoint
            const headers: Record<string, string> = { 'Content-Type': 'application/json', ...providerCfg.authHeader(apiKey) }

            if (providerCfg.bodyTransform) {
                body = providerCfg.bodyTransform(body)
                body.stream = false // Anthropic doesn't use SSE the same way
            }

            const res = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify(body) })

            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.error?.message || err.message || `API Error ${res.status}: Check your ${provider} API key`)
            }

            // Handle streaming (OpenAI-compatible) vs non-streaming
            if (body.stream && res.headers.get('content-type')?.includes('text/event-stream')) {
                const reader = res.body?.getReader()
                const decoder = new TextDecoder()
                let fullText = ''
                while (reader) {
                    const { done, value } = await reader.read()
                    if (done) break
                    const chunk = decoder.decode(value)
                    for (const line of chunk.split('\n')) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6)
                            if (data === '[DONE]') break
                            try {
                                const json = JSON.parse(data)
                                fullText += json.choices[0].delta.content || ''
                                setResponse(fullText)
                            } catch { }
                        }
                    }
                }
            } else {
                const data = await res.json()
                const text = data.choices?.[0]?.message?.content || data.content?.[0]?.text || JSON.stringify(data)
                setResponse(text)
            }
            setStats({ time: (Date.now() - startTime) / 1000, model: apiModelName })
        } catch (err: any) {
            setError(err.message || 'Unknown error')
            setKeyStatus('invalid')
        } finally { setIsLoading(false) }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-accent-cyan/20 flex items-center justify-center border border-accent-cyan/30">
                        <Terminal className="w-6 h-6 text-accent-cyan" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">API Playground</h2>
                        <p className="text-gray-300 text-sm">Test all {modelsData.models.length} models with their native APIs.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <button onClick={() => setShowPresets(!showPresets)}
                            className="glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm hover:bg-white/5 transition-all text-gray-400 border border-white/10">
                            <Code className="w-4 h-4" /> Presets <ChevronDown className="w-3 h-3" />
                        </button>
                        <AnimatePresence>
                            {showPresets && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute right-0 top-full mt-2 w-72 glass-card bg-surface p-2 z-50">
                                    {PRESETS.map(p => (
                                        <button key={p.name} onClick={() => { setSystemPrompt(p.system); setUserPrompt(p.user); setShowPresets(false) }}
                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
                                            <p className="text-sm font-bold text-white">{p.name}</p>
                                            <p className="text-[10px] text-gray-500 truncate">{p.user}</p>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button onClick={handleRun} disabled={!apiKey || isLoading || !userPrompt}
                        className="px-6 py-2 rounded-xl bg-accent-cyan text-black font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:hover:scale-100">
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-black" />} Run
                    </button>
                </div>
            </div>

            {/* API Key for selected provider */}
            <div className="glass-card p-5 mb-6 bg-white/[0.06] border-accent-cyan/15 shadow-lg shadow-accent-cyan/5">
                <div className="flex items-center gap-3 mb-3">
                    <Key className="w-5 h-5 text-accent-violet" />
                    <span className="text-sm font-bold text-white">{provider} API Key</span>
                    <span className="text-[10px] text-gray-300 ml-auto">
                        Get one at <a href={`https://${providerCfg.freeUrl}`} target="_blank" className="text-accent-cyan hover:underline">{providerCfg.freeUrl}</a>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <input type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                            placeholder={`Enter your ${provider} API key (${providerCfg.keyPlaceholder})`}
                            className="w-full glass border-white/15 pl-4 pr-12 py-2.5 rounded-xl focus:outline-none focus:border-accent-cyan/50 focus:shadow-lg focus:shadow-accent-cyan/10 transition-all text-sm bg-white/[0.04] placeholder-gray-400" />
                        <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
                            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {keyStatus === 'valid' && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {keyStatus === 'invalid' && <XCircle className="w-5 h-5 text-red-400" />}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Config */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Model
                        </h3>
                        <select value={selectedModelId} onChange={(e) => { setSelectedModelId(e.target.value); setKeyStatus('idle'); setError('') }}
                            className="w-full glass border-white/10 p-3 rounded-xl bg-surface text-sm mb-3">
                            {Object.entries(groupedModels).map(([prov, models]) => (
                                <optgroup key={prov} label={prov}>
                                    {models.map(m => <option key={m.id} value={m.id} className="bg-surface">{m.name}</option>)}
                                </optgroup>
                            ))}
                        </select>
                        {selectedModel && (
                            <div className="text-xs text-gray-400 space-y-1">
                                <p>Provider: <span className="text-white">{provider}</span></p>
                                <p>Context: {selectedModel.contextWindow.toLocaleString()} tokens</p>
                                <p>Speed: {selectedModel.performance.latency} • {selectedModel.costTier}</p>
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">Parameters</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-400">Temperature</label><span className="text-xs text-accent-cyan font-mono">{temperature}</span></div>
                                <input type="range" min="0" max="2" step="0.05" value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-accent-cyan" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-400">Max Tokens</label><span className="text-xs text-accent-cyan font-mono">{maxTokens}</span></div>
                                <input type="range" min="1" max="8192" step="1" value={maxTokens} onChange={(e) => setMaxTokens(parseInt(e.target.value))} className="w-full accent-accent-cyan" />
                            </div>
                            <div>
                                <div className="flex justify-between mb-1"><label className="text-xs font-bold text-gray-400">Top P</label><span className="text-xs text-accent-cyan font-mono">{topP}</span></div>
                                <input type="range" min="0" max="1" step="0.05" value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))} className="w-full accent-accent-cyan" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 block mb-1">Stop Sequences</label>
                                <input type="text" value={stopSequences} onChange={(e) => setStopSequences(e.target.value)} placeholder="Comma-separated"
                                    className="w-full glass border-white/15 p-2 rounded-lg text-xs bg-white/[0.04] focus:outline-none focus:border-accent-cyan/50 placeholder-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest mb-4">System Prompt</h3>
                        <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)}
                            className="w-full glass border-white/15 p-3 rounded-xl bg-white/[0.04] text-sm min-h-[100px] focus:border-accent-cyan/50 focus:outline-none resize-none text-gray-200" />
                    </div>
                </div>

                {/* Input/Output */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">User Prompt</h3>
                            <button onClick={() => setUserPrompt('')} className="p-2 rounded-lg hover:bg-white/5 text-gray-500"><RefreshCw className="w-4 h-4" /></button>
                        </div>
                        <textarea value={userPrompt} onChange={(e) => setUserPrompt(e.target.value)}
                            className="bg-transparent border-none focus:outline-none resize-none text-base text-white min-h-[120px] w-full placeholder-gray-400" placeholder="Write your prompt..." />
                    </div>

                    <div className="glass-card p-6 flex-1 min-h-[300px] border-accent-cyan/10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-bold text-accent-cyan uppercase tracking-widest">Response</h3>
                            {response && <button onClick={() => navigator.clipboard.writeText(response)} className="flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-white/5 text-gray-300 text-xs"><Copy className="w-3.5 h-3.5" /> Copy</button>}
                        </div>
                        {error && <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4 text-red-400 text-sm"><AlertTriangle className="w-5 h-5 shrink-0" />{error}</div>}
                        {isLoading && !response && <div className="flex items-center justify-center py-20 text-accent-cyan animate-pulse"><Loader2 className="w-8 h-8 animate-spin mr-3" /><span className="font-bold">Calling {provider} API...</span></div>}
                        <div className="overflow-y-auto max-h-[400px] pr-2 text-gray-300 leading-relaxed font-mono text-sm whitespace-pre-wrap">
                            {response || (!isLoading && !error && <span className="text-gray-400">Response will appear here...</span>)}
                        </div>
                        {stats && (
                            <div className="mt-4 pt-4 border-t border-white/5 flex gap-6 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {stats.time.toFixed(2)}s</span>
                                <span>Model: {stats.model}</span>
                                <span>Provider: {provider}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
