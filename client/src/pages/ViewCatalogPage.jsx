import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCatalogWithProducts } from '../api/catalogs';
import ProductCard from '../components/ProductCard';

const ViewCatalogPage = () => {
  const { catalogId } = useParams();
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await getCatalogWithProducts(catalogId);
        setCatalog(data);
      } catch (err) {
        setError('Falha ao buscar o catálogo. Verifique se ele existe e se você tem permissão para visualizá-lo.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [catalogId]);

  if (loading) {
    return <div className="text-center mt-10">Carregando catálogo...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  if (!catalog) {
    return <div className="text-center mt-10">Catálogo não encontrado.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{catalog.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to={`/my-catalogs/${catalogId}/events`} className="bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-md hover:bg-indigo-200 transition-colors text-sm">Ver Histórico de Eventos</Link>
          <Link to="/my-catalogs" className="text-purple-600 hover:text-purple-800">&larr; Voltar para Meus Catálogos</Link>
        </div>
      </div>
      <p className="text-gray-600 mb-6">{catalog.description || 'Este catálogo não possui uma descrição.'}</p>

      <hr className="my-8" />

      <h2 className="text-2xl font-bold text-gray-700 mb-6">Produtos</h2>
      {catalog.products && catalog.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {catalog.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Ainda não há produtos neste catálogo.</p>
      )}
    </div>
  );
};

export default ViewCatalogPage;
