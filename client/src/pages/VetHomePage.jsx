import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getRecentlyViewedCatalogs } from '../api/catalogs';
import { BookOpenIcon } from '@heroicons/react/24/outline';

const VetHomePage = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState('');
  const [recentCatalogs, setRecentCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCatalogAccess = (e) => {
    e.preventDefault();
    if (accessCode.trim()) {
      // TODO: In the future, this will navigate to the vet's catalog view page.
      navigate(`/catalog/${accessCode.trim()}`);
    }
  };

  useEffect(() => {
    const fetchRecentCatalogs = async () => {
      try {
        const data = await getRecentlyViewedCatalogs();
        setRecentCatalogs(data);
      } catch (error) {
        console.error('Failed to fetch recent catalogs:', error);
        // Optionally set an error state to show a message to the user
      } finally {
        setLoading(false);
      }
    };

    fetchRecentCatalogs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Acessar Catálogo de Fornecedor</h1>
        <p className="mt-4 text-lg text-gray-600">Insira o código de acesso fornecido pelo vendedor para visualizar o catálogo.</p>
        <form onSubmit={handleCatalogAccess} className="mt-8 max-w-sm mx-auto flex gap-2">
          <input type="text" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} placeholder="Código de Acesso" className="flex-grow px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors">Acessar</button>
        </form>
      </div>

      <hr className="my-12" />

      {/* Recently Viewed Catalogs Section */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Catálogos Visitados Recentemente</h2>
        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : recentCatalogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCatalogs.slice(0, 5).map(catalog => (
              <Link
                key={catalog.id}
                to={`/catalog/${catalog.access_code}`}
                className="block bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <BookOpenIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{catalog.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">de {catalog.vendor_name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Você ainda não visualizou nenhum catálogo.</p>
        )}
      </div>
    </div>
  );
};

export default VetHomePage;