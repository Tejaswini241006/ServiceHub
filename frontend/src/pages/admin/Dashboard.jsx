import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Package, Calendar, DollarSign, TrendingUp, ArrowRight, UserCheck, UserX } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { adminAPI } from "../../services/api";
import { StatCard, Card, Spinner } from "../../components/common/UI";

const PIE_COLORS = ["#f97316", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.stats()
      .then((r) => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!stats) return null;

  const { users, bookings, revenue } = stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900">Platform Overview</h1>
        <p className="text-surface-500 mt-1">Real-time analytics and management</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Users" value={users.total} color="primary" />
        <StatCard icon={UserCheck} label="Approved Providers" value={users.approved_providers} color="green" />
        <StatCard icon={Calendar} label="Total Bookings" value={bookings.total} color="blue" />
        <StatCard icon={DollarSign} label="Total Revenue" value={`₹${revenue.total?.toLocaleString()}`} color="purple" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue bar chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-surface-900">Monthly Revenue</h2>
            <TrendingUp className="w-5 h-5 text-primary-500" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenue.monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+"k" : v}`} />
              <Tooltip
                formatter={(v) => [`₹${v.toLocaleString()}`, "Revenue"]}
                contentStyle={{ borderRadius: "12px", border: "1px solid #e4e4e7", fontSize: "13px" }}
              />
              <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Bookings pie chart */}
        <Card className="p-6">
          <h2 className="font-display font-bold text-lg text-surface-900 mb-6">Bookings by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={bookings.by_status.filter(s => s.count > 0)}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
              >
                {bookings.by_status.filter(s => s.count > 0).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e4e4e7", fontSize: "13px" }} />
              <Legend
                formatter={(value) => value.replace("_", " ").replace(/^\w/, c => c.toUpperCase())}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Quick nav cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: "/admin/users", icon: Users, label: "Manage Users", value: `${users.total} total`, color: "from-blue-500 to-blue-600" },
          { to: "/admin/providers", icon: UserCheck, label: "Manage Providers", value: `${users.providers} total`, color: "from-primary-500 to-primary-600" },
          { to: "/admin/bookings", icon: Calendar, label: "All Bookings", value: `${bookings.completed} completed`, color: "from-green-500 to-green-600" },
          { to: "/admin/providers", icon: UserX, label: "Pending Approvals", value: `${users.providers - users.approved_providers} waiting`, color: "from-red-500 to-red-600" },
        ].map(({ to, icon: Icon, label, value, color }) => (
          <Link key={to+label} to={to} className={`group bg-gradient-to-br ${color} text-white rounded-2xl p-5 hover:shadow-lg transition-all`}>
            <Icon className="w-7 h-7 mb-3 opacity-80" />
            <p className="font-display font-bold">{label}</p>
            <p className="text-sm opacity-80 mt-0.5">{value}</p>
            <ArrowRight className="w-4 h-4 mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
}
