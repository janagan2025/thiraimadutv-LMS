import React, { useState } from 'react';
import { verifyPassword } from '../services/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    const isValid = await verifyPassword(password);
    if (isValid) {
      onLoginSuccess();
    } else {
      setError(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full border border-gray-100">
        <div className="text-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">அதிபர் உள்நுழைவு</h2>
          <p className="text-gray-500 text-sm mt-1">Please enter admin password</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="கடவுச்சொல்"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          
          {error && <p className="text-red-500 text-sm text-center font-medium">தவறான கடவுச்சொல் (Invalid Password)</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition shadow-md disabled:opacity-70"
          >
            {loading ? 'சரிபார்க்கிறது...' : 'உள்நுழைக'}
          </button>
        </form>
      </div>
    </div>
  );
};