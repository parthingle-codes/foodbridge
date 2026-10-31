const db = require('../config/database');
const { success, error, created } = require('../utils/response');

/**
 * POST /api/reservations
 * Create a reservation for a food listing (DISTRIBUTOR only).
 * Uses SELECT ... FOR UPDATE to prevent race conditions.
 */
const createReservation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { listingId, notes } = req.body;

    if (!listingId) {
      return error(res, 'listingId is required', 400);
    }

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Look up the organization for this user
      const orgResult = await client.query(
        'SELECT id FROM organizations WHERE user_id = $1',
        [userId]
      );

      if (orgResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return error(res, 'No organization found for this user', 404);
      }

      const organizationId = orgResult.rows[0].id;

      // Lock the listing row to prevent race conditions
      const listingResult = await client.query(
        'SELECT * FROM food_listings WHERE id = $1 FOR UPDATE',
        [listingId]
      );

      if (listingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return error(res, 'Listing not found', 404);
      }

      const listing = listingResult.rows[0];

      // Check listing status
      if (!['AVAILABLE', 'MATCHED'].includes(listing.status)) {
        await client.query('ROLLBACK');
        return error(res, `Cannot reserve a listing with status ${listing.status}. Listing must be AVAILABLE or MATCHED.`, 400);
      }

      // Check no other active reservation exists
      const existingReservation = await client.query(
        `SELECT id FROM reservations
         WHERE listing_id = $1 AND status IN ('PENDING', 'ACCEPTED')`,
        [listingId]
      );

      if (existingReservation.rows.length > 0) {
        await client.query('ROLLBACK');
        return error(res, 'An active reservation already exists for this listing', 409);
      }

      // Set expiry to 30 minutes from now
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      // Create reservation
      const reservationResult = await client.query(
        `INSERT INTO reservations (organization_id, listing_id, status, notes, expires_at)
         VALUES ($1, $2, 'PENDING', $3, $4)
         RETURNING *`,
        [organizationId, listingId, notes || null, expiresAt]
      );

      // Update listing status to RESERVED
      await client.query(
        `UPDATE food_listings SET status = 'RESERVED', reserved_by = $1, updated_at = NOW()
         WHERE id = $2`,
        [organizationId, listingId]
      );

      await client.query('COMMIT');

      return created(res, reservationResult.rows[0], 'Reservation created successfully');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/reservations/:id/accept
 * Accept a reservation (DONOR only - must be listing owner).
 */
const acceptReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donorId = req.user.id;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Load reservation with listing join to verify donor ownership
      const reservationResult = await client.query(
        `SELECT r.*, fl.donor_id
         FROM reservations r
         JOIN food_listings fl ON r.listing_id = fl.id
         WHERE r.id = $1
         FOR UPDATE OF r`,
        [id]
      );

      if (reservationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return error(res, 'Reservation not found', 404);
      }

      const reservation = reservationResult.rows[0];

      if (reservation.donor_id !== donorId) {
        await client.query('ROLLBACK');
        return error(res, 'Only the listing donor can accept this reservation', 403);
      }

      if (reservation.status !== 'PENDING') {
        await client.query('ROLLBACK');
        return error(res, `Cannot accept a reservation with status ${reservation.status}`, 400);
      }

      // Update reservation status
      const updated = await client.query(
        `UPDATE reservations SET status = 'ACCEPTED', updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [id]
      );

      // Update listing status
      await client.query(
        `UPDATE food_listings SET status = 'ACCEPTED', updated_at = NOW()
         WHERE id = $1`,
        [reservation.listing_id]
      );

      await client.query('COMMIT');

      return success(res, updated.rows[0], 'Reservation accepted successfully');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/reservations/:id/decline
 * Decline a reservation (donor or org can decline).
 */
const declineReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Load reservation with listing and org info
      const reservationResult = await client.query(
        `SELECT r.*, fl.donor_id, o.user_id AS org_user_id
         FROM reservations r
         JOIN food_listings fl ON r.listing_id = fl.id
         LEFT JOIN organizations o ON r.organization_id = o.id
         WHERE r.id = $1
         FOR UPDATE OF r`,
        [id]
      );

      if (reservationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return error(res, 'Reservation not found', 404);
      }

      const reservation = reservationResult.rows[0];

      // Verify the requester is either the donor or the org user
      if (reservation.donor_id !== userId && reservation.org_user_id !== userId) {
        await client.query('ROLLBACK');
        return error(res, 'Only the listing donor or the reserving organization can decline', 403);
      }

      if (!['PENDING', 'ACCEPTED'].includes(reservation.status)) {
        await client.query('ROLLBACK');
        return error(res, `Cannot decline a reservation with status ${reservation.status}`, 400);
      }

      // Update reservation status
      const updated = await client.query(
        `UPDATE reservations SET status = 'DECLINED', updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [id]
      );

      // Reset listing status to AVAILABLE
      await client.query(
        `UPDATE food_listings SET status = 'AVAILABLE', reserved_by = NULL, updated_at = NOW()
         WHERE id = $1`,
        [reservation.listing_id]
      );

      await client.query('COMMIT');

      return success(res, updated.rows[0], 'Reservation declined successfully');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReservation,
  acceptReservation,
  declineReservation,
};
