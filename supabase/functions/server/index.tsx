import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as kv from "./kv_store.tsx";

const app = new Hono();
const ADMIN_EMAILS = new Set([
  "tuasiking@gmail.com",
  "tuamenebestgod@gmail.com",
  "letifyholdings@gmail.com",
  "loopital.finanace@gmail.com",
  "services.opal@gmail.com",
]);

const adminClient = () =>
  createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  );

const getBearerToken = (authHeader: string | undefined | null) => {
  if (!authHeader) return null;
  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
};

const getAuthUser = async (c: any) => {
  const token = getBearerToken(c.req.header("Authorization"));
  if (!token) return null;
  const supabase = adminClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    console.error("Auth error:", error);
    return null;
  }
  return data.user;
};

const requireAuth = async (c: any) => {
  const user = await getAuthUser(c);
  if (!user) {
    return { user: null, errorResponse: c.json({ error: "Unauthorized" }, 401) };
  }
  return { user, errorResponse: null };
};

const requireAdmin = async (c: any) => {
  const { user, errorResponse } = await requireAuth(c);
  if (errorResponse) return { user: null, errorResponse };
  const email = user?.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.has(email)) {
    return { user: null, errorResponse: c.json({ error: "Forbidden" }, 403) };
  }
  return { user, errorResponse: null };
};

const createAdminNotification = async (title: string, body: string) => {
  const id = `admin_notification_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await kv.set(id, {
    id,
    title,
    body,
    createdAt: new Date().toISOString(),
  });
};

const createUserNotification = async (userId: string, title: string, body: string) => {
  const id = `notification_${userId}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  await kv.set(id, {
    id,
    userId,
    title,
    body,
    createdAt: new Date().toISOString(),
  });
};

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
async function sendEmail(to: string | string[], subject: string, html: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY is not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const recipients = Array.isArray(to) ? to : [to];
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Letifi Realty <onboarding@resend.dev>',
        to: recipients,
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
    await createAdminNotification(
      "New Contact Inquiry",
      `${name} submitted a contact inquiry.`,
    );

    // Send email notification
    const emailHtml = `
      <h2>New Contact Inquiry from Letifi Realty Website</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr>
      <p><small>Received on: ${new Date().toLocaleString()}</small></p>
    `;

    await sendEmail('info@letifirealty.com', `New Contact Inquiry from ${name}`, emailHtml);

    return c.json({ success: true, inquiryId });
  } catch (error) {
    console.error('Error creating contact inquiry:', error);
    return c.json({ error: 'Failed to submit inquiry' }, 500);
  }
});

