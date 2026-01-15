# Magang Portal - Project Summary

## Project Overview

**Magang Portal** is a modern web application built for managing internship applications at **Radar Cirebon**. It provides a comprehensive platform for applicants to register, submit applications, track their status, and receive notifications, while admins can manage and review applications.

---

## Key Features

### For Users/Applicants:
- **User Registration & Authentication**: Register as an applicant with email and password
- **Application Form**: Submit internship applications with:
  - Personal information (name, email, phone)
  - PDF document upload (max 5MB)
- **Real-time Status Tracking**: View application status (PENDING, ACCEPTED, REJECTED)
- **Notifications System**: Receive automatic notifications when application status changes
- **Responsive Dashboard**: Access from desktop and mobile devices

### For Admins:
- **Admin Dashboard**: View all applications in one centralized location
- **Status Management**: Update application status (PENDING → ACCEPTED/REJECTED)
- **Filter & Search**: Filter applications by status
- **Automatic Notifications**: System automatically sends notifications to applicants when status changes
- **Detailed View**: View applicant details and their submitted documents
- **Custom Notifications**: Send custom messages to applicants

### General Features:
- **Beautiful UI**: Modern, gradient-based design with smooth animations
- **Secure Authentication**: Password hashing using bcryptjs
- **Database Integration**: PostgreSQL with Prisma ORM
- **Role-based Access**: Different interfaces for Users and Admins
- **Health Check**: API health monitoring endpoint

---

## Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Features**: Client-side rendering with animations

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes (REST)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: bcryptjs for password hashing

### DevOps & Deployment
- **Version Management**: npm
- **Deployment**: Vercel-compatible
- **File Storage**: Vercel Blob storage support
- **Database Targets**: native + debian-openssl-3.0.x

---

## Database Schema

### User Model
```
- id (Int, Primary Key)
- name (String)
- email (String, Unique)
- password (String, hashed)
- role (Enum: USER | ADMIN)
- createdAt (DateTime)
- updatedAt (DateTime)
- applicants (Relation to Applicant[])
```

### Applicant Model
```
- id (Int, Primary Key)
- userId (Int?, Foreign Key to User)
- name (String)
- email (String)
- phone (String)
- fileName (String?)
- fileData (Bytes?, PDF content)
- fileUrl (String?)
- status (Enum: PENDING | ACCEPTED | REJECTED)
- createdAt (DateTime)
- updatedAt (DateTime)
- user (Relation to User?)
- notifications (Relation to Notification[])
```

### Notification Model
```
- id (Int, Primary Key)
- message (String)
- applicantId (Int, Foreign Key to Applicant)
- createdAt (DateTime)
- applicant (Relation to Applicant)
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user account | ❌ |
| POST | `/api/auth/login` | Login with email & password | ❌ |
| GET | `/api/auth/me` | Get current user info | ✅ |

### Applications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/apply` | Get all applications | ❌ (public) |
| POST | `/api/apply` | Submit new application | ❌ |
| POST | `/api/update-status` | Update application status | ✅ (Admin) |

### Notifications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notifications` | Get notifications for applicant | ❌ |
| POST | `/api/notifications` | Create new notification | ✅ (Admin) |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Database connection status |

---

## Project Structure

```
magang-portal/
├── app/
│   ├── page.tsx                          # Home page with login/register modal
│   ├── layout.tsx                        # Root layout
│   ├── globals.css                       # Global styles
│   │
│   ├── admin/
│   │   └── page.tsx                      # Admin dashboard
│   │
│   ├── dashboard/
│   │   ├── page.tsx                      # User dashboard (tabs)
│   │   ├── applyForm.tsx                 # Application submission form
│   │   └── statusView.tsx                # Status tracking view
│   │
│   ├── user/
│   │   └── page.tsx                      # User profile & applications page
│   │
│   ├── apply/
│   │   └── page.tsx                      # Application form page
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts           # Login endpoint
│   │   │   ├── register/route.ts        # Registration endpoint
│   │   │   └── me/route.ts              # Current user endpoint
│   │   ├── apply/
│   │   │   ├── route.ts                 # Application CRUD
│   │   │   ├── [id]/route.ts            # Individual application
│   │   │   └── ...
│   │   ├── notifications/
│   │   │   └── route.ts                 # Notifications management
│   │   ├── update-status/
│   │   │   └── route.ts                 # Status update endpoint
│   │   ├── health/
│   │   │   └── route.ts                 # Health check
│   │   └── applicant/
│   │       └── [id]/route.ts            # Individual applicant endpoint
│   │
│   └── components/
│       ├── ApplicationForm.tsx           # Reusable application form
│       ├── NotificationsWidget.tsx       # User notifications widget
│       └── AdminNotificationsWidget.tsx  # Admin notifications widget
│
├── lib/
│   └── prisma.ts                        # Prisma client instance
│
├── prisma/
│   ├── schema.prisma                    # Database schema definition
│   └── migrations/                      # Database migrations
│
├── public/
│   ├── icons/                           # Icon assets
│   └── uploads/                         # User uploads directory
│
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript config
├── next.config.ts                       # Next.js config
├── postcss.config.mjs                   # PostCSS config
└── prisma.config.ts                     # Prisma config
```

