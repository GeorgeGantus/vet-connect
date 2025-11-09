import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UploadCloud as UploadCloudIcon } from 'lucide-react';
import { addProduct } from '../api/products';

const AddProductPage = () => {
  const { catalogId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Nome do produto é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const productFormData = new FormData();
    productFormData.append('name', formData.name);
    productFormData.append('description', formData.description);
    productFormData.append('catalog_id', parseInt(catalogId, 10));
    if (imageFile) {
      productFormData.append('image', imageFile);
    }

    try {
      await addProduct(productFormData);
      // On success, navigate back to the catalogs list or a success page
      navigate('/my-catalogs');
    } catch (err) {
      setError(err.response?.data?.message || 'Falha ao adicionar o produto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Adicionar Produto ao Catálogo</h1>
          <Link to="/my-catalogs" className="text-blue-600 hover:text-blue-800">&larr; Voltar para Meus Catálogos</Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                <textarea
                  name="description"
                  id="description"
                  rows="4"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* Image Upload */}
            <div className="flex flex-col items-center justify-center bg-gray-50 p-4 rounded-md border-2 border-dashed border-gray-300">
              {imagePreview ? (
                <img src={imagePreview} alt="Pré-visualização do produto" className="w-48 h-48 object-cover rounded-md mb-4" />
              ) : (
                <div className="text-center text-gray-500 mb-4">
                  <UploadCloudIcon className="mx-auto h-12 w-12" />
                  <p className="mt-2 text-sm">Nenhuma imagem selecionada</p>
                </div>
              )}
              <label htmlFor="image" className="cursor-pointer bg-white text-blue-600 font-semibold py-2 px-4 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Selecionar Imagem
              </label>
              <input
                id="image"
                name="image"
                type="file"
                className="sr-only"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleImageChange}
              />
            </div>

            {/* Form Submission */}
            <div className="md:col-span-2">
              {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
              <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300">
                  {isSubmitting ? 'Adicionando...' : 'Adicionar Produto'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;