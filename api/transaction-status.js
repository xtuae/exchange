import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Fetch transaction from database
    const result = await sql`
      SELECT 
        id,
        session_id,
        name,
        email,
        usd_amount,
        nila_amount,
        status,
        deposit_status,
        withdraw_status,
        withdraw_tx_id,
        created_at,
        updated_at
      FROM nila_transactions
      WHERE session_id = ${sessionId}
    `;

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = result.rows[0];

    return res.status(200).json({
      success: true,
      transaction: transaction
    });

  } catch (error) {
    console.error('Error fetching transaction:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch transaction',
      details: error.message 
    });
  }
}
