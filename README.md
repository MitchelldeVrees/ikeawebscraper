# IKEA Tweedekansje Alerts

A web application that monitors IKEA's Tweedekansje (second chance) deals and sends email alerts when your watched products become available.

## Features

- **Email-based watches**: No account needed, just provide your email
- **Store-specific monitoring**: Watch products at your preferred IKEA store
- **Multi-store coverage**: Monitor the same article across multiple IKEA NL stores at once
- **Quantity thresholds**: Choose how many available units should trigger an alert
- **CSV import/export**: Download a template, fill in product IDs & quantities, and import watches in bulk
- **Account preferences**: Store your driving origin and vehicle fuel usage for future mileage cost estimates
- **Automated checking**: Runs every 4 hours (07:00, 11:00, 15:00, 19:00, 23:00, 03:00)
- **Smart matching**: Fuzzy product name matching to catch variations
- **Duplicate prevention**: Won't spam you with the same deal twice
- **Manage watches**: Easy interface to view and delete your watches

## Supported IKEA Stores

- Amersfoort (415)
- Amsterdam (088)
- Barendrecht (274)
- Breda (403)
- Delft (151)
- Duiven (272)
- Eindhoven (087)
- Groningen (404)
- Haarlem (378)
- Heerlen (089)
- Hengelo (312)
- Utrecht (270)
- Zwolle (391)

All Dutch IKEA locations are included by default. Extend the `IKEA_STORES` mapping if new stores are introduced.

## Setup

### Prerequisites

- Supabase account (for database)
- Vercel account (for hosting and cron jobs)
- Optional: Resend account (for production email sending)

### Database Setup

1. Connect your Supabase integration in the v0 UI
2. Run the SQL scripts in the `scripts` folder:
   - `001_create_watches_table.sql`
   - `002_create_notifications_table.sql`
   - `003_add_desired_quantity_to_watches.sql`
   - `004_create_profiles_table.sql`

### Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- All other Supabase env vars (automatically set via integration)

Optional:
- `CRON_SECRET` - Secret token to secure the cron endpoint
- `RESEND_API_KEY` - For production email sending
- `NEXT_PUBLIC_SITE_URL` - Your production URL for email links

### Deployment

1. Deploy to Vercel
2. Vercel Cron Jobs will automatically run based on `vercel.json`
3. Monitor logs to ensure jobs are running correctly

## How It Works

1. **User creates a watch**: User enters email, product name, and store
2. **Cron job runs**: Every 4 hours, the system checks IKEA's API
3. **Product matching**: Compares available products against user watches
4. **Email notification**: Sends alert when a match is found
5. **Duplicate prevention**: Records sent notifications to avoid spam

## API Endpoints

- `POST /api/watches` - Create a new watch
- `GET /api/watches?email=xxx` - Get watches by email
- `DELETE /api/watches/:id` - Delete a watch
- `GET /api/check-deals` - Cron endpoint to check deals (secured)

## Development

\`\`\`bash
# Install dependencies (automatic in v0)
npm install

# Run development server
npm run dev

# Manually trigger deal check
curl http://localhost:3000/api/check-deals
\`\`\`

## Email Integration

Currently, emails are logged to console. To enable actual email sending:

1. Sign up for Resend
2. Add `RESEND_API_KEY` to environment variables
3. Uncomment the Resend integration code in `lib/email.ts`
4. Configure your sender domain

## Future Enhancements

- Add more IKEA stores
- Email templates with better styling
- Weekly digest option
- Price drop alerts
- Mobile app notifications
- Multiple product watches per email

## License

MIT

## Disclaimer

This is an independent service and is not affiliated with IKEA. Data is sourced from IKEA's public Tweedekansje API.
