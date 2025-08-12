import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookData = req.body;
    const webhookKey = req.headers['x-instaxwh-key'];
    
    // Log webhook data for debugging
    console.log('Webhook received:', JSON.stringify(webhookData, null, 2));

    // Verify webhook authenticity if secret is configured
    if (process.env.INSTAXCHANGE_WEBHOOK_SECRET) {
      const sortedData = {};
      Object.keys(webhookData).sort().forEach(key => {
        sortedData[key] = webhookData[key];
      });
      
      const expectedKey = crypto
        .createHash('md5')
        .update(`${JSON.stringify(sortedData)}:${process.env.INSTAXCHANGE_WEBHOOK_SECRET}`)
        .digest('hex');
      
      if (webhookKey !== expectedKey) {
        console.error('Webhook verification failed');
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    // Extract relevant data
    const { data, invoiceData } = webhookData;
    const sessionId = data?.sessionId;
    const status = data?.status;
    const depositStatus = invoiceData?.Deposit_tx_status;
    const withdrawStatus = invoiceData?.Withdraw_tx_status;
    const withdrawTxId = invoiceData?.Withdraw_tx_ID;

    if (!sessionId) {
      return res.status(400).json({ error: 'Missing session ID' });
    }

    // First, ensure the table has all necessary columns
    try {
      await sql`
        ALTER TABLE nila_transactions 
        ADD COLUMN IF NOT EXISTS deposit_status VARCHAR(50),
        ADD COLUMN IF NOT EXISTS withdraw_status VARCHAR(50),
        ADD COLUMN IF NOT EXISTS withdraw_tx_id VARCHAR(255),
        ADD COLUMN IF NOT EXISTS webhook_data JSONB
      `;
    } catch (alterError) {
      // Table might not support JSONB, use TEXT instead
      console.log('Using TEXT for webhook_data column');
    }

    // Update transaction status in database
    const updateResult = await sql`
      UPDATE nila_transactions
      SET 
        status = ${status},
        deposit_status = ${depositStatus},
        withdraw_status = ${withdrawStatus},
        withdraw_tx_id = ${withdrawTxId},
        webhook_data = ${JSON.stringify(webhookData)}::text,
        updated_at = CURRENT_TIMESTAMP
      WHERE session_id = ${sessionId}
      RETURNING *
    `;

    if (updateResult.rowCount === 0) {
      console.error('Transaction not found for session:', sessionId);
      return res.status(404).json({ error: 'Transaction not found' });
    }

    const transaction = updateResult.rows[0];

    // If payment is completed successfully, you can trigger additional actions here
    if (status === 'completed' && depositStatus === 'completed') {
      console.log(`Payment completed for transaction ${sessionId}`);
      // Here you could:
      // - Send confirmation email
      // - Trigger NILA token distribution
      // - Update user balance
      // etc.
    }

    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      transaction: transaction
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ 
      error: 'Failed to process webhook',
      details: error.message 
    });
  }
}

// Disable body parsing to access raw body for webhook verification if needed
export const config = {
  api: {
    bodyParser: true
  }
};
