import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { servicesAPI } from "../../services/api";
import ServiceCard from "../../components/common/ServiceCard";
import { Spinner, EmptyState, Pagination } from "../../components/common/UI";

export default function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({});

  const q = searchParams.get("q") || "";
  const categoryId = searchParams.get("category_id") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort") || "created_at";

  useEffect(() => {
    servicesAPI.categories().then((r) => setCategories(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    servicesAPI
      .list({ q, category_id: categoryId, page, sort, per_page: 9 })
      .then((r) => {
        setServices(r.data.data);
        setMeta(r.data.meta || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q, categoryId, page, sort]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "page") params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-surface-900 mb-2">Browse Services</h1>
        <p className="text-surface-500">{meta.total ?? 0} services available</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            defaultValue={q}
            placeholder="Search services..."
            className="input pl-12"
            onChange={(e) => {
              clearTimeout(window._searchTimeout);
              window._searchTimeout = setTimeout(() => updateParam("q", e.target.value), 400);
            }}
          />
        </div>

        <select
          value={categoryId}
          onChange={(e) => updateParam("category_id", e.target.value)}
          className="input sm:w-52"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="input sm:w-44"
        >
          <option value="created_at">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {/* Active filters */}
      {(q || categoryId) && (
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {q && (
            <span className="flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full">
              Search: "{q}"
              <button onClick={() => updateParam("q", "")}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
          {categoryId && (
            <span className="flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm font-medium px-3 py-1 rounded-full">
              {categories.find((c) => c.id === categoryId)?.name || "Category"}
              <button onClick={() => updateParam("category_id", "")}><X className="w-3.5 h-3.5" /></button>
            </span>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : services.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No services found"
          description="Try adjusting your search or filters"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <Pagination
            page={page}
            pages={meta.pages}
            onPageChange={(p) => updateParam("page", p)}
          />
        </>
      )}
    </div>
  );
}
