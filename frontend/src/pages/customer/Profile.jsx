import { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Phone, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { Card, Spinner } from "../../components/common/UI";
import toast from "react-hot-toast";

export default function CustomerProfile() {
  const { user, fetchMe } = useAuth();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name, phone: user?.phone || "" },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.put("/auth/me", data);
      await fetchMe();
      toast.success("Profile updated!");
    } catch {}
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">My Profile</h1>
        <p className="text-surface-500 mt-1">Manage your account details</p>
      </div>

      {/* Avatar */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-700">{user?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-surface-900">{user?.name}</h2>
            <p className="text-surface-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs bg-primary-50 text-primary-700 font-semibold px-2.5 py-0.5 rounded-full capitalize">{user?.role}</span>
          </div>
        </div>
      </Card>

      {/* Edit form */}
      <Card className="p-6">
        <h3 className="font-display font-bold text-lg text-surface-900 mb-5">Edit Details</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input {...register("name", { required: "Name is required" })} className="input pl-10" />
            </div>
            {errors.name && <p className="error-msg">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input value={user?.email} disabled className="input pl-10 opacity-60 cursor-not-allowed" />
            </div>
            <p className="text-xs text-surface-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="label">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input {...register("phone")} type="tel" className="input pl-10" placeholder="+91 9999999999" />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-2">
            {saving ? <><Spinner size="sm" className="border-white border-t-transparent" />Saving...</> : "Save Changes"}
          </button>
        </form>
      </Card>
    </div>
  );
}
