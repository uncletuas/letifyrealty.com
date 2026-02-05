# Letifi Realty - Complete Deployment Guide

## 🚀 Quick Start - Deploy to Netlify in 5 Minutes

### Prerequisites
- GitHub account
- Netlify account (free tier works fine)
- Your Supabase credentials

---

## Step 1: Push to GitHub

```bash
# In your project terminal, run these commands:

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Letifi Realty website"

# Add your remote repository
git remote add origin https://github.com/uncletuas/letifirealty.com.git

# Push to GitHub
git push -u origin main
```

**If you get an error:** Try `git push -u origin master` instead of `main`

---

## Step 2: Deploy to Netlify

### Option A: Deploy via Netlify UI (Recommended)

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub
5. Select the **`letifirealty`** repository
6. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** (leave empty)

7. **IMPORTANT:** Click **"Show advanced"** and add these environment variables:

   ```
   SUPABASE_URL = [Your Supabase Project URL]
   SUPABASE_ANON_KEY = [Your Supabase Anon Key]
   SUPABASE_SERVICE_ROLE_KEY = [Your Supabase Service Role Key]
   RESEND_API_KEY = re_EERQ5Rb7_9d81fgJswRbZFSRcFwC6nwKV
   ```

8. Click **"Deploy site"**

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

---

## Step 3: Configure Supabase Edge Function

Your Supabase Edge Function needs to be deployed separately:

1. Go to your Supabase project dashboard
2. Navigate to **Edge Functions** in the sidebar
3. The function should already be deployed at `/supabase/functions/server/`
4. Make sure environment variables are set in Supabase:
   - `RESEND_API_KEY = re_EERQ5Rb7_9d81fgJswRbZFSRcFwC6nwKV`

---

## Step 4: Access Your Admin Panel

Once deployed, your admin panel will be accessible at:

### 🔐 Admin URL
```
https://[your-site-name].netlify.app/admin-cms-letifi-realty-2026
```

**Example:**
- If your Netlify site is `letifi-realty-ph.netlify.app`
- Your admin URL is: `https://letifi-realty-ph.netlify.app/admin-cms-letifi-realty-2026`

### Alternative Access Methods:
2. **Direct URL:** Bookmark the admin URL above for easy access

---

## Step 5: Test Everything

After deployment, test these features:

### ✅ Testing Checklist

1. **Homepage**
   - [ ] Hero section loads
   - [ ] Services display correctly
   - [ ] Property listings show up

2. **Contact Forms**
   - [ ] Main contact form submits successfully
   - [ ] Email is sent to info@letifirealty.com
   - [ ] Phone number shows: +234 906 743 5048
   - [ ] WhatsApp link works
   - [ ] Address shows: 25 Kpalukwu Street, D-line, Port Harcourt

3. **Admin Panel**
   - [ ] Access via URL: `/admin-cms-letifi-realty-2026`
   - [ ] Can add new properties
   - [ ] Can upload up to 5 images per property
   - [ ] Can edit existing properties
   - [ ] Can delete properties

4. **Property Details**
   - [ ] Property images display (up to 5)
   - [ ] Contact form on property page works
   - [ ] Email notifications sent for inquiries
   - [ ] WhatsApp, phone, and email links work

---

## 🔧 Troubleshooting

### Issue: Admin page shows 404
**Solution:** 
- Check that `netlify.toml` and `public/_redirects` files exist
- Redeploy the site
- Clear browser cache

### Issue: Forms don't submit
**Solution:**
- Check Supabase environment variables in Netlify
- Check browser console for errors
- Verify Supabase Edge Function is deployed

### Issue: Emails not sending
**Solution:**
- Verify `RESEND_API_KEY` is set in Supabase Edge Function environment
- Check Supabase Edge Function logs
- Verify email address in server code (should be info@letifirealty.com)

### Issue: Properties don't save
**Solution:**
- Check Supabase Edge Function is running
- Verify API endpoint URLs in frontend code
- Check browser network tab for failed requests

---

## 📞 Contact Information

**Website:** https://[your-site].netlify.app  
**Admin Panel:** https://[your-site].netlify.app/admin-cms-letifi-realty-2026  
**Email:** info@letifirealty.com  
**Phone:** +234 906 743 5048  
**WhatsApp:** +234 906 743 5048  
**Address:** 25 Kpalukwu Street, D-line, Port Harcourt, Rivers State, Nigeria

---

## 🎯 Key Features Implemented

✅ Up to 5 images per property (optional)  
✅ Email notifications via Resend  
✅ Secure admin panel access  
✅ Property filtering and search  
✅ Individual property detail pages  
✅ WhatsApp integration  
✅ Responsive mobile design  
✅ Contact forms with backend storage  
✅ Full CMS for property management

---

## 📝 Important Notes

1. **Keep your admin URL private** - Don't share `/admin-cms-letifi-realty-2026` publicly
2. **Bookmark the admin URL** for easy access
3. **Test email notifications** after first deployment
4. **Check Resend dashboard** to monitor email delivery
5. **Business hours:** Monday - Friday, 9:00 AM - 5:00 PM

---

## 🔄 Future Updates

To update your website:

```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Netlify will automatically rebuild and redeploy your site!

---

**Deployment Date:** January 6, 2026  
**Version:** 1.0.0
