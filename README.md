# 🏥 Samsung Health Dashboard

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

A high-fidelity, interactive health analytics dashboard that transforms exported Samsung Health data into beautiful, actionable insights. Built with a focus on modern aesthetics, glassmorphism design, and engaging animations.

<img width="1847" height="909" alt="image" src="https://github.com/user-attachments/assets/10e103e1-942e-47d1-ae5d-b023c21c1f1f" />


## ✨ Features

### 📊 Comprehensive Insights
- **Core Metrics**: Real-time overview of steps, calories, and distance.
- **Workout Analysis**: Deep dive into 50+ exercise types with historical trends.
- **Sleep Quality**: Analysis of sleep cycles, efficiency, and consistency archetypes.
- **Wellness Tracking**: Monitoring stress levels, resting heart rate, and HRV.

### 🧠 Advanced Analytics
- **Personal Records**: Automated tracking of your all-time bests.
- **Weekday Patterns**: Visualizing how your health habits change throughout the week.
- **Correlation Studies**: Discover how your sleep affects your activity (and vice versa).
- **Interactive Heatmaps**: Full-year GitHub-style activity heatmaps for steps and sleep.

### 🎭 2024 Wrapped Experience
- **12 Interactive Story Cards**: A Spotify Wrapped-style journey through your year.
- **Fitness Personality**: Analyzes your data to find your "Fitness Archetype" (e.g., Early Bird vs Night Owl).
- **Fun Comparisons**: Relatable metrics like "Marathons Walked" and "Pizzas Burned".

## 🛠 Tech Stack

- **Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)

## 📂 Project Structure

```text
├── src/
│   ├── utils/
│   │   └── healthParser.ts   # Core parsing logic & statistical algorithms
│   ├── App.tsx               # Main dashboard UI & view management
│   ├── App.css               # Global layout & custom animations
│   ├── index.css             # Tailwind directives & theme tokens
│   └── main.tsx              # Application entry point
├── public/                   # Static assets
└── package.json              # Project dependencies & scripts
```

## 🚀 Getting Started

### 1. Export Your Data
1. Open the **Samsung Health** app on your phone.
2. Go to **Settings** > **Download Personal Data**.
3. Select the data you want and tap **Download**.
4. Once ready, move the resulting `.zip` file to your computer.

### 2. Run Locally
```bash
# Clone the repository
git clone https://github.com/your-username/health-dashboard.git

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Upload & Explore
Once the app is running, simply drag and drop your Samsung Health `.zip` export into the upload area. All calculations are performed entirely in your browser—your health data never leaves your device.

## 🚀 Deployment

The project is pre-configured for **GitHub Pages**. To deploy:

1. Ensure your project is pushed to a GitHub repository.
2. Run the deployment script:
   ```bash
   npm run deploy
   ```
3. In your GitHub repository settings, under **Pages**, ensure the **Source** is set to "Deploy from a branch" and select `gh-pages` as the branch.

## 🔒 Privacy

This application is built with privacy in mind. **No data is uploaded to any server.** All parsing and processing happen locally in your browser leveraging the `JSZip` and custom TypeScript parsing engines.

---
Built with ❤️ for health enthusiasts.
