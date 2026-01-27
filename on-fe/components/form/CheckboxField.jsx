// components/CheckboxField.jsx
import React from 'react'

export default function CheckboxField({ label, checked, name, onChange, labelClass,error }) {

  return (
    <div className="checkbox-form text-white font-pretendard">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: '#ffd753', marginRight: 8 }}
      />
      <span className={labelClass}>{label}</span>
      {error && (
        <p className="mt-[0.5rem] text-xl text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}