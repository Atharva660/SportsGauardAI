import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  AlertTriangle, 
  BarChart3, 
  Upload, 
  Bell, 
  Settings, 
  LogOut,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Eye,
  TrendingUp,
  Globe,
  Zap
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = "http://localhost:8000/api";

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-transparent transition-all border-none cursor-pointer ${
      active ? 'sidebar-active' : 'text-gray-400'
    }`}
    style={{ textAlign: 'left' }}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="glass-panel p-6 flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
      <TrendingUp size={12} className="text-emerald-400" />
      <span className="text-emerald-400 font-medium">{subtext}</span> vs last week
    </p>
  </div>
);

const DetectionItem = ({ detection, onTakedown }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-panel p-4 flex items-center justify-between transition-all"
  >
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
        {detection.platform === 'YouTube' ? <XCircle className="text-rose-400" /> : <Eye className="text-cyan-400" />}
      </div>
      <div>
        <h4 className="font-semibold text-sm">{detection.asset_name}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded">{detection.platform}</span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <ExternalLink size={12} /> {detection.url.split('/')[2]}
          </span>
          <span className={`text-xs font-bold ${detection.risk_level === 'High' ? 'text-rose-400' : 'text-amber-400'}`}>
            {detection.risk_level} RISK
          </span>
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-8">
      <div style={{ textAlign: 'right' }}>
        <p className="text-sm font-bold text-cyan-400">{detection.match_score}% Match</p>
        <p className="text-xs text-gray-500">{detection.view_count.toLocaleString()} views</p>
      </div>
      <div className="flex gap-2">
        {detection.status === 'Pending' ? (
          <button 
            onClick={() => onTakedown(detection.id)}
            className="px-4 py-2 bg-rose-500/10 text-rose-400 text-xs font-bold rounded-lg border-none cursor-pointer transition-all"
            style={{ border: '1px solid rgba(255, 62, 62, 0.2)' }}
          >
            ISSUE TAKEDOWN
          </button>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold px-4 py-2">
            <CheckCircle2 size={16} /> TAKEDOWN ISSUED
          </div>
        )}
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [detections, setDetections] = useState([]);
  const [assets, setAssets] = useState([]);
  const [platformData, setPlatformData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [sRes, dRes, aRes, pRes, tRes] = await Promise.all([
        axios.get(`${API_BASE}/stats`),
        axios.get(`${API_BASE}/detections`),
        axios.get(`${API_BASE}/assets`),
        axios.get(`${API_BASE}/analytics/platforms`),
        axios.get(`${API_BASE}/analytics/trends`)
      ]);
      setStats(sRes.data);
      setDetections(dRes.data);
      setAssets(aRes.data);
      setPlatformData(pRes.data);
      setTrendData(tRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleTakedown = async (id) => {
    try {
      await axios.post(`${API_BASE}/detections/${id}/takedown`);
      fetchData();
    } catch (err) {
      alert("Error issuing takedown");
    }
  };

  const COLORS = ['#00f2ff', '#7000ff', '#ff3e3e', '#00ff88', '#ff9f00', '#007bff'];

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside className="w-64 glass-panel m-4 flex flex-col p-4" style={{ position: 'sticky', top: '16px', height: 'calc(100vh - 32px)' }}>
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-10 h-10 flex items-center justify-center rounded-xl" style={{ background: 'linear-gradient(135deg, #00f2ff, #7000ff)' }}>
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold">SportGuard <span className="text-cyan-400">AI</span></h1>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={AlertTriangle} label="Detections" active={activeTab === 'detections'} onClick={() => setActiveTab('detections')} />
          <SidebarItem icon={ShieldCheck} label="Protected Assets" active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} />
          <SidebarItem icon={BarChart3} label="Analytics" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
          <SidebarItem icon={Upload} label="Enroll Content" active={activeTab === 'enroll'} onClick={() => setActiveTab('enroll')} />
        </nav>

        <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <SidebarItem icon={Settings} label="Settings" />
          <SidebarItem icon={LogOut} label="Sign Out" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, Admin</h2>
            <p className="text-gray-400 text-sm">Monitoring your digital assets in real-time.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 glass-panel px-4 py-2">
              <div className="live-indicator"></div>
              <span className="text-xs font-bold text-rose-400" style={{ letterSpacing: '1px' }}>LIVE SCRAWL ACTIVE</span>
            </div>
            <button className="glass-panel p-2 border-none cursor-pointer" style={{ position: 'relative' }}>
              <Bell size={20} className="text-white" />
              <span style={{ position: 'absolute', top: '0', right: '0', width: '8px', height: '8px', background: '#00f2ff', borderRadius: '50%', border: '2px solid black' }}></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-white/10" style={{ border: '1px solid rgba(255,255,255,0.1)' }}></div>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '300px' }}>
            <div className="animate-spin rounded-full h-12 w-12" style={{ borderTop: '2px solid #00f2ff', borderBottom: '2px solid transparent' }}></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Assets Protected" value={stats.assets_protected} subtext="+12%" icon={ShieldCheck} colorClass="bg-cyan-500/10 text-cyan-400" />
                  <StatCard title="Active Detections" value={stats.active_detections} subtext="+5%" icon={AlertTriangle} colorClass="bg-amber-500/10 text-amber-400" />
                  <StatCard title="Takedowns Issued" value={stats.takedowns_issued} subtext="+24%" icon={Zap} colorClass="bg-white/10 text-cyan-400" />
                  <StatCard title="Est. Revenue Saved" value={stats.roi_estimated} subtext="+18%" icon={TrendingUp} colorClass="bg-white/10 text-emerald-400" />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Detection & Takedown Trends</h3>
                    <div style={{ height: '260px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorDet" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00f2ff" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#00f2ff" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorTake" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#7000ff" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#7000ff" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="day" stroke="#666" fontSize={12} />
                          <YAxis stroke="#666" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#141419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          />
                          <Area type="monotone" dataKey="detections" stroke="#00f2ff" fillOpacity={1} fill="url(#colorDet)" strokeWidth={2} />
                          <Area type="monotone" dataKey="takedowns" stroke="#7000ff" fillOpacity={1} fill="url(#colorTake)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Platform Distribution</h3>
                    <div style={{ height: '260px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={platformData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {platformData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#141419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent Detections */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">Recent Critical Detections</h3>
                    <button onClick={() => setActiveTab('detections')} className="text-cyan-400 text-sm font-semibold border-none bg-transparent cursor-pointer hover:underline">View All</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {detections.slice(0, 5).map(det => (
                      <DetectionItem key={det.id} detection={det} onTakedown={handleTakedown} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">
                    {selectedAsset ? `Analytics: ${selectedAsset.name}` : "Strategic Intelligence Analytics"}
                  </h2>
                  {selectedAsset && (
                    <button onClick={() => setSelectedAsset(null)} className="btn-outline">Back to Fleet Overview</button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard 
                    title="Total Detections" 
                    value={selectedAsset ? detections.filter(d => d.asset_id === selectedAsset.id).length : detections.length} 
                    subtext="+5%" icon={AlertTriangle} colorClass="bg-amber-500/10 text-amber-400" 
                  />
                  <StatCard 
                    title="Success Rate" 
                    value={selectedAsset ? "98.2%" : "96.4%"} 
                    subtext="+2%" icon={ShieldCheck} colorClass="bg-cyan-500/10 text-cyan-400" 
                  />
                  <StatCard 
                    title="Avg. Takedown Time" 
                    value="42s" 
                    subtext="-12s" icon={Zap} colorClass="bg-white/10 text-cyan-400" 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Volume Analysis (7 Days)</h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="day" stroke="#666" fontSize={12} />
                          <YAxis stroke="#666" fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: '#141419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="detections" stroke="#00f2ff" fillOpacity={0.2} fill="#00f2ff" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-bold mb-6">Risk Factor by Platform</h3>
                    <div style={{ height: '300px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={platformData}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {platformData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#141419', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="glass-panel p-6">
                  <h3 className="text-lg font-bold mb-6">Repeat Offender Monitoring</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { name: "Telegram Bot @SportStreams_Free", detections: 124, risk: "High" },
                      { name: "Twitter/X User @MatchDayLive", detections: 89, risk: "High" },
                      { name: "Discord Server 'GoalHub'", detections: 56, risk: "Medium" }
                    ].map((offender, i) => (
                      <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/5">
                        <div className="flex items-center gap-4">
                          <Globe className="text-gray-500" size={20} />
                          <div>
                            <p className="font-bold text-sm">{offender.name}</p>
                            <p className="text-xs text-gray-500">{offender.detections} total violations detected</p>
                          </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${offender.risk === 'High' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {offender.risk} RISK
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'detections' && (
              <motion.div key="detections" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Real-time Detections Feed</h2>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Search detections..." className="p-3 text-sm bg-white/5 border-none outline-none focus:border-cyan-400 w-64" />
                    <button className="btn-outline flex items-center gap-2"><Globe size={16} /> Filter Platform</button>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {detections.map(det => (
                    <DetectionItem key={det.id} detection={det} onTakedown={handleTakedown} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'assets' && (
              <motion.div key="assets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Protected Digital Assets</h2>
                  <button onClick={() => setActiveTab('enroll')} className="btn-primary flex items-center gap-2"><Upload size={18} /> Enroll New Asset</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {assets.map(asset => (
                    <div key={asset.id} className="glass-panel p-6" style={{ borderTop: '4px solid #00f2ff' }}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                          <ShieldCheck size={24} />
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[10px] font-bold text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded mb-2">AI AUDITED</span>
                           <MoreVertical className="text-gray-500 cursor-pointer" />
                        </div>
                      </div>
                      <h4 className="font-bold text-lg mb-1">{asset.name}</h4>
                      <p className="text-xs text-gray-500 mb-2">{asset.type} • Created {new Date(asset.created_at * 1000).toLocaleDateString()}</p>
                      
                      <div className="bg-white/5 p-3 rounded-lg mb-4">
                        <p className="text-[11px] text-gray-400 leading-relaxed italic">
                          "{asset.description || 'AI analysis in progress...'}"
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Fingerprint ID:</span>
                          <span className="text-cyan-400" style={{ fontFamily: 'monospace' }}>{asset.fingerprint}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Protection Status:</span>
                          <span className="text-emerald-400 font-bold">Active</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedAsset(asset);
                          setActiveTab('analytics');
                        }}
                        className="w-full mt-6 py-2 bg-white/5 border-none rounded-lg text-xs font-bold text-white cursor-pointer transition-all hover:bg-white/10"
                      >
                        VIEW FULL ANALYTICS
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'enroll' && (
              <motion.div key="enroll" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="glass-panel p-8">
                  <h2 className="text-2xl font-bold mb-2">Enroll New Content</h2>
                  <p className="text-gray-400 mb-8">Upload official media to generate tamper-resistant perceptual fingerprints.</p>
                  
                  <form className="flex flex-col gap-6" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    axios.post(`${API_BASE}/assets/enroll`, formData).then(() => {
                      setActiveTab('assets');
                      setSelectedFile(null);
                      fetchData();
                    });
                  }}>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-400">Asset Name</label>
                      <input name="name" type="text" placeholder="e.g. NBA Finals Game 7 Highlights" className="p-3 bg-white/5 outline-none focus:border-cyan-400" required />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-400">Content Type</label>
                      <select name="type" className="p-3 bg-[#141419] outline-none focus:border-cyan-400">
                        <option>Video Clip</option>
                        <option>Full Match Stream</option>
                        <option>Official Image</option>
                        <option>Brand Graphics</option>
                      </select>
                    </div>

                    <div 
                      onClick={() => fileInputRef.current.click()}
                      className="p-12 text-center transition-all cursor-pointer" 
                      style={{ 
                        border: selectedFile ? '2px solid #00f2ff' : '2px dashed rgba(255,255,255,0.1)', 
                        borderRadius: '12px',
                        backgroundColor: selectedFile ? 'rgba(0, 242, 255, 0.05)' : 'transparent'
                      }}
                    >
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className={selectedFile ? "text-cyan-400" : "text-gray-400"} />
                      </div>
                      <p className="font-bold">{selectedFile ? selectedFile.name : "Click to upload or drag and drop"}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "MP4, MKV, MOV up to 2GB"}
                      </p>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        name="file" 
                        className="hidden" 
                        style={{ display: 'none' }} 
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                      />
                    </div>

                    <div className="flex gap-4">
                      <button type="submit" className="flex-1 btn-primary py-4">GENERATE FINGERPRINT & ENROLL</button>
                      <button type="button" onClick={() => setActiveTab('dashboard')} className="px-8 py-4 glass-panel font-bold cursor-pointer transition-all">CANCEL</button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
