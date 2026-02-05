import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, Mail, MessageCircle, Save, Send } from 'lucide-react';
import { supabase } from '../../../utils/supabase/client';
import { projectId } from '../../../utils/supabase/info';

interface UserDashboardProps {
  session: Session;
  onClose: () => void;
}

interface ProfileData {
  fullName: string;
  phone: string;
  location: string;
  interests: {
    propertyTypes: string[];
    serviceTypes: string[];
  };
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

export function UserDashboard({ session, onClose }: UserDashboardProps) {
  const accessToken = session.access_token;
  const [profile, setProfile] = useState<ProfileData>({
    fullName: session.user.user_metadata?.full_name || '',
    phone: '',
    location: '',
    interests: { propertyTypes: [], serviceTypes: [] },
  });
  const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [requestData, setRequestData] = useState({
    requestType: 'service',
    serviceType: 'Sales',
    propertyType: 'Sale',
    budget: '',
    message: '',
  });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [messageStatus, setMessageStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    fetchProfile();
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
    setProfileStatus('saving');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ef402f1d/profiles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(profile),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setProfileStatus('saved');
        setTimeout(() => setProfileStatus('idle'), 3000);
      } else {
        setProfileStatus('error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setProfileStatus('error');
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestStatus('sending');
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
        setRequestData({
          requestType: 'service',
          serviceType: 'Sales',
          propertyType: 'Sale',
          budget: '',
          message: '',
        });
        setTimeout(() => setRequestStatus('idle'), 3000);
      } else {
        setRequestStatus('error');
      }
    } catch (error) {
      console.error('Error sending request:', error);
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
    onClose();
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <motion.button
            onClick={onClose}
            className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft size={18} />
            Back to site
          </motion.button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-2xl p-8">
              <h2 className="text-xl mb-6" style={{ fontWeight: 700 }}>Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                  <label className="block mb-2 text-sm text-foreground/80">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm text-foreground/80">Location</label>
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
                  <span className="text-sm text-red-500">Could not save profile.</span>
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
                    placeholder="â‚¦5,000,000"
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
                    <span className="text-sm text-red-500">Request failed.</span>
                  )}
                </div>
              </form>
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
              <div className="text-sm text-foreground/80">
                <div>Email: {session.user.email}</div>
                <div>Member since: {new Date(session.user.created_at || '').toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
