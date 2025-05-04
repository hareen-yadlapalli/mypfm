import React from 'react';

const DataFormPopup = ({
  isOpen,
  onSave,
  onCancel,
  title,
  formData,
  setFormData,
  fields
}) => {
  if (!isOpen) return null;

  return (
    <div className="popup-backdrop">
      <div className="popup">
        <h2>{title}</h2>

        {fields.map((field) => (
          <div className="form-field" key={field.name}>
            <label>{field.label}</label>
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              value={
                field.type === 'date' && formData[field.name]
                  ? formData[field.name].slice(0, 10) // YYYY-MM-DD
                  : formData[field.name] || ''
              }
              onChange={(e) =>
                setFormData({ ...formData, [field.name]: e.target.value })
              }
            />
          </div>
        ))}

        <div className="modal-buttons">
          <button className="button button-primary" onClick={onSave}>
            {title.toLowerCase().includes('add') ? 'Save' : 'Update'}
          </button>
          <button className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataFormPopup;
