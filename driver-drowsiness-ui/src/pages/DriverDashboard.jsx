import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Play, Square, AlertTriangle, CheckCircle, Eye, ShieldAlert, Volume2, VolumeX, Camera, RefreshCw } from 'lucide-react';

const DriverDashboard = () => {
  const { user, logout, activeSession, startSession, stopSession, triggerAlert } = useApp();
  
  // Local Sim parameters
  const [ear, setEar] = useState(0.28); // Eye Aspect Ratio (0.1 to 0.45)
  const [blinkCount, setBlinkCount] = useState(12);
  const [isMuted, setIsMuted] = useState(false);
  const [sessionAlerts, setSessionAlerts] = useState([]);
  const [manualOverride, setManualOverride] = useState(false);
  const [cameraPermission, setCameraPermission] = useState('pending'); // 'granted', 'denied', 'pending'

  // Refs
  const videoRef = useRef(null);
  const audioContextRef = useRef(null);
  const oscRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Determine drowsiness status based on EAR
  let status = 'safe'; // 'safe', 'warning', 'critical'
  if (ear < 0.20) {
    status = 'critical';
  } else if (ear < 0.24) {
    status = 'warning';
  }

  // Handle camera stream
  useEffect(() => {
    if (activeSession) {
      navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(e => console.log("Video play interrupted", e));
          }
          setCameraPermission('granted');
        })
        .catch(err => {
          console.error("Camera access error:", err);
          setCameraPermission('denied');
        });
    } else {
      // Stop camera stream when session stops
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraPermission('pending');
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeSession]);

  // Audio synthesizer (Web Audio API)
  const startAlarm = () => {
    if (isMuted) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      if (!oscRef.current) {
        const osc = audioContextRef.current.createOscillator();
        const gainNode = audioContextRef.current.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // High pitched beep
        
        // Pulsing volume effect
        gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
        
        osc.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        
        osc.start();
        oscRef.current = { osc, gainNode };
      }
    } catch (e) {
      console.error("Failed to generate audio beep", e);
    }
  };

  const stopAlarm = () => {
    if (oscRef.current) {
      try {
        oscRef.current.osc.stop();
        oscRef.current.osc.disconnect();
      } catch (e) {}
      oscRef.current = null;
    }
  };

  // Trigger alarm sounds based on status
  useEffect(() => {
    if (activeSession && status === 'critical') {
      startAlarm();
    } else {
      stopAlarm();
    }
    return () => stopAlarm();
  }, [status, activeSession, isMuted]);

  // Simulate active session variations (Auto simulation mode)
  useEffect(() => {
    if (!activeSession || manualOverride) return;

    const interval = setInterval(() => {
      // Natural oscillating eye aspect ratio
      setEar(prev => {
        let prob = Math.random();
        let nextEar;
        if (prob > 0.93) {
          // Occasional longer blink/drowsy dip
          nextEar = parseFloat((0.15 + Math.random() * 0.06).toFixed(2));
        } else if (prob > 0.75) {
          // Quick standard blink
          nextEar = 0.10;
          setBlinkCount(b => b + 1);
          setTimeout(() => setEar(0.29), 200);
        } else {
          // Resting baseline
          nextEar = parseFloat((0.26 + Math.random() * 0.08).toFixed(2));
        }
        return nextEar;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [activeSession, manualOverride]);

  // Log drowsiness alerts
  const lastAlertTimeRef = useRef(0);
  useEffect(() => {
    if (activeSession && status === 'critical') {
      const now = Date.now();
      // Throttle log triggers to once every 5 seconds
      if (now - lastAlertTimeRef.current > 5000) {
        lastAlertTimeRef.current = now;
        triggerAlert(ear);
        
        const newLog = {
          id: Math.floor(Math.random() * 1000),
          time: new Date().toLocaleTimeString(),
          ear: ear,
          severity: 'Critical'
        };
        setSessionAlerts(prev => [newLog, ...prev]);
      }
    }
  }, [status, activeSession, ear]);

  return (
    <div className={`min-h-screen bg-darkBg text-slate-100 flex flex-col transition-all duration-500 ${
      activeSession && status === 'critical' ? 'ring-8 ring-red-600 ring-inset animate-pulse-slow' : ''
    }`}>
      {/* Alert Banner for Critical Drowsiness */}
      {activeSession && status === 'critical' && (
        <div className="bg-red-600 text-white font-bold py-3 px-4 flex items-center justify-center gap-3 animate-bounce">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
          <span className="tracking-wide uppercase text-sm">CRITICAL WARNING: DROWSINESS DETECTED. PLEASE PULL OVER SAFETY!</span>
        </div>
      )}

      {/* Header Navigation */}
      <header className="glass-panel sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Eye className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SDDDS Console
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Driver Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-medium">Logged in as</p>
            <p className="text-sm font-semibold text-slate-200">{user?.username}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Live Feed Panel */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          <div className="glass-panel rounded-3xl overflow-hidden border border-slate-800 relative flex-1 flex flex-col min-h-[400px]">
            {/* HUD Status Header Overlay */}
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur border border-slate-800 text-[10px] font-bold tracking-wider text-slate-300">
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                LIVE HUD STREAM
              </span>

              {activeSession && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-extrabold tracking-widest text-emerald-400 animate-pulse">
                  REC 1080P
                </span>
              )}
            </div>

            {/* Video / Simulator Screen Container */}
            <div className="relative w-full flex-1 bg-slate-950 flex items-center justify-center overflow-hidden">
              {activeSession ? (
                <>
                  {cameraPermission === 'granted' ? (
                    <video
                      ref={videoRef}
                      muted
                      playsInline
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center px-6">
                      <Camera className="w-12 h-12 text-slate-700 animate-pulse" />
                      <p className="text-sm font-semibold text-slate-400">Webcam stream active (simulated feed overlay)</p>
                      <p className="text-xs text-slate-600">Grant browser camera permission to preview physical feed</p>
                    </div>
                  )}

                  {/* AI Facial Landmarks simulation Overlay */}
                  <div className="absolute inset-0 pointer-events-none border border-cyan-500/10">
                    {/* Scan Line */}
                    <div className="absolute left-0 w-full h-0.5 bg-cyan-400/30 scan-line" />
                    
                    {/* Floating Mesh Dots */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-70">
                      <div className="relative w-48 h-48 border border-dashed border-cyan-500/20 rounded-full flex items-center justify-center">
                        {/* Eye tracking markers */}
                        <div className={`absolute top-[40%] left-[25%] w-3 h-3 rounded-full border border-cyan-400 flex items-center justify-center ${ear < 0.22 ? 'bg-red-500 border-red-500 scale-75' : 'bg-cyan-500/40'}`}>
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                        <div className={`absolute top-[40%] right-[25%] w-3 h-3 rounded-full border border-cyan-400 flex items-center justify-center ${ear < 0.22 ? 'bg-red-500 border-red-500 scale-75' : 'bg-cyan-500/40'}`}>
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                        {/* Mouth landmark */}
                        <div className="absolute bottom-[30%] left-[45%] w-5 h-2 border border-cyan-500/30 rounded-full" />
                        {/* Nose point */}
                        <div className="absolute top-[52%] left-[49%] w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
                  <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-2">
                    <Eye className="w-10 h-10 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-300">System Monitoring Offline</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Click the "Start Session" control toggle on the right panel to boot face recognition models and initialize the video telemetry feed.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Panel */}
            <div className="glass-panel p-4 flex justify-between items-center border-t border-slate-800/80 bg-slate-950/40">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeSession ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  System: {activeSession ? 'Monitoring Active' : 'Offline'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span>EAR: <strong className="text-slate-300 font-mono">{activeSession ? ear : '0.00'}</strong></span>
                <span className="mx-1">•</span>
                <span>Blinks: <strong className="text-slate-300 font-mono">{activeSession ? blinkCount : '0'}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Side: Diagnostics & HUD Telemetry */}
        <section className="lg:col-span-5 flex flex-col gap-5">
          {/* Diagnostic Console Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              Diagnostic Console
            </h2>

            {/* Main Action Buttons */}
            <div className="space-y-4">
              {!activeSession ? (
                <button
                  onClick={startSession}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Start Live Monitoring
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  className="w-full py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-2xl hover:from-red-400 hover:to-rose-500 hover:shadow-lg hover:shadow-red-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                >
                  <Square className="w-5 h-5 fill-current" />
                  Stop Monitoring
                </button>
              )}

              {/* Sound & Alert Controls */}
              <div className="flex justify-between items-center bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <span className="text-xs text-slate-400 font-semibold">Audio Warning System</span>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  disabled={!activeSession}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    !activeSession 
                      ? 'text-slate-700 bg-transparent cursor-not-allowed'
                      : isMuted 
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' 
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20'
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      Muted
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      Audio Live
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Drowsiness Status Indicators */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800">
            <h3 className="text-xs text-slate-500 uppercase tracking-widest font-extrabold mb-4">
              Real-time Metrics & Status
            </h3>

            {/* Drowsiness card status */}
            <div className="mb-6">
              {!activeSession ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-center text-slate-500 text-sm">
                  Start session to receive diagnostics
                </div>
              ) : status === 'safe' ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">Driver Active & Alert</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Eye blinking patterns within standard threshold.</p>
                  </div>
                </div>
              ) : status === 'warning' ? (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100">Warning: Mild Drowsiness</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Eyes closing duration starting to exceed limit.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 flex items-center gap-4 relative overflow-hidden animate-shake">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 animate-pulse">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-red-400 glow-text-red">CRITICAL DROWSY DETECTED</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Eye Aspect Ratio critically low. Triggering alert siren.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Telemetry Sim Controls */}
            {activeSession && (
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">Telemetry Simulation Mode</span>
                  <button
                    onClick={() => setManualOverride(!manualOverride)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      manualOverride 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                        : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-400'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${manualOverride ? 'animate-spin' : ''}`} />
                    {manualOverride ? 'Manual Control' : 'Auto Oscillate'}
                  </button>
                </div>

                {manualOverride && (
                  <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-4">
                    {/* EAR Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-400">Simulate Eye Aspect Ratio (EAR):</span>
                        <span className={`font-mono font-bold ${ear < 0.20 ? 'text-red-400' : ear < 0.24 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {ear}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.10"
                        max="0.40"
                        step="0.01"
                        value={ear}
                        onChange={(e) => setEar(parseFloat(e.target.value))}
                        className="w-full accent-cyan-500 bg-slate-900 border border-slate-800 h-2 rounded-lg cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-600 font-bold uppercase tracking-wider mt-1.5">
                        <span className="text-red-500">Drowsy (&lt;0.20)</span>
                        <span className="text-amber-500">Warning (0.20-0.24)</span>
                        <span className="text-emerald-500">Alert (&gt;0.24)</span>
                      </div>
                    </div>

                    {/* Blink Speed Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-400">Total Blinks:</span>
                        <span className="font-mono text-slate-200 font-bold">{blinkCount}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setBlinkCount(c => c + 1)}
                          className="flex-1 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold"
                        >
                          Simulate Blink (+1)
                        </button>
                        <button
                          onClick={() => setBlinkCount(0)}
                          className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-red-500/20 hover:text-red-400 text-xs text-slate-500 transition-all"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Session Alerts Log */}
          {activeSession && (
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex-1 flex flex-col min-h-[200px]">
              <h3 className="text-xs text-slate-500 uppercase tracking-widest font-extrabold mb-3">
                Live Alert Activity Log ({sessionAlerts.length})
              </h3>
              
              <div className="flex-1 overflow-y-auto max-h-[160px] space-y-2 pr-1">
                {sessionAlerts.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-600 text-center py-6">
                    No anomalies recorded this session. Safe driving!
                  </div>
                ) : (
                  sessionAlerts.map((log) => (
                    <div key={log.id} className="flex justify-between items-center p-2.5 rounded-xl bg-red-950/20 border border-red-900/35 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                        <span className="text-red-400 font-bold uppercase text-[10px]">Drowsiness Alert</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono text-slate-400 text-[11px]">
                        <span>EAR: <strong className="text-red-400 font-bold">{log.ear}</strong></span>
                        <span>Time: {log.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default DriverDashboard;