---

## UI/UX Features

### Home Page
- **Hero Section**: Eye-catching banner with CTA buttons
- **Features Showcase**: 4 key features highlighted with icons
- **Gradient Design**: Blue color scheme with smooth transitions
- **Responsive Layout**: Works on mobile, tablet, and desktop

### Login/Register Modal
- **Tab Navigation**: Seamless switching between login and registration
- **Account Type Selection**: User vs Admin registration (currently hidden - default: USER)
- **Form Validation**: Real-time input validation
- **Smooth Animations**: Fade in/out effects and scaling

### Dashboard (User)
- **Tab Interface**: Apply and Status tabs
- **Application Tracking**: Real-time status display
- **PDF Upload**: Drag-and-drop file upload with validation
- **Notification Badge**: Real-time notification counter

### Admin Dashboard
- **Application List**: Table view of all applications
- **Status Filters**: View by PENDING, ACCEPTED, or REJECTED
- **Bulk Actions**: Update multiple applications
- **Detailed View**: Modal with full applicant information
- **File Preview**: Download submitted PDF files

---

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **Email Validation**: Unique email constraints in database
3. **File Validation**: 
   - PDF format only
   - Maximum 5MB file size
4. **Input Sanitization**: Form data validation before processing
5. **Database Relations**: Proper user-applicant linking
6. **Error Handling**: Comprehensive error messages without exposing sensitive data

---

## Responsive Design

- **Mobile-First Approach**: Optimized for mobile devices
- **Breakpoints**: Tailored layouts for sm, md, lg screens
- **Touch-Friendly**: Larger buttons and inputs on mobile
- **Performance**: Optimized animations for mobile performance

---

## Recent Changes

### Account Type Selection
- The "Pilih Tipe Akun" (Choose Account Type) section is now **hidden using comments**
- Default registration mode is set to **"register-user"**
- All new registrations are automatically created as **USER role**
- Admin registration UI is no longer accessible but code is preserved for future use

---

## User Workflows

### Applicant Workflow
1. User visits home page
2. Clicks "Login / Daftar Sekarang"
3. Registers as a peserta (applicant)
4. Completes application form with personal info + PDF
5. Receives notification when status is updated
6. Can view application status in real-time

### Admin Workflow
1. Admin logs in with admin credentials
2. Views all applications on dashboard
3. Filters by status (PENDING, ACCEPTED, REJECTED)
4. Clicks on application to view details
5. Updates status, which automatically:
   - Updates database
   - Creates notification
   - Sends message to applicant

---

## Key Statistics

- **Database Models**: 3 (User, Applicant, Notification)
- **API Endpoints**: 11+
- **React Components**: 3 main components
- **Pages**: 6 (Home, Admin, Dashboard, User, Apply, etc.)
- **Database Migrations**: 6+
- **Animations**: 11+ custom CSS animations

---

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma migrate  # Run migrations
npx prisma generate # Generate Prisma client
npx prisma studio  # Open Prisma Studio (GUI)

# Linting
npm run lint         # Run ESLint
```

---

## Features Checklist

- [x] User Registration & Authentication
- [x] Admin Login
- [x] Application Form with PDF Upload
- [x] Real-time Status Tracking
- [x] Notification System
- [x] Admin Dashboard
- [x] Status Update Management
- [x] Database Schema & Migrations
- [x] Responsive Design
- [x] Form Validation
- [x] Error Handling
- [x] Security (password hashing, validation)
- [x] Mobile Optimization
- [x] Health Check Endpoint

---

## Future Enhancements

Potential features for future development:
- Email notifications to applicants
- Document preview/viewer
- Advanced search and filtering
- Export applications to CSV/Excel
- Multi-language support
- SMS notifications
- Video interview integration
- Application scoring system
- Bulk import from Excel

---

## Contact Information

**Organization**: Radar Cirebon  
**Email**: radarcireboncom@gmail.com  
**Phone**: (0231) 483531/483533  
**Hours**: Mon-Fri 08:00-16:00, Sat 08:00-14:00  

---

*Generated: December 8, 2025*
