# Twinkle Stars Kindergarten Website

A cosmic-themed kindergarten website for **Twinkle Stars** with a public-facing site, admission form, and full admin CMS with CRUD operations.

## Features

- **Public website**: Home, About, Programs, Daily Adventures, Daycare, Facilities, Gallery, Contact
- **Cosmic theme**: Vibrant space-themed design with animations, responsive layout
- **Admission form**: "Join Our Galaxy" modal with validation
- **Admin dashboard**: Manage admissions, programs, schedule, daycare facilities, gallery, announcements, and settings
- **CRUD API**: Vercel serverless functions with Postgres database
- **Demo mode**: Add `?demo=1` to any URL for localStorage-based CRUD (no backend required)

## Quick Start (Demo Mode)

Open `index.html` in a browser with demo mode:

```
index.html?demo=1
```

Admin panel (demo password: `admin123`):

```
admin/index.html?demo=1
```

## Local Development with API

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Set up [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) and add `POSTGRES_URL` to `.env`

4. Run the database schema:
   - Open the Vercel dashboard → Storage → Postgres → Query
   - Paste and run the contents of `sql/schema.sql`

5. Start the dev server:
   ```bash
   npx vercel dev
   ```

6. Visit `http://localhost:3000`

## Deploy to Vercel

1. Push this project to GitHub

2. Import the repository in [Vercel](https://vercel.com/new)

3. Add **Vercel Postgres** from the Storage tab in your project

4. Set environment variables in Vercel project settings:
   - `ADMIN_PASSWORD` — your secure admin password
   - `JWT_SECRET` — a long random string

5. Run `sql/schema.sql` against your Postgres database (Vercel SQL tab)

6. Deploy — static pages and `/api/*` routes are wired automatically

7. Access admin at: `https://your-site.vercel.app/admin/`

## Project Structure

```
├── index.html, about.html, programs.html, ...   # Public pages
├── admin/index.html                              # Admin dashboard
├── css/                                          # Styles (cosmic theme)
├── js/                                           # Frontend scripts
├── api/                                          # Vercel serverless API
├── sql/schema.sql                                # Database schema + seed data
└── vercel.json                                   # Vercel configuration
```

## API Endpoints

| Endpoint | Methods | Auth | Description |
|----------|---------|------|-------------|
| `/api/admissions` | GET, POST | GET: admin | Admission inquiries |
| `/api/admissions/[id]` | GET, PUT, DELETE | Yes | Single admission |
| `/api/programs` | GET, POST | POST: admin | Preschool programs |
| `/api/schedule` | GET, POST | POST: admin | Daily schedule items |
| `/api/daycare-facilities` | GET, POST | POST: admin | Daycare facilities |
| `/api/gallery` | GET, POST | POST: admin | Gallery images |
| `/api/announcements` | GET, POST | POST: admin | Site announcements |
| `/api/settings` | GET, PUT | PUT: admin | Site settings |
| `/api/auth/login` | POST | No | Admin login |

## Content

**Programs (Preschool):**
- Little Comets — PreKG 1.5–2 yrs
- Bright Stars — LKG 2.5–3.5 yrs
- SuperNovas — UKG 3.5–5 yrs
- Daycare

**Daily Adventures:** Welcome Circle & Songs, Story Time, Art & Messy Play, Outdoor Exploration, Healthy Snack Time, Music & Movement

**Hours:** School 9:30 AM–12:30 PM | Daycare 8:00 AM–8:00 PM

**Taglines:** "Where every child finds their spark" | "Nurturing Minds, Building Future"

## License

Private — Twinkle Stars Kindergarten
