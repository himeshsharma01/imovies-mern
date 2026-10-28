import 'dotenv/config';
import dns from 'dns';
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Movie from './models/Movie.js';
import Theatre from './models/Theatre.js';
import Show from './models/Show.js';
import Booking from './models/Booking.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to MongoDB. Starting database seeding...');

// 1. Seed Admin & Demo Customer
const adminPassword = await bcrypt.hash('Admin123!', 12);
const userPassword = await bcrypt.hash('User123!', 12);

const adminUser = await User.findOneAndUpdate(
  { email: 'admin@imovies.local' },
  { $set: { name: 'IMovies Admin', email: 'admin@imovies.local', password: adminPassword, role: 'admin' } },
  { upsert: true, new: true }
);

const demoCustomer = await User.findOneAndUpdate(
  { email: 'user@imovies.local' },
  { $set: { name: 'Alex Johnson', email: 'user@imovies.local', password: userPassword, role: 'user' } },
  { upsert: true, new: true }
);

// 2. Seed Movies
const moviesData = [
  {
    title: 'Interstellar Odyssey',
    description: 'When Earth faces ecological collapse, a team of courageous explorers undertakes the most important mission in human history: traveling beyond this galaxy to discover whether mankind has a future among the stars.',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=700&auto=format&fit=crop&q=80',
    durationMinutes: 169,
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    language: 'English',
    rating: 8.9,
    active: true
  },
  {
    title: 'City of Dreams',
    description: 'A poignant and heartfelt contemporary drama following three ambitious young artists as they navigate love, sacrifice, and fierce competition in the bustling heart of Mumbai.',
    posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=700&auto=format&fit=crop&q=80',
    durationMinutes: 124,
    genres: ['Drama', 'Romance'],
    language: 'Hindi',
    rating: 8.1,
    active: true
  },
  {
    title: 'Midnight Chase',
    description: 'An elite undercover detective is trapped in an international conspiracy after intercepting an encrypted drive, triggering a non-stop high-octane chase across illuminated neon cityscapes.',
    posterUrl: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=700&auto=format&fit=crop&q=80',
    durationMinutes: 135,
    genres: ['Action', 'Thriller'],
    language: 'Hindi',
    rating: 8.4,
    active: true
  },
  {
    title: 'Neon Cyberpunk 2099',
    description: 'In a dystopian mega-city ruled by artificial intelligence and rogue synth corporations, a former operative must hunt down a sentient cybernetic rebel before total blackout.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=700&auto=format&fit=crop&q=80',
    durationMinutes: 142,
    genres: ['Sci-Fi', 'Action'],
    language: 'English',
    rating: 8.7,
    active: true
  },
  {
    title: 'The Silent Haunting',
    description: 'A secluded mountain estate holds dark Victorian secrets. When a family moves in for winter restoration, whispers in the walls reveal an ancient curse.',
    posterUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=700&auto=format&fit=crop&q=80',
    durationMinutes: 112,
    genres: ['Horror', 'Thriller'],
    language: 'English',
    rating: 7.6,
    active: true
  },
  {
    title: 'Laugh Riot',
    description: 'When two chaotic wedding planners accidentally double-book an eccentric billionaire’s destination wedding and a boisterous family reunion, hilarity ensues.',
    posterUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=700&auto=format&fit=crop&q=80',
    durationMinutes: 108,
    genres: ['Comedy'],
    language: 'Hindi',
    rating: 7.9,
    active: true
  }
];

const seededMovies = [];
for (const m of moviesData) {
  const doc = await Movie.findOneAndUpdate(
    { title: m.title },
    { $set: m },
    { upsert: true, new: true }
  );
  seededMovies.push(doc);
}

// 3. Seed Theatres
const theatresData = [
  { name: 'IMovies Central Multiplex', city: 'Bhopal', address: 'MP Nagar Zone 1, Bhopal', totalSeats: 60 },
  { name: 'IMovies IMAX & 4DX', city: 'Mumbai', address: 'Bandra West, Link Road, Mumbai', totalSeats: 80 },
  { name: 'IMovies PXL Cinema', city: 'Delhi', address: 'Connaught Place, Central Delhi', totalSeats: 70 },
  { name: 'IMovies Luxe Boulevard', city: 'Bengaluru', address: 'Indiranagar 100ft Road, Bengaluru', totalSeats: 60 }
];

const seededTheatres = [];
for (const t of theatresData) {
  const doc = await Theatre.findOneAndUpdate(
    { name: t.name },
    { $set: t },
    { upsert: true, new: true }
  );
  seededTheatres.push(doc);
}

// 4. Seed Shows for Today, Tomorrow, and Next Day
const now = new Date();
const timeSlots = [
  { hour: 10, minute: 30, price: 200 },
  { hour: 14, minute: 15, price: 240 },
  { hour: 18, minute: 45, price: 280 },
  { hour: 21, minute: 30, price: 320 }
];

let primaryShowForDemoBooking = null;

for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
  for (const movie of seededMovies) {
    for (const theatre of seededTheatres) {
      // Pick 2 slots per movie per theatre per day
      const slotIndex = (seededMovies.indexOf(movie) + seededTheatres.indexOf(theatre) + dayOffset) % timeSlots.length;
      const slot = timeSlots[slotIndex];

      const showTime = new Date(now);
      showTime.setDate(now.getDate() + dayOffset);
      showTime.setHours(slot.hour, slot.minute, 0, 0);

      // Only seed future shows
      if (showTime > now) {
        let existingShow = await Show.findOne({
          movie: movie._id,
          theatre: theatre._id,
          startsAt: showTime
        });

        if (!existingShow) {
          const rows = 6;
          const seatsPerRow = 10;
          const seats = [];
          for (let r = 0; r < rows; r++) {
            for (let c = 1; c <= seatsPerRow; c++) {
              seats.push({
                seatNumber: `${String.fromCharCode(65 + r)}${c}`,
                status: 'available'
              });
            }
          }

          existingShow = await Show.create({
            movie: movie._id,
            theatre: theatre._id,
            startsAt: showTime,
            price: slot.price,
            seats
          });
        }

        if (!primaryShowForDemoBooking) {
          primaryShowForDemoBooking = existingShow;
        }
      }
    }
  }
}

// 5. Seed a Sample Booking for Demo Customer if not existing
const existingDemoBooking = await Booking.findOne({ user: demoCustomer._id });
if (!existingDemoBooking && primaryShowForDemoBooking) {
  const bookedSeats = ['C4', 'C5'];
  const sampleBooking = await Booking.create({
    user: demoCustomer._id,
    show: primaryShowForDemoBooking._id,
    movie: primaryShowForDemoBooking.movie,
    theatre: primaryShowForDemoBooking.theatre,
    seats: bookedSeats,
    totalAmount: primaryShowForDemoBooking.price * bookedSeats.length,
    status: 'confirmed',
    paymentStatus: 'demo-paid'
  });

  // Mark seats as booked
  primaryShowForDemoBooking.seats.forEach(s => {
    if (bookedSeats.includes(s.seatNumber)) {
      s.status = 'booked';
      s.booking = sampleBooking._id;
    }
  });
  await primaryShowForDemoBooking.save();
  console.log('Seeded sample booking for demo user.');
}

console.log('Seed completed successfully!');
console.log('----------------------------------------------------');
console.log('Admin Account: admin@imovies.local / Admin123!');
console.log('Demo User:     user@imovies.local  / User123!');
console.log('----------------------------------------------------');

await mongoose.disconnect();
