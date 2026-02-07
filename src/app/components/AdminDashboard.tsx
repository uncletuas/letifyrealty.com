import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Bell, Download, Mail, MessageCircle, Send, Settings } from 'lucide-react';
import { supabase } from '../../../utils/supabase/client';
import { projectId } from '../../../utils/supabase/info';

interface AdminDashboardProps {
  onClose: () => void;
  accessToken: string;
  children?: React.ReactNode;
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

interface PropertyInquiry {
  id: string;
  propertyId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
}

interface ServiceRequest {
  id: string;
  requestType: string;
  serviceType: string;
  propertyType: string;
  budget?: string;
  message: string;
  createdAt: string;
  email: string;
}

interface InspectionRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyType: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime?: string;
  notes?: string;
  status: string;
  confirmedDate?: string;
  confirmedTime?: string;
  createdAt: string;
}

interface ConsultationRequest {
  id: string;
  propertyId?: string;
  propertyTitle?: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time?: string;
  topic?: string;
  notes?: string;
  status: string;
  confirmedDate?: string;
  confirmedTime?: string;
  createdAt: string;
}

interface AdminMessage {
  id: string;
  userId: string;
  email: string;
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

interface MailingList {
  id: string;
  name: string;
  category: 'property' | 'service';
  interests: string[];
  createdAt: string;
}

interface UserItem {
  id: string;
  email: string;
}

export function AdminDashboard({ onClose, accessToken, children }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'clients' | 'inspections' | 'consultations' | 'messages' | 'notifications' | 'mailing'>('overview');
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [propertyInquiries, setPropertyInquiries] = useState<PropertyInquiry[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [inspections, setInspections] = useState<InspectionRequest[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [mailingLists, setMailingLists] = useState<MailingList[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [messageData, setMessageData] = useState({ userId: '', email: '', content: '' });
  const [messageStatus, setMessageStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [mailingForm, setMailingForm] = useState({ name: '', category: 'property', interests: [] as string[] });
  const [mailingSend, setMailingSend] = useState({ listId: '', subject: '', body: '' });
  const [mailingStatus, setMailingStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [inspectionUpdates, setInspectionUpdates] = useState<Record<string, { status: string; confirmedDate: string; confirmedTime: string }>>({});
  const [consultationUpdates, setConsultationUpdates] = useState<Record<string, { status: string; confirmedDate: string; confirmedTime: string }>>({});

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    await Promise.all([
      fetchContactInquiries(),
      fetchPropertyInquiries(),
      fetchServiceRequests(),
      fetchInspections(),
      fetchConsultations(),
      fetchMessages(),
      fetchNotifications(),
      fetchMailingLists(),
      fetchUsers(),
    ]);
  };

  const fetchContactInquiries = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/contact/all`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (response.ok && data.inquiries) {
        setContactInquiries(data.inquiries);
      }
    } catch (error) {
      console.error('Error fetching contact inquiries:', error);
    }
  };

  const fetchPropertyInquiries = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/property-inquiries/all`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (response.ok && data.inquiries) {
        setPropertyInquiries(data.inquiries);
      }
    } catch (error) {
      console.error('Error fetching property inquiries:', error);
    }
  };

  const fetchServiceRequests = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/requests/all`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (response.ok && data.requests) {
        setServiceRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchInspections = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/inspections/all`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (response.ok && data.inspections) {
        setInspections(data.inspections);
      }
    } catch (error) {
      console.error('Error fetching inspections:', error);
    }
  };

  const fetchConsultations = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/consultations/all`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (response.ok && data.consultations) {
        setConsultations(data.consultations);
      }
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/admin/messages`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
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
        `https://${projectId}.supabase.co/functions/v1/server/admin/notifications`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (response.ok && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchMailingLists = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/admin/mailing-lists`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (response.ok && data.lists) {
        setMailingLists(data.lists);
      }
    } catch (error) {
      console.error('Error fetching mailing lists:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/admin/users`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await response.json();
      if (response.ok && data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  const clientRows = useMemo(() => ([
    ...contactInquiries.map((item) => ({
      source: 'Contact',
      name: item.name,
      email: item.email,
      phone: item.phone,
      message: item.message,
      createdAt: item.createdAt,
    })),
    ...propertyInquiries.map((item) => ({
      source: 'Property Inquiry',
      name: item.name,
      email: item.email,
      phone: item.phone,
      message: item.message || '',
      createdAt: item.createdAt,
    })),
    ...serviceRequests.map((item) => ({
      source: 'Service Request',
      name: '',
      email: item.email,
      phone: '',
      message: `${item.requestType} | ${item.serviceType} | ${item.propertyType} | ${item.message}`,
      createdAt: item.createdAt,
    })),
    ...inspections.map((item) => ({
      source: 'Inspection Booking',
      name: item.name,
      email: item.email,
      phone: item.phone,
      message: `${item.propertyTitle || item.propertyId} | ${item.preferredDate} ${item.preferredTime || ''} | ${item.status}`,
      createdAt: item.createdAt,
    })),
    ...consultations.map((item) => ({
      source: 'Consultation Request',
      name: item.name,
      email: item.email,
      phone: item.phone,
      message: `${item.topic || 'Consultation'} | ${item.date} ${item.time || ''} | ${item.status}`,
      createdAt: item.createdAt,
    })),
  ]), [contactInquiries, propertyInquiries, serviceRequests, inspections, consultations]);

  const handleUpdateInspection = async (id: string) => {
    const update = inspectionUpdates[id];
    if (!update) return;
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/inspections/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(update),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        fetchInspections();
      }
    } catch (error) {
      console.error('Error updating inspection:', error);
    }
  };

  const handleUpdateConsultation = async (id: string) => {
    const update = consultationUpdates[id];
    if (!update) return;
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/consultations/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(update),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        fetchConsultations();
      }
    } catch (error) {
      console.error('Error updating consultation:', error);
    }
  };

  const handleDownloadCsv = () => {
    const rows = clientRows;
    const header = ['Source', 'Name', 'Email', 'Phone', 'Message', 'Created At'];
    const csv = [
      header.join(','),
      ...rows.map((row) => [
        row.source,
        row.name,
        row.email,
        row.phone,
        `"${(row.message || '').replace(/"/g, '""')}"`,
        row.createdAt,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'letifi-client-data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageData.userId || !messageData.content) return;
    setMessageStatus('sending');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/admin/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(messageData),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setMessageStatus('sent');
        setMessageData({ userId: '', email: '', content: '' });
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

  const toggleMailingInterest = (value: string) => {
    setMailingForm((prev) => {
      const exists = prev.interests.includes(value);
      const updated = exists ? prev.interests.filter((item) => item !== value) : [...prev.interests, value];
      return { ...prev, interests: updated };
    });
  };

  const handleCreateMailingList = async () => {
    if (!mailingForm.name || mailingForm.interests.length === 0) return;
    setMailingStatus('sending');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/admin/mailing-lists`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify(mailingForm),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setMailingForm({ name: '', category: 'property', interests: [] });
        fetchMailingLists();
        setMailingStatus('sent');
        setTimeout(() => setMailingStatus('idle'), 2000);
      } else {
        setMailingStatus('error');
      }
    } catch (error) {
      console.error('Error creating mailing list:', error);
      setMailingStatus('error');
    }
  };

  const handleSendMailing = async () => {
    if (!mailingSend.listId || !mailingSend.subject || !mailingSend.body) return;
    setMailingStatus('sending');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/admin/mailing-lists/${mailingSend.listId}/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            subject: mailingSend.subject,
            body: mailingSend.body,
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        setMailingSend({ listId: '', subject: '', body: '' });
        setMailingStatus('sent');
        setTimeout(() => setMailingStatus('idle'), 2000);
      } else {
        setMailingStatus('error');
      }
    } catch (error) {
      console.error('Error sending mailing:', error);
      setMailingStatus('error');
    }
  };

  const stats = useMemo(() => ({
    contacts: contactInquiries.length,
    propertyInquiries: propertyInquiries.length,
    serviceRequests: serviceRequests.length,
    inspections: inspections.length,
    consultations: consultations.length,
    messages: messages.length,
    users: users.length,
  }), [contactInquiries, propertyInquiries, serviceRequests, inspections, consultations, messages, users]);

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
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg border border-border hover:border-primary/50 text-sm transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {[
            { label: 'Contacts', value: stats.contacts },
            { label: 'Property Inquiries', value: stats.propertyInquiries },
            { label: 'Service Requests', value: stats.serviceRequests },
            { label: 'Inspections', value: stats.inspections },
            { label: 'Consultations', value: stats.consultations },
            { label: 'Messages', value: stats.messages },
            { label: 'Users', value: stats.users },
          ].map((item) => (
            <div key={item.label} className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-foreground/60">{item.label}</div>
              <div className="text-2xl" style={{ fontWeight: 700 }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { id: 'overview', label: 'Overview', icon: Settings },
            { id: 'properties', label: 'Properties', icon: Settings },
            { id: 'clients', label: 'Clients', icon: Download },
            { id: 'inspections', label: 'Inspections', icon: Settings },
            { id: 'consultations', label: 'Consultations', icon: Settings },
            { id: 'messages', label: 'Messages', icon: MessageCircle },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'mailing', label: 'Mailing Lists', icon: Mail },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 text-sm ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary to-accent text-white border-transparent'
                  : 'border-border text-foreground/70 hover:border-primary/50'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6 lg:col-span-2">
              <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>Recent Requests</h2>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {[...serviceRequests].slice(0, 5).map((item) => (
                  <div key={item.id} className="border border-border rounded-lg p-4">
                    <div className="text-xs text-foreground/60 mb-1">{new Date(item.createdAt).toLocaleString()}</div>
                    <div className="text-sm" style={{ fontWeight: 600 }}>{item.requestType} • {item.serviceType}</div>
                    <div className="text-sm text-foreground/70">{item.message}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-6">
              <h3 className="text-lg mb-3" style={{ fontWeight: 600 }}>Admin Notes</h3>
              <p className="text-sm text-foreground/70">
                Use the tabs to manage properties, review clients, and send updates. All admin actions are logged and
                notifications are sent automatically.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            {children}
          </div>
        )}

        {activeTab === 'clients' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl" style={{ fontWeight: 700 }}>Client Data</h2>
              <button
                onClick={handleDownloadCsv}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:border-primary/50 text-sm"
              >
                <Download size={16} />
                Download CSV
              </button>
            </div>

            <div className="space-y-6">
              <div className="border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      {['Source', 'Name', 'Email', 'Phone', 'Message', 'Created At'].map((head) => (
                        <th key={head} className="text-left px-4 py-3 text-foreground/70 font-medium">
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {clientRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-foreground/60">
                          No client data available yet.
                        </td>
                      </tr>
                    ) : (
                      clientRows.map((row, index) => (
                        <tr key={`${row.email}-${index}`} className="border-t border-border">
                          <td className="px-4 py-3">{row.source}</td>
                          <td className="px-4 py-3">{row.name || '—'}</td>
                          <td className="px-4 py-3">{row.email}</td>
                          <td className="px-4 py-3">{row.phone || '—'}</td>
                          <td className="px-4 py-3 text-foreground/70">{row.message}</td>
                          <td className="px-4 py-3 text-foreground/70">{new Date(row.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="text-sm text-foreground/60 mb-3">Contact Inquiries</h3>
                <div className="space-y-3">
                  {contactInquiries.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
                        <span>{item.name} • {item.email}</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-foreground/80">{item.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm text-foreground/60 mb-3">Property & Reservation Inquiries</h3>
                <div className="space-y-3">
                  {propertyInquiries.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
                        <span>{item.name} • {item.email}</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-foreground/80 whitespace-pre-line">{item.message}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm text-foreground/60 mb-3">Service & Purchase Requests</h3>
                <div className="space-y-3">
                  {serviceRequests.map((item) => (
                    <div key={item.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
                        <span>{item.email}</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-foreground/80">
                        {item.requestType} • {item.serviceType} • {item.propertyType}
                      </div>
                      <div className="text-sm text-foreground/70">{item.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inspections' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>Inspection Bookings</h2>
            <div className="space-y-4">
              {inspections.length === 0 ? (
                <div className="text-sm text-foreground/60">No inspection bookings yet.</div>
              ) : (
                inspections.map((item) => {
                  const current = inspectionUpdates[item.id] || {
                    status: item.status || 'pending',
                    confirmedDate: item.confirmedDate || '',
                    confirmedTime: item.confirmedTime || '',
                  };
                  return (
                    <div key={item.id} className="border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-foreground/60">
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                        <span className="uppercase">{item.status}</span>
                      </div>
                      <div className="text-sm" style={{ fontWeight: 600 }}>
                        {item.propertyTitle || item.propertyId}
                      </div>
                      <div className="text-sm text-foreground/70">
                        {item.name} • {item.email} • {item.phone}
                      </div>
                      <div className="text-sm text-foreground/70">
                        Preferred: {item.preferredDate} {item.preferredTime || ''}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-foreground/60 whitespace-pre-line">{item.notes}</div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select
                          value={current.status}
                          onChange={(e) =>
                            setInspectionUpdates((prev) => ({
                              ...prev,
                              [item.id]: { ...current, status: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="declined">Declined</option>
                        </select>
                        <input
                          type="date"
                          value={current.confirmedDate}
                          onChange={(e) =>
                            setInspectionUpdates((prev) => ({
                              ...prev,
                              [item.id]: { ...current, confirmedDate: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                        />
                        <input
                          type="time"
                          value={current.confirmedTime}
                          onChange={(e) =>
                            setInspectionUpdates((prev) => ({
                              ...prev,
                              [item.id]: { ...current, confirmedTime: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                        />
                      </div>
                      <button
                        onClick={() => handleUpdateInspection(item.id)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm"
                      >
                        Save Update
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'consultations' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>Consultation Requests</h2>
            <div className="space-y-4">
              {consultations.length === 0 ? (
                <div className="text-sm text-foreground/60">No consultation requests yet.</div>
              ) : (
                consultations.map((item) => {
                  const current = consultationUpdates[item.id] || {
                    status: item.status || 'pending',
                    confirmedDate: item.confirmedDate || '',
                    confirmedTime: item.confirmedTime || '',
                  };
                  return (
                    <div key={item.id} className="border border-border rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-foreground/60">
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                        <span className="uppercase">{item.status}</span>
                      </div>
                      <div className="text-sm" style={{ fontWeight: 600 }}>
                        {item.topic || 'Consultation'}
                      </div>
                      <div className="text-sm text-foreground/70">
                        {item.name} • {item.email} • {item.phone}
                      </div>
                      <div className="text-sm text-foreground/70">
                        Preferred: {item.date} {item.time || ''}
                      </div>
                      {item.notes && (
                        <div className="text-xs text-foreground/60 whitespace-pre-line">{item.notes}</div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select
                          value={current.status}
                          onChange={(e) =>
                            setConsultationUpdates((prev) => ({
                              ...prev,
                              [item.id]: { ...current, status: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="declined">Declined</option>
                        </select>
                        <input
                          type="date"
                          value={current.confirmedDate}
                          onChange={(e) =>
                            setConsultationUpdates((prev) => ({
                              ...prev,
                              [item.id]: { ...current, confirmedDate: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                        />
                        <input
                          type="time"
                          value={current.confirmedTime}
                          onChange={(e) =>
                            setConsultationUpdates((prev) => ({
                              ...prev,
                              [item.id]: { ...current, confirmedTime: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg text-sm"
                        />
                      </div>
                      <button
                        onClick={() => handleUpdateConsultation(item.id)}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm"
                      >
                        Save Update
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>Inbox</h2>
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {messages.map((message) => (
                  <div key={message.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between text-xs text-foreground/60 mb-2">
                      <span>{message.email || 'Unknown user'}</span>
                      <span>{new Date(message.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-foreground/80 whitespace-pre-line">{message.content}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>Send Direct Message</h2>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Recipient</label>
                  <select
                    value={messageData.userId}
                    onChange={(e) => {
                      const selected = users.find((user) => user.id === e.target.value);
                      setMessageData({ ...messageData, userId: e.target.value, email: selected?.email || '' });
                    }}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Message</label>
                  <textarea
                    value={messageData.content}
                    onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                    placeholder="Write your message..."
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-5 py-3 rounded-lg"
                >
                  <Send size={18} />
                  Send Message
                </button>
                {messageStatus === 'sent' && (
                  <div className="text-sm text-green-500">Message delivered.</div>
                )}
                {messageStatus === 'error' && (
                  <div className="text-sm text-red-500">Message failed.</div>
                )}
              </form>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>Admin Notifications</h2>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {notifications.length === 0 ? (
                <div className="text-sm text-foreground/60">No notifications yet.</div>
              ) : (
                notifications.map((note) => (
                  <div key={note.id} className="border border-border rounded-lg p-4">
                    <div className="text-xs text-foreground/60 mb-1">{new Date(note.createdAt).toLocaleString()}</div>
                    <div className="text-sm" style={{ fontWeight: 600 }}>{note.title}</div>
                    <div className="text-sm text-foreground/70 whitespace-pre-line">{note.body}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'mailing' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>Create Mailing List</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">List Name</label>
                  <input
                    type="text"
                    value={mailingForm.name}
                    onChange={(e) => setMailingForm({ ...mailingForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    placeholder="Luxury Buyers"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Category</label>
                  <select
                    value={mailingForm.category}
                    onChange={(e) => setMailingForm({ ...mailingForm, category: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="property">Property Type</option>
                    <option value="service">Service Type</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {(mailingForm.category === 'property'
                      ? ['Sale', 'Rent', 'Airbnb', 'Commercial']
                      : ['Sales', 'Management', 'Advisory', 'Marketing']
                    ).map((item) => (
                      <button
                        key={item}
                        onClick={() => toggleMailingInterest(item)}
                        className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                          mailingForm.interests.includes(item)
                            ? 'bg-primary text-white border-primary'
                            : 'border-border text-foreground/70 hover:border-primary/50'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleCreateMailingList}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-5 py-3 rounded-lg"
                >
                  Create List
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-xl mb-4" style={{ fontWeight: 700 }}>Send Email Update</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Mailing List</label>
                  <select
                    value={mailingSend.listId}
                    onChange={(e) => setMailingSend({ ...mailingSend, listId: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  >
                    <option value="">Select list</option>
                    {mailingLists.map((list) => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Subject</label>
                  <input
                    type="text"
                    value={mailingSend.subject}
                    onChange={(e) => setMailingSend({ ...mailingSend, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm text-foreground/80">Message</label>
                  <textarea
                    value={mailingSend.body}
                    onChange={(e) => setMailingSend({ ...mailingSend, body: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                  />
                </div>
                <button
                  onClick={handleSendMailing}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent text-white px-5 py-3 rounded-lg"
                >
                  <Send size={18} />
                  Send Update
                </button>
                {mailingStatus === 'sent' && (
                  <div className="text-sm text-green-500">Update sent.</div>
                )}
                {mailingStatus === 'error' && (
                  <div className="text-sm text-red-500">Update failed.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
