import { Suspense } from "react"
import RegisterClient from "./components/register-form"


export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-10">Cargando...</div>}>
      <RegisterClient />
    </Suspense>
  )
}
