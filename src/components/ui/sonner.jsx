"use client"

import { Toaster as Sonner } from "sonner"

function Toaster({ ...props }) {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        style: { width: '320px' },
        className: 'max-w-[320px]',
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-sans",
          title: "group-[.toast]:text-gray-900 group-[.toast]:font-bold",
          description: "group-[.toast]:text-gray-500",
          actionButton:
            "group-[.toast]:bg-[#0A3D2E] group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:font-semibold group-[.toast]:px-4 group-[.toast]:py-2 shrink-0 ms-auto",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 group-[.toast]:rounded-lg",
          success:
            "group-[.toaster]:!border-emerald-200 group-[.toaster]:!bg-emerald-50",
          error:
            "group-[.toaster]:!border-red-200 group-[.toaster]:!bg-red-50",
          icon: "group-[.toast]:text-[#10b981]",
          closeButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 group-[.toast]:border-gray-200 hover:group-[.toast]:bg-gray-200",
        },
      }}
      richColors
      closeButton={false}
      position="top-center"
      expand={false}
      duration={3000}
      {...props}
    />
  )
}

export { Toaster }
