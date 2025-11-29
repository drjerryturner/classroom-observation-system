# Classroom Observation System

A comprehensive web application designed for school psychologists to conduct systematic classroom observations of students with IDEA disabilities. The system provides real-time observation recording, time sampling methodologies, and professional report generation.

## Features

### 🎯 **IDEA Compliance**
- Supports all 13 federal IDEA disability categories
- Autism, Intellectual Disability, Specific Learning Disability, Multiple Disabilities, and more
- Evidence-based observation methodologies

### ⏱️ **Time Sampling & Recording**
- Real-time observation recording with precise timestamps
- Multiple observation methodologies supported
- Live timer and interval management
- Behavior categorization and tagging

### 📊 **Professional Reporting**
- Generates comprehensive observation reports
- Automatic summary and recommendation generation
- Print and PDF export functionality
- Professional format matching industry standards

### 👥 **Student Management**
- Secure student profile management
- FERPA-compliant data handling
- Grade level and disability category tracking
- Historical observation records

### 🔒 **Security & Authentication**
- JWT-based authentication for school psychologists
- Role-based access control
- Secure password management with bcrypt
- Data privacy protection

## Technology Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI**: shadcn/ui components with Tailwind CSS
- **Authentication**: JWT with bcrypt password hashing
- **Icons**: Lucide React
- **Deployment**: Vercel-ready with PostgreSQL support

## Quick Start

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database (local or hosted)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <your-repository>
cd classroom-observation-system
bun install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your database connection string:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/classroom_obs"
JWT_SECRET="your-secure-jwt-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Set up the database:**
```bash
bun run db:push
bun run db:seed
```

4. **Start the development server:**
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### Default Login
- **Email**: `admin@school.edu`
- **Password**: `admin123`

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── students/          # Student management
│   ├── observations/      # Observation recording & reports
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── forms/            # Form components
├── lib/                  # Utility functions
│   ├── auth.ts           # JWT authentication
│   ├── db.ts             # Database connection
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
```

## Database Schema

The application uses a comprehensive database schema designed for classroom observations:

- **Users**: School psychologists and administrators
- **Students**: Student profiles with IDEA categories
- **Observations**: Observation sessions with metadata
- **ObservationEntries**: Time-stamped observation entries
- **IdeaCategories**: Federal IDEA disability classifications

See `database-schema.md` for complete documentation.

## Development

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run db:push` - Push schema changes to database
- `bun run db:seed` - Seed database with sample data
- `bun run db:studio` - Open Prisma Studio

### Database Management

```bash
# Generate Prisma client
bun run db:generate

# Push schema changes
bun run db:push

# View data in Prisma Studio
bun run db:studio
```

## Deployment

This application is optimized for deployment on Vercel with a PostgreSQL database. See `DEPLOYMENT.md` for comprehensive deployment instructions including:

- Vercel deployment setup
- PostgreSQL database configuration (Neon recommended)
- Environment variable configuration
- Custom domain setup
- Security considerations

### Quick Deploy to Vercel

1. **Push to GitHub**
2. **Connect to Vercel** and import the repository
3. **Set up PostgreSQL database** (Neon or similar)
4. **Configure environment variables** in Vercel dashboard
5. **Deploy**

Estimated monthly cost: $8-15 for small to medium usage.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See `LICENSE` file for details.

## Support

For support, please contact the development team or create an issue in the repository.

---

**Built for school psychologists, by developers who care about special education.**
