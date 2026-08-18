# Khan Interface — Complete Setup Guide
## KM Car Deals | Nawaz Khan

---

## STEP 1 — Supabase (Database)

1. Go to: https://supabase.com → Sign Up (free)
2. Create new project → name: "khan-interface"
3. Choose region: Mumbai (ap-south-1)
4. Set a strong database password → Save it
5. Wait for project to be ready (~2 minutes)

**Get your keys:**
- Go to Project Settings → API
- Copy:
  - `Project URL` → this is your SUPABASE_URL
  - `anon public` key → SUPABASE_ANON_KEY
  - `service_role secret` key → SUPABASE_SERVICE_ROLE_KEY

**Run the database schema:**
- Go to SQL Editor in Supabase
- Copy the entire contents of `khan-backend/src/db/schema.sql`
- Paste and click Run
- You should see: "Khan Interface database schema created successfully!"

---

## STEP 2 — Groq API Key (Free AI)

1. Go to: https://console.groq.com
2. Sign Up (free — no credit card)
3. Go to API Keys → Create API Key
4. Copy the key (starts with `gsk_`)

**Free limits:**
- Llama 3.1 70B: 6,000 tokens/minute
- 14,400 requests/day
- Completely free

---

## STEP 3 — Twilio WhatsApp (Free Trial)

1. Go to: https://www.twilio.com → Sign Up (free trial)
2. Verify your phone number
3. Go to Console → Account SID and Auth Token (copy both)
4. Go to Messaging → Try it out → Send a WhatsApp message
5. Follow the sandbox setup:
   - Send "join [sandbox-code]" to +1 415 523 8886 from your WhatsApp
   - Your number is now registered for testing

**For production WhatsApp:**
- Apply for WhatsApp Business API through Twilio
- Takes 1-3 days to approve
- Pay per message (~₹0.50/message)

---

## STEP 4 — Deploy Backend on Render (Free)

1. Go to: https://render.com → Sign Up with GitHub
2. Click "New +" → Web Service
3. Connect your GitHub repo: `mohammednawazkhan40/Khan-UI`
4. Settings:
   - **Name:** khan-interface-api
   - **Root Directory:** khan-backend
   - **Build Command:** npm install
   - **Start Command:** npm start
   - **Plan:** Free

5. Add Environment Variables (click "Add Environment Variable"):
```
SUPABASE_URL          = your_supabase_url
SUPABASE_ANON_KEY     = your_anon_key
SUPABASE_SERVICE_ROLE_KEY = your_service_role_key
GROQ_API_KEY          = gsk_your_groq_key
TWILIO_ACCOUNT_SID    = ACxxxxxxxxxx
TWILIO_AUTH_TOKEN     = your_auth_token
TWILIO_WHATSAPP_FROM  = whatsapp:+14155238886
JWT_SECRET            = any_random_32_char_string_here
NODE_ENV              = production
OWNER_NAME            = Nawaz Khan
BUSINESS_NAME         = KM Car Deals
FRONTEND_URL          = https://khan-ui.vercel.app
```

6. Click "Create Web Service"
7. Wait ~3 minutes for first deploy
8. Your API URL will be: `https://khan-interface-api.onrender.com`
9. Test it: open that URL in browser — should show `{"status":"ok",...}`

---

## STEP 5 — Connect Frontend to Backend (Vercel)

1. Go to: https://vercel.com/mohammednawazkhan40/khan-ui/settings/environment-variables
2. Add:
```
NEXT_PUBLIC_API_BASE_URL = https://khan-interface-api.onrender.com
```
3. Click Save
4. Go to Deployments → Redeploy

Your frontend will now use the real backend instead of demo data.

---

## STEP 6 — Test Everything

Open your live site and:

1. **Login** with: nawaz@kmcardeals.com / (set your password in Supabase users table)
2. **Add a Customer** → should save to Supabase database
3. **Chat with Finance Agent** → should respond with Groq Llama 3.1
4. **Send WhatsApp** → should send via Twilio to your verified number

---

## What You Get (Fully Live)

| Feature | Technology | Cost |
|---|---|---|
| Database | Supabase (PostgreSQL) | FREE |
| Backend API | Render (Node.js) | FREE |
| AI Agents | Groq (Llama 3.1 70B) | FREE |
| Frontend | Vercel (Next.js) | FREE |
| WhatsApp | Twilio | ~₹0.50/msg |
| Auth | JWT + bcrypt | FREE |
| Real-time updates | Supabase Realtime | FREE |

**Total monthly cost: ~₹50-200/month** (only WhatsApp messages)

---

## Cron Jobs (Automatic)

Once deployed, these run automatically:
- **6 AM daily** — Update payment statuses (mark overdue, due today)
- **7 AM daily** — Business Manager generates morning briefing
- **9 AM daily** — Send WhatsApp reminders to customers
- **Every 6 hours** — Finance Agent auto-analysis

---

## Need Help?

All files are in the repository:
- Frontend: `khan-interface/` folder
- Backend: `khan-backend/` folder
- Database: `khan-backend/src/db/schema.sql`
- Setup: `SETUP_GUIDE.md` (this file)
