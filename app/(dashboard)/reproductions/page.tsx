import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ReproductionsContent from '@/components/reproductions/ReproductionsContent'

export default function ReproductionsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#00685f]" />
        </div>
      }
    >
      <ReproductionsContent />
    </Suspense>
  )
}