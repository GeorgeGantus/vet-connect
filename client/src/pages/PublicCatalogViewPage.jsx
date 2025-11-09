import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCatalogByAccessCode } from '../api/catalogs';
import { toggleLikeProduct, requestBudgetForProduct } from '../api/products';
import ProductCard from '../components/ProductCard';

const PublicCatalogViewPage = () => {
  const { accessCode } = useParams();
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [products, setProducts] = useState([]);

  // State for budget request modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [budgetMessage, setBudgetMessage] = useState('');

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const data = await getCatalogByAccessCode(accessCode);
        // Separate catalog info from products to manage product state independently
        const { products: fetchedProducts, ...catalogInfo } = data;
        setCatalog(catalogInfo);
        setProducts(fetchedProducts.map(p => ({ ...p, is_liked: !!p.is_liked })));
      } catch (err) {
        setError('Catálogo não encontrado. Verifique o código de acesso e tente novamente.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [accessCode]);

  const handleLikeToggle = async (productId) => {
    // Optimistic UI update
    const originalProducts = [...products];
    setProducts(currentProducts =>
      currentProducts.map(p =>
        p.id === productId ? { ...p, is_liked: !p.is_liked } : p
      )
    );

    try {
      await toggleLikeProduct(productId);
    } catch (err) {
      // Revert on error
      setProducts(originalProducts);
      // eslint-disable-next-line no-alert
      alert('Ocorreu um erro ao curtir o produto. Tente novamente.');
      console.error('Failed to toggle like:', err);
    }
  };

  const openBudgetModal = (productId) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const closeBudgetModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
    setBudgetMessage('');
  };

  const handleBudgetSubmit = async () => {
    if (!selectedProductId) return;
    try {
      await requestBudgetForProduct(selectedProductId, budgetMessage);
      closeBudgetModal();
      alert('Sua solicitação de orçamento foi enviada com sucesso!');
    } catch (err) {
      console.error('Failed to submit budget request:', err);
      alert('Ocorreu um erro ao enviar sua solicitação. Tente novamente.');
    }
  };

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
    <>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{catalog.name}</h1>
          <p className="text-md text-gray-500 mt-1">Fornecido por: <span className="font-semibold text-gray-700">{catalog.vendor_name}</span></p>
        </div>
        <Link to="/vet-home" className="text-blue-600 hover:text-blue-800">&larr; Voltar</Link>
      </div>
      <p className="text-gray-600 mb-6">{catalog.description || 'Este catálogo não possui uma descrição.'}</p>

      <hr className="my-8" />

      <h2 className="text-2xl font-bold text-gray-700 mb-6">Produtos</h2>
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showLikeButton={true}
              isLiked={product.is_liked}
              onLikeToggle={handleLikeToggle}
              showRequestBudgetButton={true}
              onRequestBudget={openBudgetModal}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Ainda não há produtos neste catálogo.</p>
      )}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Solicitar Orçamento</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 mb-4">
                  Você pode incluir uma mensagem para o fornecedor junto com sua solicitação.
                </p>
                <textarea
                  className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none"
                  rows="4"
                  placeholder="Sua mensagem (opcional)..."
                  value={budgetMessage}
                  onChange={(e) => setBudgetMessage(e.target.value)}
                ></textarea>
              </div>
              <div className="items-center px-4 py-3 space-x-4">
                <button onClick={handleBudgetSubmit} className="px-4 py-2 bg-blue-600 text-white text-base font-medium rounded-md w-auto shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">Enviar Solicitação</button>
                <button onClick={closeBudgetModal} className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-auto shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicCatalogViewPage;