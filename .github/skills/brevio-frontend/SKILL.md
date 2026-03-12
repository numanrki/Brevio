---
name: brevio-frontend
description: "Build Brevio frontend pages and components. USE WHEN: creating React/TypeScript pages, Inertia components, dashboard UI, admin panel UI, or styling with Tailwind dark theme. Covers layout patterns, url() helper, Inertia forms, and design system."
---

# Brevio Frontend Development

## When to Use
- Creating new Inertia/React pages
- Building reusable components
- Working with the dark theme design system
- Handling Inertia form submissions

## Design System

### Theme
- **Base background**: `bg-gray-950`
- **Card background**: `bg-gray-900`
- **Borders**: `border-gray-800`
- **Text primary**: `text-white`
- **Text secondary**: `text-gray-400`
- **Text muted**: `text-gray-500`
- **Primary accent**: `violet-500` / `violet-400`
- **Gradient**: `from-violet-600 to-fuchsia-600`
- **Success**: `emerald-400/500`
- **Warning**: `amber-400/500`
- **Danger**: `red-400/500`

### Rounded Corners
- Cards: `rounded-xl` or `rounded-2xl`
- Buttons: `rounded-xl`
- Inputs: `rounded-xl`
- Badges: `rounded-full`

### Status Badges
```tsx
// Active
<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ACTIVE</span>
// Archived
<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400 border border-gray-700">ARCHIVED</span>
// Expired
<span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">EXPIRED</span>
```

## Page Structure

### Standard Page Template
```tsx
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { url } from '@/utils';

export default function Index({ items }: Props) {
    return (
        <DashboardLayout header="Page Title">
            <Head title="Page Title" />
            {/* Page content */}
        </DashboardLayout>
    );
}
```

### Layout Selection
- User dashboard pages → `DashboardLayout`
- Admin panel pages → `AdminLayout`
- Public pages → No layout wrapper (full custom)

## Critical Rules

### Always Use url() Helper
```tsx
import { url } from '@/utils';

// Links
<Link href={url('/dashboard/links')}>

// Navigation
router.get(url('/dashboard/links'), params);

// Redirects
router.delete(url(`/dashboard/links/${id}`));
```

**Exception**: In `Links/Show.tsx`, use `urlHelper` alias:
```tsx
import { url as urlHelper } from '@/utils';
```

### JSON Fields in Forms
Always `JSON.stringify()` array/object fields before sending:
```tsx
const form = useForm({
    name: '',
    data: '',
    style: '',
});

const submit = () => {
    form.transform((data) => ({
        ...data,
        data: JSON.stringify(data.data),
        style: JSON.stringify(data.style),
    }));
    form.post(url('/dashboard/resource'));
};
```

### Inertia Form Pattern
```tsx
import { useForm } from '@inertiajs/react';

const { data, setData, post, processing, errors } = useForm({
    field: '',
});

const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(url('/dashboard/resource'));
};
```

## File Locations
- Pages: `resources/js/Pages/Dashboard/<Feature>/` or `resources/js/Pages/Admin/<Feature>/`
- Components: `resources/js/Components/`
- Layouts: `resources/js/Layouts/`
- Types: `resources/js/types/`
- Utils: `resources/js/utils.ts`
