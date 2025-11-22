import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, User as UserIcon, LogOut, Zap, Upload, Copy, Sparkles, 
  ShieldCheck, Gift, Crown, Loader2, MessageSquare, TrendingUp, Shield, 
  RefreshCw, Image as ImageIcon, X, Terminal, CheckCircle, Play
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

import { StorageService } from './services/storageService';
import { GeminiService } from './services/geminiService';
import { User, MembershipType, ViewState } from './types';
import { Button, Input, Card, Badge, Modal } from './components/UIComponents';

const ADMIN_PASSWORD = "3130995534"; 

// --- Extracted Components ---
interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
  setView: (view: ViewState) => void;
  handleLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, isAdmin, setView, handleLogout }) => (
  <nav className="w-full h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 fixed top-0 z-40">
    <div className="flex items-center gap-2 text-brand-500 cursor-pointer" onClick={() => isAdmin ? setView('ADMIN') : setView('DASHBOARD')}>
      <Zap className="w-6 h-6" fill="currentColor" />
      <span className="text-xl font-bold tracking-wide text-white">Sora<span className="text-brand-500">Prompter</span></span>
    </div>
    {user && (
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
           <span className="text-xs text-slate-400">剩余积分:</span>
           <span className="font-mono text-brand-400 font-bold">
             {(isAdmin || user.membership === 'SVIP' || (user.membership === 'VIP' && user.membershipExpiry && user.membershipExpiry > Date.now())) ? '∞' : user.credits}
           </span>
        </div>
        {isAdmin && (
          <button onClick={() => setView('ADMIN')} className="flex items-center gap-1 px-2 py-1 rounded bg-red-900/50 text-red-200 border border-red-800 text-xs font-bold animate-pulse">
            <Shield size={12} /> 管理员模式
          </button>
        )}
        <button onClick={() => setView('PRICING')} className="flex items-center gap-2">
           <span className="text-sm font-medium text-slate-200">{user.username}</span>
           <Badge type={user.membership} />
        </button>
        <button onClick={handleLogout} className="text-slate-400 hover:text-white transition-colors" title="退出登录">
          <LogOut size={20} />
        </button>
      </div>
    )}
  </nav>
);

interface AuthViewProps {
  view: ViewState;
  setView: (view: ViewState) => void;
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  inviteCode: string;
  setInviteCode: (v: string) => void;
  handleLogin: () => void;
  handleRegister: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ 
  view, setView, username, setUsername, password, setPassword, inviteCode, setInviteCode, handleLogin, handleRegister 
}) => (
  <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
    <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2" />
    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent-svip/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2" />
    <Card className="w-full max-w-md z-10 relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-purple-500">
          {view === 'LOGIN' ? '欢迎回来' : '加入 SoraPrompter'}
        </h2>
        <p className="text-slate-400 mt-2">
          {view === 'LOGIN' ? '登录以进入您的 AI 视频提示词工作室。' : '创建一个账户，开始提取高精度提示词。'}
        </p>
      </div>
      <div className="space-y-4">
        <Input label="用户名" placeholder="请输入用户名" value={username} onChange={e => setUsername(e.target.value)} />
        <Input label="密码" type="password" placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} />
        {view === 'REGISTER' && (
          <Input label="邀请码 (选填)" placeholder="如有好友邀请码，请在此填写" value={inviteCode} onChange={e => setInviteCode(e.target.value)} />
        )}
        <div className="pt-4">
          <Button onClick={view === 'LOGIN' ? handleLogin : handleRegister} className="w-full py-3 text-lg">
            {view === 'LOGIN' ? '立即登录' : '注册账号'}
          </Button>
        </div>
        <div className="text-center text-sm text-slate-400 mt-4">
          {view === 'LOGIN' ? "还没有账号？ " : "已有账号？ "}
          <button className="text-brand-400 hover:text-brand-300 underline" onClick={() => setView(view === 'LOGIN' ? 'REGISTER' : 'LOGIN')}>
            {view === 'LOGIN' ? '立即注册' : '在此登录'}
          </button>
        </div>
         <div className="text-center mt-6 border-t border-slate-700 pt-4">
          <button className="text-xs text-slate-500 hover:text-slate-300" onClick={() => setView('ADMIN_LOGIN')}>
            管理员入口
          </button>
        </div>
      </div>
    </Card>
  </div>
);

interface AdminLoginViewProps {
  adminPassInput: string;
  setAdminPassInput: (v: string) => void;
  handleAdminLogin: () => void;
  setView: (view: ViewState) => void;
}

