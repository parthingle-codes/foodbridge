require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../src/config/database');

async function seed() {
  const client = await db.getClient();
  try {
    console.log('🌱 Seeding database...\n');
    await client.query('BEGIN');

    // Hash password for all demo users
    const passwordHash = await bcrypt.hash('password123', 10);

    // ============================================
    // USERS
    // ============================================
    console.log('Creating users...');

    // Donor
    const donor = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, sub_role)
       VALUES ('11111111-1111-1111-1111-111111111111', 'donor@foodbridge.demo', $1, 'Rajesh Kumar', '+91-9876543210', 'DONOR', 'INDIVIDUAL')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      [passwordHash]
    );

    // NGO 1
    const ngo1 = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, sub_role)
       VALUES ('22222222-2222-2222-2222-222222222222', 'ngo1@foodbridge.demo', $1, 'Annapurna Foundation', '+91-9876543211', 'DISTRIBUTOR', 'NGO')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      [passwordHash]
    );

    // NGO 2
    const ngo2 = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, sub_role)
       VALUES ('33333333-3333-3333-3333-333333333333', 'ngo2@foodbridge.demo', $1, 'Feeding India Network', '+91-9876543212', 'DISTRIBUTOR', 'NGO')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      [passwordHash]
    );

    // Volunteer 1
    const vol1 = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, sub_role)
       VALUES ('44444444-4444-4444-4444-444444444444', 'volunteer1@foodbridge.demo', $1, 'Priya Sharma', '+91-9876543213', 'VOLUNTEER', 'INDEPENDENT')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      [passwordHash]
    );

    // Volunteer 2
    const vol2 = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, sub_role)
       VALUES ('55555555-5555-5555-5555-555555555555', 'volunteer2@foodbridge.demo', $1, 'Amit Patel', '+91-9876543214', 'VOLUNTEER', 'NGO_PARTNER')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      [passwordHash]
    );

    // Biofarm
    const biofarm = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, sub_role)
       VALUES ('66666666-6666-6666-6666-666666666666', 'biofarm@foodbridge.demo', $1, 'Green Earth Biofarm', '+91-9876543215', 'BIOFARM', 'WASTE_RECOVERY_ORGANIZATION')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
       RETURNING id`,
      [passwordHash]
    );

    // Admin
    await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, phone, role, sub_role)
       VALUES ('77777777-7777-7777-7777-777777777777', 'admin@foodbridge.demo', $1, 'System Admin', '+91-9876543216', 'ADMIN', 'ADMIN')
       ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name`,
      [passwordHash]
    );

    console.log('✅ Users created');

    // ============================================
    // DONOR PROFILE
    // ============================================
    console.log('Creating donor profile...');
    await client.query(
      `INSERT INTO donor_profiles (user_id, organization_name, address, latitude, longitude, location)
       VALUES ($1, 'Kumar Catering Services', '123 MG Road, Bangalore, Karnataka', 12.9716, 77.5946,
               ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography)
       ON CONFLICT (user_id) DO UPDATE SET organization_name = EXCLUDED.organization_name`,
      [donor.rows[0].id]
    );
    console.log('✅ Donor profile created');

    // ============================================
    // ORGANIZATIONS (NGOs + Biofarm)
    // ============================================
    console.log('Creating organizations...');

    // NGO 1 - Annapurna Foundation (3 km from donor)
    await client.query(
      `INSERT INTO organizations (id, user_id, name, type, registration_number, description,
         address, latitude, longitude, location, service_radius_km,
         accepted_categories, daily_capacity_kg, current_load_kg,
         operating_hours, operating_days, is_verified, is_active, verified_at)
       VALUES (
         'aaaa1111-1111-1111-1111-111111111111',
         $1, 'Annapurna Foundation', 'NGO', 'NGO-KA-2024-001',
         'We distribute surplus food to underprivileged communities in Bangalore.',
         '456 Church Street, Bangalore, Karnataka',
         12.9750, 77.6100,
         ST_SetSRID(ST_MakePoint(77.6100, 12.9750), 4326)::geography,
         30, ARRAY['COOKED_MEALS','RAW_VEGETABLES','RAW_FRUITS','BAKERY','DAIRY','GRAINS_CEREALS','CANNED_PACKAGED','MIXED'],
         200, 30,
         '{"start":"07:00","end":"21:00"}', ARRAY[1,2,3,4,5,6,7],
         true, true, NOW()
       )
       ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name`,
      [ngo1.rows[0].id]
    );

    // NGO 2 - Feeding India Network (8 km from donor)
    await client.query(
      `INSERT INTO organizations (id, user_id, name, type, registration_number, description,
         address, latitude, longitude, location, service_radius_km,
         accepted_categories, daily_capacity_kg, current_load_kg,
         operating_hours, operating_days, is_verified, is_active, verified_at)
       VALUES (
         'aaaa2222-2222-2222-2222-222222222222',
         $1, 'Feeding India Network', 'NGO', 'NGO-KA-2024-002',
         'Large-scale food redistribution network covering South Bangalore.',
         '789 Jayanagar, Bangalore, Karnataka',
         12.9250, 77.5800,
         ST_SetSRID(ST_MakePoint(77.5800, 12.9250), 4326)::geography,
         40, ARRAY['COOKED_MEALS','RAW_VEGETABLES','BAKERY','SNACKS','BEVERAGES','MIXED'],
         500, 100,
         '{"start":"08:00","end":"20:00"}', ARRAY[1,2,3,4,5,6],
         true, true, NOW()
       )
       ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name`,
      [ngo2.rows[0].id]
    );

    // Biofarm Organization
    await client.query(
      `INSERT INTO organizations (id, user_id, name, type, registration_number, description,
         address, latitude, longitude, location, service_radius_km,
         accepted_categories, daily_capacity_kg, current_load_kg,
         operating_hours, operating_days, is_verified, is_active, verified_at)
       VALUES (
         'aaaa3333-3333-3333-3333-333333333333',
         $1, 'Green Earth Biofarm', 'WASTE_RECOVERY_ORGANIZATION', 'BIO-KA-2024-001',
         'Organic waste recovery and composting facility in outskirts of Bangalore.',
         '101 Whitefield, Bangalore, Karnataka',
         12.9698, 77.7500,
         ST_SetSRID(ST_MakePoint(77.7500, 12.9698), 4326)::geography,
         50, ARRAY['COOKED_MEALS','RAW_VEGETABLES','RAW_FRUITS','BAKERY','DAIRY','GRAINS_CEREALS','MIXED','OTHER'],
         1000, 200,
         '{"start":"06:00","end":"18:00"}', ARRAY[1,2,3,4,5,6],
         true, true, NOW()
       )
       ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name`,
      [biofarm.rows[0].id]
    );

    console.log('✅ Organizations created');

    // ============================================
    // VOLUNTEER PROFILES
    // ============================================
    console.log('Creating volunteer profiles...');

    await client.query(
      `INSERT INTO volunteer_profiles (user_id, organization_id, vehicle_type, max_carry_kg,
         latitude, longitude, location, is_available, availability_start, availability_end, available_days)
       VALUES ($1, 'aaaa1111-1111-1111-1111-111111111111', 'BIKE', 15,
               12.9730, 77.6050,
               ST_SetSRID(ST_MakePoint(77.6050, 12.9730), 4326)::geography,
               true, '08:00', '20:00', ARRAY[1,2,3,4,5,6,7])
       ON CONFLICT (user_id) DO UPDATE SET vehicle_type = EXCLUDED.vehicle_type`,
      [vol1.rows[0].id]
    );

    await client.query(
      `INSERT INTO volunteer_profiles (user_id, organization_id, vehicle_type, max_carry_kg,
         latitude, longitude, location, is_available, availability_start, availability_end, available_days)
       VALUES ($1, 'aaaa2222-2222-2222-2222-222222222222', 'CAR', 50,
               12.9300, 77.5850,
               ST_SetSRID(ST_MakePoint(77.5850, 12.9300), 4326)::geography,
               true, '09:00', '18:00', ARRAY[1,2,3,4,5])
       ON CONFLICT (user_id) DO UPDATE SET vehicle_type = EXCLUDED.vehicle_type`,
      [vol2.rows[0].id]
    );

    console.log('✅ Volunteer profiles created');

    // ============================================
    // FOOD LISTINGS
    // ============================================
    console.log('Creating food listings...');

    // Listing 1 - AVAILABLE cooked meals
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(14, 0, 0, 0);

    await client.query(
      `INSERT INTO food_listings (id, donor_id, food_name, food_category, description,
         quantity, unit, estimated_servings, preparation_date_time,
         pickup_start_time, pickup_end_time, storage_notes, allergen_notes,
         food_condition, pickup_address, latitude, longitude, location, status)
       VALUES (
         'bbbb1111-1111-1111-1111-111111111111',
         $1, 'Vegetable Biryani', 'COOKED_MEALS',
         'Freshly prepared vegetable biryani from a corporate event. Basmati rice with mixed vegetables.',
         25, 'KG', 100,
         $2, $3, $4,
         'Stored in insulated containers. Maintained at proper temperature.',
         'Contains: nuts, dairy. Vegetarian.',
         'EXCELLENT',
         '123 MG Road, Bangalore, Karnataka',
         12.9716, 77.5946,
         ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
         'AVAILABLE'
       )
       ON CONFLICT DO NOTHING`,
      [
        donor.rows[0].id,
        new Date().toISOString(),
        tomorrow.toISOString(),
        tomorrowEnd.toISOString(),
      ]
    );

    // Listing 2 - AVAILABLE bakery items
    const tomorrow2 = new Date();
    tomorrow2.setDate(tomorrow2.getDate() + 1);
    tomorrow2.setHours(8, 0, 0, 0);
    const tomorrow2End = new Date(tomorrow2);
    tomorrow2End.setHours(12, 0, 0, 0);

    await client.query(
      `INSERT INTO food_listings (id, donor_id, food_name, food_category, description,
         quantity, unit, estimated_servings, preparation_date_time,
         pickup_start_time, pickup_end_time, storage_notes,
         food_condition, pickup_address, latitude, longitude, location, status)
       VALUES (
         'bbbb2222-2222-2222-2222-222222222222',
         $1, 'Assorted Bread and Pastries', 'BAKERY',
         'Day-old bread loaves, croissants, and muffins from bakery. Still fresh.',
         10, 'KG', 40,
         $2, $3, $4,
         'Stored in cool, dry place. Individually wrapped.',
         'GOOD',
         '123 MG Road, Bangalore, Karnataka',
         12.9716, 77.5946,
         ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
         'AVAILABLE'
       )
       ON CONFLICT DO NOTHING`,
      [
        donor.rows[0].id,
        new Date().toISOString(),
        tomorrow2.toISOString(),
        tomorrow2End.toISOString(),
      ]
    );

    // Listing 3 - DRAFT raw vegetables
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(9, 0, 0, 0);
    const dayAfterEnd = new Date(dayAfter);
    dayAfterEnd.setHours(15, 0, 0, 0);

    await client.query(
      `INSERT INTO food_listings (id, donor_id, food_name, food_category, description,
         quantity, unit, estimated_servings,
         pickup_start_time, pickup_end_time,
         food_condition, pickup_address, latitude, longitude, location, status)
       VALUES (
         'bbbb3333-3333-3333-3333-333333333333',
         $1, 'Mixed Raw Vegetables', 'RAW_VEGETABLES',
         'Fresh vegetables - potatoes, onions, tomatoes, carrots from wholesale surplus.',
         50, 'KG', 200,
         $2, $3,
         'GOOD',
         '123 MG Road, Bangalore, Karnataka',
         12.9716, 77.5946,
         ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
         'DRAFT'
       )
       ON CONFLICT DO NOTHING`,
      [
        donor.rows[0].id,
        dayAfter.toISOString(),
        dayAfterEnd.toISOString(),
      ]
    );

    // Listing 4 - EXPIRED (for waste recovery testing)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(10, 0, 0, 0);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(14, 0, 0, 0);

    await client.query(
      `INSERT INTO food_listings (id, donor_id, food_name, food_category, description,
         quantity, unit, estimated_servings,
         pickup_start_time, pickup_end_time,
         food_condition, pickup_address, latitude, longitude, location, status)
       VALUES (
         'bbbb4444-4444-4444-4444-444444444444',
         $1, 'Rice and Curry (Expired)', 'COOKED_MEALS',
         'Leftover rice and curry from cafeteria. Pickup window expired.',
         15, 'KG', 60,
         $2, $3,
         'FAIR',
         '123 MG Road, Bangalore, Karnataka',
         12.9716, 77.5946,
         ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
         'EXPIRED'
       )
       ON CONFLICT DO NOTHING`,
      [
        donor.rows[0].id,
        yesterday.toISOString(),
        yesterdayEnd.toISOString(),
      ]
    );

    // Listing 5 - AVAILABLE fruits
    await client.query(
      `INSERT INTO food_listings (id, donor_id, food_name, food_category, description,
         quantity, unit, estimated_servings,
         pickup_start_time, pickup_end_time, storage_notes,
         food_condition, pickup_address, latitude, longitude, location, status)
       VALUES (
         'bbbb5555-5555-5555-5555-555555555555',
         $1, 'Seasonal Fruits Basket', 'RAW_FRUITS',
         'Bananas, apples, and oranges from fruit vendor surplus.',
         20, 'KG', 80,
         $2, $3,
         'Stored at room temperature. No refrigeration needed.',
         'EXCELLENT',
         '123 MG Road, Bangalore, Karnataka',
         12.9716, 77.5946,
         ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
         'AVAILABLE'
       )
       ON CONFLICT DO NOTHING`,
      [
        donor.rows[0].id,
        tomorrow.toISOString(),
        tomorrowEnd.toISOString(),
      ]
    );

    console.log('✅ Food listings created');

    // ============================================
    // WASTE RECOVERY LISTING (for expired listing)
    // ============================================
    console.log('Creating waste recovery listing...');
    await client.query(
      `INSERT INTO waste_recovery_listings (id, original_listing_id, material_category,
         quantity, unit, collection_start, collection_end,
         pickup_address, latitude, longitude, location,
         waste_reason, recovery_suitability, recovery_status)
       VALUES (
         'cccc1111-1111-1111-1111-111111111111',
         'bbbb4444-4444-4444-4444-444444444444',
         'COOKED_MEALS', 15, 'KG',
         $1, $2,
         '123 MG Road, Bangalore, Karnataka',
         12.9716, 77.5946,
         ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)::geography,
         'EXPIRED_NO_RESERVATION',
         'Suitable for composting. Not suitable for human consumption.',
         'AVAILABLE'
       )
       ON CONFLICT DO NOTHING`,
      [tomorrow.toISOString(), tomorrowEnd.toISOString()]
    );

    // Update the expired listing to WASTE_RECOVERY_PENDING
    await client.query(
      `UPDATE food_listings SET status = 'WASTE_RECOVERY_PENDING' WHERE id = 'bbbb4444-4444-4444-4444-444444444444'`
    );

    console.log('✅ Waste recovery listing created');

    await client.query('COMMIT');

    console.log('\n🎉 Seed completed successfully!\n');
    console.log('='.repeat(60));
    console.log('DEMO CREDENTIALS');
    console.log('='.repeat(60));
    console.log('All accounts use password: password123');
    console.log('');
    console.log('Donor:       donor@foodbridge.demo');
    console.log('NGO 1:       ngo1@foodbridge.demo');
    console.log('NGO 2:       ngo2@foodbridge.demo');
    console.log('Volunteer 1: volunteer1@foodbridge.demo');
    console.log('Volunteer 2: volunteer2@foodbridge.demo');
    console.log('Biofarm:     biofarm@foodbridge.demo');
    console.log('Admin:       admin@foodbridge.demo');
    console.log('');
    console.log('Demo OTP:    123456');
    console.log('='.repeat(60));

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error.message);
    console.error(error.stack);
    throw error;
  } finally {
    client.release();
    await db.pool.end();
  }
}

if (require.main === module) {
  seed().catch(() => process.exit(1));
}

module.exports = seed;