// Get all contact inquiries
app.get("/make-server-ef402f1d/contact/all", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
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
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
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
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
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
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
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

    await createAdminNotification(
      "New Property Inquiry",
      `${name} requested details about ${propertyTitle}.`,
    );

    const emailHtml = `
      <h2>New Property Inquiry from Letifi Realty Website</h2>
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

    await sendEmail('info@letifirealty.com', `Property Inquiry: ${propertyTitle}`, emailHtml);

    return c.json({ success: true, inquiryId });
  } catch (error) {
    console.error('Error creating property inquiry:', error);
    return c.json({ error: 'Failed to submit inquiry' }, 500);
  }
});

// Get all property inquiries (admin only)
app.get("/make-server-ef402f1d/property-inquiries/all", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const inquiries = await kv.getByPrefix('prop_inquiry_');
    return c.json({ inquiries });
  } catch (error) {
    console.error('Error fetching property inquiries:', error);
    return c.json({ error: 'Failed to fetch inquiries' }, 500);
  }
});

// User profile routes
app.get("/make-server-ef402f1d/profiles/me", async (c) => {
  try {
    const { user, errorResponse } = await requireAuth(c);
    if (errorResponse) return errorResponse;
    const profile = await kv.get(`profile_${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.post("/make-server-ef402f1d/profiles", async (c) => {
  try {
    const { user, errorResponse } = await requireAuth(c);
    if (errorResponse) return errorResponse;
    const body = await c.req.json();
    const ageValue =
      body.age === undefined || body.age === null || body.age === ""
        ? null
        : Number(body.age);
    if (ageValue !== null && (Number.isNaN(ageValue) || ageValue < 18)) {
      return c.json({ error: "You must be 18 or older to register." }, 400);
    }
    const existingProfile = await kv.get(`profile_${user.id}`);
    const profile = {
      userId: user.id,
      email: user.email,
      fullName: body.fullName || '',
      gender: body.gender || '',
      age: ageValue,
      address: body.address || '',
      phone: body.phone || '',
      location: body.location || '',
      interests: body.interests || { propertyTypes: [], serviceTypes: [] },
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`profile_${user.id}`, profile);

    if (!existingProfile && user.email) {
      await sendEmail(
        user.email,
        "Welcome to Letifi Realty",
        `
          <h2>Welcome to Letifi Realty</h2>
          <p>Hello ${profile.fullName || "there"},</p>
          <p>Your account has been created successfully. You can now sign in anytime to manage your profile, requests, and reservations.</p>
          <p>We are excited to support your real estate journey.</p>
        `,
      );
    }
    return c.json({ success: true, profile });
  } catch (error) {
    console.error('Error saving profile:', error);
    return c.json({ error: 'Failed to save profile' }, 500);
  }
});

// Service requests / purchases
app.post("/make-server-ef402f1d/requests", async (c) => {
  try {
    const { user, errorResponse } = await requireAuth(c);
    if (errorResponse) return errorResponse;
    const body = await c.req.json();
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request = {
      id: requestId,
      userId: user.id,
      email: user.email,
      propertyId: body.propertyId || '',
      requestType: body.requestType || 'service',
      serviceType: body.serviceType || '',
      propertyType: body.propertyType || '',
      budget: body.budget || '',
      message: body.message || '',
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    await kv.set(requestId, request);
      await createAdminNotification(
        "New Service Request",
        `${user.email} submitted a ${request.requestType} request.`,
      );

      await createUserNotification(
        user.id,
        "Request received",
        `We received your ${request.requestType} request. Our team will reach out shortly with next steps.`,
      );

      if (user.email) {
        await sendEmail(
          user.email,
          "Request Received - Letifi Realty",
          `
            <h2>Request Received</h2>
            <p>Hello ${user.email},</p>
            <p>We have received your ${request.requestType} request.</p>
            <p><strong>Service:</strong> ${request.serviceType || 'N/A'}</p>
            <p><strong>Property:</strong> ${request.propertyType || 'N/A'}</p>
            ${request.budget ? `<p><strong>Budget:</strong> ${request.budget}</p>` : ''}
            ${request.message ? `<p><strong>Message:</strong></p><p>${request.message}</p>` : ''}
            <p>We will contact you shortly.</p>
          `,
        );
      }

    await sendEmail(
      Array.from(ADMIN_EMAILS),
      `New ${request.requestType} request`,
      `
        <h2>New Request from ${user.email}</h2>
        <p><strong>Type:</strong> ${request.requestType}</p>
        <p><strong>Service:</strong> ${request.serviceType}</p>
        <p><strong>Property:</strong> ${request.propertyType}</p>
        <p><strong>Budget:</strong> ${request.budget}</p>
        <p><strong>Message:</strong></p>
        <p>${request.message}</p>
      `,
    );

    return c.json({ success: true, requestId });
  } catch (error) {
    console.error('Error creating request:', error);
    return c.json({ error: 'Failed to submit request' }, 500);
  }
});

// Reservation requests
app.post("/make-server-ef402f1d/reservations", async (c) => {
  try {
    const body = await c.req.json();
    const {
      propertyId,
      propertyTitle,
      propertyType,
      name,
      email,
      phone,
      checkIn,
      checkOut,
      moveIn,
      guests,
      leaseTerm,
      notes,
      paymentMethod,
    } = body;

    if (!propertyId || !name || !email || !phone) {
      return c.json({ error: "propertyId, name, email, and phone are required" }, 400);
    }

    const reservationId = `reservation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const reservation = {
      id: reservationId,
      propertyId,
      propertyTitle: propertyTitle || '',
      propertyType: propertyType || '',
      name,
      email,
      phone,
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      moveIn: moveIn || '',
      guests: guests || 1,
      leaseTerm: leaseTerm || '',
      notes: notes || '',
      paymentMethod: paymentMethod || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    await kv.set(reservationId, reservation);
    await createAdminNotification(
      "New Reservation",
      `${name} reserved ${reservation.propertyTitle || 'a property'}.`,
    );

    await sendEmail(
      email,
      "Reservation Received - Letifi Realty",
      `
        <h2>Reservation Received</h2>
        <p>Hello ${name},</p>
        <p>We have received your reservation request for ${reservation.propertyTitle || 'your selected property'}.</p>
        <p><strong>Property Type:</strong> ${reservation.propertyType || 'N/A'}</p>
        <p><strong>Check-in:</strong> ${reservation.checkIn || 'N/A'}</p>
        <p><strong>Check-out:</strong> ${reservation.checkOut || 'N/A'}</p>
        <p><strong>Move-in:</strong> ${reservation.moveIn || 'N/A'}</p>
        <p><strong>Guests:</strong> ${reservation.guests || 'N/A'}</p>
        <p><strong>Payment Method:</strong> ${reservation.paymentMethod || 'N/A'}</p>
        ${reservation.notes ? `<p><strong>Notes:</strong> ${reservation.notes}</p>` : ''}
        <p>We will reach out shortly with next steps.</p>
      `,
    );

    await sendEmail(
      Array.from(ADMIN_EMAILS),
      "New Reservation Request",
      `
        <h2>New Reservation Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Property:</strong> ${reservation.propertyTitle || propertyId}</p>
        <p><strong>Type:</strong> ${reservation.propertyType || 'N/A'}</p>
        <p><strong>Check-in:</strong> ${reservation.checkIn || 'N/A'}</p>
        <p><strong>Check-out:</strong> ${reservation.checkOut || 'N/A'}</p>
        <p><strong>Move-in:</strong> ${reservation.moveIn || 'N/A'}</p>
        <p><strong>Guests:</strong> ${reservation.guests || 'N/A'}</p>
        <p><strong>Payment Method:</strong> ${reservation.paymentMethod || 'N/A'}</p>
        ${reservation.notes ? `<p><strong>Notes:</strong> ${reservation.notes}</p>` : ''}
      `,
    );

    return c.json({ success: true, reservationId });
  } catch (error) {
    console.error('Error creating reservation:', error);
    return c.json({ error: 'Failed to submit reservation' }, 500);
  }
});

app.get("/make-server-ef402f1d/reservations/all", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const reservations = await kv.getByPrefix('reservation_');
    return c.json({ reservations });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    return c.json({ error: 'Failed to fetch reservations' }, 500);
  }
});

// Inspection booking
app.post("/make-server-ef402f1d/inspections", async (c) => {
  try {
    const body = await c.req.json();
    const {
      propertyId,
      propertyTitle,
      propertyType,
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      notes,
    } = body;

    if (!propertyId || !name || !email || !phone || !preferredDate) {
      return c.json({ error: "propertyId, name, email, phone, and preferredDate are required" }, 400);
    }

    const inspectionId = `inspection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inspection = {
      id: inspectionId,
      propertyId,
      propertyTitle: propertyTitle || '',
      propertyType: propertyType || '',
      name,
      email,
      phone,
      preferredDate,
      preferredTime: preferredTime || '',
      notes: notes || '',
      status: 'pending',
      confirmedDate: '',
      confirmedTime: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(inspectionId, inspection);
    await createAdminNotification(
      "New Inspection Booking",
      `${name} requested an inspection for ${inspection.propertyTitle || 'a property'}.`,
    );

    await sendEmail(
      email,
      "Inspection Booking Received - Letifi Realty",
      `
        <h2>Inspection Booking Received</h2>
        <p>Hello ${name},</p>
        <p>We have received your inspection request for ${inspection.propertyTitle || 'your selected property'}.</p>
        <p><strong>Preferred Date:</strong> ${preferredDate}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime || 'N/A'}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p>We will confirm your inspection date shortly.</p>
      `,
    );

    await sendEmail(
      Array.from(ADMIN_EMAILS),
      "New Inspection Request",
      `
        <h2>New Inspection Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Property:</strong> ${inspection.propertyTitle || propertyId}</p>
        <p><strong>Preferred Date:</strong> ${preferredDate}</p>
        <p><strong>Preferred Time:</strong> ${preferredTime || 'N/A'}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      `,
    );

    return c.json({ success: true, inspectionId });
  } catch (error) {
    console.error('Error creating inspection:', error);
    return c.json({ error: 'Failed to submit inspection' }, 500);
  }
});

app.get("/make-server-ef402f1d/inspections/all", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const inspections = await kv.getByPrefix('inspection_');
    return c.json({ inspections });
  } catch (error) {
    console.error('Error fetching inspections:', error);
    return c.json({ error: 'Failed to fetch inspections' }, 500);
  }
});

app.put("/make-server-ef402f1d/inspections/:id", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Inspection not found' }, 404);
    }

    const updated = {
      ...existing,
      status: body.status || existing.status,
      confirmedDate: body.confirmedDate || existing.confirmedDate,
      confirmedTime: body.confirmedTime || existing.confirmedTime,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(id, updated);

    await sendEmail(
      updated.email,
      "Inspection Update - Letifi Realty",
      `
        <h2>Inspection Update</h2>
        <p>Hello ${updated.name},</p>
        <p>Your inspection request for ${updated.propertyTitle || 'your selected property'} has been updated.</p>
        <p><strong>Status:</strong> ${updated.status}</p>
        <p><strong>Confirmed Date:</strong> ${updated.confirmedDate || 'Pending'}</p>
        <p><strong>Confirmed Time:</strong> ${updated.confirmedTime || 'Pending'}</p>
        <p>Thank you for choosing Letifi Realty.</p>
      `,
    );

    return c.json({ success: true, inspection: updated });
  } catch (error) {
    console.error('Error updating inspection:', error);
    return c.json({ error: 'Failed to update inspection' }, 500);
  }
});

