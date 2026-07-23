<div align="center">

![Fundora banner](https://capsule-render.vercel.app/api?type=waving&color=0:11261A,50:1B4332,100:C8F20B&height=220&section=header&text=Fundora&fontSize=76&fontColor=FFFFFF&animation=fadeIn&fontAlignY=38&desc=Small%20credits.%20Big%20beginnings.&descAlignY=58&descSize=20)

# Fundora

### A modern, full-stack crowdfunding platform for supporters, creators, and administrators.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Fundora-C8F20B?style=for-the-badge&logo=vercel&logoColor=11261A)](https://fundora-hazel.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-1B4332?style=for-the-badge)](LICENSE)

[Live site](https://fundora-hazel.vercel.app) · [Report a bug](https://github.com/GalibDev/Fundora/issues) · [Request a feature](https://github.com/GalibDev/Fundora/issues)

</div>

## Overview

Fundora connects people who have meaningful ideas with supporters who want to fund them. Supporters purchase credits through Stripe, creators launch and manage campaigns, and administrators moderate the marketplace from a role-aware dashboard.

## Preview

<p align="center">
  <a href="https://fundora-hazel.vercel.app">
    <img src="https://image.thum.io/get/width/1200/crop/720/https://fundora-hazel.vercel.app" alt="Fundora home page preview" width="900" />
  </a>
</p>

> The preview links to the live project. Open the live site for the complete responsive experience.

## Highlights

| Supporter | Creator | Administrator |
| --- | --- | --- |
| Explore campaigns and contribute with credits | Create, edit, and delete campaigns | Manage users and roles |
| Track contribution status and history | Review pending contributions | Approve or reject campaigns |
| Purchase credit packages through Stripe Checkout | Request withdrawals and view payment history | Process withdrawals and resolve reports |
| Receive in-app notifications | See total, active, and raised campaign stats | View platform-wide supporters, creators, credits, and payments |

## Features

- Role-based JWT authentication: Supporter, Creator, and Admin
- Google Sign-In with verified ID tokens
- Responsive landing page with animated hero, top-funded, and closing-soon campaigns
- Campaign search, category filters, sorting, pagination, and detailed campaign pages
- ImgBB profile and campaign image uploads
- Credit-based contribution workflow with creator approval/rejection
- Automatic supporter refund when a contribution is rejected
- Stripe test-mode Checkout credit packages and signed webhook fulfilment
- Creator campaign, contribution-review, withdrawal, and payment tools
- Admin moderation for users, campaigns, withdrawal requests, and reports
- In-app notifications and optional transactional email notifications
- Framer Motion animations, React Hook Form + Zod validation, and MongoDB transactions

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, TanStack Query, Framer Motion, Recharts |
| Backend | Express.js, TypeScript, JWT, Zod |
| Database | MongoDB Atlas with Mongoose |
| Payments | Stripe Checkout and webhooks |
| Media | ImgBB |
| Deployment | Vercel (frontend) and Render (backend) |

## Project structure

```text
Fundora/
├── client/                 # Next.js application
│   ├── app/                # Routes and pages
│   ├── components/         # Reusable UI components
│   └── lib/                # API, auth, data, and types
├── server/                 # Express API
│   └── src/
│       ├── routes/         # Auth, campaigns, payments, admin, uploads
│       ├── models/         # MongoDB schemas
│       └── middleware/     # JWT and role guards
├── render.yaml             # Render Blueprint
└── LICENSE                 # MIT License
```

## Run locally

**Requirements:** Node.js 20+ and a MongoDB Atlas database.

```bash
git clone https://github.com/GalibDev/Fundora.git
cd Fundora
npm run install:all
copy server\.env.example server\.env
copy client\.env.example client\.env.local
npm run dev
```

The frontend starts at `http://localhost:3000` and the API starts at `http://localhost:5000`.

## Environment variables

### Frontend — `client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_IMGBB_KEY=your-imgbb-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend — `server/.env`

```env
PORT=5000
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=use-a-long-random-secret
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_EMAIL=admin@fundora.com
ADMIN_PASSWORD=choose-a-strong-password
```

Optional: add `RESEND_API_KEY` and `EMAIL_FROM` to enable email notifications.

> On every backend start, Fundora ensures the admin account from `ADMIN_EMAIL` and `ADMIN_PASSWORD` exists and is assigned the Admin role.

## Stripe test mode

Create a Stripe webhook endpoint at:

```text
https://YOUR-RENDER-SERVICE.onrender.com/api/webhooks/stripe
```

Subscribe to `checkout.session.completed` and store the signing secret in `STRIPE_WEBHOOK_SECRET`.

Use Stripe's test card `4242 4242 4242 4242`, any future expiry date, and any CVC.

## Deploy

1. Deploy the `server` directory to Render using [`render.yaml`](render.yaml).
2. Set the server variables, especially `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.
3. Import the repository into Vercel and set **Root Directory** to `client`.
4. On Vercel set `NEXT_PUBLIC_API_URL` to `https://YOUR-RENDER-SERVICE.onrender.com/api`.
5. Update Render `CLIENT_URL` with your Vercel URL, then redeploy both services.

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">Built with care by <a href="https://github.com/GalibDev">GalibDev</a>.</div>
