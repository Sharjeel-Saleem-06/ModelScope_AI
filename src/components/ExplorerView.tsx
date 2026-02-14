import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ExternalLink, Zap, Shield, ShieldCheck, Code, Brain, X, Eye, Star, ChevronDown, Layers, Globe, Cpu, Sparkles, BookOpen, BarChart3, DollarSign, Info, Clock, Database, Lock, Unlock, Users, Activity, Hash, Server, Calendar, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react'
import modelsData from '../data/models.json'

const typeIcons: Record<string, any> = {
    'LLM': Brain,
    'Multimodal': Eye,
    'Reasoning': Sparkles,
    'Code': Code,
}

const ProviderBadge = ({ provider }: { provider: string }) => {
    const colors: Record<string, string> = {
        'OpenAI': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Anthropic': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Google': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Meta': 'bg-sky-500/20 text-sky-400 border-sky-500/30',
        'Mistral': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
        'DeepSeek': 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        'Alibaba': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        'Microsoft': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
        'xAI': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Cohere': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        '01.AI': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        'Cursor': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Moonshot': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    }
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colors[provider] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>{provider}</span>
}

const CostBadge = ({ tier }: { tier: string }) => {
    const styles: Record<string, string> = {
        'free': 'text-green-400 bg-green-400/10',
        'free-on-groq': 'text-green-400 bg-green-400/10',
        'cheap': 'text-emerald-400 bg-emerald-400/10',
        'moderate': 'text-yellow-400 bg-yellow-400/10',
        'expensive': 'text-orange-400 bg-orange-400/10',
        'very-expensive': 'text-red-400 bg-red-400/10',
    }
    return <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${styles[tier] || 'text-gray-400 bg-gray-400/10'}`}>
        {tier === 'free-on-groq' ? '🆓 Free on Groq' : tier === 'very-expensive' ? '💎 Enterprise' : tier === 'free' ? '🆓 Free' : tier === 'cheap' ? '💰 Budget' : tier === 'moderate' ? '💰 Moderate' : '💎 Premium'}
    </span>
}

interface ModelType {
    id: string;
    name: string;
    provider: string;
    type: string;
    category: string[];
    contextWindow: number;
    strengths: string[];
    weaknesses: string[];
    useCases: string[];
    notRecommendedFor?: string[];
    safety?: string;
    performance: { speedTier: string; latency: string; throughput: string };
    costTier: string;
    idealFor: string[];
    pricing: { input: string; output: string; tier: string };
    capabilities: Record<string, boolean>;
    description: string;
    benchmarks?: Record<string, number>;
    releaseDate?: string;
    apiEndpoint?: string;
    architecture?: string;
    parameterCount?: string;
    knowledgeCutoff?: string;
    trainingData?: string;
    maxOutput?: number;
    license?: string;
    multilingual?: string[];
}

type TabId = 'overview' | 'technical' | 'benchmarks' | 'pricing'

const BenchmarkBar = ({ label, value, max = 100, color }: { label: string; value: number; max?: number; color: string }) => (
    <div className="space-y-1">
        <div className="flex justify-between text-xs">
            <span className="text-gray-300 font-medium">{label}</span>
            <span className={`font-bold ${color}`}>{value}{max === 100 ? '%' : ''}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${color.includes('cyan') ? 'bg-gradient-to-r from-accent-cyan/60 to-accent-cyan' : color.includes('violet') ? 'bg-gradient-to-r from-accent-violet/60 to-accent-violet' : color.includes('green') ? 'bg-gradient-to-r from-green-500/60 to-green-400' : color.includes('magenta') ? 'bg-gradient-to-r from-accent-magenta/60 to-accent-magenta' : 'bg-gradient-to-r from-yellow-500/60 to-yellow-400'}`}
            />
        </div>
    </div>
)

const SpecItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | undefined }) => {
    if (!value) return null
    return (
        <div className="glass p-3 rounded-xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-accent-cyan" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-sm text-white font-medium truncate">{value}</p>
            </div>
        </div>
    )
}

