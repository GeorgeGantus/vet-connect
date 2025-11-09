import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: '',
    role: 'veterinarian', // Default role
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const roleFromUrl = searchParams.get('role');
    if (roleFromUrl === 'vendor' || roleFromUrl === 'veterinarian') {
      setFormData((prev) => ({ ...prev, role: roleFromUrl }));
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone_number') {
      // Apply phone number mask
      const onlyNums = value.replace(/\D/g, '');
      if (onlyNums.length <= 11) {
        let masked = onlyNums.replace(/^(\d{2})(\d)/g, '($1) $2');
        masked = masked.replace(/(\d{5})(\d)/, '$1-$2');
        setFormData({ ...formData, [name]: masked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // The password regex can be used here for client-side validation before sending.
    // For this example, we rely on the backend to perform the final validation,
    // but adding it here would provide faster feedback to the user.

    try {
      const { user: registeredUser } = await register(formData);
      // Redirect based on role
      if (registeredUser.role === 'vendor') {
        navigate('/my-catalogs');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Falha no cadastro. Tente novamente.');
    }
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Cadastro</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              type="tel"
              name="phone_number"
              id="phone_number"
              required
              placeholder="(XX) XXXXX-XXXX"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              minLength="8"
              pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$"
              title="A senha deve ter no mínimo 8 caracteres, com pelo menos um número e um caractere especial."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              required
              minLength="8"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>
          <p className="text-sm text-gray-600">
            Você está se cadastrando como: <span className="font-bold">{formData.role === 'veterinarian' ? 'Veterinário(a)' : 'Representante(a)'}</span>
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
            Cadastrar
          </button>
        </form>
        <p className="text-sm text-center text-gray-600">
          Já tem uma conta? <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">Faça login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;