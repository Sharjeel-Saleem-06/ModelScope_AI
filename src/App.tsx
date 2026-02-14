import { motion, AnimatePresence } from 'framer-motion'
import {
    MessageSquare,
    Search,
    BarChart3,
    Calculator,
    Terminal,
    BookOpen,
    Sun,
    Moon,
    Home,
    ChevronRight,
    Brain,
    Zap,
    Cpu
} from 'lucide-react'
import { useAppStore } from './store/useAppStore'
import BackgroundScene from './components/BackgroundScene'
import ChatView from './components/ChatView'
import ExplorerView from './components/ExplorerView'
import BenchmarksView from './components/BenchmarksView'
import CalculatorView from './components/CalculatorView'
import PlaygroundView from './components/PlaygroundView'
import LearningHubView from './components/LearningHubView'

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active
            ? 'bg-white/10 text-accent-cyan'
            : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
    >
        <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="font-medium text-sm whitespace-nowrap">{label}</span>
        {active && <motion.div layoutId="sidebar-active" className="ml-auto w-1 h-4 bg-accent-cyan rounded-full" />}
    </button>
)

const Hero = () => {
    const setView = useAppStore((state) => state.setView)

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full glass border-accent-cyan/20 text-accent-cyan text-sm font-medium"
            >
                <Zap className="w-4 h-4 fill-accent-cyan" />
                <span>Powered by Groq Intelligence</span>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-bold mb-6 tracking-tight"
            >
                Select Your <span className="text-gradient">Intelligence</span>
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 text-xl max-w-2xl mb-12 leading-relaxed"
            >
                The ultimate AI model recommendation engine. Discover, compare, and optimize
                the world's most powerful language models for your specific architecture.
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4 justify-center"
            >
                <button
                    onClick={() => setView('chat')}
                    className="px-8 py-4 rounded-2xl bg-white text-black font-bold flex items-center gap-2 hover:bg-accent-cyan hover:scale-105 transition-all duration-300"
                >
                    Get Started <ChevronRight className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setView('explorer')}
                    className="px-8 py-4 rounded-2xl glass font-bold hover:bg-white/10 transition-all duration-300"
                >
                    Explore Models
                </button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl"
            >
                {[
                    { icon: Brain, title: 'Smart Select', desc: 'AI-driven model matching for any task' },
                    { icon: Cpu, title: 'Live Testing', desc: 'Real-time performance benchmarks' },
                    { icon: Calculator, title: 'Cost Engine', desc: 'Predictive pricing and optimization' }
                ].map((feature, i) => (
                    <div key={i} className="glass-card p-6 text-left">
                        <feature.icon className="w-8 h-8 text-accent-cyan mb-4" />
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-300 text-sm">{feature.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    )
}

function App() {
    const { currentView, setView, groqKey, setGroqKey, theme, toggleTheme } = useAppStore()

    return (
        <div className="relative min-h-screen">
            <BackgroundScene />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between glass border-b-0">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-violet flex items-center justify-center glow-cyan">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tighter">MODELSCOPE <span className="text-accent-cyan">AI</span></span>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="theme-toggle glass hover:bg-white/10 text-gray-400 hover:text-white"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={theme}
                                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5 text-yellow-400" />
                                ) : (
                                    <Moon className="w-5 h-5 text-indigo-600" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex pt-20">
                {/* Sidebar */}
                <aside className="fixed left-0 top-20 bottom-0 w-72 glass border-r-0 p-4 hidden lg:block">
                    <div className="space-y-2">
                        <SidebarItem icon={Home} label="Home" active={currentView === 'home'} onClick={() => setView('home')} />
                        <SidebarItem icon={MessageSquare} label="AI Recommendation" active={currentView === 'chat'} onClick={() => setView('chat')} />
                        <SidebarItem icon={Search} label="Model Explorer" active={currentView === 'explorer'} onClick={() => setView('explorer')} />
                        <SidebarItem icon={BarChart3} label="Benchmarks" active={currentView === 'benchmarks'} onClick={() => setView('benchmarks')} />
                        <SidebarItem icon={Calculator} label="Cost Calculator" active={currentView === 'calculator'} onClick={() => setView('calculator')} />
                        <SidebarItem icon={Terminal} label="API Playground" active={currentView === 'playground'} onClick={() => setView('playground')} />
                        <SidebarItem icon={BookOpen} label="Learning Hub" active={currentView === 'learn'} onClick={() => setView('learn')} />
                    </div>


                </aside>

                {/* Content */}
                <main className="flex-1 lg:ml-72 p-8 min-h-[calc(100vh-80px)]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentView}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentView === 'home' && <Hero />}
                            {currentView === 'chat' && <ChatView />}
                            {currentView === 'explorer' && <ExplorerView />}
                            {currentView === 'benchmarks' && <BenchmarksView />}
                            {currentView === 'calculator' && <CalculatorView />}
                            {currentView === 'playground' && <PlaygroundView />}
                            {currentView === 'learn' && <LearningHubView />}
                            {/* Add more views here */}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    )
}

export default App
