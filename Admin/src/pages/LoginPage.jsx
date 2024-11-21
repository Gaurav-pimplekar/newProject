import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import '../styles/LoginPage.css';  // Optional CSS for styling

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();  // Initialize the navigate function

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }

    // Assuming a mock login function here
    const mockLogin = (email, password) => {
      // Fake validation (replace with real authentication logic)
      return email === 'test@example.com' && password === 'password123';
    };

    if (mockLogin(email, password)) {
      setError('');
      alert('Login successful!');
      
      // Redirect to the admin dashboard after successful login
      navigate('/admin-dashboard');  // Change the route according to your app's structure
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p className="signup-link">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
