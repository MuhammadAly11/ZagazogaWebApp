# Zagazoga Web App

A modern web application designed to create structured quiz questions and export them in a specific JSON format. This project was created with the assistance of AI (Claude) to demonstrate modern web development practices.

## 🎯 What It Does

Zagazoga helps you create quiz questions with a specific structure and exports them as JSON. Each question includes:
- Serial number (sn)
- Source/category
- Question text
- Correct answer
- Multiple choice options (a through g)

Example output format:
```json
[
    {
        "sn": "1",
        "source": "Science",
        "question": "What is the chemical symbol for water?",
        "answer": "a",
        "a": "H2O",
        "b": "CO2",
        "c": "O2",
        "d": "N2",
        "e": "H2SO4",
        "f": "NaCl",
        "g": ""
    }
]
```

## 🚀 Features

### Application Features
- User-friendly interface for inputting quiz questions
- Support for up to 7 multiple choice options (a-g)
- Automatic serial number generation
- JSON export functionality
- Source/category tagging for questions
- Dynamic question addition and removal

### Technical Features
- ⚡️ Lightning fast development with Vite
- 🎨 Modern UI with TailwindCSS
- 📦 Type-safe development with TypeScript
- 🔍 Code quality tools (ESLint)
- 🎯 React 18 with latest features
- 🖼 Lucide React icons integration

## 🛠 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/zagazoga-web-app.git
cd zagazoga-web-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 📁 Project Structure

```
zagazoga-web-app/
├── src/               # Source files
├── public/           # Static files
├── dist/             # Production build
├── index.html        # Entry HTML file
├── vite.config.ts    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies and scripts
```

## 🤖 AI Collaboration

This project was developed in collaboration with Claude, an AI assistant, showcasing the potential of human-AI pair programming in modern web development.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details. 