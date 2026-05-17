import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../../components/common/UI";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await login(data.email, data.password);
      const redirect = user.role === "admin" ? "/admin" : user.role === "provider" ? "/provider/dashboard" : "/dashboard";
      navigate(redirect, { replace: true });
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-surface-900">Welcome back</h1>
          <p className="text-surface-500 mt-1">Sign in to your ServiceHub account</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <input {...register("email")} type="email" className="input" placeholder="you@example.com" autoFocus />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register("password")} type={showPw ? "text" : "password"} className="input pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {submitting ? <><Spinner size="sm" className="border-white border-t-transparent" />Signing in...</> : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Sign up</Link>
            </p>
          </div>

          {/* Demo accounts */}
          <div className="mt-6 pt-6 border-t border-surface-100">
            <p className="text-xs text-surface-400 text-center mb-3 font-medium uppercase tracking-wide">Demo Accounts</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { label: "Customer", email: "customer1@example.com", pw: "Customer@123" },
                { label: "Provider", email: "rajesh@provider.com", pw: "Provider@123" },
                { label: "Admin", email: "admin@servicehub.com", pw: "Admin@123" },
              ].map(({ label, email, pw }) => (
                <button
                  key={label}
                  type="button"
                  onClick={async () => {
                    setSubmitting(true);
                    try {
                      const user = await login(email, pw);
                      const redirect = user.role === "admin" ? "/admin" : user.role === "provider" ? "/provider/dashboard" : "/dashboard";
                      navigate(redirect, { replace: true });
                    } catch {}
                    setSubmitting(false);
                  }}
                  className="bg-surface-50 hover:bg-primary-50 border border-surface-200 hover:border-primary-200 rounded-xl py-2 px-1 text-center transition-colors"
                >
                  <p className="font-semibold text-surface-700">{label}</p>
                  <p className="text-surface-400 truncate">{email.split("@")[0]}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
