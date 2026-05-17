import LoginForm from "@/components/login/loginform";
import { Suspense } from "react";


// 🔧 Page exportée avec Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f0f4f3] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00685f]" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}