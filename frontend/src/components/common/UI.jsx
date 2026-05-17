// Reusable UI components

export function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${sizes[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin ${className}`} />
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-surface-500 font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-surface-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-surface-800 mb-2">{title}</h3>
      {description && <p className="text-surface-500 mb-6 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}

export function Badge({ variant = "default", children, className = "" }) {
  const variants = {
    default: "bg-surface-100 text-surface-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    primary: "bg-primary-100 text-primary-700",
    info: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const map = {
    pending: { variant: "warning", label: "Pending" },
    accepted: { variant: "info", label: "Accepted" },
    in_progress: { variant: "primary", label: "In Progress" },
    completed: { variant: "success", label: "Completed" },
    cancelled: { variant: "danger", label: "Cancelled" },
  };
  const { variant, label } = map[status] || { variant: "default", label: status };
  return <Badge variant={variant}>{label}</Badge>;
}

export function StarRating({ rating, size = "sm" }) {
  const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5" };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`${sizes[size]} ${star <= rating ? "text-yellow-400" : "text-surface-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-2xl border border-surface-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, change, color = "primary" }) {
  const colors = {
    primary: "bg-primary-50 text-primary-600",
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-500 font-medium mb-1">{label}</p>
          <p className="text-2xl font-bold font-display text-surface-900">{value}</p>
          {change && <p className="text-xs text-green-600 mt-1 font-medium">{change}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}

export function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 rounded-lg border border-surface-200 text-sm font-medium disabled:opacity-50 hover:bg-surface-50 transition-colors"
      >
        Previous
      </button>
      <span className="text-sm text-surface-600 px-3">
        Page {page} of {pages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="px-3 py-1.5 rounded-lg border border-surface-200 text-sm font-medium disabled:opacity-50 hover:bg-surface-50 transition-colors"
      >
        Next
      </button>
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-surface-100">
          <h3 className="text-lg font-semibold font-display text-surface-900">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-surface-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
