import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Package } from "lucide-react";
import { servicesAPI } from "../../services/api";
import { Card, EmptyState, Spinner, Modal, Badge } from "../../components/common/UI";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

const schema = yup.object({
  title: yup.string().required("Title is required").min(3),
  description: yup.string().required("Description is required").min(10),
  price: yup.number().required("Price is required").min(1, "Price must be > 0"),
  duration_mins: yup.number().required().min(15).max(480),
  category_id: yup.string().required("Category is required"),
});

export default function ProviderServices() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Load provider's services via the services list (provider filter would need backend; use all for now)
      const [svcR, catR] = await Promise.all([
        servicesAPI.list({ per_page: 50 }),
        servicesAPI.categories(),
      ]);
      setServices(svcR.data.data || []);
      setCategories(catR.data.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    reset({});
    setModalOpen(true);
  };

  const openEdit = (svc) => {
    setEditing(svc);
    reset({
      title: svc.title,
      description: svc.description,
      price: svc.price,
      duration_mins: svc.duration_mins,
      category_id: svc.category_id,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await servicesAPI.update(editing.id, data);
        toast.success("Service updated!");
      } else {
        await servicesAPI.create(data);
        toast.success("Service created!");
      }
      setModalOpen(false);
      load();
    } catch {}
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    setDeletingId(id);
    try {
      await servicesAPI.delete(id);
      toast.success("Service deleted");
      load();
    } catch {}
    setDeletingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-surface-900">My Services</h1>
          <p className="text-surface-500 mt-1">Manage your service listings</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No services yet"
          description="Create your first service listing to start receiving bookings"
          action={<button onClick={openCreate} className="btn-primary">Create Service</button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {services.map((svc) => (
            <Card key={svc.id} className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-surface-900 truncate">{svc.title}</h3>
                  <span className="text-xs text-surface-400">{svc.category?.name}</span>
                </div>
                <Badge variant={svc.is_active ? "success" : "danger"}>{svc.is_active ? "Active" : "Inactive"}</Badge>
              </div>

              <p className="text-sm text-surface-500 line-clamp-2 mb-4">{svc.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm text-surface-600">
                  <span className="font-bold text-primary-600 text-base">₹{svc.price?.toLocaleString()}</span>
                  <span>· {svc.duration_mins} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(svc)}
                    className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    disabled={deletingId === svc.id}
                    className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Service" : "Add New Service"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Service Title</label>
            <input {...register("title")} className="input" placeholder="e.g. Deep Home Cleaning" />
            {errors.title && <p className="error-msg">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea {...register("description")} rows={3} className="input resize-none" placeholder="Describe your service in detail..." />
            {errors.description && <p className="error-msg">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price (₹)</label>
              <input {...register("price")} type="number" step="0.01" className="input" placeholder="999" />
              {errors.price && <p className="error-msg">{errors.price.message}</p>}
            </div>
            <div>
              <label className="label">Duration (mins)</label>
              <input {...register("duration_mins")} type="number" className="input" placeholder="60" />
              {errors.duration_mins && <p className="error-msg">{errors.duration_mins.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Category</label>
            <select {...register("category_id")} className="input">
              <option value="">Select category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.category_id && <p className="error-msg">{errors.category_id.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving…" : editing ? "Update Service" : "Create Service"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
