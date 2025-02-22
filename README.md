# Quiz Creator

A modern web application for creating and managing quiz questions with support for two distinct modes:

## Features

- Two Quiz Creation Modes:
  - **Lesson Mode**: Structured format for educational content with module, subject, and lesson organization
  - **Custom Mode**: Flexible format with optional categorization, perfect for standalone quizzes
- Multiple Choice Questions (up to 7 options)
- Real-time validation
- JSON export
- Modern, responsive UI

## Quiz Modes

### Lesson Mode
Designed for educational content with structured organization:
- Required fields: module, subject, and lesson
- Perfect for curriculum-based quizzes
- Helps maintain consistent organization across educational content

Example output:
```json
{
  "type": "lesson",
  "module": "Mathematics",
  "subject": "Algebra",
  "lesson": "Quadratic Equations",
  "questions": [
    {
      "sn": "1",
      "source": "Chapter 3",
      "question": "What is the standard form of a quadratic equation?",
      "answer": "a",
      "a": "ax² + bx + c = 0",
      "b": "ax + b = 0",
      "c": "ax³ + bx² + cx + d = 0",
      "d": "ax + by = c"
    }
  ]
}
```

### Custom Mode
Flexible format for standalone quizzes:
- Only requires a title
- Optional module and tags for categorization
- Perfect for one-off quizzes or custom collections

Example output:
```json
{
  "type": "custom",
  "title": "Programming Basics",
  "module": "Computer Science",
  "tags": ["programming", "beginners", "fundamentals"],
  "questions": [
    {
      "sn": "1",
      "source": "Introduction to Programming",
      "question": "What is a variable?",
      "answer": "b",
      "a": "A fixed value that never changes",
      "b": "A container for storing data",
      "c": "A type of function",
      "d": "A programming language"
    }
  ]
}
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Choose your preferred mode (Lesson or Custom)
2. Fill in the required metadata
3. Add questions with multiple choice options
4. Export to JSON when complete

## Development

Built with:
- React
- TypeScript
- Tailwind CSS
- Vite

## License

MIT 