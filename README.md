# Maithili Dictionary Platform

A comprehensive multi-dictionary platform for the Maithili language with workflow management, public contributions, and multi-format PDF export capabilities.

## 🚀 Project Status

**Current Phase**: Foundation Setup
- ✅ Project configuration files created
- ✅ Docker compose setup for services
- ✅ Environment configuration template
- ✅ Comprehensive project plan documented
- ⏳ Next.js application initialization (pending)
- ⏳ Database schema setup (pending)
- ⏳ Source code implementation (pending)

## 📋 Core Features

### Multi-Dictionary Support
- 7-8 dictionary sources (Maithili to Hindi, English, etc.)
- Main dictionary by Maithili Linguistics Research Council (default)
- Dictionary-specific word entries and configurations

### Dynamic Parameter System
- 15± configurable parameters
- Multi-language parameter entries
- Flexible parameter types (text, rich_text, json, array, multilingual)
- Admin-manageable parameter definitions

### Word Management
- Sub-words and compound words support
- Cross-referencing between words
- Word relationships (synonyms, antonyms, related words)
- Hierarchical word structures

### Workflow System
- Role-based workflow (Field Researcher → Editor → Senior Editor → Editor-in-Chief → Admin)
- Word assignment and transfer
- Revision control
- Comments and returns
- Status tracking

### Public Contribution
- Edit suggestions (email + mobile required)
- New word submissions
- Review and approval workflow
- User notifications

### Search & Discovery
- Autocomplete search
- Full-text search across dictionaries
- Advanced filters (dictionary, word type, language)
- Search history and analytics
- Popular words tracking

### Word Detail Interface
- Tabbed interface with multiple sections:
  - Overview
  - Meanings (multi-language)
  - Synonyms
  - Related Words
  - Sub-words
  - Examples
  - Etymology
  - Cross-references
  - Additional Info

### PDF Export (4 Formats)
1. **Pocket Dictionary** - 4" x 6", 2-3 columns, word + primary meaning
2. **Concise Dictionary** - 5.8" x 8.3", 2 columns, word + meanings + brief usage
3. **Volume Dictionary** - A4, single column, all parameters, multi-volume support
4. **Descriptive Dictionary** - A4, premium formatting, all parameters + images

All PDFs include:
- Standard dictionary typography and formatting
- Guide words and running headers
- Cross-references with page numbers
- Index generation
- Table of contents (for volumes)

### Authentication
- Social authentication (Google, Facebook, Instagram, Twitter)
- NextAuth.js integration
- Role-based access control
- User profiles and preferences

### User Features
- Favorites/bookmarks
- Personal notes on words
- Search history
- Word of the day
- Share functionality

### Website Integration
- Embedded in MLRC parent website
- Shared header/footer
- Seamless navigation
- Consistent design system

## 🛠️ Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (sober, clean design)
- **Database**: PostgreSQL 15+ (via Prisma ORM)
- **Cache/Sessions**: Redis 7+
- **Authentication**: NextAuth.js (OAuth providers)
- **File Storage**: AWS S3 / Azure Blob (with local filesystem option)
- **Search**: PostgreSQL Full-Text Search + Algolia/Elasticsearch
- **PDF Generation**: Puppeteer or LaTeX
- **Email**: SendGrid / AWS SES
- **Containerization**: Docker & Docker Compose

## 📁 Project Structure

```
maithili-dictionary/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   ├── word/[id]/         # Word detail pages
│   └── search/            # Search pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── dictionary/       # Dictionary-specific components
│   ├── workflow/         # Workflow components
│   └── forms/            # Form components
├── lib/                  # Utility functions
│   ├── db/              # Database utilities
│   ├── auth/            # Authentication utilities
│   └── utils/           # General utilities
├── prisma/              # Prisma schema and migrations
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── public/              # Static assets
├── storage/             # File storage (local)
│   └── pdfs/           # Generated PDFs
└── types/              # TypeScript type definitions
```

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- Docker Desktop (recommended)
- Git

### Setup Steps

