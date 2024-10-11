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
  const [permissionGranted, setPermissionGranted] = useState(false);

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
              setIsStarted(true);
              setPermissionGranted(true);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
        setIsStarted(true);
        setPermissionGranted(true);
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

    if (isStarted && permissionGranted) {
      startDetection();
    }

    return () => {
      stopDetection();
    };
  }, [isStarted, permissionGranted]);

  useEffect(() => {
    const stage = ALERT_STAGES.findLast(stage => stillnessDuration >= stage.time);
    setCurrentAlert(stage || ALERT_STAGES[0]);
  }, [stillnessDuration]);

  const toggleDetection = () => {
    if (isStarted) {
      setIsStarted(false);
    } else {
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
      {!permissionGranted && (
        <p style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
          You'll need to grant motion sensor permissions when you start.
        </p>
      )}
    </div>
  );
}

