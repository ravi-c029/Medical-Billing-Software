import React, { useState, useMemo } from 'react';
import { useProductStore } from '../store/productStore';
import { NeuCard } from '../components/ui/NeuCard';
import { NeuButton } from '../components/ui/NeuButton';
import { NeuInput } from '../components/ui/NeuInput';
import { Modal } from '../components/ui/Modal';
import type { Medicine } from '../types';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export const ProductManager = () => {
  const { medicines, addProduct, updateProduct, deleteProduct } = useProductStore();
  
  const [search, setSearch] = useState('');
  const [categoryTab, setCategoryTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const initialFormState: Medicine = {
    id: '', name: '', hsn: '', mrp: 0, mfdBy: '', taxPercent: 5, category: 'Tablets', stock: 0
  };
  const [formData, setFormData] = useState<Medicine>(initialFormState);
  const [isEditing, setIsEditing] = useState(false);

  const categories = ['All', 'Tablets', 'Syrups', 'Injections', 'Oils', 'Others'];

  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryTab === 'All' || m.category === categoryTab;
      return matchSearch && matchCategory;
    });
  }, [search, categoryTab, medicines]);

  const handleOpenModal = (medicine?: Medicine) => {
    if (medicine) {
      setFormData(medicine);
      setIsEditing(true);
    } else {
      setFormData({ ...initialFormState, id: Date.now().toString() });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'mrp' || name === 'taxPercent' || name === 'stock' ? Number(value) : value 
    }));
  };

  const handleSave = () => {
    if (!formData.name) return;
    if (isEditing) {
      updateProduct(formData.id, formData);
    } else {
      addProduct(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="animate-fade-in w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex space-x-2 bg-background shadow-neu-down p-1 rounded-neu-btn flex-wrap md:flex-nowrap w-full md:w-auto overflow-x-auto min-w-[300px]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryTab(cat)}
              className={`px-4 py-2 rounded-neu-btn text-sm font-medium transition-all duration-300 ${
                categoryTab === cat 
                  ? 'neu-filter-active' 
                  : 'text-slate-600 hover:text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <NeuInput 
              placeholder="Search products..." 
              className="pl-9 w-full sm:w-64 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <NeuButton variant="primary" icon={<Plus size={16} />} onClick={() => handleOpenModal()} className="whitespace-nowrap">
            Add Product
          </NeuButton>
        </div>
      </div>

      <NeuCard className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">Product Name</th>
                <th className="p-4 font-semibold text-slate-700">HSN</th>
                <th className="p-4 font-semibold text-slate-700">MRP (₹)</th>
                <th className="p-4 font-semibold text-slate-700">Tax %</th>
                <th className="p-4 font-semibold text-slate-700">Category</th>
                <th className="p-4 font-semibold text-slate-700">Stock</th>
                <th className="p-4 font-semibold text-slate-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    (item.stock ?? 0) < 10 ? 'bg-red-50/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="p-4 font-medium text-slate-800">{item.name}</td>
                  <td className="p-4 text-slate-600">{item.hsn}</td>
                  <td className="p-4 text-slate-600 font-semibold">{item.mrp.toFixed(2)}</td>
                  <td className="p-4 text-slate-600">{item.taxPercent}%</td>
                  <td className="p-4 text-slate-600">
                    <span className="bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`font-bold ${(item.stock ?? 0) < 10 ? 'text-danger' : 'text-success'}`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleOpenModal(item)} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-danger hover:bg-danger/10 rounded-full transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </NeuCard>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditing ? 'Edit Product' : 'Add New Product'}>
        <div className="space-y-4">
          <NeuInput label="Product Name" name="name" value={formData.name} onChange={handleChange} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeuInput label="HSN Code" name="hsn" value={formData.hsn} onChange={handleChange} />
            <NeuInput label="MRP (₹)" name="mrp" type="number" value={formData.mrp} onChange={handleChange} />
          </div>
          <NeuInput label="Manufacturer" name="mfdBy" value={formData.mfdBy} onChange={handleChange} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1 w-full text-slate-700">
              <label className="text-sm font-semibold pl-1">Tax (%)</label>
              <select name="taxPercent" value={formData.taxPercent} onChange={handleChange} className="neu-input">
                <option value={5}>5%</option>
                <option value={12}>12%</option>
                <option value={18}>18%</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full text-slate-700">
              <label className="text-sm font-semibold pl-1">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="neu-input">
                <option value="Tablets">Tablets</option>
                <option value="Syrups">Syrups</option>
                <option value="Injections">Injections</option>
                <option value="Oils">Oils</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <NeuInput label="Stock Qty" name="stock" type="number" value={formData.stock} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <NeuButton onClick={handleCloseModal}>Cancel</NeuButton>
            <NeuButton variant="primary" onClick={handleSave}>
              {isEditing ? 'Save Changes' : 'Add Product'}
            </NeuButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};
