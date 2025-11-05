import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download, QrCode } from "lucide-react";
import { toast } from "sonner";

interface PropertyQRCodeProps {
  propertyId: string;
  propertyName: string;
}

export function PropertyQRCode({ propertyId, propertyName }: PropertyQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const qrCodeUrl = `${window.location.origin}/quick-request/${propertyId}`;

  const downloadQRCode = () => {
    const svg = document.getElementById(`qr-${propertyId}`) as any;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR-${propertyName}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success("تم تحميل رمز QR بنجاح");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-3 h-12">
          <QrCode className="h-4 w-4" />
          رمز QR للعقار
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">رمز QR للعقار</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              id={`qr-${propertyId}`}
              value={qrCodeUrl}
              size={250}
              level="H"
              includeMargin={true}
            />
          </div>
          <div className="text-center space-y-2">
            <p className="font-semibold">{propertyName}</p>
            <p className="text-sm text-muted-foreground">
              امسح الرمز لإرسال طلب صيانة عاجل
            </p>
          </div>
          <Button onClick={downloadQRCode} className="w-full">
            <Download className="ml-2 h-4 w-4" />
            تحميل رمز QR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
