import React from 'react'

export default function AlertModal({
  open,
  title,
  description,
  children,
  confirmText = '확인',
  cancelText,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-fit rounded-2xl bg-white px-[5rem] py-[4rem] text-center shadow-xl">
        {title && (
          <h2 className="mb-[1rem] text-3xl font-semibold text-gray-900">
            {title}
          </h2>
        )}

        {description && (
          <p className="mb-[2rem] text-2xl text-gray-500">
            {description}
          </p>
        )}

        {/* 필요 시 커스텀 콘텐츠 */}
        {children}

        <div className="flex gap-[1rem]">
          {cancelText && (
            <button
              onClick={onCancel}
              className="p-[0.6rem] flex-1 rounded-full bg-gray-200 text-2xl font-medium text-gray-700 hover:bg-gray-300"
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={onConfirm}
            className="p-[0.6rem] flex-1 rounded-full bg-yellow-400 text-2xl font-medium text-gray-700 hover:bg-yellow-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
