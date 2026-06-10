import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LogOut, Users, Radio, AlertOctagon, ShieldCheck, Search, Filter, Trash2, Check, Eye, Clock, FileSpreadsheet } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend, Cell } from 'recharts';

const AdminDashboard = () => {
  const { user, logout, drivers, alerts, updateAlertStatus } = useApp();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // 1. Calculations for KPI Cards
  const totalDrivers = drivers.length;
  const activeSessions = drivers.filter(d => d.status === 'active' || d.status === 'drowsy').length;
  const totalAlertsCount = alerts.length;
  const avgSafetyScore = Math.round(
    drivers.reduce((acc, curr) => acc + curr.safetyScore, 0) / totalDrivers
  );

  // 2. Prepare mock data for charts based on current alerts state
  // Group alerts by hour or driver names for analytical visualization
  const alertsByDriverData = drivers.map(d => {
    const driverAlerts = alerts.filter(a => a.username === d.username).length;
    return {
      name: d.username,
      alerts: driverAlerts,
      safetyScore: d.safetyScore
    };
  });

  const hourlyAlertTrendData = [
    { hour: '08:00', alerts: 1 },
    { hour: '10:00', alerts: 3 },
    { hour: '12:00', alerts: 2 },
    { hour: '14:00', alerts: 6 },
    { hour: '16:00', alerts: alerts.filter(a => new Date(a.timestamp).getHours() >= 16 || a.session_id > 200).length + 2 },
    { hour: '18:00', alerts: alerts.filter(a => new Date(a.timestamp).getHours() >= 18 || a.session_id > 300).length },
  ];

  // 3. Search and filter logs
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = statusFilter === 'all' || alert.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-darkBg text-slate-100 flex flex-col">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              SDDDS Fleet Control
            </h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Administrator Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 font-medium">Administrator Console</p>
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

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        
        {/* KPI Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Drivers */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fleet Drivers</p>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{totalDrivers}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Registered Accounts</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Active Sessions */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Live Monitoring</p>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{activeSession}</h3>
              <p className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active Sessions
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow">
              <Radio className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Total Alerts */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">System Alerts</p>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{totalAlertsCount}</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Cumulative Warnings</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow">
              <AlertOctagon className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Fleet Safety Score */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fleet Safety Score</p>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1">{avgSafetyScore}%</h3>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Average Fleet Rating</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Fleet Monitor & Analytics Row */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Charts Panel */}
          <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-100">Telemetry Analytics</h2>
                <p className="text-xs text-slate-500">Hourly alert distributions and driver metric breakdowns</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chart A: Alert Trend Over Time */}
              <div className="space-y-2 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Hourly Warnings Trend</span>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyAlertTrendData}>
                      <defs>
                        <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="hour" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#ef4444' }}
                      />
                      <Area type="monotone" dataKey="alerts" stroke="#ef4444" fillOpacity={1} fill="url(#colorAlerts)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart B: Alerts by Driver */}
              <div className="space-y-2 bg-slate-950/40 border border-slate-900 p-4 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Warnings & Safety Scores</span>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={alertsByDriverData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                      <Bar name="Total Alerts" dataKey="alerts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar name="Safety Score %" dataKey="safetyScore" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Active Fleet Status List */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-slate-100">Live Fleet</h2>
              <p className="text-xs text-slate-500">Real-time driver activity tracking</p>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[300px] lg:max-h-[320px] space-y-3 pr-1">
              {drivers.map((driver) => (
                <div key={driver.id} className="p-3 bg-slate-950/40 rounded-2xl border border-slate-900 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-slate-300 border border-slate-800 text-sm uppercase">
                        {driver.username.slice(0, 2)}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-950 ${
                        driver.status === 'drowsy' 
                          ? 'bg-red-500 animate-ping' 
                          : driver.status === 'active' 
                          ? 'bg-emerald-500' 
                          : 'bg-slate-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{driver.username}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{driver.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    {driver.status === 'offline' ? (
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-extrabold">Offline</span>
                    ) : (
                      <div className="space-y-0.5">
                        <span className={`text-[10px] uppercase tracking-wider font-extrabold ${
                          driver.status === 'drowsy' ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          {driver.status === 'drowsy' ? 'Critical' : 'Alert'}
                        </span>
                        <p className="text-[9px] font-mono text-slate-500 font-bold">EAR: {driver.currentEAR || '0.00'}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Historical Logs & Activity Audit Table */}
        <section className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">Historical Alert Logs</h2>
              <p className="text-xs text-slate-500">Audit trail of all registered driver drowsiness occurrences</p>
            </div>

            {/* Search & Filter Inputs */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:flex-initial">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Search Driver Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-48 bg-slate-950 border border-slate-900 rounded-xl py-2 pl-9 pr-4 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Status Filter */}
              <div className="relative w-full sm:w-auto">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Filter className="w-3.5 h-3.5" />
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto bg-slate-950 border border-slate-900 rounded-xl py-2 pl-9 pr-6 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 appearance-none cursor-pointer"
                >
                  <option value="all">All Alerts</option>
                  <option value="alerted">Active Warning</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="ignored">Ignored</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desktop Table Layout */}
          <div className="overflow-x-auto rounded-2xl border border-slate-900 bg-slate-950/20">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/60 border-b border-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Alert ID</th>
                  <th className="py-3 px-4">Driver Name</th>
                  <th className="py-3 px-4">Drowsiness Intensity</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40 text-xs">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 font-medium">
                      No matching alert logs found.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-slate-950/30 transition-all">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-400">#{alert.id}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-200">{alert.username}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden max-w-[80px]">
                            <div 
                              className={`h-full rounded-full ${
                                alert.drowsiness_level > 0.8 ? 'bg-red-500' : 'bg-amber-500'
                              }`} 
                              style={{ width: `${alert.drowsiness_level * 100}%` }}
                            />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-300">{(alert.drowsiness_level * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold tracking-wider uppercase ${
                          alert.status === 'alerted'
                            ? 'bg-red-500/10 border border-red-500/30 text-red-400 animate-pulse'
                            : alert.status === 'dismissed'
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {alert.status === 'alerted' ? 'Critical warning' : alert.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {alert.status === 'alerted' ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => updateAlertStatus(alert.id, 'dismissed')}
                              title="Resolve & Dismiss Warning"
                              className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => updateAlertStatus(alert.id, 'ignored')}
                              title="Flag / Mute Log"
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-semibold uppercase italic tracking-wider">resolved</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;
