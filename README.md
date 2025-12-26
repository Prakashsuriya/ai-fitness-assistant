# AI Fitness Coach App

A personalized fitness and nutrition planning application powered by AI that generates customized workout and meal plans based on user profiles and goals.

## Features

- **Personalized AI Plans**: Generates custom 7-day fitness and nutrition plans using Groq AI
- **Dynamic Meal Planning**: Daily varied meals with calories and macros
- **Exercise Library**: Detailed exercises with instructions and muscle groups
- **Real Images**: Fetches exercise and food images from Pexels API
- **User Profiles**: Custom plans based on age, goals, fitness level, dietary preferences
- **Interactive UI**: Navigate through daily plans with smooth animations
- **Dark Mode**: Full dark/light theme support
- **Responsive Design**: Works on all devices

## Voice Features

The application includes comprehensive voice functionality for accessibility and convenience:

- **Workout Plan Voice**: Click volume icons to hear exercise details, instructions, and workout tips
- **Nutrition Plan Voice**: Click volume icons to hear meal descriptions, nutritional information, and diet tips
- **Text-to-Speech**: Uses browser's built-in speech synthesis for natural voice reading
- **Color-Coded Buttons**: Blue buttons for exercises, green buttons for meals
- **Accessibility**: Proper aria-labels and keyboard navigation support

**Voice Content Examples:";**
- Adoption Exercise: '';Exercise Name . Instructions. Perform

## How It Works

1. **User Input**: Fill out profile form with personal details and fitness goals
2. **AI Generation**: Groq AI creates personalized 7-day workout and nutrition plans
3. **Image Enhancement**: Pexels API provides real images for exercises and meals
4. **Interactive Display**: Navigate through daily plans with detailed information

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

### Backend/APIs
- **Groq AI** - AI plan generation (llama-3.3-70b-versatile)
- **Pexels API** - Image search and retrieval
- **LocalStorage** - Client-side data persistence

### Development Tools
- **Create React App** - Project setup
- **Vite** - Build tool (if applicable)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-fitness-assistant

Install dependencies:
bash
npm install
Set up API keys:
Get Groq API key: https://groq.com/
Get Pexels API key: https://pexels.com/api/
Update keys in src/services/api.ts
Running the Application
Start the development server:

bash
npm start
Open http://localhost:3000 to view the application.

Build for Production
bash
npm run build
API Configuration
Update the following constants in src/services/api.ts:

typescript
const GROQ_API_KEY = 'your-groq-api-key';
const PEXELS_API_KEY = 'your-pexels-ap

Vercel Deployed Link

https://ai-fitness-assistant-ecru.vercel.app/
