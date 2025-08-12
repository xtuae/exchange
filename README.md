# NILA Token Purchase App

A React application that allows users to buy NILA tokens using USD through the Instaxchange API. Built with MindWaveDAO branding and integrated with Vercel Postgres for transaction tracking.

## Features

- **Buy NILA Tokens with USD**: Simple interface to purchase NILA tokens
- **Real-time Price Display**: Shows current NILA token price from CoinGecko
- **Automatic NILA Calculation**: Displays how many NILA tokens users will receive
- **User Information Collection**: Captures name, email, and phone for transaction records
- **Database Integration**: Stores all transactions in Vercel Postgres
- **Webhook Support**: Automatically updates transaction status via Instaxchange webhooks
- **Secure Payment Processing**: Integration with Instaxchange's secure payment gateway
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **MindWaveDAO Themed**: Dark theme with purple accents matching the brand

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A valid Instaxchange account with the provided Account Reference ID

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd usdc-exchange-app
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### Required Configuration

1. **Account Reference ID**: Pre-configured as `dfkvch5vrd0d57sowjqnt17y`
2. **USDC Wallet Address**: Pre-configured as `0x6B992443ead5c751df1dDBBd35DD1E7b3f319B36`

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Vercel Postgres Database
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database

# Instaxchange Webhook Secret (optional but recommended)
INSTAXCHANGE_WEBHOOK_SECRET=your_webhook_secret
```

## Running the Application

### Development Mode

```bash
npm start
```

This will start the development server on [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## How to Use

1. **Enter Personal Information**: Provide your name, email, and phone number

2. **Enter USD Amount**: Specify how much USD you want to spend

3. **View NILA Amount**: See real-time calculation of NILA tokens you'll receive

4. **Continue to Payment**: Click the button to create a payment session

5. **Complete Payment**: Use the embedded Instaxchange payment form

6. **Transaction Recorded**: Your transaction is saved to the database

7. **Receive NILA Tokens**: Tokens will be distributed from the MindWaveDAO wallet

## API Integration

### External APIs

- **Instaxchange API**: 
  - Session Creation: `POST https://instaxchange.com/api/session`
  - Payment Processing: Via embedded iframe
  
- **CoinGecko API**: 
  - NILA Price: `GET https://api.coingecko.com/api/v3/simple/price?ids=mindwavedao&vs_currencies=usd`

### Internal API Endpoints

- **Save Transaction**: `POST /api/save-transaction`
  - Saves transaction details to Vercel Postgres
  
- **Webhook Handler**: `POST /api/webhook`
  - Receives payment status updates from Instaxchange

## Deployment to Vercel

1. **Fork/Clone the Repository**

2. **Install Vercel CLI** (if not already installed)
```bash
npm i -g vercel
```

3. **Login to Vercel**
```bash
vercel login
```

4. **Deploy the Application**
```bash
vercel
```

5. **Set up Vercel Postgres**
   - Go to your Vercel dashboard
   - Navigate to the Storage tab
   - Create a new Postgres database
   - Copy the environment variables to your project

6. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add all the required environment variables from `.env.example`

7. **Configure Webhook in Instaxchange**
   - Log into your Instaxchange dashboard
   - Set webhook URL to: `https://your-app.vercel.app/api/webhook`
   - Copy the webhook secret and add it to Vercel environment variables

8. **Deploy to Production**
```bash
vercel --prod
```

## Database Schema

The application automatically creates the following table:

```sql
CREATE TABLE nila_transactions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  usd_amount DECIMAL(10, 2) NOT NULL,
  nila_amount DECIMAL(18, 8) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  deposit_status VARCHAR(50),
  withdraw_status VARCHAR(50),
  withdraw_tx_id VARCHAR(255),
  webhook_data JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Notes

- Always verify your wallet address before submitting
- The application uses HTTPS for all API communications
- Payment processing is handled securely by Instaxchange
- Never share your session IDs or sensitive payment information

## Troubleshooting

### CORS Issues
The application includes a proxy configuration for development. If you encounter CORS issues in production, ensure your domain is whitelisted in your Instaxchange account settings.

### Payment Session Errors
- Verify your Account Reference ID is correct
- Ensure you're providing a valid wallet address
- Check that the amount is within Instaxchange's allowed limits

## Support

For issues related to:
- **Application**: Check the console for error messages and ensure all fields are filled correctly
- **Instaxchange API**: Refer to [Instaxchange documentation](https://instaxchange.com/iframe-session.html)
- **Payments**: Contact Instaxchange support

## License

This project is created for demonstration purposes. Please ensure you comply with all relevant financial regulations in your jurisdiction when using cryptocurrency exchange services.
