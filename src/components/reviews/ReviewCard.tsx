import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ReviewCardProps {
  customerName?: string;
  rating: number;
  comment?: string;
  images?: string[];
  createdAt: string;
}

export function ReviewCard({
  customerName = "عميل",
  rating,
  comment,
  images = [],
  createdAt
}: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(customerName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold">{customerName}</h4>
              <span className="text-xs text-muted-foreground">
                {format(new Date(createdAt), 'dd MMMM yyyy', { locale: ar })}
              </span>
            </div>
            
            <div className="flex items-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < rating
                      ? 'fill-yellow-500 text-yellow-500'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
            
            {comment && (
              <p className="text-sm text-foreground leading-relaxed">
                {comment}
              </p>
            )}
            
            {images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Review image ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(img, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