export default function ExplorerView() {
    const [search, setSearch] = useState('')
    const [providerFilter, setProviderFilter] = useState<string>('all')
    const [typeFilter, setTypeFilter] = useState<string>('all')
    const [costFilter, setCostFilter] = useState<string>('all')
    const [selectedModel, setSelectedModel] = useState<ModelType | null>(null)
    const [showFilters, setShowFilters] = useState(false)
    const [activeTab, setActiveTab] = useState<TabId>('overview')

    const providers = useMemo(() => [...new Set(modelsData.models.map(m => m.provider))], [])
    const types = useMemo(() => [...new Set(modelsData.models.map(m => m.type))], [])

    const filteredModels = useMemo(() => {
        return modelsData.models.filter(m => {
            const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.provider.toLowerCase().includes(search.toLowerCase()) ||
                m.category.some(c => c.toLowerCase().includes(search.toLowerCase())) ||
                m.description?.toLowerCase().includes(search.toLowerCase())
            const matchProvider = providerFilter === 'all' || m.provider === providerFilter
            const matchType = typeFilter === 'all' || m.type === typeFilter
            const matchCost = costFilter === 'all' || m.costTier === costFilter
            return matchSearch && matchProvider && matchType && matchCost
        })
    }, [search, providerFilter, typeFilter, costFilter])

    const tabs: { id: TabId; label: string; icon: any }[] = [
        { id: 'overview', label: 'Overview', icon: Info },
        { id: 'technical', label: 'Technical', icon: Cpu },
        { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3 },
        { id: 'pricing', label: 'Pricing & API', icon: DollarSign },
    ]

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Model Explorer</h2>
                    <p className="text-gray-300">{modelsData.models.length} AI models across {providers.length} providers.</p>
                </div>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, provider, or category..."
                            className="glass border-white/15 pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-accent-cyan/50 focus:shadow-lg focus:shadow-accent-cyan/10 transition-all w-80 bg-white/[0.04] placeholder-gray-400"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`glass border-white/15 px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all ${showFilters ? 'bg-accent-cyan/10 text-accent-cyan border-accent-cyan/30' : 'hover:bg-white/5 text-gray-300'}`}
                    >
                        <Filter className="w-4 h-4" />
                        <span className="text-sm">Filters</span>
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mb-8"
                    >
                        <div className="glass-card p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Provider</label>
                                <select value={providerFilter} onChange={(e) => setProviderFilter(e.target.value)}
                                    className="w-full glass border-white/15 p-2.5 rounded-xl bg-surface text-sm text-white">
                                    <option value="all" className="bg-surface">All Providers</option>
                                    {providers.map(p => <option key={p} value={p} className="bg-surface">{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Type</label>
                                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full glass border-white/15 p-2.5 rounded-xl bg-surface text-sm text-white">
                                    <option value="all" className="bg-surface">All Types</option>
                                    {types.map(t => <option key={t} value={t} className="bg-surface">{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Cost Tier</label>
                                <select value={costFilter} onChange={(e) => setCostFilter(e.target.value)}
                                    className="w-full glass border-white/15 p-2.5 rounded-xl bg-surface text-sm text-white">
                                    <option value="all" className="bg-surface">All Tiers</option>
                                    <option value="free-on-groq" className="bg-surface">Free on Groq</option>
                                    <option value="free" className="bg-surface">Free</option>
                                    <option value="cheap" className="bg-surface">Budget</option>
                                    <option value="moderate" className="bg-surface">Moderate</option>
                                    <option value="expensive" className="bg-surface">Premium</option>
                                    <option value="very-expensive" className="bg-surface">Enterprise</option>
                                </select>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Results count */}
            <p className="text-sm text-gray-300 mb-6">{filteredModels.length} models found</p>

            {/* Model Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map((model, i) => {
                    const IconComp = typeIcons[model.type] || Brain
                    return (
                        <motion.div
                            key={model.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            onClick={() => { setSelectedModel(model as ModelType); setActiveTab('overview') }}
                            className="glass-card p-6 flex flex-col group cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent-cyan/50 transition-colors">
                                    <IconComp className="w-6 h-6 text-accent-cyan" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <ProviderBadge provider={model.provider} />
                                </div>
                            </div>

                            <h3 className="text-lg font-bold mb-1 group-hover:text-accent-cyan transition-colors">{model.name}</h3>
                            <p className="text-xs text-gray-300 mb-3">{model.type} • {model.contextWindow.toLocaleString()} ctx • {model.performance.latency}</p>

                            <p className="text-xs text-gray-300 mb-4 line-clamp-2 leading-relaxed">{model.description}</p>

                            <div className="space-y-1.5 mb-4 flex-1">
                                {model.strengths.slice(0, 2).map((s, j) => (
                                    <div key={j} className="flex items-center gap-2 text-xs text-gray-300">
                                        <Zap className="w-2.5 h-2.5 text-accent-cyan fill-accent-cyan shrink-0" />
                                        <span className="truncate">{s}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto">
                                <CostBadge tier={model.costTier} />
                                <button className="p-2 rounded-lg bg-white/5 hover:bg-accent-cyan/10 hover:text-accent-cyan transition-all text-gray-400">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* ===== PREMIUM MODEL DETAIL MODAL ===== */}
            <AnimatePresence>
                {selectedModel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                        onClick={() => setSelectedModel(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-[#0d1117] border border-white/10 rounded-2xl p-0 max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl shadow-black/50"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 pb-0 border-b border-white/5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-accent-violet/20 flex items-center justify-center border border-white/10">
                                            {(() => { const IC = typeIcons[selectedModel.type] || Brain; return <IC className="w-7 h-7 text-accent-cyan" /> })()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-2xl font-bold text-white">{selectedModel.name}</h2>
                                                <ProviderBadge provider={selectedModel.provider} />
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-300">
                                                <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{selectedModel.type}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><Database className="w-3 h-3" />{selectedModel.contextWindow.toLocaleString()} tokens</span>
                                                {selectedModel.releaseDate && <><span>•</span><span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{selectedModel.releaseDate}</span></>}
                                                {selectedModel.parameterCount && <><span>•</span><span className="flex items-center gap-1"><Hash className="w-3 h-3" />{selectedModel.parameterCount}</span></>}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedModel(null)} className="p-2 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Tab Navigation */}
                                <div className="flex gap-1">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-medium transition-all relative ${activeTab === tab.id
                                                ? 'text-accent-cyan bg-white/5'
                                                : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.02]'
                                                }`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            {tab.label}
                                            {activeTab === tab.id && (
                                                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-cyan rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6 overflow-y-auto max-h-[calc(92vh-140px)]">
                                <AnimatePresence mode="wait">
                                    {/* OVERVIEW TAB */}
                                    {activeTab === 'overview' && (
                                        <motion.div key="overview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                            <p className="text-gray-300 leading-relaxed text-sm">{selectedModel.description}</p>

                                            {/* Quick Stats Row */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div className="glass p-3 rounded-xl text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Speed</p>
                                                    <p className="text-sm font-bold text-white">{selectedModel.performance.latency}</p>
                                                </div>
                                                <div className="glass p-3 rounded-xl text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Throughput</p>
                                                    <p className="text-sm font-bold text-white">{selectedModel.performance.throughput}</p>
                                                </div>
                                                <div className="glass p-3 rounded-xl text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Context</p>
                                                    <p className="text-sm font-bold text-accent-cyan">{(selectedModel.contextWindow / 1000).toFixed(0)}K</p>
                                                </div>
                                                <div className="glass p-3 rounded-xl text-center">
                                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Cost Tier</p>
                                                    <CostBadge tier={selectedModel.costTier} />
                                                </div>
                                            </div>

                                            {/* Strengths & Weaknesses side by side */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="glass p-4 rounded-xl border-green-500/10">
                                                    <h3 className="text-sm font-bold text-green-400 mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> Strengths</h3>
                                                    <div className="space-y-2">
                                                        {selectedModel.strengths.map((s, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                                                <span className="text-green-400 mt-0.5 shrink-0">✦</span>{s}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="glass p-4 rounded-xl border-red-500/10">
                                                    <h3 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Weaknesses</h3>
                                                    <div className="space-y-2">
                                                        {selectedModel.weaknesses.map((w, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                                                <span className="text-red-400 mt-0.5 shrink-0">○</span>{w}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Use Cases */}
                                            <div>
                                                <h3 className="text-sm font-bold text-accent-cyan mb-3 flex items-center gap-2"><ArrowRight className="w-4 h-4" /> Best Use Cases</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedModel.useCases.map((u, i) => (
                                                        <span key={i} className="px-3 py-1.5 rounded-full text-xs glass border-accent-cyan/20 text-accent-cyan font-medium hover:bg-accent-cyan/10 transition-all">{u}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {selectedModel.notRecommendedFor && (
                                                <div>
                                                    <h3 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> Not Recommended For</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedModel.notRecommendedFor.map((n, i) => (
                                                            <span key={i} className="px-3 py-1.5 rounded-full text-xs glass border-orange-400/20 text-orange-400 font-medium">{n}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedModel.safety && (
                                                <div>
                                                    <h3 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Safety & Alignment</h3>
                                                    <div className="glass p-3 rounded-xl border-blue-500/10 bg-blue-500/5">
                                                        <p className="text-xs text-gray-300 leading-relaxed">{selectedModel.safety}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Capabilities */}
                                            <div>
                                                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> Capabilities</h3>
                                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                                    {Object.entries(selectedModel.capabilities).map(([key, val]) => (
                                                        <div key={key} className={`glass p-2.5 rounded-xl text-center text-[11px] font-bold transition-all ${val ? 'text-green-400 border-green-500/20 bg-green-500/5' : 'text-gray-600 border-gray-700/20'}`}>
                                                            {val ? '✅' : '❌'} {key}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-accent-violet mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Ideal For</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedModel.idealFor.map((u, i) => (
                                                        <span key={i} className="px-3 py-1.5 rounded-full text-xs glass border-accent-violet/20 text-accent-violet capitalize font-medium">{u}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* TECHNICAL TAB */}
                                    {activeTab === 'technical' && (
                                        <motion.div key="technical" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <SpecItem icon={Cpu} label="Architecture" value={selectedModel.architecture || 'Transformer'} />
                                                <SpecItem icon={Hash} label="Parameters" value={selectedModel.parameterCount || 'Undisclosed'} />
                                                <SpecItem icon={Database} label="Context Window" value={`${selectedModel.contextWindow.toLocaleString()} tokens`} />
                                                <SpecItem icon={ArrowRight} label="Max Output" value={selectedModel.maxOutput ? `${selectedModel.maxOutput.toLocaleString()} tokens` : 'Standard'} />
                                                <SpecItem icon={Calendar} label="Knowledge Cutoff" value={selectedModel.knowledgeCutoff || 'Not specified'} />
                                                <SpecItem icon={Clock} label="Release Date" value={selectedModel.releaseDate || 'Unknown'} />
                                                <SpecItem icon={BookOpen} label="Training Data" value={selectedModel.trainingData || 'Proprietary dataset'} />
                                                <SpecItem icon={selectedModel.license === 'Open Source' || selectedModel.license === 'Apache 2.0' || selectedModel.license === 'Llama 3.3 Community' ? Unlock : Lock} label="License" value={selectedModel.license || 'Proprietary'} />
                                                <SpecItem icon={Server} label="API Endpoint" value={selectedModel.apiEndpoint} />
                                                <SpecItem icon={Activity} label="Speed Tier" value={`${selectedModel.performance.speedTier} — ${selectedModel.performance.latency}`} />
                                            </div>

                                            {selectedModel.multilingual && selectedModel.multilingual.length > 0 && (
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2"><Globe className="w-4 h-4" /> Language Support</h3>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedModel.multilingual.map((lang, i) => (
                                                            <span key={i} className="px-2.5 py-1 rounded-lg text-xs glass text-gray-200 border-white/10">{lang}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <h3 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2"><Layers className="w-4 h-4" /> Categories</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedModel.category.map((c, i) => (
                                                        <span key={i} className="px-3 py-1.5 rounded-full text-xs glass border-accent-cyan/20 text-accent-cyan capitalize font-medium">{c}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* BENCHMARKS TAB */}
                                    {activeTab === 'benchmarks' && (
                                        <motion.div key="benchmarks" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                            {selectedModel.benchmarks && Object.keys(selectedModel.benchmarks).length > 0 ? (
                                                <>
                                                    <div className="glass p-5 rounded-xl space-y-4">
                                                        <h3 className="text-sm font-bold text-white flex items-center gap-2"><TrendingUp className="w-4 h-4 text-accent-cyan" /> Performance Scores</h3>
                                                        {Object.entries(selectedModel.benchmarks)
                                                            .filter(([k]) => ['mmlu', 'humaneval', 'gsm8k', 'math', 'coding', 'reasoning', 'language', 'knowledge'].includes(k))
                                                            .map(([key, val], i) => (
                                                                <BenchmarkBar
                                                                    key={key}
                                                                    label={key.toUpperCase()}
                                                                    value={val}
                                                                    color={i % 4 === 0 ? 'text-accent-cyan' : i % 4 === 1 ? 'text-accent-violet' : i % 4 === 2 ? 'text-green-400' : 'text-accent-magenta'}
                                                                />
                                                            ))}
                                                    </div>
                                                    {Object.entries(selectedModel.benchmarks).filter(([k]) => ['hellaswag', 'arc'].includes(k)).length > 0 && (
                                                        <div className="glass p-5 rounded-xl space-y-4">
                                                            <h3 className="text-sm font-bold text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-accent-violet" /> Additional Benchmarks</h3>
                                                            {Object.entries(selectedModel.benchmarks)
                                                                .filter(([k]) => ['hellaswag', 'arc'].includes(k))
                                                                .map(([key, val]) => (
                                                                    <BenchmarkBar key={key} label={key.toUpperCase()} value={val} color="text-yellow-400" />
                                                                ))}
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                                    <BarChart3 className="w-12 h-12 text-gray-600 mb-4" />
                                                    <p className="text-gray-400 text-sm">Benchmark data not yet available for this model.</p>
                                                    <p className="text-gray-500 text-xs mt-1">Check back soon for updated performance metrics.</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* PRICING & API TAB */}
                                    {activeTab === 'pricing' && (
                                        <motion.div key="pricing" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="glass p-5 rounded-xl border-accent-cyan/10">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Input Price</span>
                                                    <p className="text-2xl font-bold text-accent-cyan mt-1">{selectedModel.pricing.input}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">per 1 million tokens</p>
                                                </div>
                                                <div className="glass p-5 rounded-xl border-accent-magenta/10">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Output Price</span>
                                                    <p className="text-2xl font-bold text-accent-magenta mt-1">{selectedModel.pricing.output}</p>
                                                    <p className="text-[10px] text-gray-500 mt-1">per 1 million tokens</p>
                                                </div>
                                            </div>

                                            <div className="glass p-5 rounded-xl">
                                                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-accent-cyan" /> API Integration</h3>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-400">Provider</span>
                                                        <span className="text-white font-bold">{selectedModel.provider}</span>
                                                    </div>
                                                    {selectedModel.apiEndpoint && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-400">Endpoint</span>
                                                            <span className="text-accent-cyan font-mono text-[11px] truncate max-w-[300px]">{selectedModel.apiEndpoint}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-400">Context Window</span>
                                                        <span className="text-white">{selectedModel.contextWindow.toLocaleString()} tokens</span>
                                                    </div>
                                                    {selectedModel.maxOutput && (
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-400">Max Output</span>
                                                            <span className="text-white">{selectedModel.maxOutput.toLocaleString()} tokens</span>
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-gray-400">Cost Tier</span>
                                                        <CostBadge tier={selectedModel.costTier} />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cost Comparison Helper */}
                                            <div className="glass p-5 rounded-xl bg-accent-cyan/[0.03] border-accent-cyan/10">
                                                <h3 className="text-sm font-bold text-accent-cyan mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Cost Estimate</h3>
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div>
                                                        <p className="text-xs text-gray-400 mb-1">1K requests</p>
                                                        <p className="text-sm font-bold text-white">
                                                            ${(((selectedModel.pricing as any).inputNum || 0) * 0.5 + ((selectedModel.pricing as any).outputNum || 0) * 0.5).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 mb-1">10K requests</p>
                                                        <p className="text-sm font-bold text-white">
                                                            ${(((selectedModel.pricing as any).inputNum || 0) * 5 + ((selectedModel.pricing as any).outputNum || 0) * 5).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 mb-1">100K requests</p>
                                                        <p className="text-sm font-bold text-white">
                                                            ${(((selectedModel.pricing as any).inputNum || 0) * 50 + ((selectedModel.pricing as any).outputNum || 0) * 50).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-500 mt-3 text-center">Estimated based on ~500 input + 500 output tokens per request</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
