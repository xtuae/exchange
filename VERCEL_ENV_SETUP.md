# Vercel Environment Variables Setup

Your application is deployed at: https://exchange-dun.vercel.app/

## Manual Setup Instructions

1. **Go to your Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your `exchange` project

2. **Navigate to Settings → Environment Variables**

3. **Add the following environment variables:**

### Database Configuration
```
DATABASE_URL = postgres://neondb_owner:npg_sV9NAcHX1Wnt@ep-billowing-thunder-ad5cciz3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

DATABASE_URL_UNPOOLED = postgresql://neondb_owner:npg_sV9NAcHX1Wnt@ep-billowing-thunder-ad5cciz3.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_URL = postgres://neondb_owner:npg_sV9NAcHX1Wnt@ep-billowing-thunder-ad5cciz3-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_URL_NON_POOLING = postgres://neondb_owner:npg_sV9NAcHX1Wnt@ep-billowing-thunder-ad5cciz3.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

POSTGRES_USER = neondb_owner

POSTGRES_HOST = ep-billowing-thunder-ad5cciz3-pooler.c-2.us-east-1.aws.neon.tech

POSTGRES_PASSWORD = npg_sV9NAcHX1Wnt

POSTGRES_DATABASE = neondb

POSTGRES_PRISMA_URL = postgres://neondb_owner:npg_sV9NAcHX1Wnt@ep-billowing-thunder-ad5cciz3-pooler.c-2.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
```

### Instaxchange Configuration
```
INSTAXCHANGE_WEBHOOK_SECRET = 83yfj8SBqQFuWeXrAonaR6DhheHhbwDr
```

### SMTP Configuration for Emails
```
SMTP_HOST = your_smtp_host
SMTP_PORT = your_smtp_port
SMTP_SECURE = true
SMTP_USER = your_smtp_username
SMTP_PASS = your_smtp_password
SMTP_FROM_EMAIL = your_from_email_address
```

4. **Select Environment Scope**
   - Check: ✅ Production
   - Check: ✅ Preview
   - Check: ✅ Development

5. **Save All Variables**

6. **Redeploy Your Application**
   - Go to the Deployments tab
   - Click on the three dots menu on the latest deployment
   - Select "Redeploy"

## Webhook Configuration in Instaxchange

Now that your webhook secret is configured, set up the webhook in Instaxchange:

1. Log into your Instaxchange dashboard
2. Navigate to Webhook settings
3. Set the webhook URL to:
   ```
   https://exchange-dun.vercel.app/api/webhook
   ```
4. Set the webhook secret to:
   ```
   83yfj8SBqQFuWeXrAonaR6DhheHhbwDr
   ```

## Testing the Integration

After redeployment, you can test:
1. Visit https://exchange-dun.vercel.app/
2. Fill in the form and create a test transaction
3. Check your Neon database for the transaction record
4. Monitor webhook responses in Vercel Functions logs

Your application is now fully configured!
