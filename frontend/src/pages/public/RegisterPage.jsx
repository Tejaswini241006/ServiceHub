import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Spinner } from "../../components/common/UI";

const schema = yup.object({
  name: yup.string().required("Name is required").min(2, "Name too short"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Min 8 characters")
    .matches(/[A-Z]/, "Must include uppercase letter")
    .matches(/\d/, "Must include a number"),
  phone: yup.string(),
  role: yup.string().oneOf(["customer", "provider"]).required(),
});

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { role: "customer" },
  });

  const role = watch("role");

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const user = await authRegister(data);
      navigate(user.role === "provider" ? "/provider/dashboard" : "/dashboard", { replace: true });
    } catch {}
    setSubmitting(false);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-surface-900">Create your account</h1>
          <p className="text-surface-500 mt-1">Join ServiceHub today</p>
        </div>

        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-8">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {["customer", "provider"].map((r) => (
              <label key={r} className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${role === r ? "border-primary-500 bg-primary-50" : "border-surface-200 hover:border-surface-300"}`}>
                <input {...register("role")} type="radio" value={r} className="sr-only" />
                <span className="text-2xl">{r === "customer" ? "🏠" : "🔧"}</span>
                <span className={`text-sm font-semibold capitalize ${role === r ? "text-primary-700" : "text-surface-600"}`}>{r}</span>
              </label>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register("name")} type="text" className="input" placeholder="John Doe" />
              {errors.name && <p className="error-msg">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email address</label>
              <input {...register("email")} type="email" className="input" placeholder="you@example.com" />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone (optional)</label>
              <input {...register("phone")} type="tel" className="input" placeholder="+91 9999999999" />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input {...register("password")} type={showPw ? "text" : "password"} className="input pr-12" placeholder="Min 8 chars, 1 uppercase, 1 number" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {submitting ? <><Spinner size="sm" className="border-white border-t-transparent" />Creating account...</> : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
