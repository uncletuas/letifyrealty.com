import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to send email via Resend
async function sendEmail(to: string, subject: string, html: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Letify Realty <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

// Health check endpoint
app.get("/make-server-ef402f1d/health", (c) => {
  return c.json({ status: "ok" });
});

// Contact Inquiries Routes
app.post("/make-server-ef402f1d/contact", async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !phone || !message) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const inquiryId = `inquiry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inquiry = {
      id: inquiryId,
      name,
      email,
      phone,
      message,
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    await kv.set(inquiryId, inquiry);
    console.log(`Contact inquiry created: ${inquiryId}`);

    // Send email notification
    const emailHtml = `
      <h2>New Contact Inquiry from Letify Realty Website</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr>
      <p><small>Received on: ${new Date().toLocaleString()}</small></p>
    `;

    await sendEmail('info@letifyrealty.com', `New Contact Inquiry from ${name}`, emailHtml);

    return c.json({ success: true, inquiryId });
  } catch (error) {
    console.error('Error creating contact inquiry:', error);
    return c.json({ error: 'Failed to submit inquiry' }, 500);
  }
});

// Get all contact inquiries
app.get("/make-server-ef402f1d/contact/all", async (c) => {
  try {
    const inquiries = await kv.getByPrefix('inquiry_');
    return c.json({ inquiries });
  } catch (error) {
    console.error('Error fetching contact inquiries:', error);
    return c.json({ error: 'Failed to fetch inquiries' }, 500);
  }
});

// Property Routes
app.post("/make-server-ef402f1d/properties", async (c) => {
  try {
    const body = await c.req.json();
    const { title, location, price, type, description, bedrooms, bathrooms, area, images, videos, features } = body;

    if (!title || !location || !price || !type) {
      return c.json({ error: "Required fields: title, location, price, type" }, 400);
    }

    const propertyId = `property_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const property = {
      id: propertyId,
      title,
      location,
      price,
      type,
      description: description || '',
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      area: area || '',
      images: images || [],
      videos: videos || [],
      features: features || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(propertyId, property);
    console.log(`Property created: ${propertyId}`);

    return c.json({ success: true, property });
  } catch (error) {
    console.error('Error creating property:', error);
    return c.json({ error: 'Failed to create property' }, 500);
  }
});

// Get all properties with optional filtering
app.get("/make-server-ef402f1d/properties", async (c) => {
  try {
    const type = c.req.query('type');
    const search = c.req.query('search');
    const minPrice = c.req.query('minPrice');
    const maxPrice = c.req.query('maxPrice');

    let properties = await kv.getByPrefix('property_');

    // Filter by type
    if (type && type !== 'all') {
      properties = properties.filter((p: any) => 
        p.type.toLowerCase() === type.toLowerCase()
      );
    }

    // Filter by search term (title or location)
    if (search) {
      const searchLower = search.toLowerCase();
      properties = properties.filter((p: any) =>
        p.title.toLowerCase().includes(searchLower) ||
        p.location.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      properties = properties.filter((p: any) => {
        const priceNum = parseFloat(p.price.replace(/[^\d]/g, ''));
        if (minPrice && priceNum < parseFloat(minPrice)) return false;
        if (maxPrice && priceNum > parseFloat(maxPrice)) return false;
        return true;
      });
    }

    return c.json({ properties });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return c.json({ error: 'Failed to fetch properties' }, 500);
  }
});

// Get single property by ID
app.get("/make-server-ef402f1d/properties/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const property = await kv.get(id);

    if (!property) {
      return c.json({ error: 'Property not found' }, 404);
    }

    return c.json({ property });
  } catch (error) {
    console.error('Error fetching property:', error);
    return c.json({ error: 'Failed to fetch property' }, 500);
  }
});

// Update property
app.put("/make-server-ef402f1d/properties/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    const existingProperty = await kv.get(id);
    if (!existingProperty) {
      return c.json({ error: 'Property not found' }, 404);
    }

    const updatedProperty = {
      ...existingProperty,
      ...body,
      updatedAt: new Date().toISOString()
    };

    await kv.set(id, updatedProperty);
    console.log(`Property updated: ${id}`);

    return c.json({ success: true, property: updatedProperty });
  } catch (error) {
    console.error('Error updating property:', error);
    return c.json({ error: 'Failed to update property' }, 500);
  }
});

// Delete property
app.delete("/make-server-ef402f1d/properties/:id", async (c) => {
  try {
    const id = c.req.param('id');
    await kv.del(id);
    console.log(`Property deleted: ${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return c.json({ error: 'Failed to delete property' }, 500);
  }
});

// Property Inquiry Routes
app.post("/make-server-ef402f1d/property-inquiries", async (c) => {
  try {
    const body = await c.req.json();
    const { propertyId, name, email, phone, message } = body;

    if (!propertyId || !name || !email || !phone) {
      return c.json({ error: "Required fields: propertyId, name, email, phone" }, 400);
    }

    // Fetch property details
    const property = await kv.get(propertyId);

    const inquiryId = `prop_inquiry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inquiry = {
      id: inquiryId,
      propertyId,
      name,
      email,
      phone,
      message: message || '',
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    await kv.set(inquiryId, inquiry);
    console.log(`Property inquiry created: ${inquiryId} for property: ${propertyId}`);

    // Send email notification
    const propertyTitle = property ? property.title : 'Unknown Property';
    const propertyLocation = property ? property.location : 'N/A';
    const propertyPrice = property ? property.price : 'N/A';

    const emailHtml = `
      <h2>New Property Inquiry from Letify Realty Website</h2>
      <h3>Property Details:</h3>
      <p><strong>Property:</strong> ${propertyTitle}</p>
      <p><strong>Location:</strong> ${propertyLocation}</p>
      <p><strong>Price:</strong> ${propertyPrice}</p>
      <hr>
      <h3>Inquirer Details:</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      ${message ? `<p><strong>Message:</strong></p><p>${message}</p>` : ''}
      <hr>
      <p><small>Received on: ${new Date().toLocaleString()}</small></p>
    `;

    await sendEmail('info@letifyrealty.com', `Property Inquiry: ${propertyTitle}`, emailHtml);

    return c.json({ success: true, inquiryId });
  } catch (error) {
    console.error('Error creating property inquiry:', error);
    return c.json({ error: 'Failed to submit inquiry' }, 500);
  }
});

Deno.serve(app.fetch);