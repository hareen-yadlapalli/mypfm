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

        {fields.map(field => {
          // allow options to be either static array or a function(formData)->array
          const opts =
            field.type === 'select'
              ? (typeof field.options === 'function'
                  ? field.options(formData)
                  : field.options)
              : [];

          return (
            <div className="form-field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>

              {field.type === 'select' ? (
                <select
                  id={field.name}
                  value={formData[field.name] ?? ''}
                  onChange={e => handleChange(field.name, e.target.value)}
                >
                  <option value="" disabled>
                    -- Select {field.label} --
                  </option>
                  {opts.map(opt =>
                    typeof opt === 'object' ? (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ) : (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    )
                  )}
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
          );
        })}

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
      options: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
    })
  ).isRequired,
};

export default DataFormPopup;
