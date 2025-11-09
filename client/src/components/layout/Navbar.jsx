import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const StethoscopeIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-stethoscope-icon lucide-stethoscope" {...props}
    >
    <path d="M11 2v2"/><path d="M5 2v2"/>
    <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/>
    <path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>
    </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleDisplay = {
    veterinarian: 'Veterinário',
    vendor: 'Vendedor',
  };

  return (
    <nav className="bg-white text-gray-800 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-gray-800 hover:opacity-80 transition-opacity">
          <StethoscopeIcon className="h-7 w-7 text-blue-600" />
          VetConnect
        </Link>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              {user.role === 'vendor' && (
                <>
                  <Link to="/dashboard" className="font-semibold text-gray-600 hover:bg-slate-100 px-3 py-1 rounded-md transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/clients" className="font-semibold text-gray-600 hover:bg-slate-100 px-3 py-1 rounded-md transition-colors">
                    Clientes
                  </Link>
                </>
              )}
              <span className="hidden sm:inline text-sm text-gray-600">
                Olá, {user.email}
                {user.role && ` (${roleDisplay[user.role] || user.role})`}
              </span>
              <button onClick={handleLogout} className="font-semibold text-gray-600 hover:bg-slate-100 px-3 py-1 rounded-md transition-colors">
                Sair
              </button>
            </>
          ) : (
            <Link to="/login" className="font-semibold text-gray-600 hover:bg-slate-100 px-3 py-2 rounded-md transition-colors">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;