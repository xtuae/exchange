import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      sessionId,
      name,
      email,
      phone,
      usdAmount,
      nilaAmount,
      walletAddress,
      timestamp
    } = req.body;

    // Validate required fields
    if (!sessionId || !name || !email || !phone || !usdAmount || !nilaAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const parsedUsdAmount = parseFloat(usdAmount);
    const parsedNilaAmount = parseFloat(nilaAmount);

    if (isNaN(parsedUsdAmount) || isNaN(parsedNilaAmount)) {
      return res.status(400).json({ error: 'Invalid amount format' });
    }

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS nila_transactions (
        id SERIAL PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        usd_amount DECIMAL(10, 2) NOT NULL,
        nila_amount DECIMAL(18, 8) NOT NULL,
        wallet_address VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert transaction record
    const result = await sql`
      INSERT INTO nila_transactions (
        session_id,
        name,
        email,
        phone,
        usd_amount,
        nila_amount,
        wallet_address,
        created_at
      ) VALUES (
        ${sessionId},
        ${name},
        ${email},
        ${phone},
        ${parsedUsdAmount},
        ${parsedNilaAmount},
        ${walletAddress},
        ${timestamp || new Date().toISOString()}
      )
      RETURNING *
    `;

    return res.status(200).json({
      success: true,
      transaction: result.rows[0]
    });

  } catch (error) {
    console.error('Database error:', error);
    
    // Check if it's a duplicate entry error
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: 'Transaction with this session ID already exists' 
      });
    }

    return res.status(500).json({ 
      error: 'Failed to save transaction',
      details: error.message 
    });
  }
}
