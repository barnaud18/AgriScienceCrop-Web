# AgriScienceCrop Web Frontend

Frontend for AgriScienceCrop application - Intelligent Crop Management Platform for Brazilian agriculture.

## Frontend Architecture

The client application is built with React 18 using TypeScript and modern hooks-based functional components. The UI leverages Tailwind CSS for styling with a comprehensive component library based on Radix UI primitives, providing accessibility and consistency. The application uses Wouter for client-side routing and TanStack Query for server state management and caching.

**Key architectural decisions:**
- **React with TypeScript**: Chosen for type safety and modern development experience
- **Radix UI + Tailwind**: Provides accessible, customizable components with utility-first styling
- **TanStack Query**: Handles server state, caching, and background refetching automatically
- **Mobile-first responsive design**: Ensures functionality across all device sizes

The frontend implements four main pages: Dashboard (crop selection and overview), Recommendations (CRUD operations on agricultural advice), Calculator (IBGE productivity calculations), and Professional (premium geospatial features).

## 🚀 Technologies

- **React 18** + **TypeScript**
- **Vite** for build and development
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **TanStack Query** for state management
- **Wouter** for routing
- **Framer Motion** for animations
- **Recharts** for charts and graphs

## Prerequisites

- Node.js 18+
- npm or yarn

## 🛠️ Installation and Execution

### 1. Install Dependencies

```bash
npm install
```

### 2. Run in Development

```bash
# Development mode with hot reload
npm run dev

# Application will be available at http://localhost:3001
```

### 3. Build for Production

```bash
# Optimized build
npm run build

# Preview build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable components
│   ├── ui/             # Base components (Radix UI)
│   ├── crop-selection.tsx
│   ├── header.tsx
│   ├── productivity-calculator.tsx
│   └── ...
├── pages/              # Application pages
│   ├── dashboard.tsx
│   ├── login.tsx
│   ├── calculator.tsx
│   └── ...
├── hooks/              # Custom hooks
│   ├── use-auth.tsx
│   ├── use-mobile.tsx
│   └── ...
├── services/           # Services and APIs
│   └── ibge-api.ts
├── lib/                # Utilities
│   ├── auth-utils.ts
│   ├── queryClient.ts
│   └── utils.ts
└── main.tsx           # Entry point
```

## 🎨 Main Components

### UI Components (Radix UI)
- **Accordion** - Expandable accordions
- **Alert** - Alerts and notifications
- **Button** - Buttons with variants
- **Card** - Content cards
- **Dialog** - Modals and dialogs
- **Form** - Forms with validation
- **Input** - Input fields
- **Select** - Dropdown selectors
- **Table** - Data tables
- **Toast** - Toast notifications

### Feature Components
- **CropSelection** - Crop selection
- **ProductivityCalculator** - Productivity calculator
- **RecommendationsSidebar** - Recommendations sidebar
- **ProfessionalSection** - Section for agronomists

## 📱 Available Pages

- **Home** (`/`) - Home page
- **Login** (`/login`) - Authentication
- **Dashboard** (`/dashboard`) - Main dashboard
- **Calculator** (`/calculator`) - Productivity calculator
- **Monitoring** (`/monitoring`) - Field monitoring
- **Recommendations** (`/recommendations`) - Recommendations
- **Professional** (`/professional`) - Professional area

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### Development Proxy

Vite is configured to proxy requests:
- `/api/*` → Backend API (port 3000)
- `/ws` → WebSocket (port 3000)

## Key Features

### ✅ Implemented Features
- **Authentication System**: JWT-based user authentication with role management
- **Dashboard**: Crop selection and overview with real-time statistics
- **Productivity Calculator**: IBGE data integration for accurate calculations
- **Crop & Protocol Selection**: Comprehensive database of Brazilian crops
- **Recommendations Engine**: Personalized agricultural advice system
- **Field Monitoring**: Real-time field data and sensor integration
- **Responsive Interface**: Mobile-first design for all devices
- **Theme System**: Dark/light mode support

### 🔄 Premium Features (Agronomist Users)
- **Geospatial Analysis**: Advanced mapping and field analysis
- **Real-time Alerts**: IoT sensor integration and monitoring
- **Advanced Reports**: Detailed analytics and insights
- **Professional Tools**: Specialized agronomic features

### User Types and Access Levels
- **Farmers**: Basic features with crop recommendations and productivity calculations
- **Agronomists**: Premium features including geospatial analysis and advanced monitoring

## 🎨 Design System

### Colors
- **Primary**: Agricultural green
- **Secondary**: Technological blue
- **Accent**: Highlight orange
- **Neutral**: Gray scale

### Typography
- **Font**: Inter (system)
- **Sizes**: xs, sm, base, lg, xl, 2xl, 3xl
- **Weights**: 400, 500, 600, 700

### Components
- Design system based on Radix UI
- Consistent variants
- Hover, focus, disabled states
- Smooth animations with Framer Motion

## External Dependencies

### Key Libraries
- **Frontend**: React, TypeScript, Tailwind CSS, Radix UI, TanStack Query, Wouter
- **Build Tools**: Vite, PostCSS, ESBuild for production builds
- **UI Components**: Radix UI primitives with custom styling
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for data visualization

### Development Tools
- **TypeScript**: Full type safety across the application
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing and optimization
- **Vite**: Fast development server and build tooling

## 📦 Available Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # TypeScript type checking
npm run lint         # ESLint code analysis
```

## 🚀 Deployment

### Static Build
```bash
npm run build
# Files will be in ./dist
```

### Deploy with Vercel/Netlify
```bash
# Configure build command: npm run build
# Configure output directory: dist
```

## Backend Integration

The frontend communicates with the backend through:

- **REST API**: Endpoints under `/api/*` for data operations
- **WebSocket**: Real-time connection at `/ws` for live updates
- **TanStack Query**: Server state management, caching, and background refetching
- **HTTP Client**: Axios for API requests with automatic error handling

### API Communication
- **Authentication**: JWT token management with automatic refresh
- **Data Fetching**: Optimized queries with caching and background updates
- **Real-time Updates**: WebSocket integration for monitoring and alerts
- **Error Handling**: Comprehensive error states and user feedback

## 📱 Responsiveness

- **Mobile First** - Mobile optimized design
- **Breakpoints**:
  - `sm`: 640px
  - `md`: 768px
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px

## 🔍 Performance

- **Automatic Code Splitting**
- **Tree Shaking** for optimized bundle
- **Lazy Loading** of components
- **Image Optimization** with Vite
- **Bundle Analysis** available

## 🤝 Contributing

1. Fork the project
2. Create a branch for your feature
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Modern Web Development

The application follows modern web development practices for maintainability and scalability.

### Development Features
- **Type Safety**: Full TypeScript integration across the application
- **Component Architecture**: Modular, reusable components with clear separation of concerns
- **Performance Optimization**: Code splitting, lazy loading, and bundle optimization
- **Accessibility**: WCAG compliant components with keyboard navigation support
- **Responsive Design**: Mobile-first approach with fluid layouts

### Production Ready
- **Build Optimization**: Vite-powered builds with tree shaking and minification
- **Static Deployment**: Ready for CDN deployment (Vercel, Netlify, etc.)
- **Environment Configuration**: Flexible configuration for different environments
- **Error Handling**: Comprehensive error boundaries and user feedback
- **SEO Optimized**: Meta tags and semantic HTML structure

## 📄 License

MIT License - see LICENSE file for details.
