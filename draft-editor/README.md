# Draft Editor

> [!NOTE] 
> Part of the [vibes](https://github.com/vibes) playground.
>
> *"Vibes" are quick experiments, mostly built by AI with prompt guidance. Expect rough edges – it's not production-ready, likely buggy, and definitely not example code, but it works..somehow. Think of it as a snapshot from my AI coding playground.*

## The Idea
What if... i can make a simple editor with code-mirror for my writing needs


## The Result
A simple text editor with Codemirror, that let's you edit scenes, chapters, reorder and compile them to a complete document. It also has a fullscreen distraction free view.

## AI Tools
- ![bolt.new](https://img.shields.io/badge/bolt.new-80%25-blue?style=social)
- ![Cursor](https://img.shields.io/badge/Cursor-15%25-blue?style=social)

## Live Demo
TBD 

![image](https://github.com/user-attachments/assets/589796e3-aca8-4257-9ca1-8a3101e429df)

![image](https://github.com/user-attachments/assets/ef0ae482-ea7a-4d73-b9ea-26fb30d18a50)

![image](https://github.com/user-attachments/assets/74b22dbf-7452-43c6-81a0-e311dc04df2a)


## Tools Used
- Tailwind CSS
- Supabase (login and story)
- Vite
- React

## Technologies
- **Languages:** TypeScript, JavaScript
- **Frameworks:** React
- **Libraries:** Zustand, CodeMirror, Lucide-React
- **Hosting:** Vite
- **Database / APIs:** Supabase

## How to Build and Run
### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- A Supabase account

### Environment Configuration
Ensure you have a `.env` file in the root of your project with the following content:
```env
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_URL=your-supabase-url
```

### Install Steps
```bash
# Clone the repository
git clone https://github.com/zoctarine/vibes.git

# Navigate to the project directory
cd draft-editor

# Install dependencies
npm install
```

### Launch in Development Mode
```bash
# Start the development server
npm run dev
```

## How to Use
### Features
- **Tree View:** Organize your chapters and scenes with drag-and-drop simplicity.
- **Editor:** Write and edit content with markdown support.
- **Status Bar:** Keep track of word count, character count, and estimated reading time.
- **Project Management:** Create, update, and delete projects effortlessly.

### Example Interaction
1. Open the app and select a project.
2. Use the Tree View to navigate or create new chapters/scenes.
3. Write your content in the Editor and watch stats update in real-time.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Creator
GitHub Username: vibes-draft-editor
