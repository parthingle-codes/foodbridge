const http = require('http');
const { Readable } = require('stream');
const app = require('../src/app');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const socket = new Readable({ read() {} });
    socket.remoteAddress = '127.0.0.1';
    socket.destroy = () => {};

    const req = new http.IncomingMessage(socket);
    req.socket = socket;
    req.connection = socket;
    req.method = method;
    req.url = '/api' + path;
    req.headers = {
      'content-type': 'application/json',
      host: 'localhost:5000',
    };

    if (token) {
      req.headers['authorization'] = `Bearer ${token}`;
    }

    const res = new http.ServerResponse(req);
    let resBody = '';

    res.write = function (chunk) {
      if (chunk) resBody += chunk.toString();
      return true;
    };

    res.end = function (chunk) {
      if (chunk) resBody += chunk.toString();
      try {
        const json = JSON.parse(resBody);
        resolve({ status: res.statusCode, body: json });
      } catch (e) {
        resolve({ status: res.statusCode, text: resBody, body: {} });
      }
    };

    if (body) {
      const bodyStr = JSON.stringify(body);
      req.headers['content-length'] = Buffer.byteLength(bodyStr);
      req.push(bodyStr);
    }
    req.push(null);

    app(req, res);
  });
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 FOODBRIDGE E2E INTEGRATION & API CONTRACT TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message} ${details ? '-> ' + details : ''}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.success === true, 'GET /api/health returns 200');

    // 2. Auth: Register new donor (frontend contract format)
    const newReg = await request('POST', '/auth/register', {
      name: 'Oberoi Grand Kitchen',
      email: `oberoi_${Date.now()}@foodbridge.demo`,
      password: 'password123',
      phone: '+91-9988776655',
      role: 'donor',
      address: 'MG Road, Bangalore',
    });
    assert(newReg.status === 201 && newReg.body.data.token, 'POST /api/auth/register supports frontend contract');

    // 3. Auth: Login demo donor
    const donorLogin = await request('POST', '/auth/login', {
      email: 'donor@foodbridge.demo',
      password: 'password123',
    });
    assert(donorLogin.status === 200 && donorLogin.body.data.token, 'POST /api/auth/login succeeds for donor');
    const donorToken = donorLogin.body.data.token;

    // 4. Auth: Login demo NGO
    const ngoLogin = await request('POST', '/auth/login', {
      email: 'ngo1@foodbridge.demo',
      password: 'password123',
    });
    assert(ngoLogin.status === 200 && ngoLogin.body.data.token, 'POST /api/auth/login succeeds for NGO');
    const ngoToken = ngoLogin.body.data.token;

    // 5. Auth: Login demo Volunteer
    const volLogin = await request('POST', '/auth/login', {
      email: 'volunteer1@foodbridge.demo',
      password: 'password123',
    });
    assert(volLogin.status === 200 && volLogin.body.data.token, 'POST /api/auth/login succeeds for Volunteer');
    const volToken = volLogin.body.data.token;

    // 6. Auth: Login demo Biofarm
    const bioLogin = await request('POST', '/auth/login', {
      email: 'biofarm@foodbridge.demo',
      password: 'password123',
    });
    assert(bioLogin.status === 200 && bioLogin.body.data.token, 'POST /api/auth/login succeeds for Biofarm');
    const bioToken = bioLogin.body.data.token;

    // 7. Auth: Login demo Admin
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@foodbridge.demo',
      password: 'password123',
    });
    assert(adminLogin.status === 200 && adminLogin.body.data.token, 'POST /api/auth/login succeeds for Admin');
    const adminToken = adminLogin.body.data.token;

    // 8. Auth: Profile
    const profile = await request('GET', '/auth/profile', null, donorToken);
    assert(profile.status === 200 && profile.body.data.email === 'donor@foodbridge.demo', 'GET /api/auth/profile returns correct user profile');

    // 9. Donor Dashboard
    const donorDash = await request('GET', '/donor/dashboard', null, donorToken);
    assert(donorDash.status === 200 && donorDash.body.data.totalDonations !== undefined, 'GET /api/donor/dashboard returns stats');

    // 10. Donor Listings
    const donorListings = await request('GET', '/donor/listings', null, donorToken);
    assert(donorListings.status === 200 && Array.isArray(donorListings.body.data), 'GET /api/donor/listings returns donor items');

    // 11. Create Food Listing
    const newListing = await request(
      'POST',
      '/food-listings',
      {
        foodName: 'Fresh Paneer Tikka & Naan',
        category: 'cooked_meals',
        quantity: 20,
        unit: 'kg',
        estimatedServings: 80,
        foodCondition: 'freshly_prepared',
        pickupStartTime: new Date().toISOString(),
        pickupEndTime: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
        storageInstructions: 'Keep in warm insulated container',
        allergens: ['dairy'],
        pickupAddress: 'Lavelle Road, Bangalore, Karnataka',
        latitude: 12.9716,
        longitude: 77.5946,
      },
      donorToken
    );
    assert(newListing.status === 201 && newListing.body.data.id, 'POST /api/food-listings creates listing');
    const listingId = newListing.body.data.id;

    // 12. Get Food Listing By ID
    const getById = await request('GET', `/food-listings/${listingId}`, null, donorToken);
    assert(getById.status === 200 && getById.body.data.id === listingId, 'GET /api/food-listings/:id returns details');

    // 13. Intelligent Matching Engine
    const matches = await request('GET', `/matching/${listingId}`, null, donorToken);
    assert(matches.status === 200 && matches.body.data.matches.length > 0, 'GET /api/matching/:listingId returns ranked matches');
    assert(matches.body.data.matches[0].matchScore > 0, 'Matching algorithm applies multi-weighted scoring');

    // 14. Organization Available Food
    const availFood = await request('GET', '/organization/available-food', null, ngoToken);
    assert(availFood.status === 200 && Array.isArray(availFood.body.data), 'GET /api/organization/available-food lists available food');

    // 15. Organization Reserve Listing
    const reserveRes = await request('POST', `/organization/listings/${listingId}/reserve`, { notes: 'Reserving for evening shelter' }, ngoToken);
    assert(reserveRes.status === 200 && reserveRes.body.data.listing.status === 'RESERVED', 'POST /api/organization/listings/:id/reserve reserves listing');

    // 16. Organization Accept Listing
    const acceptRes = await request('POST', `/organization/listings/${listingId}/accept`, {}, ngoToken);
    assert(acceptRes.status === 200 && (acceptRes.body.data.listing.status === 'ACCEPTED' || acceptRes.body.data.listing.status === 'PICKUP_ASSIGNED'), 'POST /api/organization/listings/:id/accept accepts listing');

    // 17. Volunteer Assignments
    const volAssignments = await request('GET', '/volunteer/assignments', null, volToken);
    assert(volAssignments.status === 200 && volAssignments.body.data.length > 0, 'GET /api/volunteer/assignments returns active tasks');
    const assignmentId = volAssignments.body.data[0].id;

    // 18. Donor Safety Check (Check 1 of 2)
    const donorSafety = await request(
      'POST',
      `/safety/donor-check/${listingId}`,
      {
        preparationTimeConfirmed: true,
        storageCondition: 'heated',
        packaging: 'sealed_container',
        foodAppearance: 'fresh',
        allergensListed: 'dairy',
        visibleContamination: false,
        safetyConfirmed: true,
      },
      donorToken
    );
    assert(donorSafety.status === 201 && donorSafety.body.data.result === 'pass', 'POST /api/safety/donor-check/:listingId passes donor safety check');

    // 19. Pickup Safety Check (Check 2 of 2)
    const pickupSafety = await request(
      'POST',
      `/safety/pickup-check/${assignmentId}`,
      {
        packagingIntegrity: 'intact',
        foodAppearanceSmell: 'normal',
        temperatureAppropriate: 'yes',
        transportContainer: 'insulated',
        visibleContamination: false,
        safetyConfirmed: true,
      },
      volToken
    );
    assert(pickupSafety.status === 201 && pickupSafety.body.data.result === 'pass', 'POST /api/safety/pickup-check/:assignmentId passes pickup safety check');

    // 20. Pickup OTP Flow
    const pickupOtpReq = await request('POST', `/otp/pickup/${assignmentId}/request`, {}, volToken);
    assert(pickupOtpReq.status === 201 && (pickupOtpReq.body.data.demoOtp || pickupOtpReq.body.data.otp), 'POST /api/otp/pickup/:assignmentId/request generates OTP');
    const pickupOtp = pickupOtpReq.body.data.demoOtp || pickupOtpReq.body.data.otp || '123456';

    const pickupOtpVer = await request('POST', `/otp/pickup/${assignmentId}/verify`, { otp: pickupOtp }, volToken);
    assert(pickupOtpVer.status === 200 && pickupOtpVer.body.data.verified === true, 'POST /api/otp/pickup/:assignmentId/verify authorizes pickup');

    // 21. Delivery OTP Flow
    const deliveryOtpReq = await request('POST', `/otp/delivery/${assignmentId}/request`, {}, volToken);
    assert(deliveryOtpReq.status === 201 && (deliveryOtpReq.body.data.demoOtp || deliveryOtpReq.body.data.otp), 'POST /api/otp/delivery/:assignmentId/request generates OTP');
    const deliveryOtp = deliveryOtpReq.body.data.demoOtp || deliveryOtpReq.body.data.otp || '123456';

    const deliveryOtpVer = await request('POST', `/otp/delivery/${assignmentId}/verify`, { otp: deliveryOtp }, volToken);
    assert(deliveryOtpVer.status === 200 && deliveryOtpVer.body.data.verified === true, 'POST /api/otp/delivery/:assignmentId/verify authorizes delivery');

    // 22. Rewards & Badges
    const rewards = await request('GET', '/rewards', null, donorToken);
    assert(rewards.status === 200 && rewards.body.data.totalCredits > 0, 'GET /api/rewards returns credit balance');

    const leaderboard = await request('GET', '/rewards/leaderboard', null, donorToken);
    assert(leaderboard.status === 200 && leaderboard.body.data.length > 0, 'GET /api/rewards/leaderboard returns ranked donors');

    const badges = await request('GET', '/rewards/badges', null, donorToken);
    assert(badges.status === 200 && badges.body.data.length > 0, 'GET /api/rewards/badges returns achievement badges');

    // 23. Waste Recovery Workflow (Biofarm)
    const wasteList = await request('GET', '/waste-recovery/available', null, bioToken);
    assert(wasteList.status === 200 && wasteList.body.data.length > 0, 'GET /api/waste-recovery/available returns opportunities');
    const wasteId = wasteList.body.data[0].id;

    const wasteAccept = await request('POST', `/waste-recovery/${wasteId}/accept`, {}, bioToken);
    assert(wasteAccept.status === 200, 'POST /api/waste-recovery/:id/accept reserves recovery');

    const wasteCollect = await request('POST', `/waste-recovery/${wasteId}/collect`, { collectedQuantity: 15, notes: 'Collected for composting' }, bioToken);
    assert(wasteCollect.status === 200 && wasteCollect.body.data.recovery_status === 'COLLECTED', 'POST /api/waste-recovery/:id/collect records collection');

    const wasteProcess = await request('PUT', `/waste-recovery/${wasteId}/processing`, { method: 'composting', status: 'completed', recoveredQuantity: 15 }, bioToken);
    assert(wasteProcess.status === 200 && wasteProcess.body.data.recovery_status === 'PROCESSED', 'PUT /api/waste-recovery/:id/processing updates processing');

    // 24. Biofarm Dashboard
    const bioDash = await request('GET', '/biofarm/dashboard', null, bioToken);
    assert(bioDash.status === 200 && bioDash.body.data.processedKg > 0, 'GET /api/biofarm/dashboard returns metrics');

    // 25. Impact Analytics
    const analytics = await request('GET', '/analytics/overview', null, donorToken);
    assert(analytics.status === 200 && analytics.body.data.totalRescued > 0, 'GET /api/analytics/overview returns impact stats');

    const trends = await request('GET', '/analytics/donation-trends', null, donorToken);
    assert(trends.status === 200 && Array.isArray(trends.body.data), 'GET /api/analytics/donation-trends returns monthly series');

    // 26. Notifications
    const notifs = await request('GET', '/notifications', null, donorToken);
    assert(notifs.status === 200 && Array.isArray(notifs.body.data), 'GET /api/notifications returns user alerts');

    const unread = await request('GET', '/notifications/unread-count', null, donorToken);
    assert(unread.status === 200 && unread.body.data.count !== undefined, 'GET /api/notifications/unread-count returns count');

    // 27. Map Markers
    const markers = await request('GET', '/map/markers', null, donorToken);
    assert(markers.status === 200 && markers.body.data.length > 0, 'GET /api/map/markers returns live map points');

    // 28. Admin Dashboard
    const adminDash = await request('GET', '/admin/dashboard', null, adminToken);
    assert(adminDash.status === 200 && adminDash.body.data.totalUsers > 0, 'GET /api/admin/dashboard returns system overview');

    console.log(`\n======================================================`);
    console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`======================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
