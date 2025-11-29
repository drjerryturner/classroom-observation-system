# Deployment Guide: Classroom Observation System

## Option 1: Vercel + PostgreSQL (RECOMMENDED)

### Prerequisites
1. GitHub account
2. Vercel account (free)
3. Neon Database account (free PostgreSQL)

### Step 1: Database Setup
1. Go to https://neon.tech and create a free account
2. Create a new PostgreSQL database
3. Copy the connection string (starts with `postgresql://`)

### Step 2: GitHub Setup
1. Push your code to a GitHub repository
2. Make sure your `.env` file is in `.gitignore` (it should be)

### Step 3: Vercel Deployment
1. Go to https://vercel.com and sign up with GitHub
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard:
   - `DATABASE_URL` = your Neon PostgreSQL connection string
   - `JWT_SECRET` = a secure random string (generate at https://generate-secret.vercel.app/64)
   - `NODE_ENV` = production

### Step 4: Deploy
1. Vercel will automatically build and deploy
2. Your app will be available at `your-app-name.vercel.app`

### Step 5: Custom Domain (Optional)
1. In Vercel dashboard, go to your project settings
2. Add custom domain: `observations.drjerryturner.com`
3. Follow DNS instructions to point subdomain to Vercel

## Option 2: Railway (Alternative)

### Prerequisites
1. GitHub account
2. Railway account

### Steps
1. Go to https://railway.app
2. Connect GitHub repository
3. Add PostgreSQL database addon
4. Set environment variables
5. Deploy

## Option 3: Netlify + Supabase

### Prerequisites
1. GitHub account
2. Netlify account
3. Supabase account (PostgreSQL)

### Steps
1. Create Supabase project and get connection string
2. Deploy to Netlify from GitHub
3. Configure environment variables
4. Enable edge functions for API routes

## Cost Breakdown

### Vercel + Neon (FREE TIER)
- Vercel: Free (up to 100GB bandwidth)
- Neon PostgreSQL: Free (3GB storage)
- Custom domain: Free
- **Total: $0/month** (perfect for starting)

### When you need to scale (later):
- Vercel Pro: $20/month (unlimited)
- Neon Pro: $19/month (more storage/compute)

## Domain Configuration

### Option A: Subdomain (Recommended)
- Use: `observations.drjerryturner.com`
- Add CNAME record in your domain DNS pointing to Vercel

### Option B: Separate Domain
- Buy a new domain like `classroomobservations.com`
- Point entire domain to your app

## Security Considerations

### Production Environment Variables
```
DATABASE_URL=postgresql://username:password@host:5432/dbname
JWT_SECRET=your-super-secret-key-min-32-characters
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=another-secret-key
```

### HTTPS
- Automatically provided by Vercel/Netlify
- Required for production use

## Backup Strategy
- Neon provides automated backups
- Export data regularly via Prisma Studio
- Keep code in GitHub for version control

## Monitoring
- Vercel provides analytics and error tracking
- Consider adding Sentry for error monitoring
- Monitor database usage in Neon dashboard