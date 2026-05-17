import { useState, useEffect, useCallback } from "react";
import { UserCheck, UserX, Star } from "lucide-react";
import { adminAPI } from "../../services/api";
import { Badge, EmptyState, Spinner, Pagination } from "../../components/common/UI";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [approvedFilter, setApprovedFilter] = useState("");
  const [actionId, setActionId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 10 };
      if (approvedFilter !== "") params.approved = approvedFilter;
      const r = await adminAPI.providers(params);
      setProviders(r.data.data || []);
      setMeta(r.data.meta || {});
    } catch {}
    setLoading(false);
  }, [page, approvedFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    setActionId(id);
    try {
      await adminAPI.approveProvider(id);
      toast.success("Provider approved!");
      load();
    } catch {}
    setActionId(null);
  };

  const handleSuspend = async (id) => {
    if (!window.confirm("Suspend this provider?")) return;
    setActionId(id);
    try {
      await adminAPI.suspendProvider(id);
      toast.success("Provider suspended");
      load();
    } catch {}
    setActionId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">Providers</h1>
        <p className="text-surface-500 mt-1">{meta.total ?? 0} service providers</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {[{ label: "All", val: "" }, { label: "Pending", val: "false" }, { label: "Approved", val: "true" }].map(({ label, val }) => (
          <button
            key={val}
            onClick={() => { setApprovedFilter(val); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${approvedFilter === val ? "bg-primary-500 text-white border-primary-500" : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : providers.length === 0 ? (
        <EmptyState icon={UserCheck} title="No providers found" />
      ) : (
        <>
          <div className="space-y-4">
            {providers.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-primary-700">{p.user?.name?.[0]}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                      <div>
                        <h3 className="font-display font-bold text-surface-900">{p.user?.name}</h3>
                        <p className="text-sm text-surface-400">{p.user?.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {p.is_suspended ? (
                          <Badge variant="danger">Suspended</Badge>
                        ) : p.is_approved ? (
                          <Badge variant="success">Approved</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-surface-500 mt-1 mb-3 line-clamp-2">{p.description || "No description provided."}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-surface-500 mb-4">
                      <span>🧑‍💼 {p.experience} yrs experience</span>
                      <span>💰 ₹{p.total_earnings?.toLocaleString()} earned</span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-yellow-400" />
                        {p.avg_rating} ({p.total_reviews} reviews)
                      </span>
                      <span>📅 Joined {p.created_at ? format(new Date(p.created_at), "MMM d, yyyy") : "—"}</span>
                    </div>

                    <div className="flex gap-2">
                      {!p.is_approved && !p.is_suspended && (
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={actionId === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          {actionId === p.id ? "…" : "Approve"}
                        </button>
                      )}
                      {p.is_approved && !p.is_suspended && (
                        <button
                          onClick={() => handleSuspend(p.id)}
                          disabled={actionId === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          {actionId === p.id ? "…" : "Suspend"}
                        </button>
                      )}
                      {p.is_suspended && (
                        <button
                          onClick={() => handleApprove(p.id)}
                          disabled={actionId === p.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Reinstate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} pages={meta.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
