# UI Design System

## Component Library

- **Base**: shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Location**: `src/components/ui/`
- **Styling**: Tailwind CSS 4 with CSS variables

## Adding Components

```bash
# Add new shadcn component
pnpm dlx shadcn@latest add button
```

Components are copied to `src/components/ui/`, not installed as dependencies.

## Styling Conventions

### Tailwind Classes
- Use `cn()` utility for conditional classes
- Prefer Tailwind over custom CSS
- Use design tokens (CSS variables) for colors

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  'rounded-lg p-4',
  isActive && 'bg-primary text-primary-foreground'
)} />
```

### Color Tokens
Defined in `src/app/globals.css`:
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--muted`, `--muted-foreground`
- Dark mode variants auto-applied

## Component Organization

```
src/components/
├── ui/              # Base UI primitives (button, card, input)
├── layout/          # Header, footer, navigation
├── forms/           # Form components, validation
├── home/            # Homepage sections
├── products/        # Product-specific components
├── blog/            # Blog-specific components
└── shared/          # Cross-cutting components
```

## Responsive Design

- Mobile-first approach
- Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Use Tailwind responsive prefixes: `md:flex`, `lg:grid-cols-3`

## Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML elements
- Include ARIA labels where needed
- Color contrast ratio ≥ 4.5:1

## Icons

- Use Lucide React icons
- Import individually to optimize bundle size
```typescript
import { ChevronRight } from 'lucide-react';
```
