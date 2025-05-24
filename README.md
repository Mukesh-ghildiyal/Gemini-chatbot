# Gemini AI Chatbot

A responsive chatbot interface with Google Gemini API integration using Next.js and streaming responses.

## Features

- 💬 Modern chat UI built with Shadcn UI components
- 🔄 Real-time streaming responses from Google's Gemini AI
- 🌓 Dark/Light mode toggle
- 📱 Fully responsive design
- 📋 Message copy functionality
- 🧠 Chat history management
- ⚡ Fast and efficient API integration

## Tech Stack

- Next.js 14+ (App Router)
- @google/generative-ai package
- Shadcn UI components
- Tailwind CSS
- TypeScript

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- Google Gemini API key (get from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/gemini-chatbot.git
   cd gemini-chatbot
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. Create a `.env.local` file in the root directory and add your Gemini API key:
   \`\`\`
   GEMINI_API_KEY=your_gemini_api_key_here
   \`\`\`

4. Start the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

- `app/` - Next.js App Router pages and API routes
  - `page.tsx` - Main chat interface
  - `api/chat/route.ts` - API endpoint for Gemini integration
  - `layout.tsx` - Root layout with ThemeProvider
- `components/` - React components
  - `chat/` - Chat-specific components
  - `ui/` - Shadcn UI components
  - `theme-toggle.tsx` - Theme switcher component
- `lib/` - Utility functions

## Deployment

This project can be easily deployed on Vercel or Netlify:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/gemini-chatbot)

Remember to set the `GEMINI_API_KEY` environment variable in your deployment settings.

## License

MIT
