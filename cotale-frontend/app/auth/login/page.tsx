import Link from "next/link";
import { LogIn, ArrowLeft } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center text-slate-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 border border-white/20">
          <div className="text-center mb-8">
            <LogIn className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Login</h1>
            <p className="text-slate-300">Welcome back to CoTale</p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-slate-300">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
