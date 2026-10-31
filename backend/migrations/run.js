const db = require('../src/config/database');

const migration = `
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL CHECK (role IN ('DONOR','DISTRIBUTOR','VOLUNTEER','BIOFARM','ADMIN')),
  sub_role VARCHAR(30),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================
-- ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(30) NOT NULL,
  registration_number VARCHAR(100),
  description TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(Point, 4326),
  service_radius_km DOUBLE PRECISION DEFAULT 25,
  accepted_categories TEXT[] DEFAULT '{}',
  daily_capacity_kg DOUBLE PRECISION DEFAULT 100,
  current_load_kg DOUBLE PRECISION DEFAULT 0,
  operating_hours JSONB DEFAULT '{"start":"08:00","end":"20:00"}',
  operating_days INT[] DEFAULT '{1,2,3,4,5,6,7}',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  verified_at TIMESTAMPTZ,
  telegram_chat_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_user ON organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_org_location ON organizations USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_org_verified ON organizations(is_verified, is_active);

-- ============================================
-- DONOR PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS donor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_name VARCHAR(255),
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(Point, 4326),
  total_donations INT DEFAULT 0,
  total_quantity_kg DOUBLE PRECISION DEFAULT 0,
  rating DOUBLE PRECISION DEFAULT 5.0,
  telegram_chat_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_donor_user ON donor_profiles(user_id);

-- ============================================
-- VOLUNTEER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS volunteer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  vehicle_type VARCHAR(50),
  max_carry_kg DOUBLE PRECISION DEFAULT 20,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(Point, 4326),
  is_available BOOLEAN DEFAULT true,
  availability_start TIME,
  availability_end TIME,
  available_days INT[] DEFAULT '{1,2,3,4,5,6,7}',
  total_deliveries INT DEFAULT 0,
  total_distance_km DOUBLE PRECISION DEFAULT 0,
  rating DOUBLE PRECISION DEFAULT 5.0,
  telegram_chat_id VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_vol_user ON volunteer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vol_org ON volunteer_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_vol_location ON volunteer_profiles USING GIST(location);

-- ============================================
-- FOOD LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS food_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES users(id),
  food_name VARCHAR(255) NOT NULL,
  food_category VARCHAR(30) NOT NULL,
  description TEXT,
  quantity DOUBLE PRECISION NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'KG',
  estimated_servings INT,
  preparation_date_time TIMESTAMPTZ,
  pickup_start_time TIMESTAMPTZ NOT NULL,
  pickup_end_time TIMESTAMPTZ NOT NULL,
  storage_notes TEXT,
  allergen_notes TEXT,
  food_condition VARCHAR(20) DEFAULT 'GOOD',
  pickup_address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location GEOGRAPHY(Point, 4326),
  status VARCHAR(30) DEFAULT 'DRAFT',
  reserved_by UUID REFERENCES organizations(id),
  reserved_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  served_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listing_donor ON food_listings(donor_id);
CREATE INDEX IF NOT EXISTS idx_listing_status ON food_listings(status);
CREATE INDEX IF NOT EXISTS idx_listing_location ON food_listings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_listing_pickup_end ON food_listings(pickup_end_time);

-- ============================================
-- FOOD IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS food_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES food_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_img_listing ON food_images(listing_id);

-- ============================================
-- MATCHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES food_listings(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  distance_km DOUBLE PRECISION,
  match_score DOUBLE PRECISION,
  score DOUBLE PRECISION,
  rank INT,
  score_breakdown JSONB,
  reasons TEXT[],
  status VARCHAR(20) DEFAULT 'PENDING',
  notified_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, organization_id)
);

CREATE INDEX IF NOT EXISTS idx_match_listing ON matches(listing_id);
CREATE INDEX IF NOT EXISTS idx_match_org ON matches(organization_id);

-- ============================================
-- RESERVATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES food_listings(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status VARCHAR(20) DEFAULT 'PENDING',
  notes TEXT,
  reserved_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_res_listing ON reservations(listing_id);
CREATE INDEX IF NOT EXISTS idx_res_org ON reservations(organization_id);
CREATE INDEX IF NOT EXISTS idx_res_status ON reservations(status);

-- ============================================
-- VOLUNTEER ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES food_listings(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  volunteer_id UUID NOT NULL REFERENCES users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  pickup_status VARCHAR(20) DEFAULT 'PENDING',
  delivery_status VARCHAR(20) DEFAULT 'PENDING',
  pickup_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assign_listing ON volunteer_assignments(listing_id);
CREATE INDEX IF NOT EXISTS idx_assign_volunteer ON volunteer_assignments(volunteer_id);

-- ============================================
-- FOOD SAFETY CHECKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS food_safety_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  check_type VARCHAR(20) NOT NULL CHECK (check_type IN ('DONOR_CHECK','PICKUP_CHECK')),
  listing_id UUID NOT NULL REFERENCES food_listings(id),
  checked_by UUID NOT NULL REFERENCES users(id),
  checklist_answers JSONB NOT NULL,
  result VARCHAR(20) NOT NULL CHECK (result IN ('PASSED','FAILED','FLAGGED')),
  notes TEXT,
  evidence_image TEXT,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_safety_listing ON food_safety_checks(listing_id);
CREATE INDEX IF NOT EXISTS idx_safety_type ON food_safety_checks(check_type);

-- ============================================
-- OTP VERIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES food_listings(id),
  assignment_id UUID REFERENCES volunteer_assignments(id),
  otp_type VARCHAR(20) NOT NULL CHECK (otp_type IN ('PICKUP','DELIVERY')),
  otp_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_listing ON otp_verifications(listing_id);

-- ============================================
-- HANDOVER RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS handover_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES food_listings(id),
  assignment_id UUID REFERENCES volunteer_assignments(id),
  handover_type VARCHAR(20) NOT NULL CHECK (handover_type IN ('PICKUP','DELIVERY')),
  from_user_id UUID REFERENCES users(id),
  to_user_id UUID REFERENCES users(id),
  otp_verification_id UUID REFERENCES otp_verifications(id),
  safety_check_id UUID REFERENCES food_safety_checks(id),
  notes TEXT,
  handover_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_handover_listing ON handover_records(listing_id);

-- ============================================
-- WASTE RECOVERY LISTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS waste_recovery_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_listing_id UUID NOT NULL REFERENCES food_listings(id),
  material_category VARCHAR(30),
  quantity DOUBLE PRECISION,
  unit VARCHAR(20) DEFAULT 'KG',
  collection_start TIMESTAMPTZ,
  collection_end TIMESTAMPTZ,
  pickup_address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(Point, 4326),
  waste_reason VARCHAR(50),
  recovery_suitability TEXT,
  recovery_status VARCHAR(30) DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_listing ON waste_recovery_listings(original_listing_id);
CREATE INDEX IF NOT EXISTS idx_waste_location ON waste_recovery_listings USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_waste_status ON waste_recovery_listings(recovery_status);

-- ============================================
-- BIOFARM ACCEPTANCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS biofarm_acceptances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  waste_listing_id UUID NOT NULL REFERENCES waste_recovery_listings(id),
  biofarm_id UUID NOT NULL REFERENCES organizations(id),
  status VARCHAR(20) DEFAULT 'ACCEPTED',
  collected_at TIMESTAMPTZ,
  recovered_quantity DOUBLE PRECISION,
  processing_method VARCHAR(30),
  processing_status VARCHAR(20) DEFAULT 'PENDING',
  processing_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_biofarm_waste ON biofarm_acceptances(waste_listing_id);
CREATE INDEX IF NOT EXISTS idx_biofarm_farm ON biofarm_acceptances(biofarm_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  channel VARCHAR(20) DEFAULT 'IN_APP',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, is_read);

-- ============================================
-- DONOR CREDITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS donor_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_id UUID NOT NULL REFERENCES users(id),
  listing_id UUID REFERENCES food_listings(id),
  credits DOUBLE PRECISION NOT NULL,
  reason VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id)
);

CREATE INDEX IF NOT EXISTS idx_credits_donor ON donor_credits(donor_id);

-- ============================================
-- REWARD BADGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reward_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  badge_name VARCHAR(100) NOT NULL,
  badge_description TEXT,
  badge_icon VARCHAR(50),
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_badges_user ON reward_badges(user_id);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_logs(entity_type, entity_id);
`;

async function runMigration() {
  try {
    console.log('Running database migration...');
    await db.query(migration);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  } finally {
    await db.pool.end();
  }
}

if (require.main === module) {
  runMigration().catch(() => process.exit(1));
}

module.exports = { runMigration, migration };
