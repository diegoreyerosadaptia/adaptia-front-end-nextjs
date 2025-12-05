import { Suspense } from "react";
import { NewPasswordForm } from "./_components/new-password-form";

export default function NewPasswordPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Suspense fallback={null}>
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}
