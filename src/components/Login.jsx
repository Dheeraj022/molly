import { useState } from 'react';
import { signIn } from '../services/authService';
import '../styles/login.css';

function Login({ onLogin, onShowRegister, onShowForgotPassword }) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);

        const result = await signIn(formData.email, formData.password);

        setLoading(false);

        if (result.success) {
            onLogin(result.data.user);
        } else {
            // Handle specific error messages
            if (result.error.includes('Invalid login credentials')) {
                setError('Invalid email or password');
            } else if (result.error.includes('Email not confirmed')) {
                setError('Please verify your email address before logging in');
            } else {
                setError(result.error || 'Login failed. Please try again.');
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <div className="logo-circle">
                        <span className="logo-text">INV</span>
                    </div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to GST Invoice Maker</p>
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
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-options">
                        <button
                            type="button"
                            onClick={onShowForgotPassword}
                            className="link-button"
                            disabled={loading}
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>

                    <div className="login-footer">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={onShowRegister}
                            className="link-button"
                            disabled={loading}
                        >
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
