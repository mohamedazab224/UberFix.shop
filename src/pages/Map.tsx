import { GoogleMap } from "@/components/maps/GoogleMap";
import { Input } from "@/components/ui/input";
import { Search, Phone, Globe, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useBranches2 } from "@/hooks/useBranches2";
import { parseLocation, getCategoryIcon } from "@/utils/mapIconHelper";
import { BranchMarkerInfo } from "@/components/maps/BranchMarkerInfo";
import { useNavigate } from "react-router-dom";

export default function Map() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const { branches, loading } = useBranches2();
  const navigate = useNavigate();

  // Filter branches based on search
  const filteredBranches = useMemo(() => {
    if (!searchQuery) return branches;
    const query = searchQuery.toLowerCase();
    return branches.filter(
      (b) =>
        b.name?.toLowerCase().includes(query) ||
        b.location?.toLowerCase().includes(query) ||
        b.category?.toLowerCase().includes(query)
    );
  }, [branches, searchQuery]);

  // Convert branches to map markers
  const markers = useMemo(() => {
    return filteredBranches
      .map((branch) => {
        const coords = parseLocation(branch.location);
        if (!coords) return null;

        const { icon, color } = getCategoryIcon(branch.category);

        return {
          id: branch.id,
          lat: coords.lat,
          lng: coords.lng,
          title: branch.name,
          type: 'branch' as const,
          icon,
          color,
          data: branch,
        };
      })
      .filter((m) => m !== null);
  }, [filteredBranches]);

  // Calculate center from markers
  const mapCenter = useMemo(() => {
    if (markers.length === 0) {
      return { lat: 30.0444, lng: 31.2357 }; // Cairo default
    }
    const avgLat = markers.reduce((sum, m) => sum + m!.lat, 0) / markers.length;
    const avgLng = markers.reduce((sum, m) => sum + m!.lng, 0) / markers.length;
    return { lat: avgLat, lng: avgLng };
  }, [markers]);

  const handleRequestService = (branchId: string) => {
    navigate('/service-request', { state: { branchId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] text-white">
      {/* Header Section */}
      <div className="bg-[#1a1f2e] border-b border-[#2a3441] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 bg-gradient-to-r from-[#d4af37] to-[#f4d03f] bg-clip-text text-transparent">
            خريطة فروع شركة العزب
          </h1>
          <p className="text-center text-gray-300 text-sm md:text-base">
            ابحث عن موقع أي فرع أو عمار بالتاريخ Azab Construction
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-md">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="ابحث عن فرع أو عمار بالتاريخ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/15 focus:border-[#d4af37]"
            />
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex items-center justify-center h-[500px] rounded-lg bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-lg overflow-hidden shadow-2xl relative">
            <GoogleMap 
              height="calc(100vh - 400px)"
              latitude={mapCenter.lat}
              longitude={mapCenter.lng}
              zoom={markers.length > 1 ? 11 : 13}
              interactive={true}
              markers={markers as any}
              onMarkerClick={(marker) => setSelectedBranch(marker.data)}
            />
            
            {/* Branch Info Card */}
            {selectedBranch && (
              <div className="absolute top-4 left-4 z-10 animate-in slide-in-from-left">
                <BranchMarkerInfo
                  branch={selectedBranch}
                  onRequestService={handleRequestService}
                  onClose={() => setSelectedBranch(null)}
                />
              </div>
            )}
          </div>
        )}
        
        {/* Results count */}
        {!loading && (
          <div className="mt-4 text-center text-sm text-muted-foreground">
            عرض {filteredBranches.length} من {branches.length} فرع
          </div>
        )}
      </div>

      {/* Footer Info Section */}
      <div className="bg-[#0f1419] border-t border-[#2a3441] py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-6 text-[#d4af37]">
              Alazab Construction
            </h2>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="text-gray-300">
                <p className="font-medium mb-1">B/500 Maadi New, Cairo, Egypt</p>
                <p className="text-sm">38 Elmahta Street, Nabaroh, Daqahlia</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-[#d4af37]">
                <Phone className="h-5 w-5" />
                <a href="tel:+201004006620" className="hover:underline transition-all">
                  (+20) 1004006620
                </a>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-[#d4af37]">
                <Globe className="h-5 w-5" />
                <a 
                  href="https://alazab.services" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                >
                  alazab.services
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-[#2a3441]">
            <p className="text-gray-400 text-sm">
              © 2025 Alazab Construction Company | All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}