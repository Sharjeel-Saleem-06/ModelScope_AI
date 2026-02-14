# 🧠 ModelScope AI | Intelligent Model Intel

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-modelscopeai.netlify.app-blueviolet?style=for-the-badge)](https://modelscopeai.netlify.app/)
[![React](https://img.shields.io/badge/React-19-block?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Powered_by-Groq-orange?style=for-the-badge)](https://groq.com/)

**ModelScope AI** is a next-generation intelligence platform designed to analyze, compare, and recommend the best AI models for any use case. Powered by the ultra-fast **Groq LPU Inference Engine**, it delivers deep technical insights and structured benchmarks in milliseconds.

---

## ✨ Key Features

### 🚀 **High-Performance Intelligence**
*   **Instant Analysis**: Leverages `llama-3.3-70b-versatile` on Groq for sub-second responses.
*   **Deep Reasoning**: Engineered prompts ensure comprehensive evaluations of model architecture, context windows, and pricing.
*   **Reliability System**: Advanced API key rotation mechanism with 5-key redundancy and automatic failover.

### 📊 **Advanced Data Presentation**
*   **Structured Benchmarks**: Automatically generates detailed **Markdown Tables** comparing models side-by-side.
*   **Rich Formatting**: Supports code syntax highlighting, lists, and complex markdown structures via `remark-gfm`.

### 🎨 **Adaptive & Modern UI**
*   **Glassmorphism Design**: Sleek, translucent interface with dynamic background effects.
*   **Full Theme Support**: Seamlessly switches between a starry **Dark Mode** and a clean, high-contrast **Light Mode**.
*   **Responsive Layout**: Optimized for desktop and mobile workflows.

### 🛠 **Developer Tools**
*   **API Playground**: Built-in sandbox to test prompts and model parameters directly.
*   **Cost Calculator**: Analyze token costs across different providers (OpenAI, Anthropic, Groq).
*   **Learning Hub**: Curated resources for mastering LLM integration.

---

## 🛠 Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS, Framer Motion (for animations)
*   **Markdown Engine**: `react-markdown`, `remark-gfm`, `@tailwindcss/typography`
*   **AI Inference**: Groq SDK (REST API)
*   **State Management**: Zustand
*   **3D Graphics**: Three.js, React Three Fiber

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ModelScope_AI.git
cd ModelScope_AI
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory and add your Groq API keys (supports up to 5 for rotation):

```env
VITE_GROQ_API_KEY=gsk_...
VITE_GROQ_API_KEY_2=gsk_...
VITE_GROQ_API_KEY_3=gsk_...
# ... up to KEY_5
```

> **Note**: You can get a free API key from the [Groq Console](https://console.groq.com/).

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 🧪 Usage Guide

1.  **AI Recommendation**: Navigate to the main chat interface.
2.  **Ask a Question**: Try asking complex comparisons like:
    > *"Compare Llama 3.1 70B and Claude 3.5 Sonnet for coding tasks in a table."*
3.  **View Results**: The AI will generate a structured markdown table with pros/cons, licensing, and performance metrics.

---

## 📄 License

This project is licensed under the MIT License.

---


# ModelScope_AI