// Consultation requests
app.post("/make-server-ef402f1d/consultations", async (c) => {
  try {
    const body = await c.req.json();
    const {
      propertyId,
      propertyTitle,
      name,
      email,
      phone,
      date,
      time,
      topic,
      notes,
    } = body;

    if (!name || !email || !phone || !date) {
      return c.json({ error: "name, email, phone, and date are required" }, 400);
    }

    const consultationId = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const consultation = {
      id: consultationId,
      propertyId: propertyId || '',
      propertyTitle: propertyTitle || '',
      name,
      email,
      phone,
      date,
      time: time || '',
      topic: topic || 'Consultation',
      notes: notes || '',
      status: 'pending',
      confirmedDate: '',
      confirmedTime: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(consultationId, consultation);
    await createAdminNotification(
      "New Consultation Request",
      `${name} requested a consultation.`,
    );

    await sendEmail(
      email,
      "Consultation Request Received - Letifi Realty",
      `
        <h2>Consultation Request Received</h2>
        <p>Hello ${name},</p>
        <p>We have received your consultation request.</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time || 'N/A'}</p>
        <p><strong>Topic:</strong> ${topic || 'Consultation'}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
        <p>We will confirm your consultation shortly.</p>
      `,
    );

    await sendEmail(
      Array.from(ADMIN_EMAILS),
      "New Consultation Request",
      `
        <h2>New Consultation Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time || 'N/A'}</p>
        <p><strong>Topic:</strong> ${topic || 'Consultation'}</p>
        ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      `,
    );

    return c.json({ success: true, consultationId });
  } catch (error) {
    console.error('Error creating consultation:', error);
    return c.json({ error: 'Failed to submit consultation' }, 500);
  }
});

app.get("/make-server-ef402f1d/consultations/all", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const consultations = await kv.getByPrefix('consultation_');
    return c.json({ consultations });
  } catch (error) {
    console.error('Error fetching consultations:', error);
    return c.json({ error: 'Failed to fetch consultations' }, 500);
  }
});

