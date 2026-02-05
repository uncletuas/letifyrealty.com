import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, Mail, MessageCircle, Save, Send } from 'lucide-react';
import { supabase } from '../../../utils/supabase/client';
import { projectId } from '../../../utils/supabase/info';

interface UserDashboardProps {
  session: Session;
  onClose?: () => void;
  embedded?: boolean;
}

interface ProfileData {
  fullName: string;
  gender: string;
  age: number | '';
  address: string;
  phone: string;
  location: string;
  interests: {
    propertyTypes: string[];
    serviceTypes: string[];
  };
}

interface RequestItem {
  id: string;
  propertyId?: string;
  requestType: string;
  serviceType?: string;
  propertyType?: string;
  budget?: string;
  message?: string;
  createdAt: string;
  status?: string;
}

interface MessageItem {
  id: string;
  from: string;
  content: string;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export function UserDashboard({ session, onClose, embedded = false }: UserDashboardProps) {
  const accessToken = session.access_token;
  const [profile, setProfile] = useState<ProfileData>({
    fullName: session.user.user_metadata?.full_name || '',
    gender: session.user.user_metadata?.gender || '',
    age: session.user.user_metadata?.age || '',
    address: session.user.user_metadata?.address || '',
    phone: '',
    location: '',
    interests: { propertyTypes: [], serviceTypes: [] },
  });
  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [requestData, setRequestData] = useState({
    requestType: 'service',
    serviceType: 'Sales',
    propertyType: 'Sale',
    budget: '',
    message: '',
  });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [messageStatus, setMessageStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchRequests();
    fetchMessages();
    fetchNotifications();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/profiles/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.profile) {
        setProfile({
          fullName: data.profile.fullName || session.user.user_metadata?.full_name || '',
          gender: data.profile.gender || session.user.user_metadata?.gender || '',
          age: data.profile.age ?? session.user.user_metadata?.age ?? '',
          address: data.profile.address || session.user.user_metadata?.address || '',
          phone: data.profile.phone || '',
          location: data.profile.location || '',
          interests: data.profile.interests || { propertyTypes: [], serviceTypes: [] },
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/messages`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/requests/me`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleProfileSave = async () => {
    const ageValue =
      typeof profile.age === 'string'
        ? Number(profile.age)
        : profile.age;
    if (!profile.gender || !profile.address || !ageValue || Number.isNaN(ageValue) || ageValue < 18) {
      setProfileStatus('error');
      setProfileError('Please provide your gender, address, and confirm you are 18 or older.');
      return;
    }

    setProfileStatus('saving');
    setProfileError(null);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/profiles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ ...profile, age: ageValue }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setProfileStatus('saved');
        setTimeout(() => setProfileStatus('idle'), 3000);
      } else {
        setProfileError(data.error || 'Could not save profile.');
        setProfileStatus('error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfileError('Could not save profile.');
      setProfileStatus('error');
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ageValue =
      typeof profile.age === 'string'
        ? Number(profile.age)
        : profile.age;
    if (!profile.gender || !profile.address || !ageValue || Number.isNaN(ageValue) || ageValue < 18) {
      setRequestError('Complete your profile and confirm you are 18+ to submit requests.');
      setRequestStatus('error');
      return;
    }

    setRequestStatus('sending');
    setRequestError(null);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(requestData),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setRequestStatus('sent');
        fetchRequests();
        setRequestData({
          requestType: 'service',
          serviceType: 'Sales',
          propertyType: 'Sale',
          budget: '',
          message: '',
        });
        setTimeout(() => setRequestStatus('idle'), 3000);
      } else {
        setRequestError(data.error || 'Request failed.');
        setRequestStatus('error');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setRequestError('Request failed.');
      setRequestStatus('error');
    }
  };

  const handleMessageSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    setMessageStatus('sending');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content: messageContent }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setMessageStatus('sent');
        setMessageContent('');
        fetchMessages();
        fetchRequests();
        setTimeout(() => setMessageStatus('idle'), 2000);
      } else {
        setMessageStatus('error');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageStatus('error');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose?.();
  };

  const toggleInterest = (type: 'propertyTypes' | 'serviceTypes', value: string) => {
    setProfile((prev) => {
      const list = prev.interests[type];
      const updated = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return {
        ...prev,
        interests: {
          ...prev.interests,
          [type]: updated,
        },
      };
    });
  };

  const ageValue =
    typeof profile.age === 'string'
      ? Number(profile.age)
      : profile.age;
  const isAdult = !!ageValue && !Number.isNaN(ageValue) && ageValue >= 18;
  const isProfileComplete = !!profile.gender && !!profile.address && isAdult;

  const dashboardGrid = (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl" style={{ fontWeight: 700 }}>Profile</h2>
            <span
              className={`text-xs px-3 py-1 rounded-full border ${
                isProfileComplete
                  ? 'border-green-500/40 text-green-500 bg-green-500/10'
                  : 'border-amber-500/40 text-amber-500 bg-amber-500/10'
              }`}
            >
              {isProfileComplete ? 'Verified 18+' : 'Complete required fields'}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="">Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Age</label>
              <input
                type="number"
                min={18}
                value={profile.age}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    age: e.target.value === '' ? '' : Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <p className="text-xs text-foreground/60 mt-1">Must be 18 or older.</p>
            </div>
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm text-foreground/80">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 text-sm text-foreground/80">City / State</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-foreground/80 mb-2">Property Interests</div>
              <div className="flex flex-wrap gap-2">
                {['Sale', 'Rent', 'Airbnb', 'Commercial'].map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleInterest('propertyTypes', item)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      profile.interests.propertyTypes.includes(item)
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-foreground/70 hover:border-primary/50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm text-foreground/80 mb-2">Service Interests</div>
              <div className="flex flex-wrap gap-2">
                {['Sales', 'Management', 'Advisory', 'Marketing'].map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleInterest('serviceTypes', item)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      profile.interests.serviceTypes.includes(item)
                        ? 'bg-primary text-white border-primary'
                        : 'border-border text-foreground/70 hover:border-primary/50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handleProfileSave}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-5 py-3 rounded-lg"
            >
              <Save size={18} />
              Save Profile
            </button>
            {profileStatus === 'saved' && (
              <span className="text-sm text-green-500">Profile updated.</span>
            )}
            {profileStatus === 'error' && (
              <span className="text-sm text-red-500">{profileError || 'Could not save profile.'}</span>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-xl mb-6" style={{ fontWeight: 700 }}>
            Request Service or Purchase
          </h2>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 text-sm text-foreground/80">Request Type</label>
                <select
                  value={requestData.requestType}
                  onChange={(e) => setRequestData({ ...requestData, requestType: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="service">Service Request</option>
                  <option value="purchase">Purchase / Booking</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm text-foreground/80">Property Type</label>
                <select
                  value={requestData.propertyType}
                  onChange={(e) => setRequestData({ ...requestData, propertyType: e.target.value })}
                  className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="Sale">Sale</option>
                  <option value="Rent">Rent</option>
                  <option value="Airbnb">Airbnb</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Service Type</label>
              <select
                value={requestData.serviceType}
                onChange={(e) => setRequestData({ ...requestData, serviceType: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="Sales">Sales</option>
                <option value="Management">Management</option>
                <option value="Advisory">Advisory</option>
                <option value="Marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Budget (Optional)</label>
              <input
                type="text"
                value={requestData.budget}
                onChange={(e) => setRequestData({ ...requestData, budget: e.target.value })}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="N5,000,000"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-foreground/80">Message</label>
              <textarea
                value={requestData.message}
                onChange={(e) => setRequestData({ ...requestData, message: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                placeholder="Tell us exactly what you need..."
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-5 py-3 rounded-lg"
              >
                <Send size={18} />
                Submit Request
              </button>
              {requestStatus === 'sent' && (
                <span className="text-sm text-green-500">Request sent.</span>
              )}
              {requestStatus === 'error' && (
                <span className="text-sm text-red-500">{requestError || 'Request failed.'}</span>
              )}
            </div>
          </form>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <h2 className="text-xl mb-6" style={{ fontWeight: 700 }}>
            Reservations & History
          </h2>
          <p className="text-sm text-foreground/70 mb-6">
            Track your bookings, service requests, and previous activities.
          </p>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {requests.length === 0 ? (
              <div className="text-sm text-foreground/60">No reservations yet.</div>
            ) : (
              requests.map((request) => (
                <div key={request.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
                    <span>{request.requestType === 'purchase' ? 'Reservation / Purchase' : 'Service Request'}</span>
                    <span>{new Date(request.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>
                    {request.propertyType || request.serviceType || 'General Request'}
                  </div>
                  <div className="text-xs text-foreground/70 mt-1">
                    Status: {request.status || 'new'}
                  </div>
                  {request.message && (
                    <div className="text-xs text-foreground/60 mt-2 whitespace-pre-line">
                      {request.message.length > 160 ? `${request.message.slice(0, 160)}...` : request.message}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle size={20} className="text-primary" />
            <h2 className="text-xl" style={{ fontWeight: 700 }}>Messages</h2>
          </div>
          <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
            {messages.length === 0 ? (
              <div className="text-sm text-foreground/60">No messages yet.</div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
                    <span>{message.from === 'admin' ? 'Letifi Admin' : 'You'}</span>
                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-foreground/80 whitespace-pre-line">{message.content}</div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleMessageSend} className="flex flex-col gap-3">
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              placeholder="Send a message to the admin..."
            />
            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-5 py-3 rounded-lg"
              >
                <Mail size={18} />
                Send Message
              </button>
              {messageStatus === 'sent' && (
                <span className="text-sm text-green-500">Message sent.</span>
              )}
              {messageStatus === 'error' && (
                <span className="text-sm text-red-500">Message failed.</span>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell size={18} className="text-primary" />
            <h3 className="text-lg" style={{ fontWeight: 600 }}>Notifications</h3>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {notifications.length === 0 ? (
              <div className="text-sm text-foreground/60">No notifications yet.</div>
            ) : (
              notifications.map((note) => (
                <div key={note.id} className="border border-border rounded-lg p-3">
                  <div className="text-xs text-foreground/60 mb-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </div>
                  <div className="text-sm" style={{ fontWeight: 600 }}>{note.title}</div>
                  <div className="text-xs text-foreground/70 whitespace-pre-line">{note.body}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6">
          <h3 className="text-lg mb-3" style={{ fontWeight: 600 }}>Account Status</h3>
          <p className="text-sm text-foreground/70 mb-4">
            Your account gives you access to all Letifi Realty services, purchases, and priority updates.
          </p>
          <div className="text-sm text-foreground/80 space-y-1">
            <div>Email: {session.user.email}</div>
            <div>Member since: {new Date(session.user.created_at || '').toLocaleDateString()}</div>
            <div>Profile: {isProfileComplete ? 'Complete' : 'Incomplete'}</div>
            <div>Reservations: {requests.length}</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <section id="member-hub" className="py-24 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl mb-2" style={{ fontWeight: 700 }}>Member Dashboard</h2>
              <p className="text-sm text-foreground/70">
                Manage your profile, reservations, requests, and notifications in one place.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-foreground/70">{session.user.email}</span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg border border-border hover:border-primary/50 text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
          {!isProfileComplete && (
            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-600">
              Complete your profile (gender, age 18+, and address) to unlock reservations and purchase requests.
            </div>
          )}
          {dashboardGrid}
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {onClose && (
            <motion.button
              onClick={onClose}
              className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
              whileHover={{ x: -4 }}
            >
              <ArrowLeft size={18} />
              Back to site
            </motion.button>
          )}
          <div className="flex items-center gap-4">
            <span className="text-sm text-foreground/70">{session.user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg border border-border hover:border-primary/50 text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {!isProfileComplete && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-6 py-4 text-sm text-amber-600">
            Complete your profile (gender, age 18+, and address) to unlock reservations and purchase requests.
          </div>
        )}
        {dashboardGrid}
      </div>
    </div>
  );
}
