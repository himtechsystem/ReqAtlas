# ReqAtlas

ReqAtlas is a comprehensive, next-generation API development and testing environment designed for modern engineers who demand both power and precision. Through a futuristic, high-performance interface and deep integration with cutting-edge generative AI, ReqAtlas elevates the developer experience end to end.

**Core Capabilities**:
- **Multi-Protocol Testing**: HTTP/REST, GraphQL, WebSocket.
- **Robust Session Management**: Cookie Jar, Request History, Environment Variables.
- **Batch Execution**: Automated Collection Runner.
- **AI Integration**: Generative AI assistance for queries and analysis.

Online use: https://reqatlas.vercel.app/

---

## 🛠️ Project Setup (Deployment Guide)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually bundled with Node.js)

### 1. Installation
Clone the repository and install dependencies (including Electron and system libraries):

```bash
npm install
```

### 2. Development Mode
Start both the Frontend (Vite) and Backend (Electron) in development mode with hot-reload:
```bash
npm run electron:dev
```

---

## 📦 Packaging (Build Guide)

### Build for macOS (.dmg)
If you are on a Mac, simply run:
```bash
npm run dist
```
The output file will be in `release/ReqAtlas-x.x.x.dmg`.

### Build for Windows (.exe)
**Recommended**: Build on a Windows machine for best stability.
1. Copy the source code to a Windows computer (exclude `node_modules`, `dist`, `release`).
2. Run `npm install`.
3. Run `npm run dist`.
The output file will be a portable `.exe` in `release/`.

**Alternative (Cross-compile on Mac)**:
Requires `homebrew` and `wine`.
```bash
brew install wine-stable
npm run dist -- --win
```

### 📂 What to Commit (Git Ignore)
When sharing or committing this project, **exclude** the following large build directories:
- `node_modules/` (Dependencies)
- `release/` (Packaged Apps)
- `dist/` (Frontend Build)
- `dist-electron/` (Backend Build)

These will be automatically regenerated when you run `npm install` and `npm run dist`.