app.put("/make-server-ef402f1d/consultations/:id", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(id);
    if (!existing) {
      return c.json({ error: 'Consultation not found' }, 404);
    }

    const updated = {
      ...existing,
      status: body.status || existing.status,
      confirmedDate: body.confirmedDate || existing.confirmedDate,
      confirmedTime: body.confirmedTime || existing.confirmedTime,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(id, updated);

    await sendEmail(
      updated.email,
      "Consultation Update - Letifi Realty",
      `
        <h2>Consultation Update</h2>
        <p>Hello ${updated.name},</p>
        <p>Your consultation request has been updated.</p>
        <p><strong>Status:</strong> ${updated.status}</p>
        <p><strong>Confirmed Date:</strong> ${updated.confirmedDate || 'Pending'}</p>
        <p><strong>Confirmed Time:</strong> ${updated.confirmedTime || 'Pending'}</p>
        <p>Thank you for choosing Letifi Realty.</p>
      `,
    );

    return c.json({ success: true, consultation: updated });
  } catch (error) {
    console.error('Error updating consultation:', error);
    return c.json({ error: 'Failed to update consultation' }, 500);
  }
});

app.get("/make-server-ef402f1d/requests/me", async (c) => {
  try {
    const { user, errorResponse } = await requireAuth(c);
    if (errorResponse) return errorResponse;
    const requests = await kv.getByPrefix('request_');
    const filtered = requests
      .filter((request: any) => request.userId === user.id)
      .sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    return c.json({ requests: filtered });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    return c.json({ error: 'Failed to fetch requests' }, 500);
  }
});

