import { SignInForm } from "@/features/admin";

/**
 * Admin sign-in — standalone page (no public header/footer).
 * The form posts to the backend's /api/auth/sign-in endpoint.
 */
export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm bg-paper p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">GastroSpecs Admin</h1>
        <p className="mt-2 text-sm text-muted">Sign in to the dashboard.</p>
        <SignInForm />
      </div>
    </main>
  );
}
