# 🎬 IMOVIES — Complete Full-Stack MERN Cinema Booking System

A production-grade, end-to-end full-stack cinema booking application built with **MongoDB**, **Express**, **React 18 + Vite**, **Node.js**, **Socket.IO**, and **Bootstrap 5 + Icons**.

---

## 🌟 Key Features Implemented

### 🍿 Customer Experience
- **Cinematic Homepage**:
  - Featured premiere hero showcase banner with rating, runtime, synopsis, and instant booking CTA.
  - Multi-dimensional search & filtering (search query, genre pills, spoken language filter, and sort options: Top Rated, Title, Runtime, Release order).
  - Modern movie cards with hover elevation, rating badge, and quick booking access.
- **Movie Details & Dynamic Showtime Selector**:
  - Full backdrop imagery, rating, duration, sound format, and synopsis.
  - Date selector tabs (Today, Tomorrow, Day 3) and City filter pills.
  - Grouped showtimes by cinema multiplex with live seat availability counters.
- **Interactive Live Hall & Seat Selection**:
  - **Socket.IO Real-Time Synchronization**: Live sync of seat status across concurrent users without page reloads.
  - Curved screen visual with ambient lighting.
  - Row indicators (A to F) with numerical seat identifiers (1 to 10).
  - Dynamic seat status (Available, Selected, Booked).
  - Maximum 10 seats validation with sticky bottom checkout drawer.
- **Simulated Multi-Method Payment Gateway**:
  - Interactive checkout modal supporting:
    - **UPI / QR Code**: Scan QR code with Google Pay, PhonePe, or Paytm.
    - **Credit / Debit Cards**: Cardholder name, mock card number, expiry, CVV.
    - **Net Banking**: Bank selection dropdown (HDFC, SBI, ICICI, Axis).
  - Fare breakdown (Ticket subtotal, booking fees/taxes, grand total in INR ₹).
- **Instant Booking Confirmation & Digital E-Ticket Pass**:
  - Celebratory confirmation screen with booking reference ID.
  - **Printable E-Ticket Modal**: Styled like an authentic cinema boarding pass with barcode, cinema hall address, seat badges, and browser print (`window.print()`) with print-optimized CSS (`@media print`).
- **Reservation Management (My Bookings)**:
  - Categorized tabs: All, Upcoming, Past & Cancelled.
  - View digital pass anytime.
  - **One-Click Ticket Cancellation**: Instant ticket cancellation with automatic seat release and demo refund.
- **Account & Security Settings**:
  - Profile update (Full name, email address).
  - Password change with old password verification.
  - Auto-logout on expired JWT tokens.

### 👑 Executive Control Center (Admin Portal)
- **Real-Time Analytics Dashboard**:
  - Total Recorded Revenue in INR ₹.
  - Total Bookings and Confirmed Bookings metrics.
  - Active Movie Catalog count, Cinema Theatres count, and Scheduled Shows count.
  - Recent Booking Activity stream with customer names, movies, seats, and status.
- **Movie Catalog Manager**:
  - Add new movie with title, description, poster URL, runtime, rating, genres, and language.
  - Edit existing movie details.
  - Delete movie from catalog with safety confirmations.
- **Cinema Multiplex Manager**:
  - Add and manage theatres with city, address, and total seat capacity.
  - Edit theatre information.
  - Delete theatre.
- **Showtime Scheduler**:
  - Schedule shows with movie selector, theatre selector, datetime picker, ticket pricing, custom row count, and seats per row.
  - Automatically generates seat maps.
  - View occupancy statistics per show (`X / Y seats booked`).
  - Delete show with automatic cancellation and refund of booked tickets.
- **Master Bookings Ledger**:
  - Complete history of all customer reservations.
  - Admin ticket cancellation and refund capability.
- **User Directory Management**:
  - View all registered accounts, emails, join dates, and roles.
  - Promote users to Admin or demote to standard Customer.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js v24)
- MongoDB instance (MongoDB 6.0+, 7.0+, or 9.0+)

