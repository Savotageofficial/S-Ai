<div align="center">

# S-Ai


<img alt="S-Ai Banner" src="S-AI.png" title="Banner" />
**A fast, multi-model AI chatbot with a Next.js frontend and FastAPI backend.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-safwat--ai--duckdns.org-black?style=for-the-badge&logo=vercel)](https://safwat-ai.duckdns.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-API-orange?style=for-the-badge)](https://openrouter.ai/)

</div>

---

## Overview

S-Ai is a lightweight, streaming AI chatbot that lets users interact with multiple AI models through a clean, unified interface. The backend is built with FastAPI and supports real-time token streaming via Server-Sent Events (SSE). The frontend is deployed on Vercel and communicates with the backend seamlessly.

---

## Features

- **Multi-model support** — Switch between different AI models including locally hosted models and cloud-based ones via OpenRouter
- **Streaming responses** — Real-time token-by-token output using Server-Sent Events
- **Fast & lightweight** — Minimal backend footprint with async request handling
- **CORS-enabled** — Ready for cross-origin frontend/backend deployments
- **Extensible** — Easily add new model endpoints

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, deployed on Vercel |
| Backend | FastAPI (Python) |
| Local Models | Ollama |
| Cloud Models | OpenRouter API |
| Streaming | Server-Sent Events (SSE) |

---

## Project Structure

```
S-Ai/
├── frontend/          # Next.js frontend application
├── main.py            # FastAPI backend — all model endpoints
├── requirements.txt   # Python dependencies
├── Pipfile            # Pipenv dependency file
└── test_main.http     # HTTP test file for API endpoints
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- [Ollama](https://ollama.ai/) (for local models)
- An [OpenRouter](https://openrouter.ai/) API key (for cloud models)

---

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Savotageofficial/S-Ai.git
   cd S-Ai
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set your OpenRouter API key**
   ```bash
   export OPENROUTER_API_KEY=your_api_key_here
   ```

4. **Run the backend**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`

---

### Frontend Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:3000`

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `GET /` | GET | Health check |
| `GET /Safwat-ai` | GET | Local Ollama model (Safwat-ai) |
| `GET /Safwat-ai-flash` | GET | Local Ollama model (Safwat-ai-flash) |
| `GET /Safwat-ai-enhanced` | GET | Cloud model via OpenRouter |

All chat endpoints accept a `message` query parameter and return a streaming SSE response.

**Example request:**
```
GET /Safwat-ai-enhanced?message=Hello, how are you?
```

**Example SSE response:**
```
data: {"content": "Hello"}
data: {"content": "! I'm"}
data: {"content": " doing great."}
```

---

## Deployment

### Backend
Deploy to any server that supports Python. Recommended options: **Railway**, **Render**, or a VPS. Make sure to set the `OPENROUTER_API_KEY` environment variable.

### Frontend
The frontend is deployed on **Vercel**. Connect your GitHub repo to Vercel and it will auto-deploy on every push to `master`.

Live at: [s-ai-sage.vercel.app](https://s-ai-sage.vercel.app)

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `OPENROUTER_API_KEY` | Yes (for cloud models) | Your OpenRouter API key |

---

## Contributing

Contributions are welcome. Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is open source. See [LICENSE](LICENSE) for details.

---

<div align="center">
  Built by <a href="https://github.com/Savotageofficial">Savotageofficial</a>
</div>
