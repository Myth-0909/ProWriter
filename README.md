# ProWriter

A full-stack cross-platform writing application — your intelligent document workspace with rich text editing, category management, and cloud sync.

## What ProWriter Can Do

### Document Management
- **Create & Edit** — Rich text editor powered by Tiptap with full formatting support
- **7 Writing Categories** — Sci-Fi Novel, Fantasy, Design, Journal, Planning, Research, General
- **Favorites** — Star important documents for quick access
- **Trash & Recovery** — Soft-delete with 30-day trash retention and restore

### Rich Text Editor
- **Text Formatting** — Bold, Italic, Underline, Strikethrough, Highlight
- **Headings** — H1, H2, H3
- **Code** — Inline code and code blocks with syntax highlighting
- **Text Color** — 8 preset colors with clear option
- **Alignment** — Left, Center, Right
- **Lists** — Bullet and ordered lists
- **Blockquote** & **Horizontal Rule**
- **Font Size** — 5 size options (12px - 30px)
- **Line Height** — 4 spacing options (1.5 - 2.5)
- **Undo / Redo** — Full edit history
- **Auto-save** — Changes saved automatically after 1.5s debounce
- **Word & Character Count** — Real-time statistics

### User System
- **Registration & Login** — JWT-based authentication
- **Password Reset** — Email-based verification code flow
- **Profile Management** — Edit name, upload avatar
- **Avatar Upload** — Click-to-upload with camera icon

### Internationalization (i18n)
- **Chinese / English** — Full UI language switching
- All system text, labels, toasts, and placeholders are localized

### Interface
- **Dark / Light Theme** — System-aware with manual toggle
- **Collapsible Sidebar** — Maximize writing space when needed
- **Responsive Layout** — Optimized for desktop writing experience

### Data & Export
- **MySQL Persistence** — All documents stored in MySQL database
- **RESTful API** — Full backend with Express + Prisma
- **Weekly Writing Stats** — ECharts-powered activity bar chart
- **Export to HTML** — Download document as standalone HTML file

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4 |
| Rich Text | Tiptap (ProseMirror) |
| Charts | ECharts |
| UI Components | Radix UI, Lucide Icons |
| Desktop Shell | Tauri v2 (Rust) |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | MySQL |
| Auth | JWT + bcryptjs |

## Project Structure

```
cc_figma/
├── document/                  # Frontend (React + Tauri)
│   ├── src/
│   │   ├── pages/             # 7 page components
│   │   ├── components/        # 15+ shared components
│   │   ├── api.ts             # API client
│   │   ├── auth.tsx           # Auth context provider
│   │   ├── store.tsx          # Document state management
│   │   └── types.ts           # TypeScript type definitions
│   └── src-tauri/             # Tauri Rust backend
├── server/                    # Backend (Express + Prisma)
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   └── src/
│       ├── routes/            # API routes (auth, documents, users, stats)
│       └── middleware/        # JWT authentication middleware
└── start.sh                   # One-click start script
```

## Quick Start

### Prerequisites
- Node.js >= 18
- pnpm
- MySQL 8+ running on localhost:3306

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/jialongli/prowriter.git
cd cc_figma

# 2. Configure MySQL
# Create a MySQL user or use root, then update server/.env:
# DATABASE_URL="mysql://root:yourpassword@127.0.0.1:3306/prowriter"

# 3. Install dependencies
cd server && npm install && npx prisma db push && cd ..
cd document && pnpm install && cd ..

# 4. Start both frontend and backend
./start.sh
```

### Access
- **Frontend**: http://localhost:1420
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with code |
| GET | `/api/users/me` | Get current user profile |
| PUT | `/api/users/me` | Update profile |
| POST | `/api/users/avatar` | Upload avatar (base64) |
| GET | `/api/documents` | List user's documents |
| POST | `/api/documents` | Create document |
| GET | `/api/documents/:id` | Get document |
| PUT | `/api/documents/:id` | Update document |
| DELETE | `/api/documents/:id` | Permanently delete |
| PATCH | `/api/documents/:id/favorite` | Toggle favorite |
| PATCH | `/api/documents/:id/trash` | Move to trash |
| PATCH | `/api/documents/:id/restore` | Restore from trash |
| GET | `/api/stats/weekly` | Weekly writing statistics |

## License

MIT