app.get("/make-server-ef402f1d/requests/all", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const requests = await kv.getByPrefix('request_');
    return c.json({ requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return c.json({ error: 'Failed to fetch requests' }, 500);
  }
});

// Messaging routes
app.post("/make-server-ef402f1d/messages", async (c) => {
  try {
    const { user, errorResponse } = await requireAuth(c);
    if (errorResponse) return errorResponse;
    const body = await c.req.json();
    if (!body.content) {
      return c.json({ error: "Message content required" }, 400);
    }
    const messageId = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      userId: user.id,
      email: user.email,
      from: 'user',
      content: body.content,
      createdAt: new Date().toISOString(),
    };
    await kv.set(messageId, message);
    await createAdminNotification(
      "New User Message",
      `${user.email} sent a new message.`,
    );
    await sendEmail(
      Array.from(ADMIN_EMAILS),
      "New message from a user",
      `
        <h2>New User Message</h2>
        <p><strong>User:</strong> ${user.email}</p>
        <p>${body.content}</p>
      `,
    );
    return c.json({ success: true, messageId });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

app.get("/make-server-ef402f1d/messages", async (c) => {
  try {
    const { user, errorResponse } = await requireAuth(c);
    if (errorResponse) return errorResponse;
    const messages = await kv.getByPrefix('message_');
    const filtered = messages.filter((message: any) => message.userId === user.id);
    return c.json({ messages: filtered });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

app.get("/make-server-ef402f1d/admin/messages", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const messages = await kv.getByPrefix('message_');
    return c.json({ messages });
  } catch (error) {
    console.error('Error fetching admin messages:', error);
    return c.json({ error: 'Failed to fetch messages' }, 500);
  }
});

app.post("/make-server-ef402f1d/admin/messages", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const body = await c.req.json();
    if (!body.userId || !body.content) {
      return c.json({ error: "userId and content are required" }, 400);
    }
    const messageId = `message_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const message = {
      id: messageId,
      userId: body.userId,
      email: body.email || '',
      from: 'admin',
      content: body.content,
      createdAt: new Date().toISOString(),
    };
    await kv.set(messageId, message);
    await createUserNotification(
      body.userId,
      "New message from Letifi Realty",
      body.content,
    );
    if (body.email) {
      await sendEmail(
        body.email,
        "Message from Letifi Realty",
        `
          <h2>New Message from Letifi Realty</h2>
          <p>${body.content}</p>
        `,
      );
    }
    return c.json({ success: true, messageId });
  } catch (error) {
    console.error('Error sending admin message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// Notifications
app.get("/make-server-ef402f1d/notifications", async (c) => {
  try {
    const { user, errorResponse } = await requireAuth(c);
    if (errorResponse) return errorResponse;
    const notifications = await kv.getByPrefix(`notification_${user.id}_`);
    return c.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

app.get("/make-server-ef402f1d/admin/notifications", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const notifications = await kv.getByPrefix('admin_notification_');
    return c.json({ notifications });
  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Mailing list management
app.post("/make-server-ef402f1d/admin/mailing-lists", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const body = await c.req.json();
    if (!body.name || !body.category || !body.interests?.length) {
      return c.json({ error: "name, category, and interests are required" }, 400);
    }
    const listId = `list_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const list = {
      id: listId,
      name: body.name,
      category: body.category,
      interests: body.interests,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`mailing_list_${listId}`, list);
    return c.json({ success: true, list });
  } catch (error) {
    console.error('Error creating mailing list:', error);
    return c.json({ error: 'Failed to create mailing list' }, 500);
  }
});

app.get("/make-server-ef402f1d/admin/mailing-lists", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const lists = await kv.getByPrefix('mailing_list_');
    return c.json({ lists });
  } catch (error) {
    console.error('Error fetching mailing lists:', error);
    return c.json({ error: 'Failed to fetch mailing lists' }, 500);
  }
});