const AdminLoginView: React.FC<AdminLoginViewProps> = ({ adminPassInput, setAdminPassInput, handleAdminLogin, setView }) => (
  <div className="min-h-screen flex items-center justify-center">
    <Card className="w-full max-w-sm p-8">
      <h2 className="text-2xl font-bold text-white text-center mb-6">管理员验证</h2>
      <Input type="password" placeholder="请输入管理员密码" value={adminPassInput} onChange={e => setAdminPassInput(e.target.value)} />
      <div className="mt-6 space-y-3">
        <Button onClick={handleAdminLogin} className="w-full">进入后台</Button>
        <Button variant="outline" onClick={() => setView('LOGIN')} className="w-full">取消</Button>
      </div>
    </Card>
  </div>
);

interface DashboardViewProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl: string | null;
  selectedFile: File | null;
  isGenerating: boolean;
  progress: number;
  triggerFileSelect: () => void;
  handleGenerate: () => void;
  generatedPrompt: string;
  handleCopy: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  fileInputRef, handleFileSelect, previewUrl, selectedFile, isGenerating, progress, triggerFileSelect, handleGenerate, generatedPrompt, handleCopy
}) => {
  const isVideoFile = (file: File | null) => {
    if (!file) return false;
    if (file.type.startsWith('video/')) return true;
    const ext = file.name.split('.').pop()?.toLowerCase();
    return ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv', 'ts', 'm4v'].includes(ext || '');
  };
  const isVideo = isVideoFile(selectedFile);

  return (
    <div className="pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      <header className="text-center space-y-2 mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          视频转 <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-500">AI 提示词</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">上传您的视频片段或图片。我们的 AI 自动提取适配 Sora、可灵 (Kling) 和 Runway 的高精度提示词。</p>
      </header>
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="min-h-[400px] flex flex-col relative border-2 border-slate-600 bg-slate-900/30 overflow-hidden">
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
            {previewUrl && selectedFile ? (
              <div className="flex flex-col h-full p-2">
                 <div className="relative flex-1 rounded-lg overflow-hidden bg-black flex items-center justify-center group min-h-[240px]">
                    {isVideo ? (
                      <video key={previewUrl} src={previewUrl} controls className="w-full h-full object-contain max-h-[400px]" />
                    ) : (
                      <img key={previewUrl} src={previewUrl} alt="Preview" className="w-full h-full object-contain max-h-[400px]" />
                    )}
                 </div>
                 <div className="mt-4 flex justify-between items-center">
                    <Button variant="outline" size="sm" onClick={triggerFileSelect} icon={RefreshCw}>更换素材</Button>
                    <div className="text-xs text-slate-400">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</div>
                 </div>
                 {isGenerating && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs text-brand-400 font-mono">
                        <span>正在分析帧数据...</span><span>{progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-500 to-purple-500 transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                 )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-800/50 transition-colors p-8 border-dashed border-2 border-transparent hover:border-slate-500/50 rounded-lg" onClick={triggerFileSelect}>
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Upload className="w-10 h-10 text-brand-500" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">点击上传素材</h3>
                <p className="text-slate-400 text-center text-sm max-w-xs">支持 MP4, MOV, JPG, PNG 等格式<br/><span className="text-brand-400">建议上传视频片段以获得最佳动态描述</span></p>
              </div>
            )}
        </Card>
        <Card className="min-h-[400px] flex flex-col bg-slate-900/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-brand-400"><Sparkles size={20} /><span className="font-semibold">AI 生成结果</span></div>
            {generatedPrompt && <Button size="sm" variant="secondary" icon={Copy} onClick={handleCopy}>复制</Button>}
          </div>
          {generatedPrompt ? (
            <div className="flex-1 relative">
               <textarea readOnly value={generatedPrompt} className="w-full h-full min-h-[300px] bg-slate-800/50 rounded-lg p-4 text-slate-200 leading-relaxed focus:outline-none resize-none font-mono text-sm border border-slate-700/50" />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
               <div className="p-4 bg-slate-800/30 rounded-full"><Sparkles className="w-8 h-8 opacity-20" /></div>
               <p>生成的提示词将显示在这里</p>
               <Button disabled={!selectedFile || isGenerating} onClick={handleGenerate} className="mt-4 w-full max-w-[200px]" isLoading={isGenerating} size="lg">{isGenerating ? '分析生成中...' : '开始提取提示词'}</Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

interface PricingViewProps {
  handleUpgrade: (type: 'VIP' | 'SVIP') => void;
}

const PricingView: React.FC<PricingViewProps> = ({ handleUpgrade }) => (
  <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
    <div className="text-center mb-12"><h2 className="text-3xl font-bold text-white">会员升级方案</h2><p className="text-slate-400 mt-2">解锁无限次使用权，获得尊贵身份标识</p></div>
    <div className="grid md:grid-cols-2 gap-8">
      <Card className="relative border-amber-500/30 hover:border-amber-500 transition-colors">
        <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded-bl-lg font-bold">性价比首选</div>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-amber-900/30 rounded-lg"><Crown className="text-amber-500 w-8 h-8" /></div>
          <div><h3 className="text-xl font-bold text-white">月度 VIP</h3><p className="text-amber-400 font-bold text-2xl">¥6.90 <span className="text-sm text-slate-400 font-normal">/ 20天</span></p></div>
        </div>
        <ul className="space-y-3 mb-8 text-slate-300">
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-amber-500"/> 20天无限次生成</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-amber-500"/> 用户名专属 VIP 金色标识</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-amber-500"/> 优先排队处理</li>
        </ul>
        <div className="flex flex-col gap-3">
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=wxp://f2f0?z=1" alt="Pay" className="w-32 h-32 mx-auto rounded-lg mix-blend-luminosity opacity-80" />
           <Button variant="vip" className="w-full" onClick={() => handleUpgrade('VIP')}>确认支付 ¥6.90 开通</Button>
        </div>
      </Card>
      <Card className="relative border-purple-500/30 hover:border-purple-500 transition-colors bg-gradient-to-b from-slate-800/50 to-purple-900/10">
        <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold shadow-lg shadow-purple-500/50">终身尊享</div>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-purple-900/30 rounded-lg"><Sparkles className="text-purple-400 w-8 h-8" /></div>
          <div><h3 className="text-xl font-bold text-white">至尊 SVIP</h3><p className="text-purple-400 font-bold text-2xl">¥29.90 <span className="text-sm text-slate-400 font-normal">/ 永久</span></p></div>
        </div>
        <ul className="space-y-3 mb-8 text-slate-300">
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500"/> 永久无限次生成 (Lifetime)</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500"/> 尊贵 SVIP 炫彩动态标识</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500"/> 专属极速通道</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-purple-500"/> 解锁未来所有新功能</li>
        </ul>
        <div className="flex flex-col gap-3">
           <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=wxp://f2f0?z=1" alt="Pay" className="w-32 h-32 mx-auto rounded-lg mix-blend-luminosity opacity-80" />
           <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-none shadow-lg shadow-purple-500/30" onClick={() => handleUpgrade('SVIP')}>确认支付 ¥29.90 开通</Button>
        </div>
      </Card>
    </div>
  </div>
);

const AdminView: React.FC<{}> = () => {
  const users = StorageService.getUsers();
  const userList = Object.values(users);
  const totalRevenue = userList.reduce((acc, u) => acc + (u.totalSpent || 0), 0);
  const totalGens = userList.reduce((acc, u) => acc + (u.usageCount || 0), 0);
  const chartData = userList.map((u, i) => ({ name: `User ${i+1}`, usage: u.usageCount })).slice(0, 10);

  return (
    <div className="pt-24 pb-12 px-4 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-white flex items-center gap-3"><ShieldCheck className="text-red-500" /> 管理员控制台</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700"><div className="text-slate-400 text-sm">总用户数</div><div className="text-2xl font-bold text-white">{userList.length}</div></Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700"><div className="text-slate-400 text-sm">总营收</div><div className="text-2xl font-bold text-green-400">¥{totalRevenue.toFixed(2)}</div></Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700"><div className="text-slate-400 text-sm">总生成次数</div><div className="text-2xl font-bold text-brand-400">{totalGens}</div></Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700"><div className="text-slate-400 text-sm">今日活跃</div><div className="text-2xl font-bold text-purple-400">{userList.filter(u => u.lastLoginDate === new Date().toISOString().split('T')[0]).length}</div></Card>
      </div>
      <div className="space-y-6">
         <Card className="h-[300px]">
            <h3 className="text-lg font-semibold text-white mb-4">生成量趋势</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tick={false} />
                <YAxis stroke="#475569" fontSize={12} />
                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} itemStyle={{ color: '#e2e8f0' }} />
                <Line type="monotone" dataKey="usage" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
         </Card>
         <Card>
            <h3 className="text-lg font-semibold text-white mb-4">用户列表</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                  <tr><th className="px-4 py-3">用户名</th><th className="px-4 py-3">等级</th><th className="px-4 py-3">积分</th><th className="px-4 py-3">消费</th><th className="px-4 py-3">生成数</th></tr>
                </thead>
                <tbody>
                  {userList.slice(0, 10).map(u => (
                    <tr key={u.username} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-medium text-white">{u.username}</td>
                      <td className="px-4 py-3"><Badge type={u.membership} /></td>
                      <td className="px-4 py-3">{u.credits}</td>
                      <td className="px-4 py-3">¥{u.totalSpent}</td>
                      <td className="px-4 py-3">{u.usageCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </Card>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) { setUser(currentUser); setView('DASHBOARD'); }
  }, []);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleLogin = () => {
    const res = StorageService.login(username, password);
    if (res.success) { setUser(StorageService.getCurrentUser()); setView('DASHBOARD'); alert(res.message); } else { alert(res.message); }
  };

  const handleRegister = () => {
    const res = StorageService.register(username, password, inviteCode);
    if (res.success) { setView('LOGIN'); alert(res.message + ' 请登录'); } else { alert(res.message); }
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null); setUser(null); setView('LOGIN');
    setUsername(''); setPassword(''); setSelectedFile(null); setGeneratedPrompt(''); setPreviewUrl(null);
  };

  const handleAdminLogin = () => {
    if (adminPassInput === ADMIN_PASSWORD) { setView('ADMIN'); } else { alert("密码错误"); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setGeneratedPrompt(''); setProgress(0);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      e.target.value = '';
    }
  };

  const triggerFileSelect = () => { fileInputRef.current?.click(); };

  const handleGenerate = async () => {
    if (!selectedFile) return;
    const isVipOrSvip = user?.membership === 'SVIP' || (user?.membership === 'VIP' && user.membershipExpiry && user.membershipExpiry > Date.now());
    const isAdmin = view === 'ADMIN';
    if (!isAdmin && !isVipOrSvip && user && user.credits <= 0) { alert("积分不足，请升级会员或等待明日福利！"); setView('PRICING'); return; }

    setIsGenerating(true); setProgress(0); setGeneratedPrompt('');
    const interval = setInterval(() => {
      setProgress(prev => { if (prev >= 90) { clearInterval(interval); return 90; } return prev + 10; });
    }, 500);

    try {
      const prompt = await GeminiService.extractPrompt(selectedFile);
      if (!isAdmin) { const deducted = StorageService.deductCredit(); if (deducted) { setUser(StorageService.getCurrentUser()); } }
      setProgress(100); setTimeout(() => { setGeneratedPrompt(prompt); setIsGenerating(false); }, 500);
    } catch (error) { console.error(error); alert("生成失败，请重试"); setIsGenerating(false); } finally { clearInterval(interval); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(generatedPrompt); alert("已复制到剪贴板"); };
  const handleUpgrade = (type: 'VIP' | 'SVIP') => {
    StorageService.upgradeMembership(type); setUser(StorageService.getCurrentUser()); alert(`恭喜！您已成功升级为 ${type === 'SVIP' ? '至尊 SVIP' : 'VIP'}`); setView('DASHBOARD');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-brand-500/30">
      {view !== 'LOGIN' && view !== 'REGISTER' && view !== 'ADMIN_LOGIN' && <Navbar user={user} isAdmin={view === 'ADMIN'} setView={setView} handleLogout={handleLogout} />}
      {view === 'LOGIN' && <AuthView view={view} setView={setView} username={username} setUsername={setUsername} password={password} setPassword={setPassword} inviteCode={inviteCode} setInviteCode={setInviteCode} handleLogin={handleLogin} handleRegister={handleRegister} />}
      {view === 'REGISTER' && <AuthView view={view} setView={setView} username={username} setUsername={setUsername} password={password} setPassword={setPassword} inviteCode={inviteCode} setInviteCode={setInviteCode} handleLogin={handleLogin} handleRegister={handleRegister} />}
      {view === 'ADMIN_LOGIN' && <AdminLoginView adminPassInput={adminPassInput} setAdminPassInput={setAdminPassInput} handleAdminLogin={handleAdminLogin} setView={setView} />}
      {view === 'DASHBOARD' && <DashboardView fileInputRef={fileInputRef} handleFileSelect={handleFileSelect} previewUrl={previewUrl} selectedFile={selectedFile} isGenerating={isGenerating} progress={progress} triggerFileSelect={triggerFileSelect} handleGenerate={handleGenerate} generatedPrompt={generatedPrompt} handleCopy={handleCopy} />}
      {view === 'PRICING' && <PricingView handleUpgrade={handleUpgrade} />}
      {view === 'ADMIN' && <AdminView />}
    </div>
  );
}