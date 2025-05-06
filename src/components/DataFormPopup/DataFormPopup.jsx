// src/components/DataFormPopup/DataFormPopup.jsx

import React from 'react';
import PropTypes from 'prop-types';
import './DataFormPopup.css';

const DataFormPopup = ({
  isOpen,
  title,
  formData,
  setFormData,
  onSave,
  onCancel,
  fields,
}) => {
  if (!isOpen) return null;

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="popup-backdrop">
      <div className="popup">
        <h3 className="popup-title">{title}</h3>
        <div className="form-fields-container">
          {fields.map(field => (
            <div className="form-field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              {field.type === 'select' ? (
                <select
                  id={field.name}
                  value={formData[field.name] ?? ''}
                  onChange={e => handleChange(field.name, field.options[0] && field.options[0].value !== undefined ? Number(e.target.value) : e.target.value)}
                >
                  {field.options.map(opt => (
                    <option key={opt.value ?? opt} value={opt.value ?? opt}>
                      {opt.label ?? opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder || ''}
                  value={formData[field.name] ?? ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="modal-buttons">
          <button className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="button button-primary" onClick={onSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

DataFormPopup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      placeholder: PropTypes.string,
      options: PropTypes.array,
    })
  ).isRequired,
};

export default DataFormPopup;