import React from 'react';
import { LucideIcon } from 'lucide-react';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'vip';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, variant = 'primary', size = 'md', isLoading, className = '', icon: Icon, ...props 
}) => {
  const baseStyles = "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  const sizeStyles = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2", lg: "px-6 py-3 text-lg" };
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20 border border-transparent",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600",
    outline: "bg-transparent border border-slate-500 text-slate-300 hover:border-brand-500 hover:text-brand-500",
    danger: "bg-red-600 hover:bg-red-500 text-white",
    vip: "bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 border-none"
  };
  return (
    <button className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (<>{Icon && <Icon size={size === 'sm' ? 16 : 18} />}{children}</>)}
    </button>
  );
};

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; }
export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
    <input className={`w-full px-4 py-2 bg-slate-900/50 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-colors ${className}`} {...props} />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

// Card Component
export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-panel rounded-xl p-6 ${className}`}>{children}</div>
);

// Badge Component
export const Badge: React.FC<{ type: 'FREE' | 'VIP' | 'SVIP' }> = ({ type }) => {
  if (type === 'SVIP') return <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white animate-pulse-slow shadow-lg shadow-purple-500/40 border border-white/20">至尊 SVIP</span>;
  if (type === 'VIP') return <span className="px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 shadow shadow-amber-500/40">VIP</span>;
  return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300 border border-slate-600">免费</span>;
};

// Modal Component
export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};