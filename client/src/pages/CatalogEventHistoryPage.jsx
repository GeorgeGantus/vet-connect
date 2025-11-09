import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCatalogEvents } from '../api/catalogs';

const CatalogEventHistoryPage = () => {
  const { catalogId } = useParams();
  const [data, setData] = useState({ catalog: null, events: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for budget request modal
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedBudgetMessage, setSelectedBudgetMessage] = useState('');
  const [selectedBudgetVetInfo, setSelectedBudgetVetInfo] = useState({ name: '', phone: '' });

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventData = await getCatalogEvents(catalogId);
        setData(eventData);
      } catch (err) {
        setError('Falha ao buscar o histórico de eventos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [catalogId]);

  const openBudgetModal = (event) => {
    setSelectedBudgetMessage(event.message);
    setSelectedBudgetVetInfo({ name: event.user_name, phone: event.user_phone_number });
    setIsBudgetModalOpen(true);
  };

  const closeBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setSelectedBudgetMessage('');
    setSelectedBudgetVetInfo({ name: '', phone: '' });
  };

  const formatActivityText = (event) => {
    const user = <span className="font-bold text-gray-900">{event.user_name}</span>;
    const product = <span className="font-semibold text-blue-600">{event.product_name}</span>;

    switch (event.event_type) {
      case 'liked': return <p>{user} curtiu o produto {product}.</p>;
      case 'unliked': return <p>{user} descurtiu o produto {product}.</p>;
      case 'budget_requested':
        return (
          <div>
            <p>{user} solicitou um orçamento para o produto {product}.</p>
            {event.message && (
              <button onClick={() => openBudgetModal(event)} className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-semibold">Ver Mensagem</button>
            )}
          </div>
        );
      default: return <p>Evento: {event.event_type}</p>;
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Carregando histórico...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  const { catalog, events } = data;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">Histórico de Eventos: {catalog?.name}</h1>
          <Link to={`/my-catalogs/${catalogId}/view`} className="text-purple-600 hover:text-purple-800">&larr; Voltar ao Catálogo</Link>
        </div>
        <p className="text-gray-600 mb-6">{catalog?.description || 'Este catálogo não possui uma descrição.'}</p>

        <hr className="my-8" />

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-700 mb-6">Eventos Recentes</h2>
          {events.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {events.map((event, index) => (
                <li key={index} className="py-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-gray-800">{formatActivityText(event)}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(event.created_at).toLocaleString('pt-BR')}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhum evento registrado para este catálogo ainda.</p>
          )}
        </div>
      </div>
      {isBudgetModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">
                Solicitação de Orçamento de {selectedBudgetVetInfo.name}
              </h3>
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-800">Mensagem do Veterinário:</p>
                <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedBudgetMessage || "Nenhuma mensagem foi deixada."}
                </p>
              </div>
              <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p className="text-sm text-blue-800">
                  Entre em contato com {selectedBudgetVetInfo.name} pelo telefone: <span className="font-bold">{selectedBudgetVetInfo.phone}</span>.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <button onClick={closeBudgetModal} className="px-6 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CatalogEventHistoryPage;