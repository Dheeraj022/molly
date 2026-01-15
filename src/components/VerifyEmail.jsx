import { useState, useEffect } from 'react';
import { resendVerificationEmail } from '../services/authService';
import '../styles/login.css';

function VerifyEmail({ onBackToLogin }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [verified, setVerified] = useState(false);

    useEffect(() => {
        // Check URL hash for verification status
        const hash = window.location.hash;
        if (hash.includes('type=signup') || hash.includes('type=email')) {
            setVerified(true);
            setMessage('Your email has been verified successfully!');
        }
    }, []);

    const handleResendEmail = async (e) => {
        e.preventDefault();
        setMessage('');

        if (!email) {
            setMessage('Please enter your email address');
            return;
        }

        setLoading(true);

        const result = await resendVerificationEmail(email);

        setLoading(false);

        if (result.success) {
            setMessage('Verification email sent! Please check your inbox.');
        } else {
            setMessage(result.error || 'Failed to resend email. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <div className="logo-circle">
                        <span className="logo-text">{verified ? '✓' : '📧'}</span>
                    </div>
                    <h1 className="login-title">
                        {verified ? 'Email Verified!' : 'Verify Your Email'}
                    </h1>
                    <p className="login-subtitle">
                        {verified
                            ? 'You can now sign in to your account'
                            : 'Didn\'t receive the verification email?'}
                    </p>
                </div>

                {verified ? (
                    <div className="success-message">
                        <p>Your email has been successfully verified.</p>
                        <button
                            onClick={onBackToLogin}
                            className="login-button"
                            style={{ marginTop: '24px' }}
                        >
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleResendEmail} className="login-form">
                        {message && (
                            <div className={message.includes('sent') ? 'success-message' : 'error-message'}>
                                {message}
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
                            {loading ? 'Sending...' : 'Resend Verification Email'}
                        </button>

                        <div className="login-footer">
                            <button
                                type="button"
                                onClick={onBackToLogin}
                                className="link-button"
                                disabled={loading}
                            >
                                Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default VerifyEmail;
