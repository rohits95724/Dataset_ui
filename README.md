# Next.js Basic Setup

A production-ready Next.js starter template with TypeScript, Tailwind CSS, shadcn/ui, and essential utilities pre-configured.

## 🚀 Features

- ⚡ **Next.js 16** - Latest version with App Router
- 🎨 **Tailwind CSS 4** - Modern styling with utility classes
- 🧩 **shadcn/ui** - Beautiful, accessible UI components
- 📝 **TypeScript** - Type-safe development
- 🔄 **React Query** - Powerful data fetching and caching
- 🎯 **Axios** - Configured HTTP client
- 🎭 **Custom Components** - Pre-built components for common use cases
- 📦 **Form Handling** - React Hook Form with Zod validation
- 🎨 **Custom Loaders** - Multiple loading spinner variants
- 🌐 **HTML Parser** - Safe HTML rendering component
- 📱 **Responsive Utilities** - Window dimension hooks and container components

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or higher
- **npm**, **yarn**, **pnpm**, or **bun** package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd next_basic_setup
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables** (if needed)
   ```bash
   cp .env.example .env.local
   ```
   Update the `.env.local` file with your configuration.

## 🚀 Getting Started

### Development Server

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Build for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
├── app/                        # Next.js App Router pages
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── custom/                # Custom reusable components
│   │   ├── custom-button/     # Custom button component
│   │   ├── htmlParser/        # Safe HTML rendering (SmartHtml)
│   │   └── loader/            # Loading spinners and page loaders
│   ├── screens/               # Page-specific components
│   ├── typography/            # Typography components
│   │   ├── container/         # Responsive section containers
│   │   └── fonts/             # Font components
│   └── ui/                    # shadcn/ui components
├── common/                     # Common providers and setup
│   └── Provider.tsx           # Global providers (React Query, etc.)
├── constant/                   # App constants
│   └── api.ts                 # API endpoints
├── context/                    # React contexts
│   └── modal-context.tsx      # Modal state management
├── hooks/                      # Custom React hooks
│   └── useWindowDimension.tsx # Window size hook
├── lib/                        # Utility libraries
│   └── utils.ts               # Utility functions (cn, etc.)
├── types/                      # TypeScript type definitions
│   └── axios-response.ts      # API response types
├── utils/                      # Utility functions
│   └── axios.ts               # Axios configuration
└── public/                     # Static assets
```

## 🧩 Available Components

### UI Components (shadcn/ui)
- `Button` - Customizable button component
- `Dialog` - Modal dialogs
- `Drawer` - Slide-out drawer (Vaul)
- `Sheet` - Side panel

### Custom Components

#### SmartHtml Parser
Safely render HTML with custom component mapping:
```tsx
import SmartHtml from '@/components/custom/htmlParser/SmartHtml';

<SmartHtml 
  html={htmlString}
  components={{ h1: CustomH1, p: CustomP }}
  classMap={{ h1: 'text-4xl font-bold' }}
/>
```

#### Loaders
- `Loader` - Customizable spinner
- `LoadingSpinner` - Pre-styled spinner
- `PageLoader` - Full-page loading overlay

#### Section Containers
Responsive containers with max-width constraints:
- `SectionContainerXSmall` - Extra small (max-w-xs)
- `SectionContainerSmall` - Small (max-w-sm)
- `SectionContainerMedium` - Medium (max-w-md)
- `SectionContainer` - Default (max-w-lg)
- `SectionContainerLarge` - Large (max-w-xl)

## 🔧 Adding More shadcn/ui Components

Install additional components as needed:

```bash
# Essential components
npx shadcn@latest add input label card form

# Navigation
npx shadcn@latest add dropdown-menu select tabs

# Feedback
npx shadcn@latest add toast alert

# Forms
npx shadcn@latest add checkbox radio-group switch textarea

# Display
npx shadcn@latest add table accordion avatar badge separator
```

## 🎯 Key Features Explained

### React Query Setup
Pre-configured in `common/Provider.tsx` for efficient data fetching and caching.

### Axios Configuration
Centralized HTTP client in `utils/axios.ts` with interceptors and error handling.

### Type-Safe Forms
React Hook Form + Zod for validation-ready forms.

### Custom Hooks
- `useWindowDimension` - Get current window dimensions

### Modal Context
Global modal state management for dialogs and sheets.

## 🎨 Styling

This project uses Tailwind CSS with custom utilities:
- `cn()` utility for conditional class merging (from `lib/utils.ts`)
- Tailwind Animate CSS for animations
- Custom color and spacing configurations

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)

## 🚀 Deployment

### Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

This app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Digital Ocean
- Railway
- Render

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
