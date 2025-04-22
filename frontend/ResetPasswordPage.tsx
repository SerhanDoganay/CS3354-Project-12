import React, { useState } from 'react';
import { AlertCircle, ArrowLeft, Lock, Mail, Loader2, CheckCircle, Key } from 'lucide-react';
import bannerPNG from './kitchenBanner.png';

const ResetPasswordPage = ({ setCurrentPage }) => {
  const [step, setStep] = useState(1); // 1: email, 2: code + new password
  const [loading, setLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  
  const [formState, setFormState] = useState({
    email: '',
    confirmationCode: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const endpoint = 'http://127.0.0.1:8000';

  const handleResetRequest = () => {
    if (!formState.email) {
      showError('Please enter your email address');
      return;
    }

    setLoading(true);
    setIsButtonClicked(true);

    // Request password reset code
    fetch(`${endpoint}/request-reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formState.email
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "Reset code sent") {
        setStep(2);
      } else {
        showError(data.message || "Error requesting reset code");
      }
    })
    .catch(err => {
      console.error("Reset request error:", err);
      showError("Something went wrong. Please try again later.");
    })
    .finally(() => {
      setLoading(false);
      setIsButtonClicked(false);
    });
  };

  const handleResetSubmit = () => {
    if (!formState.confirmationCode) {
      showError('Please enter the confirmation code');
      return;
    }
    
    if (!formState.newPassword) {
      showError('Please enter a new password');
      return;
    }
    
    if (formState.newPassword !== formState.confirmNewPassword) {
      setPasswordError(true);
      showError('Passwords do not match');
      return;
    }

    setLoading(true);
    setIsButtonClicked(true);

    // Submit password reset
    fetch(`${endpoint}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formState.email,
        code: formState.confirmationCode,
        new_password: formState.newPassword
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.message === "Password reset successful") {
        setResetComplete(true);
        setTimeout(() => {
          setCurrentPage('login');
        }, 2000);
      } else {
        showError(data.message || "Error resetting password");
      }
    })
    .catch(err => {
      console.error("Password reset error:", err);
      showError("Something went wrong. Please try again later.");
    })
    .finally(() => {
      setLoading(false);
      setIsButtonClicked(false);
    });
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => {
      setErrorMessage('');
      setPasswordError(false);
    }, 3000);
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
  };

  const buttonBaseStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '18px',
    fontFamily: 'serif',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    fontSize: '16px',
    fontFamily: 'serif',
    border: '2px solid transparent',
    backgroundColor: '#D3D3C7',
    transition: 'all 0.3s ease',
    outline: 'none'
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#DDBEA9',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0px',
      paddingTop: '210px',
      transition: 'all 0.5s ease'
    }}>
      {/* Error Message Popup */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#ff4444',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        opacity: errorMessage ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: errorMessage ? 'auto' : 'none',
        zIndex: 1000,
      }}>
        <AlertCircle size={20} />
        <span style={{ fontFamily: 'serif' }}>{errorMessage}</span>
      </div>

      {/* Success Message */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        opacity: resetComplete ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: resetComplete ? 'auto' : 'none',
        zIndex: 1000,
      }}>
        <CheckCircle size={20} />
        <span style={{ fontFamily: 'serif' }}>Password reset successful! Redirecting...</span>
      </div>

      {/* Title and Tagline */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        transition: 'all 0.5s ease',
        animation: 'float 6s ease-in-out infinite'
      }}>
        <h1 style={{
          fontSize: '48px',
          marginBottom: '16px',
          fontFamily: 'serif',
          position: 'relative',
          display: 'inline-block'
        }}>
          Reset Password
          <div style={{
            content: '""',
            position: 'absolute',
            bottom: '-4px',
            left: '0',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #8C9A8E, transparent)',
            transform: 'scaleX(0)',
            animation: 'expandWidth 1s ease-out forwards'
          }}></div>
        </h1>
        <p style={{
          fontSize: '20px',
          fontFamily: 'serif',
          opacity: '0.9'
        }}>
          {step === 1 ? "Enter your email to receive a reset code" : "Enter the code and your new password"}
        </p>
      </div>
      
      {/* Form Container */}
      <div style={{
        backgroundColor: 'rgba(140, 154, 142, 0.9)',
        padding: '24px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.5s ease'
      }}>
        {step === 1 ? (
          <>
            <div style={{ position: 'relative' }}>
              <input 
                type="email"
                placeholder="Email"
                value={formState.email}
                onChange={(e) => setFormState({...formState, email: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.email ? '#8C9A8E' : 'transparent'
                }}
              />
              <Mail 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.email ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <button 
              onClick={handleResetRequest}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              style={{
                ...buttonBaseStyle,
                backgroundColor: isButtonClicked ? '#000000' : '#D3D3C7',
                color: isButtonClicked ? '#FFFFFF' : '#000000',
                transform: isButtonClicked 
                  ? 'scale(0.95)' 
                  : isButtonHovered 
                    ? 'scale(1.10)' 
                    : 'scale(1)',
                boxShadow: isButtonHovered 
                  ? '0 6px 20px rgba(0, 0, 0, 0.15)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span style={{ position: 'relative', zIndex: 1 }}>
                  Send Reset Code
                </span>
              )}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: isButtonHovered ? '0' : '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'translateY(-50%)',
                transition: 'left 0.5s ease',
              }}></div>
            </button>
          </>
        ) : (
          <>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Confirmation Code"
                value={formState.confirmationCode}
                onChange={(e) => setFormState({...formState, confirmationCode: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.confirmationCode ? '#8C9A8E' : 'transparent'
                }}
              />
              <Key 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.confirmationCode ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                placeholder="New Password"
                value={formState.newPassword}
                onChange={(e) => {
                  setFormState({...formState, newPassword: e.target.value});
                  setPasswordError(false);
                }}
                style={{
                  ...inputBaseStyle,
                  borderColor: passwordError ? '#ff4444' : formState.newPassword ? '#8C9A8E' : 'transparent'
                }}
              />
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: passwordError ? '#ff4444' : formState.newPassword ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                placeholder="Re-enter New Password"
                value={formState.confirmNewPassword}
                onChange={(e) => {
                  setFormState({...formState, confirmNewPassword: e.target.value});
                  setPasswordError(false);
                }}
                style={{
                  ...inputBaseStyle,
                  borderColor: passwordError ? '#ff4444' : formState.confirmNewPassword ? '#8C9A8E' : 'transparent'
                }}
              />
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: passwordError ? '#ff4444' : formState.confirmNewPassword ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <button 
              onClick={handleResetSubmit}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              style={{
                ...buttonBaseStyle,
                backgroundColor: isButtonClicked ? '#000000' : '#D3D3C7',
                color: isButtonClicked ? '#FFFFFF' : '#000000',
                transform: isButtonClicked 
                  ? 'scale(0.95)' 
                  : isButtonHovered 
                    ? 'scale(1.10)' 
                    : 'scale(1)',
                boxShadow: isButtonHovered 
                  ? '0 6px 20px rgba(0, 0, 0, 0.15)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span style={{ position: 'relative', zIndex: 1 }}>
                  Reset Password
                </span>
              )}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: isButtonHovered ? '0' : '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'translateY(-50%)',
                transition: 'left 0.5s ease',
              }}></div>
            </button>
          </>
        )}

        <button 
          onClick={handleBackToLogin}
          style={{
            ...buttonBaseStyle,
            backgroundColor: 'transparent',
            color: '#000000',
            fontSize: '14px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>
      </div>

      <div style={{ width: '100%', marginTop: 'auto' }}>
        <img src={bannerPNG} alt="Banner" style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
      </div>
    </div>
  );
};

export default ResetPasswordPage;