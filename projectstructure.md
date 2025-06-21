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