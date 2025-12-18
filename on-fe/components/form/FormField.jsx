// components/FormField.jsx
import React from 'react'

export default function FormField({ label, type = 'text', name, value, onChange, maxLength, required, divClass, labelClass, inputClass, disabled }) {

  // const titleColor = style.titleColor ? style.titleColor : '';
  // const font = style.font ? style.font : '';
  // const textColor = style.textColor? style.textColor : '';
  // const bgColor = style.bgColor ? style.bgColor : 'white';

  return (
    <div className={`${divClass} w-full`}>
      <label className={labelClass}>{label}</label>
      <input
        className={`input p-[0.5rem] mt-[0.5rem] w-full rounded-xl bg-white placeholder:text-gray-400 focus:outline-none ${inputClass}`}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        required={required}
        disabled={disabled}
      />
    </div>
  )
}