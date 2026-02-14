import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Check, Plus, X, ArrowUpDown } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, CartesianGrid, Cell } from 'recharts'
import modelsData from '../data/models.json'

const CHART_COLORS = ['#00f2ff', '#ff00ff', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#f97316']

const benchmarkKeys = [
    { key: 'mmlu', label: 'MMLU', desc: 'General knowledge & reasoning' },
    { key: 'humaneval', label: 'HumanEval', desc: 'Code generation accuracy' },
    { key: 'gsm8k', label: 'GSM8K', desc: 'Grade school math' },
    { key: 'hellaswag', label: 'HellaSwag', desc: 'Common sense reasoning' },
    { key: 'arc', label: 'ARC', desc: 'Science question answering' },
]

const radarKeys = ['reasoning', 'coding', 'math', 'language', 'knowledge']

export default function BenchmarksView() {
    const modelsWithBenchmarks = useMemo(() =>
        modelsData.models.filter(m => m.benchmarks),
        [])

    const [selectedModels, setSelectedModels] = useState<string[]>(() =>
        modelsWithBenchmarks.slice(0, 3).map(m => m.id)
    )
    const [sortKey, setSortKey] = useState<string>('mmlu')

    const toggleModel = (id: string) => {
        if (selectedModels.includes(id)) {
            if (selectedModels.length > 1) {
                setSelectedModels(prev => prev.filter(x => x !== id))
            }
        } else {
            setSelectedModels(prev => [...prev, id])
        }
    }

    const selectedData = useMemo(() =>
        modelsWithBenchmarks.filter(m => selectedModels.includes(m.id)),
        [selectedModels, modelsWithBenchmarks])

    const barData = useMemo(() =>
        benchmarkKeys.map(bk => {
            const entry: Record<string, any> = { benchmark: bk.label, description: bk.desc }
            selectedData.forEach(m => {
                entry[m.name] = m.benchmarks?.[bk.key as keyof typeof m.benchmarks] || 0
            })
            return entry
        }),
        [selectedData])

    const radarData = useMemo(() =>
        radarKeys.map(key => {
            const entry: Record<string, any> = { dimension: key.charAt(0).toUpperCase() + key.slice(1) }
            selectedData.forEach(m => {
                entry[m.name] = m.benchmarks?.[key as keyof typeof m.benchmarks] || 0
            })
            return entry
        }),
        [selectedData])

    // Sort models for the selector
    const sortedModels = useMemo(() =>
        [...modelsWithBenchmarks].sort((a, b) => {
            const aVal = a.benchmarks?.[sortKey as keyof typeof a.benchmarks] || 0
            const bVal = b.benchmarks?.[sortKey as keyof typeof b.benchmarks] || 0
            return (bVal as number) - (aVal as number)
        }),
        [modelsWithBenchmarks, sortKey])

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-accent-cyan/20 flex items-center justify-center border border-accent-cyan/30">
                    <BarChart3 className="w-6 h-6 text-accent-cyan" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Benchmark Comparisons</h2>
                    <p className="text-gray-300 text-sm">Select models to compare performance across standardized benchmarks.</p>
                </div>
            </div>

            {/* Model Selector */}
            <div className="glass-card p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Select Models to Compare ({selectedModels.length} selected)
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Sort by:</span>
                        <select
                            value={sortKey}
                            onChange={(e) => setSortKey(e.target.value)}
                            className="glass border-white/10 px-3 py-1 rounded-lg bg-surface text-xs"
                        >
                            {benchmarkKeys.map(bk => (
                                <option key={bk.key} value={bk.key} className="bg-surface">{bk.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {sortedModels.map(model => {
                        const isSelected = selectedModels.includes(model.id)
                        const colorIdx = selectedModels.indexOf(model.id)
                        return (
                            <button
                                key={model.id}
                                onClick={() => toggleModel(model.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border ${isSelected
                                        ? 'bg-white/10 border-accent-cyan/40 text-white'
                                        : 'glass border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {isSelected ? (
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[colorIdx % CHART_COLORS.length] }} />
                                ) : (
                                    <Plus className="w-3 h-3" />
                                )}
                                {model.name}
                                <span className="text-[10px] text-gray-400">{model.provider}</span>
                                {isSelected && selectedModels.length > 1 && (
                                    <X className="w-3 h-3 text-gray-400 hover:text-red-400 ml-1" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Standard Benchmarks</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="benchmark" stroke="#666" tick={{ fontSize: 12 }} />
                                <YAxis domain={[0, 100]} stroke="#666" tick={{ fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ background: '#0a0a20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                    labelStyle={{ color: '#00f2ff', fontWeight: 'bold' }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                {selectedData.map((m, i) => (
                                    <Bar key={m.id} dataKey={m.name} fill={CHART_COLORS[i % CHART_COLORS.length]} radius={[4, 4, 0, 0]} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Dimensional Strength Matrix</h3>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="dimension" stroke="#999" tick={{ fontSize: 12 }} />
                                {selectedData.map((m, i) => (
                                    <Radar key={m.id} name={m.name} dataKey={m.name}
                                        stroke={CHART_COLORS[i % CHART_COLORS.length]}
                                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                                        fillOpacity={0.1}
                                        strokeWidth={2}
                                    />
                                ))}
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                                <Tooltip
                                    contentStyle={{ background: '#0a0a20', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Detailed Score Comparison</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-gray-400 font-bold">Benchmark</th>
                                {selectedData.map((m, i) => (
                                    <th key={m.id} className="text-center py-3 px-4 font-bold" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }}>
                                        {m.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...benchmarkKeys, ...radarKeys.map(k => ({ key: k, label: k.charAt(0).toUpperCase() + k.slice(1), desc: '' }))].map(bk => {
                                const scores = selectedData.map(m => m.benchmarks?.[bk.key as keyof typeof m.benchmarks] || 0)
                                const maxScore = Math.max(...(scores as number[]))
                                return (
                                    <tr key={bk.key} className="border-b border-white/5 hover:bg-white/[0.02]">
                                        <td className="py-3 px-4 text-gray-300 font-medium">{bk.label}</td>
                                        {selectedData.map((m, i) => {
                                            const val = (m.benchmarks?.[bk.key as keyof typeof m.benchmarks] || 0) as number
                                            return (
                                                <td key={m.id} className="text-center py-3 px-4">
                                                    <span className={`font-bold ${val === maxScore ? 'text-accent-cyan' : 'text-gray-400'}`}>
                                                        {val.toFixed(1)}
                                                        {val === maxScore && ' 🏆'}
                                                    </span>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
