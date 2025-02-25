# Zagazoga Quiz Creator App

## Overview
Web app for creating and exporting structured quizzes in JSON format with two distinct modes.

## Features
- **Two Quiz Modes**
  - **Lesson Mode:** Structured format (module/subject/lesson)
  - **Custom Mode:** Flexible format (title, optional module/tags)

- **Questions**
  - Multiple-choice with standard 4 options (a-d)
  - Ability to add more options as needed
  - Required: source, question text, 2+ options, correct answer
  - Real-time validation
  - Support for adding, removing, and reordering questions
  - Automatic question numbering

- **UI/UX**
  - Fully responsive design for both desktop and mobile
  - Optimized for mouse/keyboard and touch interfaces
  - Desktop layout with efficient workflows
  - Mobile layout with thumb-friendly controls
  - Dark/light mode
  - Clear validation indicators
  - Easy navigation between quiz info and questions
  - Question completion status indicators

- **Export**
  - JSON format (compatible with Quizst for Typst documents)
  - Automatic filename generation based on quiz content
  - Clean output with only filled options included

## User Workflow
1. Select quiz mode (Lesson or Custom)
2. Enter quiz metadata (module/subject/lesson or title/tags)
3. Add and edit questions with multiple-choice options
4. Set correct answers and validate questions
5. Review quiz summary showing completion status
6. Export finalized quiz as JSON

## Data Persistence
- Browser storage for auto-saving drafts
- Prevention of accidental data loss
- No account or server-side storage required

## JSON Output Examples

### Lesson Mode
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
