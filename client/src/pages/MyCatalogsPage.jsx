import React, { useState, useEffect } from 'react';
import { getMyCatalogs, createCatalog, updateCatalog, deleteCatalog } from '../api/catalogs';
import CatalogItem from '../components/CatalogItem';
// import { useAuth } from '../hooks/useAuth';

const MyCatalogsPage = () => {
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for the creation form
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [editingCatalogId, setEditingCatalogId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const { user } = useAuth();

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const data = await getMyCatalogs();
        setCatalogs(data);
      } catch (err) {
        setError('Falha ao buscar os catálogos. Tente novamente mais tarde.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogs();
  }, []);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setFormError('O nome do catálogo é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');
    
    if (editingCatalogId) {
      // Update logic
      try {
        const updatedCatalog = await updateCatalog(editingCatalogId, formData);
        setCatalogs(catalogs.map(c => c.id === editingCatalogId ? updatedCatalog : c));
        closeForm();
      } catch (err) {
        setFormError(err.response?.data?.message || 'Falha ao atualizar o catálogo.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Create logic
      try {
        const createdCatalog = await createCatalog(formData);
        setCatalogs([createdCatalog, ...catalogs]); // Add new catalog to the top of the list
        closeForm();
      } catch (err) {
        setFormError(err.response?.data?.message || 'Falha ao criar o catálogo.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const openCreateForm = () => {
    setEditingCatalogId(null);
    setFormData({ name: '', description: '' });
    setIsFormOpen(true);
  };

  const handleEditCatalog = (catalogId) => {
    const catalogToEdit = catalogs.find(c => c.id === catalogId);
    if (catalogToEdit) {
      setEditingCatalogId(catalogId);
      setFormData({ name: catalogToEdit.name, description: catalogToEdit.description || '' });
      setIsFormOpen(true);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCatalogId(null);
    setFormData({ name: '', description: '' });
    setFormError('');
  };

  const handleDeleteCatalog = async (catalogId) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Tem certeza que deseja deletar este catálogo? Esta ação não pode ser desfeita.')) {
      try {
        await deleteCatalog(catalogId);
        setCatalogs(catalogs.filter((catalog) => catalog.id !== catalogId));
      } catch (err) {
        // eslint-disable-next-line no-alert
        alert('Falha ao deletar o catálogo. Tente novamente.');
        console.error('Delete failed:', err);
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Carregando catálogos...</div>;
  }

  if (error) {
    return <div className="text-center mt-10 text-red-600">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Meus Catálogos</h1>
        <button
          onClick={isFormOpen ? closeForm : openCreateForm}
          className="bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          {isFormOpen ? 'Cancelar' : 'Adicionar Novo Catálogo'}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">{editingCatalogId ? 'Editar Catálogo' : 'Novo Catálogo'}</h2>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Catálogo</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.name}
                onChange={handleFormChange}
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
              <textarea
                name="description"
                id="description"
                rows="3"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.description}
                onChange={handleFormChange}
              ></textarea>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                {isSubmitting ? (editingCatalogId ? 'Salvando...' : 'Criando...') : (editingCatalogId ? 'Salvar Alterações' : 'Criar Catálogo')}
              </button>
            </div>
          </form>
        </div>
      )}

      {catalogs.length === 0 ? (
        <p className="text-gray-600">Você ainda não possui catálogos cadastrados.</p>
      ) : (
        <div className="space-y-4">
          {catalogs.map((catalog) => (
            <CatalogItem
              key={catalog.id}
              catalog={catalog}
              onEdit={handleEditCatalog}
              onDelete={handleDeleteCatalog}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCatalogsPage;