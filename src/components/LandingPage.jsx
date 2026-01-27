import { useState } from 'react';
import {
    FileText,
    Users,
    Calculator,
    FileCheck,
    Save,
    Edit3,
    Smartphone,
    Zap,
    Lock,
    CheckCircle,
    ArrowRight,
    Frown,
    HelpCircle,
    Keyboard,
    FileX,
    Shield,
    Sparkles,
    Target,
    BarChart3
} from 'lucide-react';
import '../styles/landing.css';

function LandingPage({ onGetStarted }) {
    const [activeFeature, setActiveFeature] = useState(0);

    const features = [
        {
            title: "Company & Buyer Profiles",
            description: "Save seller and buyer details once. Reuse them forever.",
            icon: Users
        },
        {
            title: "Smart GST Calculation",
            description: "Auto-detects CGST/SGST or IGST based on your selection.",
            icon: Calculator
        },
        {
            title: "Professional Invoices",
            description: "Add your logo and signature for branded invoices.",
            icon: FileCheck
        },
        {
            title: "Auto-Save on PDF",
            description: "Every PDF generation automatically saves your invoice.",
            icon: Save
        },
        {
            title: "Editable Quotations",
            description: "Create, edit, and convert quotations to invoices.",
            icon: Edit3
        },
        {
            title: "Mobile Responsive",
            description: "Works perfectly on desktop, tablet, and mobile.",
            icon: Smartphone
        }
    ];

    const steps = [
        {
            number: "01",
            title: "Add Your Details",
            description: "Save your company and buyer information once"
        },
        {
            number: "02",
            title: "Enter Invoice Items",
            description: "Add products or services with GST rates"
        },
        {
            number: "03",
            title: "Generate PDF",
            description: "Get a professional invoice instantly"
        },
        {
            number: "04",
            title: "Share with Client",
            description: "Download and send to your customers"
        }
    ];

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="nav-logo">
                        <img src="/logo.svg" alt="InvoiceHub Logo" className="logo-icon" style={{ width: '120px', height: 'auto' }} />
                        <span className="logo-text"></span>
                    </div>
                    <button className="nav-cta" onClick={onGetStarted}>
                        Sign In
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-badge">
                        <CheckCircle className="badge-icon" size={16} />
                        GST Compliant • Made for Indian Businesses
                    </div>

                    <h1 className="hero-title">
                        Create Professional GST Invoices
                        <span className="gradient-text"> in Minutes</span>
                    </h1>

                    <p className="hero-subtitle">
                        The simplest way for businesses, freelancers, and agencies to generate
                        GST-compliant invoices and quotations. No confusion. No manual work.
                    </p>

                    <div className="hero-cta">
                        <button className="btn-primary-large" onClick={onGetStarted}>
                            Create GST Invoice
                            <ArrowRight className="btn-arrow" size={20} />
                        </button>
                        <button className="btn-secondary-large" onClick={onGetStarted}>
                            View Demo
                        </button>
                    </div>

                    <div className="hero-trust">
                        <div className="trust-item">
                            <Zap className="trust-icon" size={18} />
                            <span>Instant PDF</span>
                        </div>
                        <div className="trust-item">
                            <Lock className="trust-icon" size={18} />
                            <span>Secure Access</span>
                        </div>
                        <div className="trust-item">
                            <Target className="trust-icon" size={18} />
                            <span>India GST Ready</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="problem-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Still Creating Invoices Manually?</h2>
                        <p className="section-subtitle">
                            You're wasting time on tasks that should take seconds
                        </p>
                    </div>

                    <div className="problem-grid">
                        <div className="problem-card">
                            <Frown className="problem-icon" size={48} strokeWidth={1.5} />
                            <h3>Manual Excel Work</h3>
                            <p>Copying formulas, formatting cells, and fixing calculation errors</p>
                        </div>
                        <div className="problem-card">
                            <HelpCircle className="problem-icon" size={48} strokeWidth={1.5} />
                            <h3>GST Confusion</h3>
                            <p>Struggling with CGST/SGST vs IGST calculations every time</p>
                        </div>
                        <div className="problem-card">
                            <Keyboard className="problem-icon" size={48} strokeWidth={1.5} />
                            <h3>Repeated Data Entry</h3>
                            <p>Typing the same company and buyer details again and again</p>
                        </div>
                        <div className="problem-card">
                            <FileX className="problem-icon" size={48} strokeWidth={1.5} />
                            <h3>Unprofessional Look</h3>
                            <p>Plain invoices that don't match your brand identity</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section className="solution-section">
                <div className="section-container">
                    <div className="solution-content">
                        <div className="solution-text">
                            <div className="solution-badge">The Solution</div>
                            <h2 className="section-title">
                                Everything You Need for GST Invoicing
                            </h2>
                            <p className="solution-description">
                                InvoiceHub handles all the complexity so you can focus on your business.
                                No learning curve. No manual calculations. Just professional invoices.
                            </p>

                            <div className="solution-features">
                                <div className="solution-feature">
                                    <CheckCircle className="feature-check" size={24} />
                                    <div>
                                        <strong>Auto GST Calculation</strong>
                                        <p>Automatically calculates CGST/SGST or IGST based on your selection</p>
                                    </div>
                                </div>
                                <div className="solution-feature">
                                    <CheckCircle className="feature-check" size={24} />
                                    <div>
                                        <strong>Saved Profiles</strong>
                                        <p>Store company and buyer details for instant reuse</p>
                                    </div>
                                </div>
                                <div className="solution-feature">
                                    <CheckCircle className="feature-check" size={24} />
                                    <div>
                                        <strong>Professional Layout</strong>
                                        <p>Clean, branded invoices with your logo and signature</p>
                                    </div>
                                </div>
                                <div className="solution-feature">
                                    <CheckCircle className="feature-check" size={24} />
                                    <div>
                                        <strong>One-Click PDF</strong>
                                        <p>Generate and download invoices instantly</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="solution-visual">
                            <div className="visual-card">
                                <div className="visual-header">
                                    <div className="visual-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                                <div className="visual-content">
                                    <div className="visual-line"></div>
                                    <div className="visual-line short"></div>
                                    <div className="visual-line"></div>
                                    <div className="visual-line medium"></div>
                                    <div className="visual-highlight"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Everything You Need, Nothing You Don't</h2>
                        <p className="section-subtitle">
                            Powerful features designed for real businesses
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="feature-card"
                                    onMouseEnter={() => setActiveFeature(index)}
                                >
                                    <IconComponent className="feature-icon" size={48} strokeWidth={1.5} />
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">How It Works</h2>
                        <p className="section-subtitle">
                            Four simple steps to professional invoices
                        </p>
                    </div>

                    <div className="steps-container">
                        {steps.map((step, index) => (
                            <div key={index} className="step-card">
                                <div className="step-number">{step.number}</div>
                                <h3 className="step-title">{step.title}</h3>
                                <p className="step-description">{step.description}</p>
                                {index < steps.length - 1 && (
                                    <ArrowRight className="step-arrow" size={24} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="trust-section">
                <div className="section-container">
                    <div className="trust-content">
                        <h2 className="section-title">Built for Real Businesses</h2>
                        <p className="trust-description">
                            InvoiceHub follows official GST invoice format guidelines and
                            provides secure, login-protected access to your data.
                        </p>

                        <div className="trust-grid">
                            <div className="trust-card">
                                <FileText className="trust-card-icon" size={40} strokeWidth={1.5} />
                                <h3>GST Compliant</h3>
                                <p>Follows official invoice structure with all required fields</p>
                            </div>
                            <div className="trust-card">
                                <Shield className="trust-card-icon" size={40} strokeWidth={1.5} />
                                <h3>Secure Access</h3>
                                <p>Login-protected platform with data encryption</p>
                            </div>
                            <div className="trust-card">
                                <Sparkles className="trust-card-icon" size={40} strokeWidth={1.5} />
                                <h3>Professional Format</h3>
                                <p>Clean, branded invoices that build client trust</p>
                            </div>
                            <div className="trust-card">
                                <Target className="trust-card-icon" size={40} strokeWidth={1.5} />
                                <h3>Made for India</h3>
                                <p>Designed specifically for Indian GST requirements</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2 className="cta-title">
                        Create Professional GST Invoices in Minutes
                    </h2>
                    <p className="cta-subtitle">
                        No setup. No confusion. Just professional invoices.
                    </p>
                    <button className="btn-cta-large" onClick={onGetStarted}>
                        Get Started
                        <ArrowRight className="btn-arrow" size={20} />
                    </button>
                    <p className="cta-note">Start creating invoices instantly</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src="/logo.svg" alt="InvoiceHub Logo" className="logo-icon" style={{ width: '24px', height: '24px' }} />
                            <span className="logo-text">InvoiceHub</span>
                        </div>
                        <p className="footer-description">
                            Professional GST invoicing platform for Indian businesses
                        </p>
                    </div>

                    <div className="footer-bottom">
                        <p className="footer-copyright">
                            © 2026 InvoiceHub. All rights reserved.
                        </p>
                        <div className="footer-links">
                            <a href="#privacy">Privacy</a>
                            <a href="#terms">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
