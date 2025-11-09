import React, { useState, useEffect } from 'react';
import { HeartIcon, ArrowTrendingUpIcon, EyeIcon, HandThumbUpIcon, HandThumbDownIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline';
import { getDashboardActivity, getDashboardStats } from '../api/catalogs';

// A simple time formatting utility
const timeSince = (date) => {
  // If the date is in the future, the difference will be negative.
  // In such cases, or for very small differences, we can just say "agora".
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 2) {
    return "agora";
  }
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} anos atrás`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} meses atrás`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} dias atrás`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} horas atrás`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} min atrás`;
  return `${Math.floor(seconds)} seg atrás`;
};

const VendorDashboardPage = () => {
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({ totalLikes: 0, topProducts: [] });
  const [loading, setLoading] = useState(true);

  // State for budget request modal
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedBudgetMessage, setSelectedBudgetMessage] = useState('');
  const [selectedBudgetVetInfo, setSelectedBudgetVetInfo] = useState({ name: '', phone: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both activity and stats in parallel
        const [activityData, statsData] = await Promise.all([
          getDashboardActivity(),
          getDashboardStats()
        ]);
        setRecentActivities(activityData);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Optionally set an error state here
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Placeholder Data ---
  // const totalLikes = 123;
  // const topProducts = [
  //   { id: 1, name: 'Produto A', likes: 45 },
  //   { id: 2, name: 'Produto B', likes: 32 },
  //   { id: 3, name: 'Produto C', likes: 28 },
  //   { id: 4, name: 'Produto D', likes: 15 },
  //   { id: 5, name: 'Produto E', likes: 9 },
  // ];
  // --- End Placeholder Data ---

  const getActivityIcon = (type) => {
    switch (type) {
      case 'liked':
        return <HandThumbUpIcon className="h-5 w-5 text-green-500" />;
      case 'unliked':
        return <HandThumbDownIcon className="h-5 w-5 text-red-500" />;
      case 'viewed':
        return <EyeIcon className="h-5 w-5 text-blue-500" />;
      case 'budget_requested':
        return <ChatBubbleLeftEllipsisIcon className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  const openBudgetModal = (activity) => {
    setSelectedBudgetMessage(activity.message);
    setSelectedBudgetVetInfo({ name: activity.user_name, phone: activity.user_phone_number });
    setIsBudgetModalOpen(true);
  };

  const closeBudgetModal = () => {
    setIsBudgetModalOpen(false);
    setSelectedBudgetMessage('');
    setSelectedBudgetVetInfo({ name: '', phone: '' });
  };

  const formatActivityText = (activity) => {
    const user = <span className="font-bold text-gray-900">{activity.user_name}</span>;
    const product = <span className="font-semibold text-blue-600">{activity.product_name}</span>;
    const catalog = <span className="font-semibold text-indigo-600">{activity.catalog_name}</span>;

    switch (activity.type) {
      case 'liked': return <p className="text-sm text-gray-700">{user} curtiu o produto {product}.</p>;
      case 'unliked': return <p className="text-sm text-gray-700">{user} descurtiu o produto {product}.</p>;
      case 'viewed': return <p className="text-sm text-gray-700">{user} visualizou o catálogo {catalog}.</p>;
      case 'budget_requested':
        return (
          <div>
            <p className="text-sm text-gray-700">{user} solicitou um orçamento para o produto {product}.</p>
            {activity.message && (
              <button onClick={() => openBudgetModal(activity)} className="mt-1 text-xs text-blue-600 hover:text-blue-800 font-semibold">Ver Mensagem</button>
            )}
          </div>
        );
      default: return <p className="text-sm text-gray-700">Evento desconhecido.</p>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="mt-1 text-lg text-gray-600">Acompanhe o desempenho do seu catálogo e atividade dos veterinários</p>
      </div>

      {/* Summary Card */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mb-8">
        <div className="flex items-center">
          <div className="bg-pink-100 p-3 rounded-full">
            <HeartIcon className="h-8 w-8 text-pink-500" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total de Curtidas nos Produtos</p>
            <p className="text-3xl font-bold text-gray-800">{loading ? '...' : stats.totalLikes}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Liked Products Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center mb-4">
            <ArrowTrendingUpIcon className="h-6 w-6 text-gray-700 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Top 5 Produtos Curtidos</h2>
          </div>
          <ul className="space-y-3">
            {loading ? (
              <p className="text-gray-500">Carregando...</p>
            ) : stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <li key={product.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-gray-700">{index + 1}. {product.name}</span>
                  <span className="font-bold text-gray-800 flex items-center">
                    {product.likes} <HeartIcon className="h-4 w-4 text-pink-500 ml-1" />
                  </span>
                </li>
              ))
            ) : (
              <p className="text-gray-500">Nenhum produto foi curtido ainda.</p>
            )}
          </ul>
        </div>

        {/* Recent Activity Card */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Atividade Recente</h2>
          <ul className="space-y-4">
            {loading ? (
              <p className="text-gray-500">Carregando atividades...</p>
            ) : recentActivities.length === 0 ? (
              <p className="text-gray-500">Nenhuma atividade recente.</p>
            ) : recentActivities.map(activity => (
              <li key={activity.id} className="flex items-center p-3 bg-slate-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="ml-3 flex-grow">
                  {formatActivityText(activity)}
                  <p className="text-xs text-gray-500">{timeSince(activity.created_at)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Budget Request Modal */}
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
    </div>
  );
};

export default VendorDashboardPage;