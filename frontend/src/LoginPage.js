import { AlertCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Camera, ChevronRight, User, Lock, Loader2, ArrowRight, Mail, UserPlus, RefreshCw } from 'lucide-react';
import './LoginPage.css'
import GenerateRecipesPage from './GenRecipesPage.tsx';
import ResetPasswordPage from './ResetPasswordPage.tsx'; // Import the new ResetPasswordPage component
import bannerPNG from './kitchenBanner.png';

const LoginPage = () => {
  const [isLoginClicked, setIsLoginClicked] = useState(false);
  const [isSignUpClicked, setIsSignUpClicked] = useState(false);
  const [isResetClicked, setIsResetClicked] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');
  const [isHovered, setIsHovered] = useState(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showSignUpForm, setShowSignUpForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: ''
  });

  const endpoint = 'http://127.0.0.1:8000'; 

  const handleLoginClick = () => {
    if (!showLoginForm) {	
      setIsLoginClicked(true);
      setTimeout(() => {
		var session = window.getCookieValue("ses")
	    if (session) {
			fetch(`${endpoint}/validatesession`, {
			  method: 'POST',
			  headers: { 'Content-Type': 'application/json' },
			  body: JSON.stringify({
				  ses: session
			  })
			})
			.then(res => res.json())
			.then(data => {
			  if (data.valid) {
			    setCurrentPage('main');
			  }
			});
	    }
		else {
          setShowLoginForm(true);
		}
        setIsLoginClicked(false);
      }, 500);
      return;
    }
  
    setLoading(true);
    setIsLoginClicked(true);
  
    fetch(`${endpoint}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formState.username,
        password: formState.confirmPassword // assuming you're reusing confirmPassword as the login field
      }),
    })
    .then(res => res.json())
    .then(data => {
      if (!data.message.startsWith("ERROR: ")) {
        setCurrentPage('main');
		document.cookie = 'ses=' + data.message
      } else {
        alert(data.message);
      }
    })
    .catch(err => {
      console.error("Login error:", err);
      alert("Something went wrong logging in.");
    })
    .finally(() => {
      setLoading(false);
    });
  };
  
  // New function to handle reset password navigation
  const handleResetPasswordClick = () => {
    setIsResetClicked(true);
    setTimeout(() => {
      setCurrentPage('reset');
      setIsResetClicked(false);
    }, 500);
  };

  const [passwordError, setPasswordError] = useState(false);

  const handleSignUpClick = () => {
    if (!showSignUpForm) {
      setIsSignUpClicked(true);
      setTimeout(() => {
        setShowSignUpForm(true);
        setIsSignUpClicked(false);
      }, 500);
      return;
    }
  
    setLoading(true);
    setIsSignUpClicked(true);
    console.log("hiiiiiii")
  
    fetch(`${endpoint}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formState.email,
        username: formState.username,
        password: formState.password,
        password2: formState.confirmPassword,
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.message === "Signup successful") {
          // setCurrentPage('main');
			fetch(`${endpoint}/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					username: formState.username,
					password: formState.password
				}),
			})
			.then(res => res.json())
			.then(data => {
				if (!data.message.startsWith("ERROR: ")) {
					setCurrentPage('main');
					document.cookie = 'ses=' + data.message
				} else {
					alert("Invalid login. Try again.");
				}
			})
			.catch(err => {
				console.error("Login error:", err);
				alert("Something went wrong logging in.");
			});
        } else {
          alert(data.message);
        }
      })
      .catch(err => {
        console.error("Signup error:", err);
        alert("Something went wrong during signup.");
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  const errorMessageStyle = {
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
    opacity: passwordError ? 1 : 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: passwordError ? 'auto' : 'none',
    zIndex: 1000,
  };


  // Main page component
  if (currentPage === 'main') {
    return <GenerateRecipesPage />;
  }
  
  // Reset Password page component
  if (currentPage === 'reset') {
    return <ResetPasswordPage setCurrentPage={setCurrentPage} />;
  }

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
        opacity: passwordError ? 1 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: passwordError ? 'auto' : 'none',
        zIndex: 1000,
      }}>
        <AlertCircle size={20} />
        <span style={{ fontFamily: 'serif' }}>Password mismatch, please try again.</span>
      </div>

      {/* Title and Tagline */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        transform: (isLoginClicked || isSignUpClicked || isResetClicked) ? 'translateY(-20px)' : 'translateY(0)',
        opacity: (isLoginClicked || isSignUpClicked || isResetClicked) ? 0 : 1,
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
          BetterChefAI
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
          Turning Nothing, Into Something.
        </p>
      </div>
      
      
      {/* Forms Container */}
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
        transform: (isLoginClicked || isSignUpClicked || isResetClicked) ? 'translateY(20px)' : 'translateY(0)',
        transition: 'all 0.5s ease'
      }}>
        {showLoginForm ? (
          <>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Username"
                value={formState.username}
                onChange={(e) => setFormState({...formState, username: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.username ? '#8C9A8E' : 'transparent'
                }}
              />
              <User 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.username ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
            <input 
              type="password"
              placeholder="Password"
              value={formState.confirmPassword}
              onChange={(e) => {
                setFormState({...formState, confirmPassword: e.target.value});
                setPasswordError(false); // Clear error when typing
              }}
              style={{
                ...inputBaseStyle,
                borderColor: passwordError ? '#ff4444' : formState.confirmPassword ? '#8C9A8E' : 'transparent',
                borderWidth: '2px'
              }}
            />
            <Lock 
              size={20} 
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: passwordError ? '#ff4444' : formState.confirmPassword ? '#8C9A8E' : '#666'
              }}
            />
          </div>
          <button 
            onClick={handleLoginClick}
            style={{
              ...buttonBaseStyle,
              backgroundColor: isLoginClicked ? '#000000' : '#D3D3C7',
              color: isLoginClicked ? '#FFFFFF' : '#000000',
              transform: isLoginClicked ? 'scale(0.95)' : 'scale(1)',
            }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <span style={{ position: 'relative', zIndex: 1 }}>
                Submit
              </span>
            )}
          </button>
          
          {/* Forgot Password Link */}
          <button 
            onClick={handleResetPasswordClick}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#333',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '-8px',
              padding: '4px'
            }}
          >
            Forgot Password?
          </button>
          </>
        ) : showSignUpForm ? (
          <>
            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Username"
                value={formState.username}
                onChange={(e) => setFormState({...formState, username: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.username ? '#8C9A8E' : 'transparent'
                }}
              />
              <User 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.username ? '#8C9A8E' : '#666'
                }}
              />
            </div>

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

            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                placeholder="Password"
                value={formState.password}
                onChange={(e) => setFormState({...formState, password: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.password ? '#8C9A8E' : 'transparent'
                }}
              />
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.password ? '#8C9A8E' : '#666'
                }}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <input 
                type="password"
                placeholder="Confirm Password"
                value={formState.confirmPassword}
                onChange={(e) => setFormState({...formState, confirmPassword: e.target.value})}
                style={{
                  ...inputBaseStyle,
                  borderColor: formState.confirmPassword ? '#8C9A8E' : 'transparent'
                }}
              />
              <Lock 
                size={20} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: formState.confirmPassword ? '#8C9A8E' : '#666'
                }}
              />
            </div>
            
            <button 
              onClick={handleSignUpClick}
              style={{
                ...buttonBaseStyle,
                backgroundColor: isSignUpClicked ? '#000000' : '#D3D3C7',
                color: isSignUpClicked ? '#FFFFFF' : '#000000',
                transform: isSignUpClicked ? 'scale(0.95)' : 'scale(1)',
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span style={{ position: 'relative', zIndex: 1 }}>
                  Create Account
                </span>
              )}
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={handleLoginClick}
              onMouseEnter={() => setIsHovered('login')}
              onMouseLeave={() => setIsHovered(null)}
              style={{
                ...buttonBaseStyle,
                backgroundColor: isLoginClicked ? '#000000' : '#D3D3C7',
                color: isLoginClicked ? '#FFFFFF' : '#000000',
                transform: isLoginClicked 
                  ? 'scale(0.95)' 
                  : isHovered === 'login' 
                    ? 'scale(1.10)' 
                    : 'scale(1)',
                boxShadow: isHovered === 'login' 
                  ? '0 6px 20px rgba(0, 0, 0, 0.15)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span style={{ position: 'relative', zIndex: 1 }}>Login</span>
                  <ArrowRight size={20} />
                </>
              )}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: isHovered === 'login' ? '0' : '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'translateY(-50%)',
                transition: 'left 0.5s ease',
              }}></div>
            </button>

            <button 
              onClick={handleSignUpClick}
              onMouseEnter={() => setIsHovered('signup')}
              onMouseLeave={() => setIsHovered(null)}
              style={{
                ...buttonBaseStyle,
                backgroundColor: isSignUpClicked ? '#000000' : '#D3D3C7',
                color: isSignUpClicked ? '#FFFFFF' : '#000000',
                transform: isSignUpClicked 
                  ? 'scale(0.95)' 
                  : isHovered === 'signup' 
                    ? 'scale(1.10)' 
                    : 'scale(1)',
                boxShadow: isHovered === 'signup' 
                  ? '0 6px 20px rgba(0, 0, 0, 0.15)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span style={{ position: 'relative', zIndex: 1 }}>Sign Up</span>
                  <UserPlus size={20} />
                </>
              )}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: isHovered === 'signup' ? '0' : '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'translateY(-50%)',
                transition: 'left 0.5s ease',
              }}></div>
            </button>
            
            {/* Reset Password Button */}
            <button 
              onClick={handleResetPasswordClick}
              onMouseEnter={() => setIsHovered('reset')}
              onMouseLeave={() => setIsHovered(null)}
              style={{
                ...buttonBaseStyle,
                backgroundColor: isResetClicked ? '#000000' : '#D3D3C7',
                color: isResetClicked ? '#FFFFFF' : '#000000',
                transform: isResetClicked 
                  ? 'scale(0.95)' 
                  : isHovered === 'reset' 
                    ? 'scale(1.10)' 
                    : 'scale(1)',
                boxShadow: isHovered === 'reset' 
                  ? '0 6px 20px rgba(0, 0, 0, 0.15)' 
                  : '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              <>
                <span style={{ position: 'relative', zIndex: 1 }}>Reset Password</span>
                <RefreshCw size={20} />
              </>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: isHovered === 'reset' ? '0' : '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                transform: 'translateY(-50%)',
                transition: 'left 0.5s ease',
              }}></div>
            </button>
          </>
        )}

        {(showLoginForm || showSignUpForm) && (
          <button 
            onClick={() => {
              setShowLoginForm(false);
              setShowSignUpForm(false);
              setFormState({
                username: '',
                password: '',
                email: '',
                confirmPassword: ''
              });
            }}
            style={{
              ...buttonBaseStyle,
              backgroundColor: 'transparent',
              color: '#000000',
              fontSize: '14px',
              padding: '8px'
            }}
          >
            Back to menu
          </button>
        )}
        
      </div>
      <div className="w-full mt-auto">
          <img src={bannerPNG} alt="Banner" className="w-full h-auto" style={{ objectFit: 'cover' }} />
        </div>
	</div>
  );
  
};

export default LoginPage;