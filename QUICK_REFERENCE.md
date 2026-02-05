# 🎯 LETIFI REALTY - Quick Reference Card

## 🔐 YOUR ADMIN ACCESS

### Admin Panel URL (After Netlify Deployment):
```
https://[your-netlify-site].netlify.app/admin-cms-letifi-realty-2026
```

**Replace `[your-netlify-site]` with your actual Netlify domain**

**Example:**
- If your Netlify gives you: `letifi-realty.netlify.app`
- Your admin URL is: `https://letifi-realty.netlify.app/admin-cms-letifi-realty-2026`

### Keyboard Shortcut (Backup Access):
- Windows/Linux: `Ctrl + Shift + C`
- Mac: `Cmd + Shift + C`

---

## 🚀 DEPLOYMENT COMMANDS

### Push to GitHub:
```bash
git add .
git commit -m "Letifi Realty website"
git push -u origin main
```

### Environment Variables for Netlify:
```
RESEND_API_KEY = re_EERQ5Rb7_9d81fgJswRbZFSRcFwC6nwKV
```
*(Plus your Supabase credentials)*

---

## 📧 EMAIL CONFIGURATION

**Resend API Key:** `re_EERQ5Rb7_9d81fgJswRbZFSRcFwC6nwKV`

**Where to add it:**
1. Netlify: Site settings → Environment variables
2. Supabase: Edge Functions → Environment variables

**Emails sent to:** info@letifirealty.com

---

## 📞 UPDATED CONTACT INFO

| Item | Value |
|------|-------|
| **Phone** | +234 906 743 5048 |
| **WhatsApp** | +234 906 743 5048 |
| **Email** | info@letifirealty.com |
| **Address** | 25 Kpalukwu Street, D-line, Port Harcourt, Rivers State, Nigeria |
| **Hours** | Monday - Friday: 9:00 AM - 5:00 PM |

---

## 🏠 PROPERTY MANAGEMENT

### Adding Properties via Admin:
1. Go to admin URL
2. Click "Add New Property"
3. Fill in details:
   - Title, Location, Price, Type (Required)
   - Bedrooms, Bathrooms, Area (Optional)
   - Description, Features (Optional)
   - **Images: Up to 5 image URLs (All Optional)**

### Image Guidelines:
- Add 1 to 5 images per property
- Use image URLs (upload images to Imgur, Cloudinary, or similar first)
- Leave blank if you don't have that many images
- First image is the main display image

---

## ✅ POST-DEPLOYMENT CHECKLIST

After deploying to Netlify:

- [ ] Test homepage loads correctly
- [ ] Test admin URL access
- [ ] Add a test property in CMS
- [ ] Submit a test contact form
- [ ] Check email arrives at info@letifirealty.com
- [ ] Test WhatsApp link clicks
- [ ] Test phone number clicks on mobile
- [ ] Test property detail pages
- [ ] Verify all images load

---

## 🆘 QUICK FIXES

**Can't access admin?**
→ Make sure you're using the full URL with `/admin-cms-letifi-realty-2026`

**Forms not working?**
→ Check environment variables are set in Netlify

**Emails not sending?**
→ Verify RESEND_API_KEY in Supabase Edge Functions

**Properties not saving?**
→ Check Supabase Edge Function is deployed and running

---

## 📱 IMPORTANT LINKS

**GitHub Repo:** https://github.com/[your-username]/letifirealty  
**Netlify Dashboard:** https://app.netlify.com  
**Supabase Dashboard:** https://app.supabase.com  
**Resend Dashboard:** https://resend.com/emails

---

**Last Updated:** January 6, 2026  
**Need Help?** Check DEPLOYMENT_GUIDE.md for detailed instructions