### 1. Backend Setup
```bash
cd server
npm install
npm run seed
npm run dev
```

The database seed automatically configures:
- **Admin Account**: `admin@imovies.local` | Password: `Admin123!`
- **Demo User Account**: `user@imovies.local` | Password: `User123!`
- 6 curated movies with high-resolution posters.
- 4 cinema multiplexes across Bhopal, Mumbai, Delhi, and Bengaluru.
- Upcoming showtimes for Today, Tomorrow, and Next Day.
- Sample confirmed booking for immediate verification.

### 2. Frontend Setup
In a second terminal:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated End-to-End Test Suite

Run the comprehensive verification script against the backend server:
```bash
cd server
node test-api.js
```
The test suite verifies:
1. API Health Check (`/api/health`)
2. Admin JWT authentication and permissions
3. Regular User JWT authentication
4. Movie filtering by genre, search query, and sorting
5. Theatre discovery
6. Show listings and seat availability calculation
7. Seat reservation transaction and atomic fallback
8. Single booking retrieval by ID (`/api/bookings/:id`)
9. User booking history (`/api/bookings/mine`)
10. Booking cancellation and refund (`/api/bookings/:id/cancel`)
11. Admin analytics metrics (`/api/admin/stats`) and user directory (`/api/admin/users`)

---

## 📁 Project Architecture

```
movie-booking-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation, brand, and auth controls
│   │   │   ├── Footer.jsx        # Cinema info, links, tech stack badges
│   │   │   ├── Notice.jsx        # Reusable dismissible alerts
│   │   │   ├── TicketModal.jsx   # Printable digital cinema pass
│   │   │   └── PaymentModal.jsx  # Multi-method simulated payment modal
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth state, login/logout, profile updates
│   │   ├── pages/
│   │   │   ├── HomePage.jsx          # Hero premiere, filters, movie cards
│   │   │   ├── MovieDetailsPage.jsx  # Backdrop, synopsis, showtimes by date & city
│   │   │   ├── SeatSelectionPage.jsx # Socket.IO live hall map & checkout drawer
│   │   │   ├── ConfirmationPage.jsx  # Success celebration and ticket download
│   │   │   ├── MyBookingsPage.jsx    # User reservations & cancellation
│   │   │   ├── TheatresPage.jsx      # Cinema directory by city
│   │   │   ├── ProfilePage.jsx       # User profile & password change
│   │   │   ├── AdminDashboard.jsx    # Analytics, CRUD for movies, theatres, shows, bookings
│   │   │   └── AuthPages.jsx         # Login & Register with demo credential helpers
│   │   ├── api.js                # Axios client with JWT interceptor & auto-logout
│   │   ├── App.jsx               # App routes & role-based guards
│   │   ├── main.jsx              # App entry point
│   │   └── styles.css            # Dark cinema aesthetics, animations, print media
│   ├── vite.config.js            # Vite React configuration
│   └── package.json
└── server/
    ├── src/
    │   ├── middleware/
    │   │   └── auth.js           # JWT verification & admin guard
    │   ├── models/
    │   │   ├── User.js           # User schema (roles: user, admin)
    │   │   ├── Movie.js          # Movie schema with language-safe text index
    │   │   ├── Theatre.js        # Cinema multiplex schema
    │   │   ├── Show.js           # Show schema with seat maps
    │   │   └── Booking.js        # Booking schema (confirmed, cancelled)
    │   ├── routes/
    │   │   ├── auth.js           # Register, login, profile, change-password
    │   │   ├── movies.js         # Movies CRUD, search, regex, sort
    │   │   ├── theatres.js       # Theatres CRUD
    │   │   ├── shows.js          # Shows CRUD, seats layout, upcoming filter
    │   │   ├── bookings.js       # Booking creation, retrieval, cancellation
    │   │   └── admin.js          # Admin analytics & user directory
    │   ├── seed.js               # Database population script
    │   └── server.js             # Express app, Socket.IO, CORS configuration
    ├── test-api.js               # Automated E2E test suite
    ├── .env                      # Environment configuration
    └── package.json
```
