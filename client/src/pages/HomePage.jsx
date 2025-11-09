import React from 'react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

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

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If the user is a vendor, redirect them to their catalogs page.
    if (user && user.role === 'vendor') {
      navigate('/my-catalogs', { replace: true });
    }
    // If the user is a veterinarian, redirect them to their dedicated home page.
    if (user && user.role === 'veterinarian') {
      navigate('/vet-home', { replace: true });
    }
  }, [user, navigate]);

  // If user is not a vendor, or not logged in, show the public homepage.
  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center">
      {/* Centered Header */}
      <div className="text-center mb-12">
        <StethoscopeIcon className="h-16 w-16 text-blue-600 mx-auto" />
        <h1 className="text-4xl font-bold text-gray-800 mt-2">
          VetConnect
        </h1>
        <p className="mt-2 text-md text-gray-500">
          Conectando veterinários e representantes farmacêuticos de forma simples e eficiente
        </p>
      </div>

      {/* Two Cards Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Vendor/Representative Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center text-center">
          <div className="flex-grow">
            <div className="bg-blue-100 p-4 rounded-full mb-4 inline-block">
              <UserIcon className="h-10 w-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Sou Representante</h2>
            <p className="mt-2 text-gray-600">Gerencie seu catálogo e conecte-se com veterinários.</p>
          </div>
          <Link to="/register?role=vendor" className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors w-full">Cadastre-se</Link>
        </div>

        {/* Veterinarian Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col items-center text-center">
          <div className="flex-grow">
            <div className="bg-green-100 p-4 rounded-full mb-4 inline-block">
              <StethoscopeIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Sou Veterinário</h2>
            <p className="mt-2 text-gray-600">Acesse catálogos de representantes.</p>
          </div>
          <Link to="/register?role=veterinarian" className="mt-6 bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors w-full">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;