1. **Start Docker services**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - PostgreSQL on port 5432
   - Redis on port 6379
   - MinIO on ports 9000, 9001

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   copy .env.example .env.local
   # Edit .env.local with your settings
   ```

4. **Set up database**
   ```bash
   npm run db:migrate
   npm run db:generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

For detailed setup instructions, see [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 📚 Documentation

- [Project Plan](./PROJECT_PLAN.md) - Complete project roadmap and features
- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [DevOps Checklist](./DEVOPS_CHECKLIST.md) - Environment requirements

## 🔧 Development

### Available Scripts
(Will be available after project initialization)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

### Database Management
- Use Prisma Studio: `npm run db:studio`
- Run migrations: `npm run db:migrate`
- Reset database: `npm run db:reset` (development only)

## 🐳 Docker Services

The project includes Docker Compose configuration for:
- **PostgreSQL**: Database server
- **Redis**: Cache and session storage
- **MinIO**: S3-compatible object storage

To manage services:
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart services
docker-compose restart
```

## 👥 User Roles

### Public User (not logged in)
- Search words
- View word details
- Submit edit suggestions

### Public User (logged in)
- All public features
- Add new words
- Save favorites
- Personal notes
- Search history

### Field Researcher
- Create word entries
- Edit own drafts
- Submit for review

### Editor
- Complete word entry forms
- Review edit suggestions
- Submit for senior editor review

### Senior Editor
- Review editor-submitted words
- Approve and forward to Editor-in-Chief

### Editor-in-Chief
- Final review of words
- Approve for dictionary inclusion

### Admin
- User management
- Dictionary management
- Parameter definition management
- View statistics

### Super Admin
- All admin permissions
- View entire word list
- Export PDFs in all formats
- System configuration

## 📝 Environment Variables

See `.env.example` for all available environment variables. Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL
- OAuth provider credentials (Google, Facebook, Instagram, Twitter)

## 🎨 Design System

### Principles
- **Sober, clean design** - Minimal, purposeful interface
- **Clear typography hierarchy** - Readable and accessible
- **Generous whitespace** - Comfortable spacing
- **Subtle accents** - Professional appearance
- **Accessible** - WCAG 2.1 AA compliance

### Color Palette
- Primary: Deep blue or teal (subtle)
- Secondary: Gray tones
- Background: White/light gray
- Text: Dark gray/black

## 📖 Dictionary Formatting

The platform follows standard dictionary formatting conventions:
- **Headwords**: Bold, larger font
- **Pronunciation**: IPA notation in brackets
- **Part of Speech**: Abbreviations (n., v., adj., etc.)
- **Definitions**: Numbered/lettered with indentation
- **Examples**: Italicized with translations
- **Etymology**: Historical development
- **Cross-references**: "See also WORD, p. 123" format
- **Guide words**: Top of each page
- **Running headers**: Letter ranges

## 🔒 Security

- Rate limiting on API endpoints
- Input validation and sanitization
- File upload security
- Comprehensive audit logging
- GDPR compliance features
- Secure authentication (OAuth + JWT)

## 📊 Development Phases

1. **Foundation** (Weeks 1-4) - Database, authentication, basic setup
2. **Core Features** (Weeks 5-8) - Dynamic parameters, workflow, search
3. **Public Features** (Weeks 9-10) - Public interface, edit suggestions
4. **Workflow** (Weeks 11-14) - Complete workflow system
5. **Advanced Features** (Weeks 15-18) - PDF export, advanced search
6. **Integration** (Weeks 19-20) - Website embedding
7. **Polish** (Weeks 21-24) - UI/UX refinement, testing
8. **Mobile** (Weeks 25-28) - Mobile app development

## 🤝 Contributing

(Contributing guidelines will be added as the project develops)

## 📄 License

(To be determined)

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📞 Support

For questions or issues, please refer to the documentation or create an issue in the repository.

---

**Note**: This project is currently in the initial setup phase. Core functionality will be implemented following the phased development approach outlined in [PROJECT_PLAN.md](./PROJECT_PLAN.md).
