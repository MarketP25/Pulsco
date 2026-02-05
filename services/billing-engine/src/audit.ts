import { Pool } from 'pg';
import { billing_activity_type } from './types'; // Assuming types are defined in a separate file

// In a real application, this would be configured securely.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function getPreviousEntryHash(userId: string): Promise<Buffer | null> {
  const result = await pool.query(
    'SELECT previous_entry_hash FROM billing_ledger WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );
  if (result.rows.length === 0) {
    return null;
  }
  return result.rows[0].previous_entry_hash;
}


export async function recordBillingEvent(
  userId: string,
  activityType: billing_activity_type,
  amountUsd: number,
  description: string,
  metadata: any,
  marpPolicyVersion: string
) {
  // In a real implementation, we would use a cryptographic hash function (e.g., SHA-256)
  // on the previous entry's data to create the hash.
  const previousHash = await getPreviousEntryHash(userId);
  const currentHash = Buffer.from('placeholder_hash'); // Placeholder for actual hash calculation

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const queryText = `
      INSERT INTO billing_ledger
        (user_id, activity_type, amount_usd, description, metadata, marp_policy_version, previous_entry_hash)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, created_at
    `;
    const values = [userId, activityType, amountUsd, description, metadata, marpPolicyVersion, previousHash];
    const res = await client.query(queryText, values);
    await client.query('COMMIT');
    console.log('Recorded billing event:', res.rows[0]);
    return res.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
