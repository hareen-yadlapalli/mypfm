import React from 'react';

/**
 * A generic search input that calls onChange with the new value.
 */
const SearchBox = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <input
      type="text"
      className="search-box"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
};

export default SearchBox;
