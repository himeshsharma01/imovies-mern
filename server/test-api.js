const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- STARTING IMOVIES E2E API VERIFICATION ---');

  // 1. Health check
  console.log('1. Testing /health...');
  const healthRes = await request('/health');
  console.log('   Health response:', healthRes.data);

  // 2. Auth: Admin Login
  console.log('2. Testing Admin Login...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@imovies.local', password: 'Admin123!' })
  });
  const adminToken = adminLogin.data.token;
  console.log('   Admin logged in successfully! Role:', adminLogin.data.user.role);

  // 3. Auth: User Login
  console.log('3. Testing User Login...');
  const userLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'user@imovies.local', password: 'User123!' })
  });
  const userToken = userLogin.data.token;
  console.log('   User logged in successfully! Name:', userLogin.data.user.name);

  // 4. Movies: Fetch and Search
  console.log('4. Testing Movies catalog search & filter...');
  const moviesRes = await request('/movies?genre=Sci-Fi&sort=rating');
  console.log(`   Found ${moviesRes.data.items.length} Sci-Fi movies. First: ${moviesRes.data.items[0]?.title}`);

  // 5. Theatres
  console.log('5. Testing Theatres list...');
  const theatresRes = await request('/theatres');
  console.log(`   Found ${theatresRes.data.length} cinema locations.`);

  // 6. Shows
  console.log('6. Testing Shows listing...');
  const showsRes = await request('/shows?upcoming=true');
  console.log(`   Found ${showsRes.data.length} upcoming shows.`);
  if (showsRes.data.length === 0) throw new Error('No upcoming shows found');
  const targetShow = showsRes.data[0];
  console.log(`   Target Show: Movie "${targetShow.movie?.title}" at "${targetShow.theatre?.name}" with ${targetShow.availableSeats} available seats.`);

  // Find 2 available seats
  const availableSeatNumbers = targetShow.seats
    .filter(s => s.status === 'available')
    .slice(0, 2)
    .map(s => s.seatNumber);

  if (availableSeatNumbers.length < 2) {
    throw new Error('Not enough available seats in target show for test');
  }
  console.log('   Selected seats for booking test:', availableSeatNumbers);

  // 7. Booking: Reserve Seats
  console.log('7. Testing Booking creation as User...');
  const bookingRes = await request('/bookings', {
    method: 'POST',
    headers: { Authorization: `Bearer ${userToken}` },
    body: JSON.stringify({
      showId: targetShow._id,
      seats: availableSeatNumbers,
      paymentMethod: 'demo-upi'
    })
  });
  const createdBooking = bookingRes.data;
  console.log(`   Booking created! ID: ${createdBooking._id}, Total Amount: INR ${createdBooking.totalAmount}, Status: ${createdBooking.status}`);

  // 8. Fetch Single Booking
  console.log('8. Testing Single Booking retrieval...');
  const singleBookingRes = await request(`/bookings/${createdBooking._id}`, {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log(`   Retrieved booking verified! Movie: ${singleBookingRes.data.movie?.title}`);

  // 9. Fetch User's My Bookings
  console.log('9. Testing My Bookings retrieval...');
  const myBookingsRes = await request('/bookings/mine', {
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log(`   User has ${myBookingsRes.data.length} bookings in history.`);

  // 10. Cancel Booking
  console.log('10. Testing Booking cancellation and refund...');
  const cancelRes = await request(`/bookings/${createdBooking._id}/cancel`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${userToken}` }
  });
  console.log(`   Booking cancelled! Status: ${cancelRes.data.status}, Payment Status: ${cancelRes.data.paymentStatus}`);

  // 11. Admin Stats & Users
  console.log('11. Testing Admin Stats & Users directory...');
  const statsRes = await request('/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`   Admin Stats: Revenue = INR ${statsRes.data.totalRevenue}, Movies = ${statsRes.data.totalMovies}, Shows = ${statsRes.data.totalShows}`);

  const usersRes = await request('/admin/users', {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log(`   Admin Users: ${usersRes.data.length} registered accounts.`);

  console.log('--- ALL E2E API VERIFICATIONS PASSED SUCCESSFULLY! ---');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err.data || err.message);
  process.exit(1);
});
