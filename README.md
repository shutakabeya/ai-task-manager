# AI Task Manager

AI-powered task management application built with Next.js, TypeScript, and TailwindCSS.

## Features

- 📝 **List View**: Expandable task list with progress tracking
- 📅 **Calendar View**: Weekly calendar with task scheduling
- 🎨 **Modern UI**: Clean and responsive design with custom color palette
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🔄 **View Toggle**: Easy switching between list and calendar views
- ➕ **Task Creation**: Modal for adding new tasks with natural language input
- 🤖 **AI Integration**: Natural language to task decomposition using GPT-4o
- ✏️ **Editable Subtasks**: AI-generated subtasks can be edited, added, or deleted
- 🔔 **Reminder System**: Automatic notifications 10 minutes before scheduled tasks
- 💾 **Data Persistence**: Automatic localStorage saving and loading
- 📤 **Export/Import**: JSON file export and import functionality

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Font**: Inter (Google Fonts)
- **State Management**: Zustand
- **Notifications**: React-Toastify
- **Date Picker**: React-DatePicker
- **AI Integration**: OpenAI GPT-4o

## Color Palette

- **Background**: #F9FAFB (Light gray)
- **Primary**: #4F46E5 (Indigo)
- **Secondary**: #A5B4FC (Light indigo)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Orange)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API Key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-task-manager
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env.local` file in the root directory
   - Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── gpt-tasks/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AppLayout.tsx
│   ├── TaskListView.tsx
│   ├── CalendarView.tsx
│   └── AddTaskModal.tsx
└── types/
    ├── task.ts
    └── exampleTaskData.ts
```

## Data Structure

### Task Type
```typescript
type Task = {
  id: string;
  title: string;
  category: string;
  subtasks: SubTask[];
};
```

### SubTask Type
```typescript
type SubTask = {
  id: string;
  title: string;
  datetime?: string;        // ISO format
  estimatedTime?: string;   // e.g. "1.5h"
  completed: boolean;
};
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Future Enhancements

- [x] AI integration for natural language task parsing
- [ ] Data persistence (database integration)
- [ ] User authentication
- [ ] Task sharing and collaboration
- [ ] Advanced filtering and search
- [ ] Export/import functionality
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 