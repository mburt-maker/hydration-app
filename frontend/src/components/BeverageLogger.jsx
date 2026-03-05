import { useState, useEffect } from 'react';
import { api } from '../api/client';
import './BeverageLogger.css';

const BeverageLogger = ({ onClose, onLog }) => {
  const [categories, setCategories] = useState([]);
  const [step, setStep] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubtype, setSelectedSubtype] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep('subtype');
  };

  const handleSubtypeSelect = (subtype) => {
    setSelectedSubtype(subtype);
    setStep('size');
  };

  const handleSizeSelect = async (size) => {
    setLoading(true);
    setError('');

    try {
      await api.logBeverage({
        beverage_type: selectedCategory.id,
        beverage_subtype: selectedSubtype,
        volume_oz: size
      });
      onLog();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to log beverage');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'size') {
      setSelectedSubtype(null);
      setStep('subtype');
    } else if (step === 'subtype') {
      setSelectedCategory(null);
      setStep('category');
    }
  };

  return (
    <div className="logger-overlay" onClick={onClose}>
      <div className="logger-modal" onClick={(e) => e.stopPropagation()}>
        <div className="logger-header">
          {step !== 'category' && (
            <button className="logger-back" onClick={handleBack}>
              ←
            </button>
          )}
          <h2>
            {step === 'category' && 'Add a drink'}
            {step === 'subtype' && selectedCategory?.name}
            {step === 'size' && `${selectedCategory?.name} - ${selectedSubtype}`}
          </h2>
          <button className="logger-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="logger-error">{error}</div>}

        <div className="logger-content">
          {step === 'category' && (
            <div className="category-grid">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className="category-button"
                  style={{ '--cat-color': cat.color }}
                  onClick={() => handleCategorySelect(cat)}
                >
                  <span className="category-icon">{getCategoryIcon(cat.id)}</span>
                  <span className="category-name">{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {step === 'subtype' && selectedCategory && (
            <div className="subtype-list">
              {selectedCategory.subtypes.map((subtype) => (
                <button
                  key={subtype}
                  className="subtype-button"
                  onClick={() => handleSubtypeSelect(subtype)}
                >
                  {subtype}
                </button>
              ))}
            </div>
          )}

          {step === 'size' && selectedCategory && (
            <div className="size-grid">
              {selectedCategory.sizes.map((size) => (
                <button
                  key={size}
                  className="size-button"
                  onClick={() => handleSizeSelect(size)}
                  disabled={loading}
                >
                  <span className="size-value">{size}</span>
                  <span className="size-unit">oz</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const getCategoryIcon = (id) => {
  const icons = {
    water: '💧',
    coffee: '☕',
    tea: '🍵',
    soda: '🥤',
    energy: '⚡',
    milk: '🥛',
    juice: '🧃'
  };
  return icons[id] || '🥤';
};

export default BeverageLogger;
