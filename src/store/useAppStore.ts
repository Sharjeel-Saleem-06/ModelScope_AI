import { create } from 'zustand'

type Theme = 'dark' | 'light'

interface AppState {
    currentView: 'home' | 'chat' | 'explorer' | 'comparison' | 'calculator' | 'benchmarks' | 'playground' | 'learn';
    groqKey: string;
    theme: Theme;
    setGroqKey: (key: string) => void;
    setView: (view: AppState['currentView']) => void;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
    const saved = localStorage.getItem('modelscope_theme')
    if (saved === 'light' || saved === 'dark') return saved
    return 'dark'
}

// Apply theme to document on load
const applyTheme = (theme: Theme) => {
    const root = document.documentElement
    if (theme === 'dark') {
        root.classList.add('dark')
        root.classList.remove('light')
    } else {
        root.classList.add('light')
        root.classList.remove('dark')
    }
    localStorage.setItem('modelscope_theme', theme)
}

// Apply initial theme immediately
const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useAppStore = create<AppState>((set) => ({
    currentView: 'home',
    groqKey: localStorage.getItem('groq_key') || '',
    theme: initialTheme,
    setGroqKey: (key: string) => {
        localStorage.setItem('groq_key', key);
        set({ groqKey: key });
    },
    setView: (view) => set({ currentView: view }),
    setTheme: (theme: Theme) => {
        applyTheme(theme)
        set({ theme })
    },
    toggleTheme: () => set((state) => {
        const newTheme = state.theme === 'dark' ? 'light' : 'dark'
        applyTheme(newTheme)
        return { theme: newTheme }
    }),
}))
