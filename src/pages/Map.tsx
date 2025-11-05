import { GoogleMap } from "@/components/maps/GoogleMap";
import { Input } from "@/components/ui/input";
import { Search, Phone, Globe, Loader2, Users, MapPin } from "lucide-react";
import { useState, useMemo } from "react";
import { useBranches2 } from "@/hooks/useBranches2";
import { useTechnicians } from "@/hooks/useTechnicians";
import { parseLocation } from "@/utils/mapIconHelper";
import { BranchMarkerInfo } from "@/components/maps/BranchMarkerInfo";
import { TechnicianMarkerInfo } from "@/components/maps/TechnicianMarkerInfo";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Map() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null);
  const [showLayer, setShowLayer] = useState<'all' | 'branches' | 'technicians'>('all');
  
  const { branches, loading: branchesLoading } = useBranches2();
  const { technicians, specializationIcons, loading: techniciansLoading } = useTechnicians();
  const navigate = useNavigate();

  const loading = branchesLoading || techniciansLoading;

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

  // Filter technicians based on search
  const filteredTechnicians = useMemo(() => {
    if (!searchQuery) return technicians;
    const query = searchQuery.toLowerCase();
    return technicians.filter(
      (t) =>
        t.name?.toLowerCase().includes(query) ||
        t.specialization?.toLowerCase().includes(query)
    );
  }, [technicians, searchQuery]);

  // Get icon for specialization
  const getSpecializationIcon = (specialization: string) => {
    const icon = specializationIcons.find(i => i.name === specialization);
    return {
      icon: icon?.icon_path || '/icons/pin-pro/pin-pro-32.svg',
      color: icon?.color || '#f5bf23',
      name_ar: icon?.name_ar || specialization
    };
  };

  // Convert branches to map markers
  const branchMarkers = useMemo(() => {
    if (showLayer === 'technicians') return [];
    
    return filteredBranches
      .map((branch) => {
        const coords = parseLocation(branch.location);
        if (!coords) return null;

        return {
          id: `branch-${branch.id}`,
          lat: coords.lat,
          lng: coords.lng,
          title: branch.name,
          type: 'branch' as const,
          icon: '/icons/pin-pro/pin-pro-49.svg', // محل Abou Auf
          color: '#1800ad', // أزرق
          data: branch,
        };
      })
      .filter((m) => m !== null);
  }, [filteredBranches, showLayer]);

  // Convert technicians to map markers
  const technicianMarkers = useMemo(() => {
    if (showLayer === 'branches') return [];
    
    return filteredTechnicians
      .filter(t => t.current_latitude && t.current_longitude)
      .map((tech) => {
        const specIcon = getSpecializationIcon(tech.specialization);
        
        return {
          id: `tech-${tech.id}`,
          lat: tech.current_latitude!,
          lng: tech.current_longitude!,
          title: tech.name,
          type: 'technician' as const,
          icon: specIcon.icon,
          color: specIcon.color,
          data: { ...tech, specializationNameAr: specIcon.name_ar },
        };
      });
  }, [filteredTechnicians, specializationIcons, showLayer]);

  // Combine all markers
  const allMarkers = useMemo(() => {
    return [...branchMarkers, ...technicianMarkers];
  }, [branchMarkers, technicianMarkers]);

  // Calculate center from markers
  const mapCenter = useMemo(() => {
    if (allMarkers.length === 0) {
      return { lat: 30.0444, lng: 31.2357 }; // Cairo default
    }
    const avgLat = allMarkers.reduce((sum, m) => sum + m!.lat, 0) / allMarkers.length;
    const avgLng = allMarkers.reduce((sum, m) => sum + m!.lng, 0) / allMarkers.length;
    return { lat: avgLat, lng: avgLng };
  }, [allMarkers]);

  const handleMarkerClick = (marker: any) => {
    if (marker.type === 'branch') {
      setSelectedBranch(marker.data);
      setSelectedTechnician(null);
    } else if (marker.type === 'technician') {
      setSelectedTechnician(marker.data);
      setSelectedBranch(null);
    }
  };

  const handleRequestService = (id: string) => {
    navigate('/service-request', { state: { technicianId: id } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1f2e] to-[#0f1419] text-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#1a1f2e] via-[#2a1f2e] to-[#1a1f2e] border-b-2 border-primary/30 py-8 shadow-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <MapPin className="h-8 w-8 md:h-10 md:w-10 text-primary animate-bounce" />
            <h1 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-r from-primary via-yellow-400 to-primary bg-clip-text text-transparent">
              UberFix.shop
            </h1>
          </div>
          <p className="text-center text-gray-300 text-sm md:text-base mb-4">
            اطلب فني صيانة بضغطة زر - خدمة فورية احترافية
          </p>
          
          {/* Stats */}
          <div className="flex justify-center gap-6 flex-wrap">
            <Badge variant="secondary" className="bg-primary/20 text-primary px-4 py-2">
              <Users className="h-4 w-4 ml-2" />
              {technicians.length} فني متاح
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 px-4 py-2">
              <MapPin className="h-4 w-4 ml-2" />
              {branches.length} فرع
            </Badge>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            <Input
              type="text"
              placeholder="ابحث عن فني أو فرع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 bg-background/50 border-primary/30 text-foreground placeholder:text-muted-foreground focus:border-primary h-12"
            />
          </div>

          {/* Layer Toggle */}
          <Tabs value={showLayer} onValueChange={(v) => setShowLayer(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                الكل ({allMarkers.length})
              </TabsTrigger>
              <TabsTrigger value="technicians" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                الفنيين ({technicianMarkers.length})
              </TabsTrigger>
              <TabsTrigger value="branches" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                الفروع ({branchMarkers.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Map Section */}
      <div className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[500px] rounded-lg bg-muted/50 border-2 border-dashed border-primary/30">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري تحميل الخريطة...</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden shadow-2xl relative border-2 border-primary/20">
            <GoogleMap 
              height="calc(100vh - 450px)"
              latitude={mapCenter.lat}
              longitude={mapCenter.lng}
              zoom={allMarkers.length > 1 ? 12 : 14}
              interactive={true}
              markers={allMarkers as any}
              onMarkerClick={handleMarkerClick}
            />
            
            {/* Technician Info Card */}
            {selectedTechnician && (
              <div className="absolute top-4 left-4 z-10 max-w-sm animate-in slide-in-from-left duration-300">
                <TechnicianMarkerInfo
                  technician={selectedTechnician}
                  specializationNameAr={selectedTechnician.specializationNameAr}
                  onRequestService={handleRequestService}
                  onClose={() => setSelectedTechnician(null)}
                />
              </div>
            )}

            {/* Branch Info Card */}
            {selectedBranch && (
              <div className="absolute top-4 left-4 z-10 max-w-sm animate-in slide-in-from-left duration-300">
                <BranchMarkerInfo
                  branch={selectedBranch}
                  onRequestService={handleRequestService}
                  onClose={() => setSelectedBranch(null)}
                />
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-background/95 backdrop-blur p-4 rounded-lg shadow-lg border border-primary/20">
              <p className="text-xs font-semibold mb-2 text-muted-foreground">دليل الأيقونات:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary" />
                  <span>فني متاح</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border-2 border-blue-500" />
                  <span>فرع Abou Auf</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Results count */}
        {!loading && (
          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-muted-foreground">
              عرض <span className="font-bold text-primary">{technicianMarkers.length}</span> فني 
              و <span className="font-bold text-blue-500">{branchMarkers.length}</span> فرع
            </div>
            
            {/* Specialization filters */}
            <div className="flex justify-center gap-2 flex-wrap pt-2">
              {specializationIcons.map((spec) => (
                <Badge 
                  key={spec.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  style={{ borderColor: spec.color, color: spec.color }}
                >
                  {spec.name_ar}
                </Badge>
              ))}
            </div>
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