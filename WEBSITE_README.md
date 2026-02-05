# Letifi Realty - Premium Real Estate Website

A modern, premium real estate website built with React, TypeScript, Tailwind CSS, and Supabase backend.

## 🌟 Features

### Frontend Features
- **Responsive Design**: Fully responsive layout optimized for desktop, tablet, and mobile
- **Smooth Animations**: Motion/Framer Motion animations throughout
- **Modern UI**: Dark theme with warm orange-gold gradients matching the brand
- **Property Listings**: Dynamic property cards with filtering and search
- **Property Details**: Full-screen property detail pages with image galleries, videos, and inquiry forms
- **Service Pages**: Dedicated pages for each service offering
- **Contact Form**: Integrated contact form with backend submission
- **Property CMS**: Built-in content management system for properties

### Backend Features (Supabase)
- **Contact Inquiries**: Store and manage contact form submissions
- **Property Management**: Full CRUD operations for properties
- **Property Inquiries**: Track property-specific inquiries
- **Advanced Filtering**: Filter properties by type, location, and price
- **RESTful API**: Well-structured API endpoints for all operations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase project set up

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Supabase:
   - Update `/utils/supabase/info.tsx` with your Supabase project ID and anon key

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📋 Page Structure

### Home Page
- **Hero Section**: Eye-catching hero with property background image and CTA buttons
- **About Section**: Company mission, vision, and values
- **Services Section**: Overview of all services (clickable to view details)
- **Listings Section**: Property cards with search and filter functionality
- **Contact Section**: Contact form and business information
- **Footer**: Links, social media, and company info

### Property Details Page
- High-resolution image gallery with thumbnail navigation
- Video player for property videos
- Complete property specifications (bedrooms, bathrooms, area)
- Features and amenities list
- Contact form for property inquiries
- Direct contact options (phone, WhatsApp, email)

### Service Detail Pages
- Detailed service descriptions
- Benefits and features
- Step-by-step process
- Call-to-action sections
- Contact information

### Property CMS
- Add new properties
- Edit existing properties
- Delete properties
- Real-time updates across the site

## 🔌 API Endpoints

### Contact Inquiries
- `POST /make-server-ef402f1d/contact` - Submit contact inquiry
- `GET /make-server-ef402f1d/contact/all` - Get all contact inquiries

### Properties
- `POST /make-server-ef402f1d/properties` - Create new property
- `GET /make-server-ef402f1d/properties` - Get all properties (with filtering)
- `GET /make-server-ef402f1d/properties/:id` - Get single property
- `PUT /make-server-ef402f1d/properties/:id` - Update property
- `DELETE /make-server-ef402f1d/properties/:id` - Delete property

### Property Inquiries
- `POST /make-server-ef402f1d/property-inquiries` - Submit property inquiry

## 🎨 Brand Colors

- **Background**: `#0a0a0a` (Deep black)
- **Primary Orange**: `#FF6B1A`
- **Accent Gold**: `#FFB854`
- **Text**: `#f5f5f5` (Light gray)
- **Card Background**: `#1a1a1a`

## 🔍 Search & Filter Features

### Property Filters
- **Search**: Search by property name or location
- **Type Filter**: Filter by Sale or Rent
- Real-time filtering without page refresh
- Clear visual feedback for active filters

## 📱 Contact Methods

Users can reach out via:
- Contact form (stores in database)
- Phone: +234 800 000 0000
- Email: info@letifirealty.com
- WhatsApp: Direct link to chat
- Property-specific inquiries (tracked separately)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS 4.0
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Backend**: Supabase Edge Functions (Hono)
- **Database**: Supabase KV Store
- **Build Tool**: Vite

## 📝 Property Data Structure

```typescript
{
  id: string;
  title: string;
  location: string;
  price: string;
  type: 'Sale' | 'Rent';
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  images?: string[];
  videos?: string[];
  features?: string[];
}
```

## 🎯 Services Offered

1. **Property Sales & Leasing**
   - Property search and tours
   - Negotiation support
   - Legal documentation

2. **Property Management**
   - Tenant screening
   - Maintenance and repairs
   - Financial reporting

3. **Real Estate Advisory**
   - Market analysis
   - Investment strategies
   - Portfolio management

4. **Property Marketing**
   - Professional photography
   - Digital marketing
   - Social media promotion

## 🔐 CMS Access

The Property CMS is accessed via keyboard shortcut for security:
- **Windows/Linux**: `Ctrl + Shift + C`
- **Mac**: `Cmd + Shift + C`

This allows authorized users to manage properties without exposing the admin interface publicly.

## 📊 Database Tables

All data is stored in Supabase's KV store with the following prefixes:
- `inquiry_*`: Contact form submissions
- `property_*`: Property listings
- `prop_inquiry_*`: Property-specific inquiries

## 🌐 Deployment

The website is ready for deployment to any hosting platform that supports:
- Node.js applications
- Supabase edge functions
- Environment variables

### Environment Variables Needed
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## 📄 License

© 2025 Letifi Realty. All rights reserved.

## 🤝 Support

For support, email info@letifirealty.com or call +234 800 000 0000.

---

**Note**: This website includes a complete backend integration with Supabase. Make sure your Supabase project is properly configured and the edge functions are deployed before using in production.
