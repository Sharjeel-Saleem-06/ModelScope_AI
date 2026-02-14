import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Zap, TrendingDown, ArrowRight, DollarSign, BarChart3, Settings2 } from 'lucide-react'
import modelsData from '../data/models.json'

export default function CalculatorView() {
    const [selectedModelId, setSelectedModelId] = useState(modelsData.models[0].id)
    const [compareModelId, setCompareModelId] = useState<string>('')
    const [inputTokens, setInputTokens] = useState(1000)
    const [outputTokens, setOutputTokens] = useState(500)
    const [requestsPerDay, setRequestsPerDay] = useState(100)
    const [daysPerMonth, setDaysPerMonth] = useState(30)
    const [avgConversationLength, setAvgConversationLength] = useState(5)

    const model = modelsData.models.find(m => m.id === selectedModelId)!
    const compareModel = compareModelId ? modelsData.models.find(m => m.id === compareModelId) : null

    const calculateCost = (m: typeof model) => {
        const inputPrice = m.pricing.inputNum || 0
        const outputPrice = m.pricing.outputNum || 0
        const totalInputTokens = inputTokens * requestsPerDay * daysPerMonth * avgConversationLength
        const totalOutputTokens = outputTokens * requestsPerDay * daysPerMonth * avgConversationLength
        const inputCost = (totalInputTokens / 1_000_000) * inputPrice
        const outputCost = (totalOutputTokens / 1_000_000) * outputPrice
        return {
            inputCost,
            outputCost,
            totalCost: inputCost + outputCost,
            totalInputTokens,
            totalOutputTokens,
            dailyCost: (inputCost + outputCost) / daysPerMonth,
            yearCost: (inputCost + outputCost) * 12,
        }
    }

    const costs = calculateCost(model)
    const compareCosts = compareModel ? calculateCost(compareModel) : null

    const sortedByCost = useMemo(() => {
        return [...modelsData.models]
            .map(m => ({ ...m, totalCost: calculateCost(m).totalCost }))
            .sort((a, b) => a.totalCost - b.totalCost)
    }, [inputTokens, outputTokens, requestsPerDay, daysPerMonth, avgConversationLength])

    const savings = compareCosts
        ? ((compareCosts.totalCost - costs.totalCost) / (compareCosts.totalCost || 1) * 100).toFixed(1)
        : null

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-accent-magenta/20 flex items-center justify-center border border-accent-magenta/30">
                    <Calculator className="w-6 h-6 text-accent-magenta" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Cost Calculator</h2>
                    <p className="text-gray-300 text-sm">Estimate and compare operational costs across all {modelsData.models.length} models.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Controls */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Model Selection */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Settings2 className="w-4 h-4" /> Model Selection
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Primary Model</label>
                                <select value={selectedModelId} onChange={(e) => setSelectedModelId(e.target.value)}
                                    className="w-full glass border-white/10 p-3 rounded-xl bg-surface text-sm">
                                    {modelsData.models.map(m => (
                                        <option key={m.id} value={m.id} className="bg-surface">{m.name} ({m.provider})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 mb-2">Compare With (optional)</label>
                                <select value={compareModelId} onChange={(e) => setCompareModelId(e.target.value)}
                                    className="w-full glass border-white/10 p-3 rounded-xl bg-surface text-sm">
                                    <option value="" className="bg-surface">No comparison</option>
                                    {modelsData.models.filter(m => m.id !== selectedModelId).map(m => (
                                        <option key={m.id} value={m.id} className="bg-surface">{m.name} ({m.provider})</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Parameters */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" /> Usage Parameters
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-400">Input Tokens per Request</label>
                                    <span className="text-xs text-accent-cyan font-bold">{inputTokens.toLocaleString()}</span>
                                </div>
                                <input type="range" min="100" max="50000" step="100" value={inputTokens}
                                    onChange={(e) => setInputTokens(parseInt(e.target.value))}
                                    className="w-full accent-accent-cyan" />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                    <span>100</span><span>25K</span><span>50K</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-400">Output Tokens per Request</label>
                                    <span className="text-xs text-accent-cyan font-bold">{outputTokens.toLocaleString()}</span>
                                </div>
                                <input type="range" min="50" max="16000" step="50" value={outputTokens}
                                    onChange={(e) => setOutputTokens(parseInt(e.target.value))}
                                    className="w-full accent-accent-cyan" />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                    <span>50</span><span>8K</span><span>16K</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-400">Requests per Day</label>
                                    <span className="text-xs text-accent-cyan font-bold">{requestsPerDay.toLocaleString()}</span>
                                </div>
                                <input type="range" min="1" max="10000" step="1" value={requestsPerDay}
                                    onChange={(e) => setRequestsPerDay(parseInt(e.target.value))}
                                    className="w-full accent-accent-cyan" />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                    <span>1</span><span>5K</span><span>10K</span>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-400">Days per Month</label>
                                    <span className="text-xs text-accent-cyan font-bold">{daysPerMonth}</span>
                                </div>
                                <input type="range" min="1" max="31" step="1" value={daysPerMonth}
                                    onChange={(e) => setDaysPerMonth(parseInt(e.target.value))}
                                    className="w-full accent-accent-cyan" />
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-400">Avg. Conversation Turns</label>
                                    <span className="text-xs text-accent-cyan font-bold">{avgConversationLength}</span>
                                </div>
                                <input type="range" min="1" max="50" step="1" value={avgConversationLength}
                                    onChange={(e) => setAvgConversationLength(parseInt(e.target.value))}
                                    className="w-full accent-accent-cyan" />
                                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                                    <span>1 turn</span><span>25 turns</span><span>50 turns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Primary Cost */}
                    <div className="glass-card p-6 bg-gradient-to-br from-accent-cyan/5 to-accent-magenta/5 border-accent-cyan/10">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">
                            {model.name} — Cost Estimate
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="glass p-4 rounded-xl text-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Daily</span>
                                <p className="text-xl font-bold text-accent-cyan">${costs.dailyCost.toFixed(2)}</p>
                            </div>
                            <div className="glass p-4 rounded-xl text-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Monthly</span>
                                <p className="text-2xl font-bold text-accent-cyan">${costs.totalCost.toFixed(2)}</p>
                            </div>
                            <div className="glass p-4 rounded-xl text-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Yearly</span>
                                <p className="text-xl font-bold text-accent-magenta">${costs.yearCost.toFixed(2)}</p>
                            </div>
                            <div className="glass p-4 rounded-xl text-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Total Tokens</span>
                                <p className="text-lg font-bold text-white">{((costs.totalInputTokens + costs.totalOutputTokens) / 1_000_000).toFixed(2)}M</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Input Cost</span>
                                <p className="text-sm font-bold text-white">${costs.inputCost.toFixed(4)} ({model.pricing.input})</p>
                            </div>
                            <div className="glass p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Output Cost</span>
                                <p className="text-sm font-bold text-white">${costs.outputCost.toFixed(4)} ({model.pricing.output})</p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison */}
                    {compareCosts && compareModel && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 border-accent-violet/20"
                        >
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                                Comparison: {model.name} vs {compareModel.name}
                            </h3>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="glass p-4 rounded-xl text-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{model.name}</span>
                                    <p className="text-lg font-bold text-accent-cyan">${costs.totalCost.toFixed(2)}/mo</p>
                                </div>
                                <div className="flex items-center justify-center">
                                    <ArrowRight className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="glass p-4 rounded-xl text-center">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">{compareModel.name}</span>
                                    <p className="text-lg font-bold text-accent-magenta">${compareCosts.totalCost.toFixed(2)}/mo</p>
                                </div>
                            </div>

                            <div className={`text-center p-4 rounded-xl ${Number(savings) > 0
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : Number(savings) < 0
                                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        : 'glass text-gray-400'
                                }`}>
                                <span className="font-bold text-lg">
                                    {Number(savings) > 0 ? `🔥 ${model.name} saves you ${savings}%` :
                                        Number(savings) < 0 ? `⚠️ ${compareModel.name} is ${Math.abs(Number(savings))}% cheaper` :
                                            'Equal cost'}
                                </span>
                            </div>
                        </motion.div>
                    )}

                    {/* All Models Cost Ranking */}
                    <div className="glass-card p-6">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <TrendingDown className="w-4 h-4" /> Cost Ranking (cheapest first)
                        </h3>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {sortedByCost.map((m, i) => {
                                const isSelected = m.id === selectedModelId
                                return (
                                    <div key={m.id}
                                        onClick={() => setSelectedModelId(m.id)}
                                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-accent-cyan/10 border border-accent-cyan/30' : 'hover:bg-white/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-gray-400 w-6">#{i + 1}</span>
                                            <div>
                                                <span className={`text-sm font-bold ${isSelected ? 'text-accent-cyan' : 'text-white'}`}>{m.name}</span>
                                                <span className="text-[10px] text-gray-400 ml-2">{m.provider}</span>
                                            </div>
                                        </div>
                                        <span className={`text-sm font-bold ${m.totalCost === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                                            {m.totalCost === 0 ? '🆓 Free' : `$${m.totalCost.toFixed(2)}/mo`}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Optimization Tips */}
                    <div className="glass-card p-6 border-green-400/10">
                        <h3 className="text-sm font-bold text-green-400 uppercase tracking-widest mb-4">💡 Optimization Tips</h3>
                        <div className="space-y-3 text-sm text-gray-300">
                            {costs.totalCost > 100 && (
                                <div className="flex gap-2"><Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" /> Use prompt caching to reduce up to 80% of repeated input tokens.</div>
                            )}
                            {outputTokens > 2000 && (
                                <div className="flex gap-2"><Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" /> Reducing output token count significantly cuts costs — try being more specific in your instructions.</div>
                            )}
                            <div className="flex gap-2"><Zap className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> Route simple queries to Llama 3.1 8B / GPT-4o Mini and complex ones to 70B+ models.</div>
                            <div className="flex gap-2"><Zap className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> Models marked "Free on Groq" have $0 cost — perfect for prototyping and development.</div>
                            {requestsPerDay > 1000 && (
                                <div className="flex gap-2"><Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" /> At {requestsPerDay.toLocaleString()} req/day, consider batch processing or semantic caching.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
