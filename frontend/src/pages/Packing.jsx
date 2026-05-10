import { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Briefcase,
  Shirt,
  Smartphone,
  Pill,
  FileText,
  MoreHorizontal
} from 'lucide-react';

const categories = [
  { id: 'clothing', name: 'Clothing', icon: Shirt },
  { id: 'electronics', name: 'Electronics', icon: Smartphone },
  { id: 'toiletries', name: 'Toiletries', icon: Briefcase },
  { id: 'medical', name: 'Medical', icon: Pill },
  { id: 'documents', name: 'Documents', icon: FileText },
  { id: 'other', name: 'Other', icon: MoreHorizontal },
];

const defaultItems = [
  { id: 1, name: 'Passport', category: 'documents', packed: true },
  { id: 2, name: 'Phone Charger', category: 'electronics', packed: true },
  { id: 3, name: 'T-shirts (5)', category: 'clothing', packed: false },
  { id: 4, name: 'Toothbrush & Toothpaste', category: 'toiletries', packed: false },
  { id: 5, name: 'Pain Relievers', category: 'medical', packed: false },
  { id: 6, name: 'Travel Adapter', category: 'electronics', packed: false },
];

export default function Packing() {
  const [items, setItems] = useState(defaultItems);
  const [newItem, setNewItem] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('clothing');

  const toggleItem = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, packed: !item.packed } : item
    ));
  };

  const addItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    
    setItems([...items, {
      id: Date.now(),
      name: newItem,
      category: selectedCategory,
      packed: false
    }]);
    setNewItem('');
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const packedCount = items.filter(i => i.packed).length;
  const progress = items.length > 0 ? (packedCount / items.length) * 100 : 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Packing List</h1>
        <p className="page-subtitle">Don't forget anything important</p>
      </div>

      {/* Progress */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Packing Progress</p>
            <p className="text-2xl font-bold text-gray-900">
              {packedCount} of {items.length} items packed
            </p>
          </div>
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-brand-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Item */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Item</h2>
            <form onSubmit={addItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="input"
                  placeholder="e.g., Sunglasses"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full">
                <Plus className="w-5 h-5 mr-2" />
                Add Item
              </button>
            </form>
          </div>
        </div>

        {/* Packing List */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {items.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No items yet. Add your first item!
                </div>
              ) : (
                items.map((item) => {
                  const CategoryIcon = categories.find(c => c.id === item.category)?.icon || Briefcase;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                        item.packed ? 'opacity-60' : ''
                      }`}
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="flex-shrink-0"
                      >
                        {item.packed ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : (
                          <Circle className="w-6 h-6 text-gray-300" />
                        )}
                      </button>
                      <CategoryIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <span className={`flex-1 ${item.packed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-400 capitalize">
                        {item.category}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
