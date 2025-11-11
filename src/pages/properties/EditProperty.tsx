import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<any>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("فشل تحميل بيانات العقار");
        navigate("/properties");
        return;
      }

      setPropertyData(data);
      setIsLoading(false);
    };

    fetchProperty();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/properties")}
          className="mb-4"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          الرجوع إلى القائمة
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground">تعديل بيانات العقار</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>بيانات العقار</CardTitle>
        </CardHeader>
        <CardContent>
          <PropertyForm 
            initialData={propertyData}
            propertyId={id}
            skipNavigation={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
