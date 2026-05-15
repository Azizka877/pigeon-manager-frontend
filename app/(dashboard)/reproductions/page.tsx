// app/reproductions/page.tsx
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ReproductionsContent from '@/components/reproductions/ReproductionsContent'


export default function ReproductionsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#00685f]" />
      </div>
    }>
      <ReproductionsContent />
    </Suspense>
  )
}