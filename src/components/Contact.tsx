import React, { useState } from 'react';
import { Mail, Send, CheckCircle, RefreshCw } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus('submitting');
    
    // Replace with your Web3Forms Access Key
    // You can get a free key in 10 seconds at: https://web3forms.com/
    const ACCESS_KEY = "d1e5cac1-bf49-44cf-bd76-451b0a9815d9";

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'Portfolio System Query',
          message: formData.message
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        
        // Reset state after showing success screen for 5 seconds
        setTimeout(() => {
          setStatus('idle');
        }, 5000);
      } else {
        setStatus('idle');
        alert(result.message || 'Transmission failed. Please try again or use direct mail.');
      }
    } catch (error) {
      setStatus('idle');
      alert('Network error. Please try again or use direct mail.');
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="section-header">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">Connect for partnerships, queries or system architectures discussion</p>
      </div>

      <div className="contact-layout-split">
        {/* Left: Info panel */}
        <div className="contact-details-panel">
          <h3 className="panel-title">Let's build something robust.</h3>
          <p className="panel-desc">
            Open to full-time engineering positions, system consultancy, or joint AI ventures. 
            Drop me a line or track my code feeds on GitHub.
          </p>

          <div className="contact-list-links">
            <a href="mailto:sarthaktiwari112003@gmail.com" className="contact-link-card clickable">
              <Mail className="link-icon text-teal" size={20} />
              <div className="link-meta">
                <span className="link-title">Direct Mail</span>
                <span className="link-value">sarthaktiwari112003@gmail.com</span>
              </div>
            </a>

            <a href="https://github.com/Sarthak2811-hub" target="_blank" rel="noopener noreferrer" className="contact-link-card clickable">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="link-icon text-violet"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
              <div className="link-meta">
                <span className="link-title">GitHub Profile</span>
                <span className="link-value">github.com/Sarthak2811-hub</span>
              </div>
            </a>

            <a href="https://www.linkedin.com/in/sarthak-t-60a3551b3?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="contact-link-card clickable">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="link-icon text-teal"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
              <div className="link-meta">
                <span className="link-title">LinkedIn Connection</span>
                <span className="link-value">linkedin.com/in/sarthak-t-60a3551b3</span>
              </div>
            </a>
          </div>
        </div>


        {/* Right: Glassmorphic form */}
        <div className="contact-form-panel">
          {status === 'success' ? (
            <div className="form-success-state animate-fade-in">
              <CheckCircle size={56} className="text-teal success-glow" />
              <h3 className="success-heading">Message Dispatched!</h3>
              <p className="success-text">
                Your message has been processed successfully. I'll reach out to your inbox shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glassmorphic-form">
              <div className="form-row">
                <div className="form-field-group">
                  <label htmlFor="name" className="field-label">Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="form-input-box"
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={status === 'submitting'}
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="email" className="field-label">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="form-input-box"
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={status === 'submitting'}
                  />
                </div>
              </div>

              <div className="form-field-group">
                <label htmlFor="subject" className="field-label">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  className="form-input-box"
                  placeholder="System Integration / Consultation"
                  value={formData.subject}
                  onChange={handleInputChange}
                  disabled={status === 'submitting'}
                />
              </div>

              <div className="form-field-group">
                <label htmlFor="message" className="field-label">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="form-input-box textarea"
                  placeholder="Tell me about your tech requirements..."
                  value={formData.message}
                  onChange={handleInputChange}
                  disabled={status === 'submitting'}
                />
              </div>

              <button
                type="submit"
                className="form-submit-btn-row clickable"
                disabled={status === 'submitting' || !formData.name || !formData.email || !formData.message}
              >
                {status === 'submitting' ? (
                  <>
                    <RefreshCw className="spinner-icon animate-spin" size={16} />
                    <span>Transmitting Payload...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
