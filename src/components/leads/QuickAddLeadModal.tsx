import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Building2,
  User,
  Phone,
  Mail,
  Globe,
  DollarSign,
  Calendar,
  Layers,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { ContactMethod, Currency, LeadSource, LeadStatus, Priority } from '../../types/crm';

export const QuickAddLeadModal: React.FC = () => {
  const {
    isQuickAddOpen,
    setIsQuickAddOpen,
    addLead,
    services,
    profile,
    setSelectedLeadId,
  } = useCRM();

  // Basic required fields
  const [businessName, setBusinessName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [serviceId, setServiceId] = useState(services[0]?.id || 'SRV-01');
  const [leadSource, setLeadSource] = useState<LeadSource>('Google Maps'); // Default to Google Maps!
  const [dealValue, setDealValue] = useState<string>(''); // Can be skipped / empty initially!
  const [currency, setCurrency] = useState<Currency>('USD');
  const [priority, setPriority] = useState<Priority>('High');
  const [status, setStatus] = useState<LeadStatus>('New Lead');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + (profile.defaultFollowupDays || 3));
    return d.toISOString().split('T')[0];
  });

  // Expanded social & contact fields
  const [showAdvanced, setShowAdvanced] = useState(true); // visible by default for easy access
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [businessCategory, setBusinessCategory] = useState('');
  const [country, setCountry] = useState('United States');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [contactMethod, setContactMethod] = useState<ContactMethod>('Email');

  const resetForm = () => {
    setBusinessName('');
    setContactPerson('');
    setDealValue('');
    setWhatsapp('');
    setEmail('');
    setWebsite('');
    setFacebook('');
    setInstagram('');
    setTwitter('');
    setBusinessCategory('');
    setCity('');
    setNotes('');
  };

  if (!isQuickAddOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const matchedService = services.find((s) => s.id === serviceId);

    const createdLead = addLead({
      businessName: businessName.trim(),
      contactPerson: contactPerson.trim() || 'Business Owner',
      businessCategory: businessCategory.trim() || 'Small Business',
      country: country.trim() || (currency === 'BDT' ? 'Bangladesh' : 'United States'),
      city: city.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      facebook: facebook.trim(),
      instagram: instagram.trim(),
      twitter: twitter.trim(),
      website: website.trim(),
      leadSource,
      serviceId,
      serviceName: matchedService ? matchedService.name : 'WordPress Website',
      status,
      priority,
      dealValue: dealValue ? Number(dealValue) : 0, // Budget can be 0 or skipped!
      currency,
      nextFollowUpDate: nextFollowUpDate || undefined,
      contactMethod,
      notes: notes.trim(),
      assignedTo: 'USR-01',
      clientId: null,
    });

    resetForm();
    setIsQuickAddOpen(false);
    setSelectedLeadId(createdLead.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsQuickAddOpen(false)}
      />

      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Add New Lead</h2>
            <p className="text-xs text-slate-500">
              Quickly record a potential client. Budget is optional and can be set when converting.
            </p>
          </div>
          <button
            onClick={() => setIsQuickAddOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Business & Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Business Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Roofing Dallas"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Contact Person Name
              </label>
              <input
                type="text"
                placeholder="e.g. Michael Vance (Owner)"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
              />
            </div>
          </div>

          {/* Lead Source (Google Maps highlighted) & Service */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Lead Source <span className="text-blue-600 font-bold">(Google Maps)</span>
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-blue-300 bg-blue-50/30 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-600 focus:outline-hidden"
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value as LeadSource)}
              >
                <option value="Google Maps">📍 Google Maps (Local USA/International)</option>
                <option value="Facebook">Facebook (Page / Group / Ads)</option>
                <option value="Instagram">Instagram</option>
                <option value="Twitter">Twitter / X</option>
                <option value="WhatsApp">WhatsApp Direct</option>
                <option value="Cold Email">Cold Email</option>
                <option value="Cold Call">Cold Call</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Upwork">Upwork</option>
                <option value="Fiverr">Fiverr</option>
                <option value="Referral">Client Referral</option>
                <option value="Website">Website Form</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Service Interested
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Priority
              </label>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-hidden"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Budget & Currency (Optional / Skippable) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">
                Initial Budget (Optional - Can Skip)
              </span>
              <span className="text-[11px] text-slate-500">
                You can specify exact project value later when converting
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Target Currency
                </label>
                <select
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as Currency)}
                >
                  <option value="USD">USD ($) - International / USA</option>
                  <option value="BDT">BDT (৳) - Bangladesh Local Client</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Estimated Value (Leave blank if unknown)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1000 (or skip for now)"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Social Profiles & Contact Channels */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Social Handles & Contact Channels
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 flex items-center gap-1">
                  <Facebook className="h-3 w-3 text-blue-600" />
                  <span>Facebook Page / Profile</span>
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/..."
                  className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 flex items-center gap-1">
                  <Instagram className="h-3 w-3 text-pink-600" />
                  <span>Instagram Profile / Handle</span>
                </label>
                <input
                  type="text"
                  placeholder="@businessname or link"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 flex items-center gap-1">
                  <Twitter className="h-3 w-3 text-slate-800" />
                  <span>Twitter / X Profile</span>
                </label>
                <input
                  type="text"
                  placeholder="@handle or link"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  WhatsApp / Phone
                </label>
                <input
                  type="text"
                  placeholder="+1 555 123 4567"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="contact@business.com"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Website URL
                </label>
                <input
                  type="text"
                  placeholder="https://clientwebsite.com"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  Country & City
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Country (e.g. USA)"
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="City (e.g. Dallas, TX)"
                    className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600">
                  First Follow-up Date
                </label>
                <input
                  type="date"
                  className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-600">
                Notes / Audit Summary
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Found on Google Maps. Website has poor mobile score. Outreach sent via cold email."
                className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsQuickAddOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Save & Open Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
