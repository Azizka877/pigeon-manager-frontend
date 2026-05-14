// app/contact-admin/page.tsx
import { Suspense } from 'react'
import { ContactAdminContent } from '@/components/contact-admin-content'

export default function ContactAdminPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f3] flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-sm border border-gray-200/60 p-8 md:p-10 text-center animate-pulse">
            <div className="w-14 h-14 rounded-xl bg-gray-200 mx-auto mb-4" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mx-auto mb-6" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
        }
      >
        <ContactAdminContent />
      </Suspense>
    </div>
  )
}