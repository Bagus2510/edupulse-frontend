# 🎨 EduPulse Frontend

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)

**Next.js 16 frontend untuk platform analitik pendidikan — dashboard embed, RBAC, AI chat**

[Pages](#-pages) • [Setup](#-installation--setup) • [Components](#-components) • [Design Tokens](#-design-tokens)

</div>

---

## 📖 About The Project

Frontend Next.js 16 dengan App Router yang menyediakan UI untuk seluruh fitur EduPulse — pipeline builder, dataset browser, BI dashboard tersemat, AI chat, dan admin panel dengan RBAC.

### 🎯 Key Features

- 📊 **Dashboard Embed** — Superset dashboard tersemat langsung di halaman
- ⚙️ **Pipeline Builder** — Visual step editor untuk membuat ETL pipeline
- 📈 **Dataset Browser** — Jelajahi dataset dengan quality checks
- 🤖 **AI Chat** — Natural language query dengan evidence panel
- 🔐 **RBAC** — Viewer, Editor, Admin roles
- 🎨 **Design System** — Konsisten dengan design tokens

---

## 💡 Pages

| Route | Description | RBAC |
|-------|-------------|------|
| `/home` | Beranda dengan overview | Viewer+ |
| `/dashboard` | BI dashboard Superset tersemat | Viewer+ |
| `/pipeline` | List semua pipeline | Editor+ |
| `/pipeline/builder` | Buat/edit pipeline | Editor+ |
| `/pipeline/{id}` | Detail pipeline + run history | Editor+ |
| `/datasets` | Jelajahi dataset + quality | Editor+ |
| `/domains` | Kelola domain | Admin |
| `/ai-analytics` | AI chat dengan data | Viewer+ |
| `/lineage` | Data lineage visualization | Editor+ |
| `/golden-path` | Golden path analytics | Admin |
| `/admin/users` | Kelola users | Admin |
| `/docs` | Dokumentasi | Admin |
| `/settings` | Pengaturan sistem | Admin |

---

## 🛠️ Technologies Used

- **Next.js 16** — React framework (App Router)
- **React 19** — UI library
- **Tailwind CSS 4** — Utility-first CSS
- **shadcn/ui** — UI components
- **Motion** — Animation library
- **ECharts** — Chart library
- **Superset Embedded SDK** — Dashboard embedding
- **sonner** — Toast notifications

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/Bagus2510/edupulse.git
cd edupulse/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment** (optional)
```bash
# Create .env.local
NEXT_PUBLIC_SUPERSET_URL=http://localhost:8088
NEXT_PUBLIC_AIRFLOW_URL=http://localhost:8080
```

4. **Run dev server**
```bash
npm run dev
```

Buka **http://localhost:3000**

---

## 🗂️ Project Structure

```
frontend/
│
├── src/
│   ├── app/
│   │   ├── (main)/                  # Authenticated layout group
│   │   │   ├── home/                # Beranda
│   │   │   ├── dashboard/           # BI dashboard Superset
│   │   │   ├── pipeline/            # Pipeline list
│   │   │   │   ├── [id]/            # Pipeline detail + run history
│   │   │   │   └── builder/         # Buat/edit pipeline
│   │   │   ├── datasets/            # Dataset browser + quality
│   │   │   ├── domains/             # Domain management
│   │   │   ├── ai-analytics/        # AI chat
│   │   │   ├── lineage/             # Data lineage
│   │   │   ├── golden-path/         # Golden path analytics
│   │   │   ├── admin/users/         # User management
│   │   │   ├── docs/                # Dokumentasi
│   │   │   └── settings/            # Pengaturan
│   │   ├── login/                   # Login page
│   │   ├── layout.tsx               # Root layout
│   │   └── not-found.tsx            # 404
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── skeletons/               # Loading skeletons
│   │   └── pipeline/                # Pipeline-specific components
│   │
│   └── lib/
│       ├── auth.ts                  # Auth utilities + RBAC
│       ├── constants.ts             # API URLs, defaults
│       ├── domain-context.ts        # Domain state provider
│       └── utils.ts                 # cn() helper
│
├── public/                          # Static assets
├── package.json
└── README.md
```

---

## 🧩 Components

### UI Components (shadcn/ui)

| Component | Description |
|-----------|-------------|
| `card.tsx` | Card, CardHeader, CardTitle, CardContent |
| `button.tsx` | Button dengan variants |
| `badge.tsx` | Badge untuk status |
| `dialog.tsx` | Modal dialog |
| `alert-dialog.tsx` | Confirmation dialog |
| `select.tsx` | Dropdown select |
| `input.tsx` | Text input |
| `separator.tsx` | Divider |
| `scroll-area.tsx` | Scrollable area |
| `progress.tsx` | Progress bar |
| `dropdown-menu.tsx` | Dropdown menu |
| `inline-select.tsx` | Custom inline select |
| `domain-select.tsx` | Domain selector |
| `form-field.tsx` | Form field wrapper |

### Loading Skeletons

| Skeleton | Description |
|----------|-------------|
| `page-skeleton-wrapper.tsx` | Wrapper skeleton untuk semua halaman |
| `home-skeleton.tsx` | Role-aware home skeleton (admin/editor vs viewer) |
| `datasets-skeleton.tsx` | Skeleton datasets (raw/mart sections) |
| `pipeline-skeleton.tsx` | Skeleton pipeline list |
| `pipeline-detail-skeleton.tsx` | Skeleton pipeline detail |
| `pipeline-builder-skeleton.tsx` | Skeleton pipeline builder |
| `admin-users-skeleton.tsx` | Skeleton admin users (header + accounts) |
| `ai-analytics-skeleton.tsx` | Skeleton AI analytics |
| `domains-skeleton.tsx` | Skeleton domains |
| `dashboard-skeleton.tsx` | Skeleton dashboard |
| `settings-skeleton.tsx` | Skeleton settings |
| `golden-path-skeleton.tsx` | Skeleton golden path |
| `lineage-skeleton.tsx` | Skeleton lineage (header + stats + graph) |

---

## 🎨 Design Tokens

Konsisten di semua halaman:

```tsx
// Labels
className="text-[10px] font-mono uppercase tracking-[0.16em] text-pulse"

// Titles
className="text-3xl font-semibold tracking-tight"

// Cards
className="rounded-lg border-border shadow-none"

// Layout
className="max-w-7xl mx-auto space-y-6"

// Empty states
className="border-dashed rounded-lg"
```

---

## 🔐 Auth & RBAC

### Usage

```tsx
import { getCurrentUser, hasMinimumRole, getAccessToken } from "@/lib/auth"

const user = getCurrentUser()
const canEdit = hasMinimumRole(user?.role, "editor")
const canDelete = hasMinimumRole(user?.role, "admin")
```

### Roles

| Role | Level | Description |
|------|-------|-------------|
| Viewer | 10 | Read-only |
| Editor | 20 | Create, edit, run |
| Admin | 30 | Full access + manage users |

---

## 📡 API Calls

```tsx
import { API_URL } from "@/lib/constants"
import { getAccessToken } from "@/lib/auth"

const token = getAccessToken()
const headers: Record<string, string> = token 
  ? { Authorization: `Bearer ${token}` } 
  : {}

const res = await fetch(`${API_URL}/api/pipelines`, { headers })
const data = await res.json()
```

---

## 🔔 Toast Notifications

```tsx
import { toast } from "sonner"

toast.success("Berhasil disimpan")
toast.error("Gagal memuat data")
```

---

## 🌐 Domain Filtering

```tsx
import { useDomain } from "@/lib/domain-context"

const { activeDomainId } = useDomain()
```

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server (webpack) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |

---

## 🔮 Future Improvements

- [ ] Add dark mode toggle
- [ ] Implement i18n (Indonesian/English)
- [ ] Add offline support with service worker
- [ ] Implement virtual scrolling for large lists
- [ ] Add keyboard shortcuts
- [ ] Implement drag-and-drop for pipeline steps

---

## 🙏 Acknowledgments

- Built as part of EduPulse — Analytics Platform for Education
- UI components powered by shadcn/ui

---

## 👤 Author

**Bagus Rahmadani**

- GitHub: [@Bagus2510](https://github.com/Bagus2510)
- LinkedIn: [bagusrahmadani](https://www.linkedin.com/in/bagusrahmadani/)
- Portfolio Website: [bagusrahmadani.vercel.app](https://bagusrahmadani.vercel.app/)
- Email: bagusrajin465@gmail.com

---

<div align="center">

**Made with ❤️ for Student Academic Success**

</div>
