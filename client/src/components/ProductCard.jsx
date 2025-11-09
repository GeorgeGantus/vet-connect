import React from 'react';
import { HeartIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/24/solid';

const ProductCard = ({ product, showLikeButton = false, isLiked = false, onLikeToggle, showRequestBudgetButton = false, onRequestBudget }) => {
  const placeholderImage = 'https://petbox.vteximg.com.br/arquivos/ids/158912-1000-1000/f71f540a1e22ccce6a278de5b22a08c302ab5603.jpg?v=637382788415500000';

  const handleLikeClick = (e) => {
    e.stopPropagation(); // prevent any parent link handlers from firing
    if (onLikeToggle) {
      onLikeToggle(product.id);
    }
  };

  const handleRequestBudgetClick = (e) => {
    e.stopPropagation();
    if (onRequestBudget) {
      onRequestBudget(product.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="relative">
        <img src={product.image_url || placeholderImage} alt={product.name} className="w-full h-48 object-cover" />
        {showLikeButton && (
          <button onClick={handleLikeClick} className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1.5 text-pink-500 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500" aria-label="Curtir produto">
            {isLiked ? <SolidHeartIcon className="h-6 w-6" /> : <HeartIcon className="h-6 w-6" />}
          </button>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <p className="text-gray-600 mt-1 text-sm">{product.description || 'Sem descrição.'}</p>
        {showRequestBudgetButton && (
          <button onClick={handleRequestBudgetClick} className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <PaperAirplaneIcon className="h-5 w-5 mr-2 -ml-1" />
            Solicitar Orçamento
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