app.post("/make-server-ef402f1d/admin/mailing-lists/:id/send", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const id = c.req.param('id');
    const list = await kv.get(`mailing_list_${id}`);
    if (!list) {
      return c.json({ error: "Mailing list not found" }, 404);
    }
    const body = await c.req.json();
    if (!body.subject || !body.body) {
      return c.json({ error: "subject and body are required" }, 400);
    }
    const profiles = await kv.getByPrefix('profile_');
    const categoryKey = list.category === 'service' ? 'serviceTypes' : 'propertyTypes';
    const matchingProfiles = profiles.filter((profile: any) => {
      const interests = profile?.interests?.[categoryKey] || [];
      return interests.some((value: string) => list.interests.includes(value));
    });
    const recipients = matchingProfiles
      .map((profile: any) => profile.email)
      .filter((email: string) => !!email);

    if (recipients.length === 0) {
      return c.json({ error: "No matching recipients found" }, 400);
    }

    await sendEmail(
      recipients,
      body.subject,
      `
        <h2>${body.subject}</h2>
        <p>${body.body}</p>
      `,
    );

    await Promise.all(
      matchingProfiles.map((profile: any) =>
        createUserNotification(
          profile.userId,
          body.subject,
          body.body,
        ),
      ),
    );

    return c.json({ success: true, sent: recipients.length });
  } catch (error) {
    console.error('Error sending mailing list:', error);
    return c.json({ error: 'Failed to send mailing list' }, 500);
  }
});

// Admin: list users for messaging
app.get("/make-server-ef402f1d/admin/users", async (c) => {
  try {
    const { errorResponse } = await requireAdmin(c);
    if (errorResponse) return errorResponse;
    const supabase = adminClient();
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return c.json({ error: error.message }, 500);
    }
    const users = (data?.users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
    }));
    return c.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

Deno.serve(app.fetch);
