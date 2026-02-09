
import React, { useState } from 'react';
import { Lock, User, ArrowRight } from 'lucide-react';
import Logo from './Logo';

interface AdminLoginProps {
  onLogin: (id: string, pass: string) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'Rahin' && pass === 'rahin5566') {
      onLogin(id, pass);
    } else {
      setError('Invalid ID or Password. System Access Denied.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-black p-12 text-center text-white flex flex-col items-center">
          <Logo light className="w-48 mb-4" />
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Internal Operations Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && <div className="p-4 bg-red-50 text-red-500 text-xs font-bold rounded-xl text-center border border-red-100">{error}</div>}
          
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder="Admin ID"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black border border-transparent transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="Secure Key"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-black border border-transparent transition-all"
              />
            </div>
          </div>

          <button className="w-full bg-black text-white py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/20 mt-4">
            <span>Authorize System</span>
            <ArrowRight size={20} />
          </button>
          
          <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest mt-6">
            Secured by UNIKA CORE 2.5
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
