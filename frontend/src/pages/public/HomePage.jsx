import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Star, Shield, Clock, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { servicesAPI } from "../../services/api";
import ServiceCard from "../../components/common/ServiceCard";
import { Spinner } from "../../components/common/UI";

const CATEGORY_ICONS = {
  Cleaning: "🧹", Plumbing: "🔧", Electrician: "⚡", Painting: "🎨",
  Carpentry: "🔨", "AC & Appliances": "❄️", "Pest Control": "🐛", Gardening: "🌱",
};

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [catResp, svcResp] = await Promise.all([
          servicesAPI.categories(),
          servicesAPI.list({ per_page: 6 }),
        ]);
        setCategories(catResp.data.data);
        setFeaturedServices(svcResp.data.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/services?q=${encodeURIComponent(searchQ)}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-primary-300" />
              <span className="text-sm font-medium text-primary-200">Trusted by 50,000+ customers</span>
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Home Services
              <span className="block text-primary-400">at Your Doorstep</span>
            </h1>
            <p className="text-lg sm:text-xl text-surface-300 mb-10 max-w-xl leading-relaxed">
              Book expert professionals for cleaning, plumbing, electrical work and more. Quality guaranteed.
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                <input
                  type="text"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search for services..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-400 font-medium"
                />
              </div>
              <button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-4 rounded-2xl font-semibold transition-colors flex items-center gap-2 whitespace-nowrap">
                Search
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-surface-900 mb-1">Browse Categories</h2>
            <p className="text-surface-500">Find the right service for your home</p>
          </div>
          <Link to="/services" className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                to={`/services?category_id=${cat.id}`}
                className="group bg-white rounded-2xl border border-surface-200 p-5 hover:border-primary-300 hover:shadow-md transition-all duration-300 text-center"
              >
                <div className="text-3xl mb-3">{CATEGORY_ICONS[cat.name] || "🔧"}</div>
                <p className="font-semibold text-surface-800 group-hover:text-primary-700 transition-colors">{cat.name}</p>
                <p className="text-xs text-surface-400 mt-0.5">{cat.service_count} services</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-surface-900 mb-1">Featured Services</h2>
            <p className="text-surface-500">Top-rated services near you</p>
          </div>
          <Link to="/services" className="hidden sm:flex items-center gap-1 text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </section>

      {/* Trust signals */}
      <section className="bg-white border-t border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { icon: Shield, title: "Verified Professionals", desc: "All service providers are background-checked and verified" },
              { icon: Star, title: "Quality Guaranteed", desc: "Not satisfied? We'll make it right or give you a refund" },
              { icon: Clock, title: "On-Time Service", desc: "Punctual professionals committed to your schedule" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-surface-900 mb-1">{title}</h3>
                  <p className="text-surface-500 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
            Are you a service professional?
          </h2>
          <p className="text-primary-100 text-lg mb-8">Join thousands of providers earning with ServiceHub</p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-primary-700 px-8 py-3.5 rounded-xl font-bold hover:bg-primary-50 transition-colors"
          >
            Join as Provider <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
