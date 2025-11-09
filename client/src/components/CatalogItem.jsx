import React from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline'; // Using an icon for the view button

const CatalogItem = ({ catalog, onEdit, onDelete }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="flex-grow">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-purple-700">{catalog.name}</h2>
          <Link
            to={`/my-catalogs/${catalog.id}/view`}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Ver produtos do catálogo"
          >
            <EyeIcon className="h-6 w-6" />
          </Link>
        </div>
        <p className="text-gray-600 mt-2">{catalog.description || 'Sem descrição.'}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Produtos: <span className="font-semibold text-gray-700">{catalog.product_count}</span></p>
          <span className="text-sm font-medium text-gray-500">Código de Acesso:</span>
          {' '}
          <span className="font-mono text-sm bg-gray-100 text-gray-800 p-1 rounded">{catalog.access_code}</span>
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-row sm:flex-col justify-end items-stretch sm:items-end space-y-0 sm:space-y-2 space-x-2 sm:space-x-0 w-full sm:w-auto">
        <Link
          to={`/my-catalogs/${catalog.id}/products`}
          className="bg-blue-500 text-white text-center font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition-colors text-sm"
        >
          Adicionar Produtos
        </Link>
        <button onClick={() => onEdit(catalog.id)} className="bg-yellow-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-yellow-600 transition-colors text-sm">Editar</button>
        <button onClick={() => onDelete(catalog.id)} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-600 transition-colors text-sm">Deletar</button>
      </div>
    </div>
  );
};

export default CatalogItem;