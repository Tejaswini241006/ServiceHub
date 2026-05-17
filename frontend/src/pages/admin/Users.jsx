import { useState, useEffect, useCallback } from "react";
import { Search, Trash2, Users } from "lucide-react";
import { adminAPI } from "../../services/api";
import { Badge, EmptyState, Spinner, Pagination } from "../../components/common/UI";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminAPI.users({ page, per_page: 12, q: search || undefined, role: roleFilter || undefined });
      setUsers(r.data.data || []);
      setMeta(r.data.meta || {});
    } catch {}
    setLoading(false);
  }, [page, search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteUser(id);
      toast.success("User deactivated");
      load();
    } catch {}
    setDeletingId(null);
  };

  const roleColors = { admin: "primary", provider: "info", customer: "default" };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">Users</h1>
        <p className="text-surface-500 mt-1">{meta.total ?? 0} registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="input sm:w-40"
        >
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : users.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    {["User", "Role", "Phone", "Status", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-primary-700">{u.name?.[0]}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-surface-900">{u.name}</p>
                            <p className="text-surface-400 text-xs">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={roleColors[u.role] || "default"}>{u.role}</Badge>
                      </td>
                      <td className="px-5 py-4 text-surface-500">{u.phone || "—"}</td>
                      <td className="px-5 py-4">
                        <Badge variant={u.is_active ? "success" : "danger"}>{u.is_active ? "Active" : "Inactive"}</Badge>
                      </td>
                      <td className="px-5 py-4 text-surface-400 text-xs">
                        {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDelete(u.id)}
                          disabled={deletingId === u.id || u.role === "admin"}
                          title={u.role === "admin" ? "Cannot deactivate admin" : "Deactivate user"}
                          className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} pages={meta.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
