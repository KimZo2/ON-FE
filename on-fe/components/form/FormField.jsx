// components/FormField.jsx
import React from 'react'

export default function FormField({ label, type = 'text', name, value, onChange, maxLength, required, divClass, labelClass, inputClass }) {

  // const titleColor = style.titleColor ? style.titleColor : '';
  // const font = style.font ? style.font : '';
  // const textColor = style.textColor? style.textColor : '';
  // const bgColor = style.bgColor ? style.bgColor : 'white';

  return (
    <div className={divClass}>
      <label className={labelClass}>{label}</label>
      <input
        className={`input mt-2 w-full px-5 py-3 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none ${inputClass}`}
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