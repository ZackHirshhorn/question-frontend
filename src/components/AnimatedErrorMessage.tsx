import React, { useState, useEffect } from 'react';
import './ErrorMessage.css';

interface AnimatedErrorMessageProps {
  message: string;
}

const AnimatedErrorMessage: React.FC<AnimatedErrorMessageProps> = ({ message }) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [show, setShow] = useState(!!message);

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      setShow(true);
    } else {
      setShow(false);
      const timer = setTimeout(() => {
        setDisplayMessage('');
      }, 300); // Must match the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!displayMessage) {
    return <div className="error-message" />;
  }

  return (
    <div className={`error-message ${show ? 'show' : ''}`}>
      {displayMessage}
    </div>
  );
};

export default AnimatedErrorMessage;
