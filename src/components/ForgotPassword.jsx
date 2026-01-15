import { useState } from 'react';
import { resetPassword } from '../services/authService';
import '../styles/login.css';

function ForgotPassword({ onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);

        const result = await resetPassword(email);

        setLoading(false);

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || 'Failed to send reset email. Please try again.');
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
                        <h1 className="login-title">Check Your Email</h1>
                        <p className="login-subtitle">Password reset link sent</p>
                    </div>

                    <div className="success-message">
                        <p>We've sent a password reset link to:</p>
                        <p style={{ fontWeight: 'bold', color: '#007aff', marginTop: '8px' }}>
                            {email}
                        </p>
                        <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                            Click the link in the email to reset your password.
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
                    <div className="logo-circle">
                        <span className="logo-text">🔑</span>
                    </div>
                    <h1 className="login-title">Forgot Password?</h1>
                    <p className="login-subtitle">Enter your email to reset your password</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <div className="login-footer">
                        Remember your password?{' '}
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

export default ForgotPassword;
