// PROJECT STRUCTURE:
/*
bread-billing-app/
├── electron/
│   ├── main.js
│   └── preload.js
├── prisma/
│   └── schema.prisma (already provided above)
├── server/
│   ├── index.ts
│   ├── auth.ts
│   ├── db.ts
│   ├── trpc.ts
│   └── routers/
│       ├── index.ts
│       ├── auth.ts
│       ├── billing.ts
│       ├── customers.ts
│       ├── products.ts
│       ├── orders.ts
│       ├── purchases.ts
│       ├── expenses.ts
│       ├── production.ts
│       ├── accounts.ts
│       ├── reports.ts
│       └── settings.ts
├── src/
│   ├── components/
│   │   ├── ui/ (shadcn components)
│   │   ├── layout/
│   │   ├── forms/
│   │   ├── tables/
│   │   └── common/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── billing/
│   │   ├── orders/
│   │   ├── customers/
│   │   ├── products/
│   │   ├── purchases/
│   │   ├── expenses/
│   │   ├── production/
│   │   ├── accounts/
│   │   ├── reports/
│   │   └── settings/
│   ├── hooks/
│   ├── lib/
│   │   ├── utils.ts
│   │   ├── trpc.ts
│   │   ├── auth.ts
│   │   └── validation.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── billingStore.ts
│   │   └── settingsStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── .env
├── .env.example
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── vite.config.ts
└── electron.config.js
*/




D:\bread-winner>node print-structure.js


├── .env
├── .env.example
├── electron/
│   ├── main.js
│   └── preload.js
├── electron.config.js
├── package-lock.json
├── package.json
├── postcss.config.js
├── print-structure.js
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── projectstructure.md
├── public/
├── server/
│   ├── auth.ts
│   ├── db.ts
│   ├── index.ts
│   ├── routers/
│   │   ├── accounts.ts
│   │   ├── auth.ts
│   │   ├── billing.ts
│   │   ├── customers.ts
│   │   ├── expenses.ts
│   │   ├── index.ts
│   │   ├── orders.ts
│   │   ├── production.ts
│   │   ├── products.ts
│   │   ├── purchases.ts
│   │   ├── reports.ts
│   │   └── settings.ts
│   └── trpc.ts
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx
│   │   ├── common/
│   │   ├── forms/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Layout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── tables/
│   │   └── ui/
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/
│   ├── index.css
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── trpc.ts
│   │   ├── utils.ts
│   │   └── validation.ts
│   ├── main.tsx
│   ├── pages/
│   │   ├── accounts/
│   │   ├── billing/
│   │   ├── customers/
│   │   ├── Dashboard.tsx
│   │   ├── expenses/
│   │   ├── Login.tsx
│   │   ├── orders/
│   │   ├── production/
│   │   ├── products/
│   │   ├── purchases/
│   │   ├── reports/
│   │   └── settings/
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── billingStore.ts
│   │   └── settingsStore.ts
│   └── types/
│       └── index.ts
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts


<!-- ******************* -->

npx prisma db seed

npx prisma migrate dev --name init
<!-- ******************* -->