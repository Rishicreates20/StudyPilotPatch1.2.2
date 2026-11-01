<div align="center">

<img width="1200" height="475" alt="StudyPilot banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# ✈️ StudyPilot

**Your AI co-pilot for studying, powered by Google Gemini.**

[![Version](https://img.shields.io/badge/version-1.2.2-blue)](https://github.com/Rishicreates20/StudyPilotPatch1.2.2)
[![Built with AI Studio](https://img.shields.io/badge/built%20with-Google%20AI%20Studio-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/apps)
[![Powered by Gemini](https://img.shields.io/badge/powered%20by-Gemini-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

[Getting Started](#-getting-started) •
[Configuration](#-configuration) •
[Deployment](#-deployment) •
[Contributing](#-contributing)

</div>

---

## 📖 About

**StudyPilot** is a study assistant built with [Google AI Studio](https://aistudio.google.com/apps)
and the [Gemini API](https://ai.google.dev/). It helps students plan, learn, and review more
effectively by bringing generative AI into everyday study sessions.

This repository holds **Patch 1.2.2** of StudyPilot.

## ✨ Features

- 🧠 **AI-powered help:** uses Google Gemini to answer questions and explain topics.
- 🗂️ **Organized studying:** keeps your study sessions focused and structured.
- ⚡ **Fast and lightweight:** runs locally in your browser with a simple dev server.
- 🔐 **Bring your own key:** your Gemini API key stays in a local `.env.local` file.

## 🧰 Tech Stack

| Layer       | Technology                                   |
| ----------- | -------------------------------------------- |
| AI model    | Google Gemini (via the Gemini API)           |
| Prototyping | Google AI Studio                             |
| Runtime     | Node.js and npm                              |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v18 or newer** (includes npm)
- A **Gemini API key**: get one free at [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Rishicreates20/StudyPilotPatch1.2.2.git
   cd StudyPilotPatch1.2.2
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Add your API key.** Create a file named `.env.local` in the project root:

   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. Open the local URL printed in your terminal (usually `http://localhost:3000` or
   `http://localhost:5173`).

## ⚙️ Configuration

| Variable         | Required | Description                                 |
| ---------------- | :------: | ------------------------------------------- |
| `GEMINI_API_KEY` |    ✅    | Your Google Gemini API key from AI Studio.  |

> [!WARNING]
> Never commit `.env.local` or your API key to GitHub. Make sure `.env.local` is listed in
> your `.gitignore`.

## 📜 Available Scripts

| Command           | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Starts the local development server.          |
| `npm run build`   | Builds an optimized production bundle.        |
| `npm run preview` | Serves the production build locally.          |

## 🌐 Deployment

StudyPilot builds to static files, so you can host it on any static hosting provider:

- **Vercel / Netlify:** import this repo, set `GEMINI_API_KEY` as an environment variable,
  and deploy.
- **Google Cloud Run:** deploy straight from Google AI Studio with one click.

> [!NOTE]
> Any key bundled into a client-side app can be seen by visitors. For a public deployment,
> consider routing Gemini requests through a small backend or serverless function.

## 📝 Changelog

### v1.2.2
- Patch release of StudyPilot. See the [commit history](https://github.com/Rishicreates20/StudyPilotPatch1.2.2/commits)
  for details.

## 🤝 Contributing

Contributions, bug reports, and feature ideas are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a pull request.

Found a bug? [Open an issue](https://github.com/Rishicreates20/StudyPilotPatch1.2.2/issues).

## 👤 Author

**Rishikesh Sarangi**: [@Rishicreates20](https://github.com/Rishicreates20)

## ⭐ Support

If StudyPilot helps you study smarter, please consider giving the repo a ⭐. It helps others
find the project!

<div align="center">

Made with ❤️ using [Google AI Studio](https://aistudio.google.com/apps)

</div>
