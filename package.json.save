import React, { useState, useEffect } from 'react';

const STILLNESS_THRESHOLD = 0.1;
const ALERT_STAGES = [
  { time: 2, message: 'Movement detected', color: 'green' },
  { time: 10, message: 'Stillness for 10 seconds', color: 'yellow' },
  { time: 30, message: 'Stillness for 30 seconds', color: 'orange' },
  { time: 60, message: 'Stillness for 1 minute', color: 'red' },
  { time: 120, message: 'Stillness for 2 minutes', color: 'darkred' },
];

export default function StillnessDetectorPWA() {
  const [stillnessDuration, setStillnessDuration] = useState(0);
  const [currentAlert, setCurrentAlert] = useState(ALERT_STAGES[0]);
  const [isStarted, setIsStarted] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [error, setError] = useState(null);

  useEffect(() => {
    let lastMovementTime = Date.now();
    let intervalId;

    const handleMotion = (event) => {
      const { accelerationIncludingGravity } = event;
      if (!accelerationIncludingGravity) return;
      
      const movement = Math.sqrt(
        accelerationIncludingGravity.x ** 2 + 
        accelerationIncludingGravity.y ** 2 + 
        accelerationIncludingGravity.z ** 2
      ) - 9.8; // Subtract gravity

      if (Math.abs(movement) > STILLNESS_THRESHOLD) {
        lastMovementTime = Date.now();
        setStillnessDuration(0);
      }
    };

    const startDetection = () => {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
              setPermissionStatus('granted');
              setIsStarted(true);
            } else {
              setPermissionStatus('denied');
              setError('Motion detection permission was denied.');
              setIsStarted(false);
            }
          })
          .catch(err => {
            setError('Error requesting motion detection permission: ' + err.message);
            setIsStarted(false);
          });
      } else {
        // For non-iOS devices or older iOS versions
        window.addEventListener('devicemotion', handleMotion);
        setPermissionStatus('granted');
        setIsStarted(true);
      }

      intervalId = setInterval(() => {
        const currentStillnessDuration = Math.floor((Date.now() - lastMovementTime) / 1000);
        setStillnessDuration(currentStillnessDuration);
      }, 1000);
    };

    const stopDetection = () => {
      window.removeEventListener('devicemotion', handleMotion);
      clearInterval(intervalId);
      setIsStarted(false);
      setStillnessDuration(0);
    };

    if (isStarted && permissionStatus === 'granted') {
      startDetection();
    } else if (isStarted && permissionStatus === 'unknown') {
      startDetection();
    }

    return () => {
      stopDetection();
    };
  }, [isStarted, permissionStatus]);

  useEffect(() => {
    const stage = ALERT_STAGES.findLast(stage => stillnessDuration >= stage.time);
    setCurrentAlert(stage || ALERT_STAGES[0]);
  }, [stillnessDuration]);

  const toggleDetection = () => {
    if (isStarted) {
      setIsStarted(false);
    } else {
      setError(null);
      setIsStarted(true);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      backgroundColor: '#f0f0f0',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ marginBottom: '20px', textAlign: 'center' }}>Stillness Detector</h1>
      <div style={{ 
        fontSize: '24px', 
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        Stillness duration: {stillnessDuration}s
      </div>
      <div style={{ 
        fontSize: '28px', 
        fontWeight: 'bold', 
        color: currentAlert.color,
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        {currentAlert.message}
      </div>
      <button 
        onClick={toggleDetection}
        style={{
          fontSize: '18px',
          padding: '15px 30px',
          backgroundColor: isStarted ? '#ff4040' : '#40a040',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          touchAction: 'manipulation'
        }}
      >
        {isStarted ? 'Stop Detection' : 'Start Detection'}
      </button>
      {error && (
        <p style={{ marginTop: '20px', textAlign: 'center', color: 'red' }}>
          {error}
        </p>
      )}
      <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
        Permission status: {permissionStatus}
      </p>
      <p style={{ marginTop: '10px', textAlign: 'center', color: '#666' }}>
        Detection status: {isStarted ? 'Running' : 'Stopped'}
      </p>
    </div>
  );
}
