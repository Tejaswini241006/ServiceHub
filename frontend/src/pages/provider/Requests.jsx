import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle, PlayCircle, XCircle } from "lucide-react";
import { bookingsAPI } from "../../services/api";
import { StatusBadge, EmptyState, Spinner, Pagination } from "../../components/common/UI";
import { format } from "date-fns";
import toast from "react-hot-toast";

const STATUS_ACTIONS = {
  pending: [
    { label: "Accept", newStatus: "accepted", icon: CheckCircle, color: "text-green-600 border-green-200 hover:bg-green-50" },
    { label: "Cancel", newStatus: "cancelled", icon: XCircle, color: "text-red-600 border-red-200 hover:bg-red-50" },
  ],
  accepted: [
    { label: "Start Job", newStatus: "in_progress", icon: PlayCircle, color: "text-blue-600 border-blue-200 hover:bg-blue-50" },
    { label: "Cancel", newStatus: "cancelled", icon: XCircle, color: "text-red-600 border-red-200 hover:bg-red-50" },
  ],
  in_progress: [
    { label: "Mark Complete", newStatus: "completed", icon: CheckCircle, color: "text-green-600 border-green-200 hover:bg-green-50" },
  ],
};

export default function ProviderRequests() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await bookingsAPI.providerBookings({ page, per_page: 10, status: statusFilter || undefined });
      setBookings(r.data.data || []);
      setMeta(r.data.meta || {});
    } catch {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await bookingsAPI.updateStatus(bookingId, newStatus);
      toast.success(`Booking ${newStatus.replace("_", " ")}`);
      load();
    } catch {}
    setUpdatingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">Booking Requests</h1>
        <p className="text-surface-500 mt-1">Manage incoming and ongoing bookings</p>
      </div>

      {/* Filter tabs */}
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
        <EmptyState icon={Calendar} title="No bookings found" description="Booking requests from customers will appear here" />
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => {
              const actions = STATUS_ACTIONS[booking.status] || [];
              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🔧</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                        <div>
                          <h3 className="font-semibold text-surface-900">{booking.service?.title}</h3>
                          <p className="text-sm text-surface-500 mt-0.5">
                            Customer: <span className="font-medium text-surface-700">{booking.customer?.name}</span>
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-surface-500 mb-4">
                        <span>📅 {booking.booking_date ? format(new Date(booking.booking_date), "MMM d, yyyy h:mm a") : "—"}</span>
                        <span>💰 ₹{booking.total_amount?.toLocaleString()}</span>
                        <span className="sm:col-span-2">📍 {booking.address}</span>
                        {booking.notes && <span className="sm:col-span-2">📝 {booking.notes}</span>}
                      </div>

                      {actions.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {actions.map(({ label, newStatus, icon: Icon, color }) => (
                            <button
                              key={newStatus}
                              onClick={() => handleAction(booking.id, newStatus)}
                              disabled={updatingId === booking.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg transition-colors disabled:opacity-50 ${color}`}
                            >
                              <Icon className="w-3.5 h-3.5" />
                              {updatingId === booking.id ? "…" : label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <Pagination page={page} pages={meta.pages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
