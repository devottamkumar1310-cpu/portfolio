<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/74e6c934-9354-407b-9b4b-648a0487eb2e

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## ✉️ Resend Contact Form Integration Setup

The contact form is production-ready and fully configured to deliver submissions via the [Resend](https://resend.com) SDK.

### 1. Configure the Environment
Add the following key configurations to your environment variables or local `.env` file:

```env
# Generate this in your Resend Dashboard (resend.com)
RESEND_API_KEY=re_123456789...

# The inbox address where you want to receive notification emails
CONTACT_EMAIL=devottamkumar7@gmail.com
```

### 2. Setting Up Resend
1. **Create an Account**: Sign up at [resend.com](https://resend.com).
2. **Retrieve API Key**: Go to the **API Keys** tab and click **Create API Key**.
3. **Configure Domains (Production)**: In development, Resend will send emails using the sandbox address `onboarding@resend.dev` to your registered account email. To send emails from custom addresses in production, verify your domain under the **Domains** tab and update the `from:` address in `/api/contact` and `server.ts`.

### 3. Testing Submissions
- Run the server locally using `npm run dev`.
- Submit the contact form under the **Get In Touch** section.
- If `RESEND_API_KEY` is not set, the server logs submissions offline in the console terminal. Once the key is configured, emails are dispatched instantly.
