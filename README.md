# Fundora

Fundora is a full-stack crowdfunding platform where supporters fund meaningful projects with credits, creators manage campaigns and withdrawals, and admins keep the ecosystem safe.

## Demo access

- Admin email: `admin@fundora.com`
- Admin password: `Admin123!` (created by the seed script; change it before production)
- Frontend live URL: not published yet — deploy `client` to Vercel and replace this line with the generated URL
- Backend live URL: not published yet — deploy the Render Blueprint and replace this line with the generated URL
- Repository: https://github.com/GalibDev/Fundora

## Features

- Three role-aware experiences for Supporters, Creators, and Admins
- Secure JWT authentication that survives private-route refreshes
- New Supporters receive 50 credits and Creators receive 20 exactly once
- Responsive public site and dashboard for mobile, tablet, and desktop
- Campaign discovery, keyword search, category filters, and campaign details
- Contribution escrow with creator approval, rejection, and automatic refunds
- Creator campaign management, earnings conversion, and withdrawal requests
- Stripe Checkout credit packages with a verified webhook credit update
- Admin campaign approvals, user roles, withdrawals, reports, and moderation
- In-app notifications for contribution, campaign, and withdrawal decisions
- Paginated contribution history and complete payment records
- MongoDB transactions for balance-safe contribution processing
- Zod and React Hook Form validation with friendly error feedback
- Framer Motion landing-page animation and Recharts dashboard analytics
- Cloud-ready environment templates with no committed credentials

## Local setup

Requirements: Node.js 20+ and a MongoDB Atlas database.

```bash
npm run install:all
copy server\.env.example server\.env
copy client\.env.example client\.env.local
npm run dev
```

Update both environment files. Seed the admin and sample campaigns:

```bash
npm run seed --prefix server
```

The client runs on `http://localhost:3000`; the API runs on `http://localhost:5000`.

## Stripe test setup

Add Stripe test keys to the client/server environment files. Create a webhook for:

`https://YOUR-RENDER-URL/api/webhooks/stripe`

Subscribe it to `checkout.session.completed` and copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`. Stripe's standard test card is `4242 4242 4242 4242` with any future expiry and CVC.

## Deploy

1. Render: create a Blueprint from `render.yaml`, add the secret values, then deploy.
2. Vercel: import this repository, set **Root Directory** to `client`, add the client variables, then deploy.
3. Set `CLIENT_URL` on Render to the Vercel origin and `NEXT_PUBLIC_API_URL` on Vercel to `https://YOUR-RENDER-URL/api`.
4. Run the seed script locally against the production Atlas database once.

### Google Sign-In

Create a Web OAuth client in Google Cloud Console. Add its client ID as
`NEXT_PUBLIC_GOOGLE_CLIENT_ID` on Vercel and `GOOGLE_CLIENT_ID` on Render. Add
both the Vercel origin and `http://localhost:3000` to the authorized origins.

### Optional email notifications

Set `RESEND_API_KEY` and `EMAIL_FROM` on Render to enable transactional emails
for campaign decisions and contribution decisions. If `RESEND_API_KEY` is
empty, the platform continues to work using in-app notifications only.

## Business rules

- Supporters buy 10 credits per USD through the predefined packages.
- Creators receive USD 1 per 20 approved credits.
- Withdrawals require at least 200 available raised credits.
- Contributions remain pending until the creator approves or rejects them.
- Deleting a creator campaign refunds all its approved supporters.
