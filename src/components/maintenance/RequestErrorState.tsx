import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

interface RequestErrorStateProps {
  error: Error;
  onRetry?: () => void;
}

export function RequestErrorState({ error, onRetry }: RequestErrorStateProps) {
  const isOnline = useOnlineStatus();

  return (
    <Card>
      <CardContent className="py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold mb-2 flex items-center gap-2">
            حدث خطأ في تحميل الطلبات
            {!isOnline && <WifiOff className="h-4 w-4" />}
          </AlertTitle>
          <AlertDescription className="space-y-4">
            <p className="text-sm">{error.message}</p>
            {!isOnline && (
              <p className="text-sm text-muted-foreground">
                تحقق من اتصالك بالإنترنت وحاول مرة أخرى
              </p>
            )}
            {onRetry && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="gap-2"
                disabled={!isOnline}
              >
                <RefreshCw className="h-4 w-4" />
                إعادة المحاولة
              </Button>
            )}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
