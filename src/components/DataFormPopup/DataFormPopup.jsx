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

  // Determine whether we're in "add" or "edit" mode for styling
  const modeClass = title.toLowerCase().includes('add') ? 'add' : 'edit';

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className={`popup ${modeClass}`}>
      <h2>{title}</h2>

      {fields.map((field) => (
        <div className="form-field" key={field.name}>
          <label>{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
          />
        </div>
      ))}

      <div className="button-container">
        <button className="save-button" onClick={onSave}>
          {title.toLowerCase().includes('add') ? 'Save' : 'Update'}
        </button>
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DataFormPopup;
