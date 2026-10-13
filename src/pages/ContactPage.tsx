import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import { JAFFNA_AREA_LIST } from '../utils/geoUtils';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    area: 'Nallur',
    subject: 'General Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="text-xs font-semibold text-emerald-700 tracking-wider uppercase font-mono">
          Jaffna Community Support
        </div>
        <h1 className="text-3xl font-extrabold text-neutral-900">
          Contact FoodShare Lanka
        </h1>
        <p className="text-base text-neutral-600 max-w-2xl leading-relaxed">
          Questions about participating as a wedding hall donor or registering a care home in Jaffna District? Our field coordination team is here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Information Cards */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-neutral-900">Jaffna Coordination Centre</h3>

            <div className="space-y-3 text-neutral-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">District Office</strong>
                  <span>No. 142 Kandy Road, Jaffna Town, Northern Province, Sri Lanka</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">Hotline & Urgent Food Dispatch</strong>
                  <span className="font-mono tabular-nums">+94 21 222 3456 / +94 77 123 4567</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">Email Desk</strong>
                  <span>support@foodshare.lk</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-neutral-900 block">Operational Support Hours</strong>
                  <span>Daily: 07:30 AM – 09:30 PM (Aligned with wedding & function hours)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-xl text-xs space-y-1 text-emerald-950">
            <h4 className="font-bold">Urgent Evening Surplus?</h4>
            <p className="text-emerald-900 leading-relaxed text-[11px]">
              If you have 40+ portions of wedding food ready for immediate pickup tonight in Nallur or Jaffna Town, please call our hotline directly.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-neutral-200 shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-neutral-900">Message Received</h3>
                <p className="text-xs text-neutral-600 max-w-sm mx-auto">
                  Thank you, {formData.name}. Our Jaffna field coordinator will contact you at {formData.phone || formData.email} shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      area: 'Nallur',
                      subject: 'General Inquiry',
                      message: '',
                    });
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:underline pt-2 inline-block"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-neutral-900">Send us a Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block font-medium text-neutral-700 mb-1">Your Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      placeholder="e.g. S. Ramanan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block font-medium text-neutral-700 mb-1">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      placeholder="name@example.lk"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-phone" className="block font-medium text-neutral-700 mb-1">Contact Phone *</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      placeholder="+94 77 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg font-mono focus:outline-emerald-600"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-area" className="block font-medium text-neutral-700 mb-1">Your Area in Jaffna</label>
                    <select
                      id="contact-area"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                    >
                      {JAFFNA_AREA_LIST.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block font-medium text-neutral-700 mb-1">Subject</label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg bg-white focus:outline-emerald-600"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Wedding Hall Partnership">Wedding Hall or Catering Partnership</option>
                    <option value="Register Care Home">Register a Children's or Elders' Home</option>
                    <option value="Food Safety Question">Food Safety or Logistics Question</option>
                    <option value="Volunteer Coordination">Volunteer Transport Support</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block font-medium text-neutral-700 mb-1">Message *</label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    placeholder="Provide details about your upcoming function, hall location, or question..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg focus:outline-emerald-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Jaffna Desk</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
