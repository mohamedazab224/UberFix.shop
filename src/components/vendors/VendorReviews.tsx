import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface VendorReviewsProps {
  vendorId: string;
}

export const VendorReviews = ({ vendorId }: VendorReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [vendorId]);

  const fetchReviews = async () => {
    try {
      // جلب التقييمات من جدول maintenance_requests
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("id, client_name, rating, customer_notes, created_at")
        .eq("assigned_vendor_id", vendorId)
        .not("rating", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedReviews = (data || []).map(item => ({
        id: item.id,
        customer_name: item.client_name || "عميل",
        rating: item.rating || 0,
        comment: item.customer_notes || "",
        created_at: item.created_at
      }));

      setReviews(formattedReviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">لا توجد تقييمات بعد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {review.customer_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{review.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          {review.comment && (
            <CardContent>
              <p className="text-muted-foreground">{review.comment}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
};
