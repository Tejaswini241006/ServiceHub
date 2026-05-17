import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle, Clock, XCircle, ArrowRight, Search } from "lucide-react";
import { bookingsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { StatCard, Card, StatusBadge, EmptyState, Spinner } from "../../components/common/UI";
import { format } from "date-fns";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.myBookings({ per_page: 5 })
      .then((r) => setBookings(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">
          Good day, {user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-surface-500 mt-1">Here's your activity overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Calendar} label="Total Bookings" value={stats.total} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="blue" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="green" />
        <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled} color="purple" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <Link to="/services" className="group bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white hover:shadow-lg transition-all duration-300">
          <Search className="w-8 h-8 mb-3 opacity-80" />
          <h3 className="font-display font-bold text-xl mb-1">Browse Services</h3>
          <p className="text-primary-100 text-sm">Find and book home services</p>
          <ArrowRight className="w-5 h-5 mt-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link to="/bookings" className="group bg-white border border-surface-200 rounded-2xl p-6 hover:shadow-md hover:border-primary-200 transition-all duration-300">
          <Calendar className="w-8 h-8 mb-3 text-primary-500" />
          <h3 className="font-display font-bold text-xl text-surface-900 mb-1">My Bookings</h3>
          <p className="text-surface-500 text-sm">View and manage your bookings</p>
          <ArrowRight className="w-5 h-5 mt-4 text-primary-500 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent bookings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-surface-900">Recent Bookings</h2>
          <Link to="/bookings" className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No bookings yet"
            description="Browse services and book your first appointment"
            action={<Link to="/services" className="btn-primary">Browse Services</Link>}
          />
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900 truncate">{booking.service?.title}</p>
                  <p className="text-sm text-surface-500">
                    {booking.booking_date ? format(new Date(booking.booking_date), "MMM d, yyyy · h:mm a") : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-semibold text-surface-900">₹{booking.total_amount?.toLocaleString()}</span>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
