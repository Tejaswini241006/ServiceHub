import { useState, useEffect, useCallback } from "react";
import { Calendar, Star, X } from "lucide-react";
import { bookingsAPI } from "../../services/api";
import { StatusBadge, EmptyState, Spinner, Pagination, Modal } from "../../components/common/UI";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewModal, setReviewModal] = useState(null); // booking object
  const [cancellingId, setCancellingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await bookingsAPI.myBookings({ page, per_page: 8, status: statusFilter || undefined });
      setBookings(r.data.data || []);
      setMeta(r.data.meta || {});
    } catch {}
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this booking?")) return;
    setCancellingId(id);
    try {
      await bookingsAPI.cancel(id);
      toast.success("Booking cancelled");
      load();
    } catch {}
    setCancellingId(null);
  };

  const handleReview = async (data) => {
    try {
      await bookingsAPI.review(reviewModal.id, { rating: parseInt(data.rating), comment: data.comment });
      toast.success("Review submitted! ⭐");
      setReviewModal(null);
      reset();
      load();
    } catch {}
  };

  const canCancel = (b) => ["pending", "accepted"].includes(b.status);
  const canReview = (b) => b.status === "completed" && !b.review;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">My Bookings</h1>
        <p className="text-surface-500 mt-1">Track and manage your service bookings</p>
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
        <EmptyState icon={Calendar} title="No bookings found" description="Your bookings will appear here" />
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🔧</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-surface-900">{booking.service?.title}</h3>
                        <p className="text-sm text-surface-500 mt-0.5">
                          Provider: {booking.service?.provider?.name || "—"}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-surface-500">
                      <span>📅 {booking.booking_date ? format(new Date(booking.booking_date), "MMM d, yyyy h:mm a") : "—"}</span>
                      <span>📍 {booking.address?.substring(0, 40)}...</span>
                      <span className="font-semibold text-surface-900">₹{booking.total_amount?.toLocaleString()}</span>
                    </div>

                    {booking.review && (
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="text-yellow-500">{"★".repeat(booking.review.rating)}</span>
                        <span className="text-surface-500">{booking.review.comment}</span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      {canCancel(booking) && (
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          {cancellingId === booking.id ? "Cancelling…" : "Cancel"}
                        </button>
                      )}
                      {canReview(booking) && (
                        <button
                          onClick={() => { setReviewModal(booking); reset(); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          <Star className="w-3.5 h-3.5" />
                          Leave Review
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

      {/* Review Modal */}
      <Modal open={!!reviewModal} onClose={() => setReviewModal(null)} title="Leave a Review">
        <form onSubmit={handleSubmit(handleReview)} className="space-y-4">
          <p className="text-surface-500 text-sm">How was your experience with <strong>{reviewModal?.service?.title}</strong>?</p>
          <div>
            <label className="label">Rating</label>
            <select {...register("rating", { required: "Please select a rating" })} className="input">
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{n} ⭐ — {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][n]}</option>
              ))}
            </select>
            {errors.rating && <p className="error-msg">{errors.rating.message}</p>}
          </div>
          <div>
            <label className="label">Comment (optional)</label>
            <textarea {...register("comment")} rows={3} className="input resize-none" placeholder="Share your experience…" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setReviewModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Submit Review</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
