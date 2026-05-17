import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Calendar, Star, Package, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { providersAPI } from "../../services/api";
import { StatCard, Card, StatusBadge, EmptyState, Spinner } from "../../components/common/UI";
import { format } from "date-fns";

export default function ProviderDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    providersAPI.dashboard()
      .then((r) => setData(r.data.data))
      .catch((err) => {
  console.error(err);
})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  const { provider, stats, recent_bookings } = data || {};

  if (provider && !provider.is_approved) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-yellow-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-surface-900 mb-2">Awaiting Approval</h2>
        <p className="text-surface-500 text-lg mb-4">
          Your provider account is under review. You'll be notified once approved.
        </p>
        <p className="text-surface-400 text-sm">This usually takes 1–2 business days.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">
          Welcome, {provider?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-surface-500 mt-1">Here's your business overview</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={DollarSign} label="Total Earnings" value={`₹${stats?.total_earnings?.toLocaleString() || 0}`} color="green" />
        <StatCard icon={Calendar} label="Total Bookings" value={stats?.total_bookings || 0} color="primary" />
        <StatCard icon={Clock} label="Pending" value={stats?.pending_bookings || 0} color="blue" />
        <StatCard icon={Star} label="Avg Rating" value={stats?.avg_rating || "—"} color="purple" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <Link to="/provider/services" className="group bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl p-6 hover:shadow-lg transition-all">
          <Package className="w-7 h-7 mb-3 opacity-80" />
          <h3 className="font-display font-bold text-lg mb-1">My Services</h3>
          <p className="text-primary-100 text-sm">{stats?.total_services || 0} active listings</p>
          <ArrowRight className="w-4 h-4 mt-4 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link to="/provider/requests" className="group bg-white border border-surface-200 rounded-2xl p-6 hover:shadow-md hover:border-primary-200 transition-all">
          <Calendar className="w-7 h-7 mb-3 text-primary-500" />
          <h3 className="font-display font-bold text-lg text-surface-900 mb-1">Booking Requests</h3>
          <p className="text-surface-500 text-sm">{stats?.pending_bookings || 0} pending</p>
          <ArrowRight className="w-4 h-4 mt-4 text-primary-500 group-hover:translate-x-1 transition-transform" />
        </Link>
        <div className="bg-white border border-surface-200 rounded-2xl p-6">
          <Star className="w-7 h-7 mb-3 text-yellow-500" />
          <h3 className="font-display font-bold text-lg text-surface-900 mb-1">Reviews</h3>
          <p className="text-surface-500 text-sm">{stats?.total_reviews || 0} total reviews</p>
          <div className="flex items-center gap-1 mt-2">
            {[1,2,3,4,5].map(s => (
              <svg key={s} className={`w-4 h-4 ${s <= Math.round(stats?.avg_rating || 0) ? "text-yellow-400" : "text-surface-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
            <span className="text-sm font-semibold text-surface-700 ml-1">{stats?.avg_rating || 0}</span>
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-surface-900">Recent Bookings</h2>
          <Link to="/provider/requests" className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {!recent_bookings?.length ? (
          <EmptyState icon={Calendar} title="No bookings yet" description="Bookings from customers will appear here" />
        ) : (
          <div className="space-y-3">
            {recent_bookings.map((b) => (
              <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 hover:bg-surface-100 transition-colors">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔧</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-surface-900 truncate">{b.service?.title}</p>
                  <p className="text-sm text-surface-500">
                    {b.customer?.name} · {b.booking_date ? format(new Date(b.booking_date), "MMM d, yyyy") : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="font-semibold">₹{b.total_amount?.toLocaleString()}</span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
