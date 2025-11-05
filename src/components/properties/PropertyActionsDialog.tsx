import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building2, Edit, Plus, Wrench, Trash2, X, QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NewRequestFormDialog } from "@/components/forms/NewRequestFormDialog";
import { PropertyQRCode } from "./PropertyQRCode";

interface PropertyActionsDialogProps {
  propertyId: string;
  propertyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyActionsDialog({
  propertyId,
  propertyName,
  open,
  onOpenChange,
}: PropertyActionsDialogProps) {
  const navigate = useNavigate();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleEditProperty = () => {
    navigate(`/properties/edit/${propertyId}`);
    onOpenChange(false);
  };

  const handleNewMaintenanceRequest = () => {
    setShowRequestDialog(true);
  };

  const handleAddSubProperty = () => {
    navigate(`/properties/add?parent=${propertyId}`);
    onOpenChange(false);
  };

  const handleArchiveProperty = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">إجراءات العقار</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Property Info */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="p-2 bg-primary/10 rounded">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{propertyName}</p>
              <p className="text-sm text-muted-foreground">الفرع</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleEditProperty}
            >
              <Edit className="h-4 w-4" />
              <span>تعديل العقار</span>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleAddSubProperty}
            >
              <Plus className="h-4 w-4" />
              <span>إضافة عقار فرعي</span>
            </Button>

            <Button
              className="w-full justify-start gap-3 h-12 bg-primary hover:bg-primary/90"
              onClick={handleNewMaintenanceRequest}
            >
              <Wrench className="h-4 w-4" />
              <span>طلب صيانة جديد</span>
            </Button>

            <PropertyQRCode propertyId={propertyId} propertyName={propertyName} />

            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 text-destructive hover:bg-destructive/10"
              onClick={handleArchiveProperty}
            >
              <Trash2 className="h-4 w-4" />
              <span>أرشفة العقار</span>
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Dialog لطلب الصيانة */}
      <NewRequestFormDialog
        trigger={<></>}
        onSuccess={() => {
          setShowRequestDialog(false);
          onOpenChange(false);
        }}
      />
    </Dialog>
  );
}
