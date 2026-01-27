import { useState } from 'react';
import { signUp } from '../services/authService';
import '../styles/login.css';

function Register({ onBackToLogin }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validateForm = () => {
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('All fields marked with * are required');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError('');

        const result = await signUp(formData.email, formData.password, formData.phone, formData.username);

        setLoading(false);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Registration failed. Please try again.');
        }
    };

    if (success) {
        return (
            <div className="login-container">
                <div className="login-box">
                    <div className="login-header">
                        <div className="logo-circle">
                            <span className="logo-text">✓</span>
                        </div>
                        <h1 className="login-title">Registration Successful!</h1>
                        <p className="login-subtitle">Please check your email to verify your account</p>
                    </div>

                    <div className="success-message">
                        <p>We've sent a verification email to:</p>
                        <p style={{ fontWeight: 'bold', color: '#007aff', marginTop: '8px' }}>
                            {formData.email}
                        </p>
                        <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                            Click the verification link in the email to activate your account.
                        </p>
                    </div>

                    <button
                        onClick={onBackToLogin}
                        className="login-button"
                        style={{ marginTop: '24px' }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <img src="/logo.svg" alt="Logo" style={{ width: '70px', height: '70px' }} />
                    </div>
                    <h1 className="login-title">Create Account</h1>
                    <p className="login-subtitle">Register for GST Invoice Maker</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">Name *</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+91 98765 43210"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Minimum 6 characters"
                            required
                            disabled={loading}
                        />
                        <small style={{ fontSize: '12px', color: '#666', marginTop: '4px', display: 'block' }}>
                            At least 6 characters
                        </small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Re-enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                    <div className="login-footer">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onBackToLogin}
                            className="link-button"
                            disabled={loading}
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
