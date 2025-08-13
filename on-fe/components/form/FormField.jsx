// components/FormField.jsx
import React from 'react'

export default function FormField({ label, type = 'text', name, value, onChange, maxLength, required, className, style }) {

  const titleColor = style.titleColor ? style.titleColor : '';
  const font = style.font ? style.font : '';
  const textColor = style.textColor? style.textColor : '';

  return (
    <div className={className}>
      <label className={`title text-${titleColor} ${font}`}>{label}</label>
      <input
        className={`input mt-2 w-full px-5 py-3 rounded-xl text-${textColor} bg-white placeholder:text-gray-400 focus:outline-none`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        required={required}
      />
    </div>
  )
}