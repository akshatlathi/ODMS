# Zlice × Setu | Campus Services Survey Platform

A premium, high-converting survey application designed to gather insights on campus home and healthcare services. Built with a focus on world-class user experience, the platform features a "Typeform-style" progressive disclosure interface, advanced behavioral analytics, and blazing-fast performance.

## 🌟 Key Features

- **Progressive Disclosure UI**: One question per screen to eliminate cognitive load and dramatically increase completion rates.
- **High-Speed Auto-Advance**: Single-choice questions auto-advance instantly upon selection (no "Next" button required).
- **Behavioral Analytics Engine**: Silently tracks user focus, blur, time spent per question, and tab-switching to ensure data integrity and detect bot activity via honeypots.
- **Complex Branching Logic**: Dynamically skips irrelevant sections (e.g., skips Elderly Care questions if the user lives alone).
- **Mobile-First & Keyboard Native**: Massive touch targets for mobile users, and seamless `Enter` key navigation for desktop users.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Pure CSS Modules & `framer-motion` for fluid micro-interactions
- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Prisma
- **Deployment**: Optimized for Vercel

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure the Database**:
   - Create a free Neon PostgreSQL database.
   - Add your connection string to a `.env` file:
     ```env
     DATABASE_URL="postgresql://username:password@your-neon-host.aws.neon.tech/neondb?sslmode=require"
     ```
4. **Push the Schema**:
   ```bash
   npx prisma db push
   ```
5. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the survey.

## 📊 Analytics Structure

The application automatically logs deeply nested analytics payloads to the database alongside every response. This data includes:
- `userAgent`, `screenResolution`, `timeZone`
- `tabSwitchCount` (to detect if users leave the survey midway)
- `honeypotTriggered` (bot detection)
- `totalTimeSpent`
- Granular `timeSpentMs` and `interactionCount` for *every single question field*.

---
*Designed for the Campus OS Initiative.*
