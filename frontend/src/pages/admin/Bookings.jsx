import { useState, useEffect, useCallback } from "react";
import { Calendar } from "lucide-react";
import { adminAPI } from "../../services/api";
import { StatusBadge, EmptyState, Spinner, Pagination } from "../../components/common/UI";
import { format } from "date-fns";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminAPI.bookings({ page, per_page: 12, status: statusFilter || undefined });
      setBookings(r.data.data || []);
      setMeta(r.data.meta || {});
    } catch {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">All Bookings</h1>
        <p className="text-surface-500 mt-1">{meta.total ?? 0} total bookings on platform</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["", "pending", "accepted", "in_progress", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${statusFilter === s ? "bg-primary-500 text-white border-primary-500" : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"}`}
          >
            {s ? s.replace("_", " ").replace(/^\w/, c => c.toUpperCase()) : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Calendar} title="No bookings found" />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface-50 border-b border-surface-200">
                  <tr>
                    {["Service", "Customer", "Date", "Amount", "Status"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-surface-900 truncate max-w-[200px]">{b.service?.title}</p>
                        <p className="text-xs text-surface-400">{b.service?.category?.name}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-surface-800">{b.customer?.name}</p>
                        <p className="text-xs text-surface-400">{b.customer?.email}</p>
                      </td>
                      <td className="px-5 py-4 text-surface-500 whitespace-nowrap">
                        {b.booking_date ? format(new Date(b.booking_date), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-5 py-4 font-semibold text-surface-900">₹{b.total_amount?.toLocaleString()}</td>
                      <td className="px-5 py-4"><StatusBadge status={b.status} /></td>
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
