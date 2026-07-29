# pwd-volunteer-network

[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/framework-Next.js-black?logo=next.js&style=flat-square)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/ui-TailwindCSS-38bdf8?logo=tailwindcss&style=flat-square)](https://tailwindcss.com/)
[![Live Demo](https://img.shields.io/badge/demo-available-brightgreen?style=flat-square)](https://assistly-pwd-volunteer-network.vercel.app)

## Overview

**pwd-volunteer-network** is an accessible, role-based volunteer management platform designed for Persons With Disabilities (PWD), students, and volunteers. It provides dedicated dashboards for admins, students, and volunteers, enabling seamless authentication, real-time chat, and profile management. The project leverages a modern React/Next.js stack with accessibility-focused UI components and theming.

## Tech Stack

- **Languages:** TypeScript, JavaScript, CSS
- **Frameworks:** [Next.js](https://nextjs.org/)
- **UI:** [TailwindCSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/)
- **State & Context:** React Context API
- **Analytics:** Vercel Analytics
- **Other Libraries:** Leaflet (map integration), Shadcn UI

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) (for dependency management)
- Git (for cloning the repository)

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/dipsnc/pwd-volunteer-network.git
cd pwd-volunteer-network
npm install
# or
yarn install
```

## Usage

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Other common commands:

- **Build for production:**
  ```bash
  npm run build
  # or
  yarn build
  ```
- **Start production server:**
  ```bash
  npm start
  # or
  yarn start
  ```
- **Lint the codebase:**
  ```bash
  npm run lint
  # or
  yarn lint
  ```

Access the app at [http://localhost:3000](http://localhost:3000) (or as indicated in your terminal).

**Role-based access:**
- Admin: `/admin/login`
- Student: `/auth/student`
- Volunteer: `/auth/volunteer`
- Explore dashboards and features as per your user role.

## Project Structure

```
pwd-volunteer-network/
├── app/
│   ├── admin/                # Admin login flow
│   ├── auth/                 # Authentication (student, volunteer, welcome)
│   ├── dashboard/            # Dashboards by role and chat interface
│   ├── dev/                  # Development/testing pages
│   ├── profile/              # User profiles (dynamic by ID)
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # App-wide layout
│   └── page.tsx              # Main entry point
├── components/
│   ├── accessibility-provider.tsx
│   ├── accessibility-widget.tsx
│   ├── admin/                # Admin-specific components
│   ├── auth-provider.tsx
│   ├── chat/                 # Chat UI components
│   ├── dashboard-sidebar.tsx
│   ├── footer.tsx
│   ├── navbar.tsx
│   ├── ui/                   # Reusable UI primitives (accordion, alert, button, etc.)
│   └── ...                   # Other shared components
├── components.json
├── .gitignore
├── README.md
```

## API Endpoints

| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | `/admin/login`        | Admin login page                   |
| GET    | `/auth/student`       | Student authentication             |
| GET    | `/auth/volunteer`     | Volunteer authentication           |
| GET    | `/auth/welcome`       | Welcome page for authentication    |
| GET    | `/dashboard/admin`    | Admin dashboard                    |
| GET    | `/dashboard/chat`     | Real-time chat interface           |
| GET    | `/dashboard/student`  | Student dashboard                  |
| GET    | `/dashboard/volunteer`| Volunteer dashboard                |
| GET    | `/profile/[id]`       | User profile (by dynamic ID)       |

## Contributing

Contributions are welcome! Please follow the typical GitHub workflow:

1. **Fork** the repository
2. **Create** a new branch (`git checkout -b feature/your-feature`)
3. **Commit** your changes (`git commit -am 'Add new feature'`)
4. **Push** to your branch (`git push origin feature/your-feature`)
5. **Open a Pull Request** describing your changes

## License

**No license specified.**  
If you intend to use or contribute to this project, please contact the repository owner regarding licensing.

---
[![README powered by ReadmeAI](https://img.shields.io/badge/README-powered%20by%20ReadmeAI-4c9be8?style=flat-square&logo=markdown)](https://www.readmeai.in)
