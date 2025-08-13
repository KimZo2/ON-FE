// components/CheckboxField.jsx
import React from 'react'

export default function CheckboxField({ label, checked, name, onChange }) {
  return (
    <div className="checkbox-form text-white font-pretendard">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: '#ffd753', marginRight: 8 }}
      />
      <span>{label}</span>
    </div>
  )
}