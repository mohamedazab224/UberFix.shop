import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Star, Calendar } from 'lucide-react';
import { Branch2 } from '@/hooks/useBranches2';

interface BranchMarkerInfoProps {
  branch: Branch2;
  onRequestService?: (branchId: string) => void;
  onClose: () => void;
}

export const BranchMarkerInfo = ({ branch, onRequestService, onClose }: BranchMarkerInfoProps) => {
  return (
    <Card className="w-80 shadow-xl bg-gradient-to-br from-primary/5 to-background border-primary/20">
      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-primary">{branch.name}</CardTitle>
            {branch.category && (
              <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
                {branch.category}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            <span className="text-sm font-medium">4.8</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* الوصف */}
        {branch.description && (
          <p className="text-sm text-muted-foreground">{branch.description}</p>
        )}

        {/* معلومات الاتصال */}
        <div className="space-y-2">
          {branch.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-primary" />
              <a href={`tel:${branch.phone}`} className="hover:underline text-foreground">
                {branch.phone}
              </a>
            </div>
          )}
          
          {branch.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <a href={`mailto:${branch.email}`} className="hover:underline truncate text-foreground">
                {branch.email}
              </a>
            </div>
          )}
          
          {branch.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{branch.location}</span>
            </div>
          )}

          {branch.opening_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">
                افتتح في {new Date(branch.opening_date).toLocaleDateString('ar-EG')}
              </span>
            </div>
          )}
        </div>

        {/* الحالة */}
        {branch.status && (
          <Badge 
            variant={branch.status === 'active' ? 'default' : 'secondary'}
            className="w-full justify-center"
          >
            {branch.status === 'active' ? 'نشط' : 'غير نشط'}
          </Badge>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex gap-2 pt-2">
          {onRequestService && (
            <Button 
              onClick={() => onRequestService(branch.id)}
              className="flex-1"
              size="sm"
            >
              طلب خدمة
            </Button>
          )}
          <Button 
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            إغلاق
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
