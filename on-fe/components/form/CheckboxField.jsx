// components/CheckboxField.jsx
import React from 'react'

export default function CheckboxField({ label, checked, name, onChange, style }) {

  const font = style.font ? style.font : '';

  return (
    <div className="checkbox-form text-white font-pretendard">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: '#ffd753', marginRight: 8 }}
      />
      <span className={`${font}`}>{label}</span>
    </div>
  )
}