import React, { useState, useEffect, useMemo } from 'react';
import { getClientsWhoLikedProducts } from '../api/catalogs';
import {
  MagnifyingGlassIcon,
  UsersIcon,
  HandThumbUpIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PhoneIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const StatCard = ({ icon, label, value }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const ClientCard = ({ client }) => {
  const cleanPhoneNumber = client.client_phone_number.replace(/\D/g, '');

  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between space-y-6 md:space-y-0 md:space-x-6">
      {/* Vet Info */}
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
          Dr
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-gray-800 truncate">{client.client_name}</h3>
          <p className="text-sm text-gray-500 truncate">{client.client_email}</p>
        </div>
      </div>

      {/* Liked Products */}
      <div className="flex-1 w-full md:w-auto">
        <h4 className="font-semibold text-gray-700 mb-2 text-sm">Produtos Curtidos:</h4>
        <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 max-h-24 overflow-y-auto">
          {client.liked_products.map(p => (
            <li key={p.product_id}>{p.product_name} <span className="text-gray-400">({p.catalog_name})</span></li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col space-y-2 w-full md:w-auto self-stretch justify-center">
        <a href={`https://wa.me/${cleanPhoneNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-semibold">
          <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4 mr-2" />
          WhatsApp
        </a>
        <a href={`tel:${cleanPhoneNumber}`} className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-semibold">
          <PhoneIcon className="h-4 w-4 mr-2" />
          Ligar
        </a>
        <a href={`mailto:${client.client_email}`} className="flex items-center justify-center px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-semibold">
          <EnvelopeIcon className="h-4 w-4 mr-2" />
          Email
        </a>
      </div>
    </div>
  );
};

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await getClientsWhoLikedProducts();
        setClients(data);
      } catch (err) {
        setError('Falha ao carregar os clientes. Tente novamente mais tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = useMemo(() =>
    clients.filter(client =>
      client.client_name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [clients, searchTerm]
  );

  const totalLikes = useMemo(() =>
    filteredClients.reduce((sum, client) => sum + client.liked_products.length, 0),
    [filteredClients]
  );

  if (loading) {
    return <div className="text-center mt-10">Carregando clientes...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Seus Clientes</h1>

      {/* Search Bar */}
      <div className="relative mb-8">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Buscar clientes por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard
          icon={<UsersIcon className="h-6 w-6" />}
          label="Total de Clientes"
          value={filteredClients.length}
        />
        <StatCard
          icon={<HandThumbUpIcon className="h-6 w-6" />}
          label="Total de Curtidas"
          value={totalLikes}
        />
      </div>

      {/* Client Cards */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredClients.map(client => (
            <ClientCard key={client.client_id} client={client} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            {searchTerm ? 'Nenhum cliente encontrado com esse nome.' : 'Nenhum cliente curtiu seus produtos ainda.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;