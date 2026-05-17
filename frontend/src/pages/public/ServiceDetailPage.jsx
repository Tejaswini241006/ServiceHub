import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, Star, MapPin, Calendar, ChevronLeft } from "lucide-react";
import { servicesAPI, bookingsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { Spinner, StarRating, Card } from "../../components/common/UI";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

const bookingSchema = yup.object({
  booking_date: yup.string().required("Please select a date and time"),
  address: yup.string().required("Address is required").min(10, "Please provide a full address"),
  notes: yup.string(),
});

export default function ServiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(bookingSchema),
  });

  useEffect(() => {
    servicesAPI.get(id)
      .then((r) => setService(r.data.data))
      .catch(() => navigate("/services"))
      .finally(() => setLoading(false));
  }, [id]);

  const onBook = async (data) => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "customer") { toast.error("Only customers can book services"); return; }

    setBooking(true);
    try {
      await bookingsAPI.create({ service_id: service.id, ...data });
      toast.success("Booking confirmed! 🎉");
      navigate("/bookings");
    } catch {}
    setBooking(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!service) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-surface-500 hover:text-surface-700 mb-6 transition-colors">
        <ChevronLeft className="w-5 h-5" />Back to services
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Service info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-primary-50 to-orange-100">
            {service.image_url ? (
              <img src={service.image_url} alt={service.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">🔧</div>
            )}
          </div>

          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-sm bg-primary-50 text-primary-700 font-medium px-3 py-1 rounded-full">
                  {service.category?.name}
                </span>
                <h1 className="font-display text-2xl font-bold text-surface-900 mt-3">{service.title}</h1>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold font-display text-primary-600">₹{service.price.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-surface-400 text-sm mt-1">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration_mins} mins</span>
                </div>
              </div>
            </div>
            <p className="text-surface-600 leading-relaxed">{service.description}</p>
          </Card>

          {/* Provider */}
          {service.provider && (
            <Card className="p-6">
              <h3 className="font-display font-bold text-surface-900 mb-4">About the Provider</h3>
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-primary-700">{service.provider.name?.[0]}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-surface-900 text-lg">{service.provider.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {service.provider.avg_rating > 0 && (
                      <>
                        <StarRating rating={service.provider.avg_rating} size="md" />
                        <span className="font-semibold text-surface-700">{service.provider.avg_rating}</span>
                        <span className="text-surface-400 text-sm">({service.provider.total_reviews} reviews)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right: Booking form */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-24">
            <h3 className="font-display font-bold text-xl text-surface-900 mb-5">Book This Service</h3>

            {!user ? (
              <div className="text-center py-4">
                <p className="text-surface-500 mb-4">Sign in to book this service</p>
                <button onClick={() => navigate("/login")} className="btn-primary w-full">Log In to Book</button>
              </div>
            ) : user.role !== "customer" ? (
              <p className="text-surface-500 text-sm text-center py-4">Only customers can book services</p>
            ) : (
              <form onSubmit={handleSubmit(onBook)} className="space-y-4">
                <div>
                  <label className="label">Date & Time</label>
                  <input type="datetime-local" {...register("booking_date")} className="input" min={new Date().toISOString().slice(0, 16)} />
                  {errors.booking_date && <p className="error-msg">{errors.booking_date.message}</p>}
                </div>

                <div>
                  <label className="label">Service Address</label>
                  <textarea
                    {...register("address")}
                    rows={3}
                    className="input resize-none"
                    placeholder="Enter your full address..."
                  />
                  {errors.address && <p className="error-msg">{errors.address.message}</p>}
                </div>

                <div>
                  <label className="label">Notes (optional)</label>
                  <textarea {...register("notes")} rows={2} className="input resize-none" placeholder="Any special instructions..." />
                </div>

                <div className="pt-2 border-t border-surface-100">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-surface-500">Service Fee</span>
                    <span className="font-semibold">₹{service.price.toLocaleString()}</span>
                  </div>
                </div>

                <button type="submit" disabled={booking} className="btn-primary w-full flex items-center justify-center gap-2">
                  {booking ? <><Spinner size="sm" className="border-white" />Booking...</> : "Confirm Booking"}
                </button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
