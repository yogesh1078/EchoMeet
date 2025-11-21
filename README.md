#  Echomeet

A next-generation video conferencing platform with AI-powered features, real-time collaboration, and seamless meeting experiences. Built with modern web technologies for scalability and performance.

##  Features

-  **Real-time Video Conferencing** - HD video calls with WebRTC technology powered by Stream.io
-  **AI-Powered Meetings** - OpenAI Realtime API integration for intelligent meeting assistance
-  **Secure Authentication** - Multi-provider authentication with Better Auth
-  **Real-time Chat** - In-meeting messaging and collaboration
-  **Meeting Analytics** - Track meeting history, duration, and participation
-  **Dark/Light Mode** - Customizable themes for better user experience
-  **Responsive Design** - Works seamlessly across desktop, tablet, and mobile
-  **Private Rooms** - Secure meeting rooms with access controls
-  **Avatar System** - Dynamic avatar generation with Dicebear
-  **Modern UI/UX** - Sleek interface with Radix UI components

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.3.4 with App Router
- **React:** 19.0.0 with Server & Client Components
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4 with PostCSS
- **UI Components:** Radix UI (Accordion, Dialog, Dropdown, Avatar, etc.)
- **Icons:** Lucide React + React Icons
- **Theme:** next-themes for dark/light mode
- **Forms:** React Hook Form with Zod validation
- **State Management:** TanStack Query (React Query) v5
- **Animations:** Embla Carousel, Vaul drawer, tw-animate-css

### Backend
- **API Layer:** tRPC v11 for type-safe APIs
- **Authentication:** Better Auth v1.2.12
- **Database:** PostgreSQL with Neon Serverless
- **ORM:** Drizzle ORM with Drizzle Kit
- **Video SDK:** Stream.io Video React SDK & Node SDK
- **AI Integration:** OpenAI Realtime API via Stream.io

### Development Tools
- **Linting:** ESLint 9 with Next.js config
- **Package Manager:** npm
- **Environment:** dotenv for configuration
- **Webhooks:** ngrok for local webhook testing
- **Type Safety:** End-to-end type safety with TypeScript + tRPC

##  Architecture & Concepts

### 1. **App Router Architecture**
- Route Groups: `(auth)`, `(dashboard)` for organized routing
- Server Components for better performance
- Client Components for interactivity
- API routes for backend logic

### 2. **Database Design**
- Drizzle ORM for type-safe database queries
- PostgreSQL schema with migrations
- Neon serverless for scalable database hosting

### 3. **Video Streaming**
- Stream.io SDK for WebRTC connections
- Real-time audio/video streams
- Call state management
- Participant controls and permissions

### 4. **Authentication Flow**
- Better Auth for secure user management
- Session handling
- Protected routes and API endpoints

### 5. **Type Safety**
- tRPC for end-to-end type safety
- Shared types between client and server
- Zod schemas for runtime validation

### 6. **UI Component System**
- Headless UI with Radix primitives
- Custom component library with shadcn/ui
- Responsive design patterns
- Accessible components (ARIA compliant)

### 7. **Real-time Features**
- WebSocket connections for live updates
- Optimistic UI updates with React Query
- Real-time video/audio streaming
- Live participant tracking

## Getting Started

### Prerequisites

- **Node.js** 20+ 
- **PostgreSQL** database (Neon recommended)
- **Stream.io** account and API keys
- **OpenAI API** key (for AI features)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yogesh1078/meet-ai.git
cd meet-ai
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=your_neon_postgresql_url

# Stream.io
NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Better Auth
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Initialize the database:**
```bash
npm run db:push
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

##  Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build production-ready application |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |
| `npm run db:push` | Push database schema changes |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run dev:webhook` | Start ngrok tunnel for webhook testing |

##  Project Structure

```
echomeet/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── call/              # Video call interface
│   │   ├── api/               # API routes & webhooks
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable UI components
│   ├── db/                    # Database schema & config
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   ├── modules/               # Feature modules
│   ├── trpc/                  # tRPC router & procedures
│   └── constants.ts           # App constants
├── public/                    # Static assets
├── drizzle.config.ts         # Drizzle ORM configuration
├── components.json           # shadcn/ui configuration
├── next.config.ts            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── package.json              # Dependencies & scripts
```

##  Key Dependencies

### Core
- `next@15.3.4` - React framework with App Router
- `react@19.0.0` - UI library
- `typescript@5` - Type safety

### Video & Real-time
- `@stream-io/video-react-sdk` - Video conferencing
- `@stream-io/node-sdk` - Backend video operations
- `@stream-io/openai-realtime-api` - AI integration

### Database & API
- `drizzle-orm` - Type-safe ORM
- `@neondatabase/serverless` - Serverless PostgreSQL
- `@trpc/server` & `@trpc/client` - Type-safe API
- `better-auth` - Authentication

### UI & Styling
- `@radix-ui/*` - Headless UI primitives
- `tailwind-merge` & `class-variance-authority` - Dynamic styling
- `lucide-react` - Icon library
- `next-themes` - Theme management

### Forms & Validation
- `react-hook-form` - Form handling
- `zod` - Schema validation
- `@hookform/resolvers` - Form validation integration

##  Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



##  Author

**Yogesh** - [@yogesh1078](https://github.com/yogesh1078)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [Stream.io](https://getstream.io/) - Video SDK
- [Vercel](https://vercel.com/) - Deployment Platform
- [Radix UI](https://www.radix-ui.com/) - UI Components
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

Built with ❤️ using Next.js 15 and modern web technologies
