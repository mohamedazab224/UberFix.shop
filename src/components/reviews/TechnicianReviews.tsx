import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ReviewCard } from "./ReviewCard";
import { Button } from "@/components/ui/button";
import { AddReviewDialog } from "./AddReviewDialog";
import { Star, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Review {
  id: string;
  rating: number;
  comment?: string;
  images?: string[];
  created_at: string;
  customer_id: string;
}

interface TechnicianReviewsProps {
  technicianId: string;
  technicianName: string;
  rating: number;
  totalReviews: number;
}

export function TechnicianReviews({
  technicianId,
  technicianName,
  rating,
  totalReviews
}: TechnicianReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddReview, setShowAddReview] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('reviews')
        .select('*')
        .eq('technician_id', technicianId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [technicianId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">التقييمات والمراجعات</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
              <span className="text-2xl font-bold">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({totalReviews} تقييم)
            </span>
          </div>
        </div>
        
        <Button onClick={() => setShowAddReview(true)} className="gap-2">
          <MessageSquare className="h-4 w-4" />
          أضف تقييم
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              جاري التحميل...
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد تقييمات بعد. كن أول من يضيف تقييم!
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                rating={review.rating}
                comment={review.comment}
                images={review.images}
                createdAt={review.created_at}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <AddReviewDialog
        open={showAddReview}
        onOpenChange={setShowAddReview}
        technicianId={technicianId}
        onReviewAdded={fetchReviews}
      />
    </div>
  );
}
