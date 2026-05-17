import { Link } from "react-router-dom";
import { Clock, Star, ArrowRight } from "lucide-react";

export default function ServiceCard({ service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="group bg-white rounded-2xl border border-surface-200 overflow-hidden hover:shadow-lg hover:border-primary-200 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-50 to-orange-100 overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-30">{getCategoryEmoji(service.category?.name)}</span>
          </div>
        )}
        {/* Category badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-surface-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {service.category?.name || "Service"}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-surface-900 text-base mb-1.5 group-hover:text-primary-600 transition-colors line-clamp-1">
          {service.title}
        </h3>
        <p className="text-sm text-surface-500 mb-4 line-clamp-2 flex-1">{service.description}</p>

        {/* Provider */}
        {service.provider && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-primary-700">{service.provider.name?.[0]}</span>
            </div>
            <span className="text-sm text-surface-600">{service.provider.name}</span>
            {service.provider.avg_rating > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-medium text-surface-700">{service.provider.avg_rating}</span>
                <span className="text-xs text-surface-400">({service.provider.total_reviews})</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-100">
          <div>
            <span className="text-xl font-bold font-display text-primary-600">₹{service.price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-surface-400 text-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{service.duration_mins} min</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function getCategoryEmoji(name) {
  const map = {
    Cleaning: "🧹", Plumbing: "🔧", Electrician: "⚡", Painting: "🎨",
    Carpentry: "🔨", "AC & Appliances": "❄️", "Pest Control": "🐛", Gardening: "🌱",
  };
  return map[name] || "🔧";
}
