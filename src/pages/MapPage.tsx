import { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { MapView } from '@/components/Map';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Clock, X, Search } from 'lucide-react';

interface ServiceProvider {
  id: string;
  name: string;
  type: 'plumber' | 'electrician' | 'carpenter' | 'painter';
  lat: number;
  lng: number;
  phone: string;
  rating: number;
  reviews: number;
  address: string;
  availability: string;
  color: string;
  icon: string;
  pinIcon: string;
}

const PROVIDERS: ServiceProvider[] = [
  {
    id: '1',
    name: 'أحمد حسين',
    type: 'plumber',
    lat: 30.0444,
    lng: 31.2357,
    phone: '+20 100 123 4567',
    rating: 5,
    reviews: 128,
    address: 'في سياق المقطم',
    availability: 'متاح الآن',
    color: '#FFA500',
    icon: '🔧',
    pinIcon: '/pin-icon.svg'
  },
  {
    id: '2',
    name: 'محمد علي',
    type: 'electrician',
    lat: 30.0333,
    lng: 31.2333,
    phone: '+20 100 234 5678',
    rating: 4.8,
    reviews: 95,
    address: 'الجيزة',
    availability: 'متاح خلال ساعة',
    color: '#1E40AF',
    icon: '⚡',
    pinIcon: '/pin-icon-2.svg'
  },
  {
    id: '3',
    name: 'سامي محمود',
    type: 'carpenter',
    lat: 30.0555,
    lng: 31.2444,
    phone: '+20 100 345 6789',
    rating: 4.9,
    reviews: 156,
    address: 'مشهد البكاري',
    availability: 'متاح الآن',
    color: '#FFA500',
    icon: '🪛',
    pinIcon: '/pin-icon.svg'
  },
  {
    id: '4',
    name: 'علي محمد',
    type: 'painter',
    lat: 30.0222,
    lng: 31.2222,
    phone: '+20 100 456 7890',
    rating: 4.7,
    reviews: 82,
    address: 'كردسة',
    availability: 'متاح غداً',
    color: '#9333EA',
    icon: '🎨',
    pinIcon: '/pin-icon-2.svg'
  },
  {
    id: '5',
    name: 'خالد إبراهيم',
    type: 'electrician',
    lat: 30.0666,
    lng: 31.2555,
    phone: '+20 100 567 8901',
    rating: 4.6,
    reviews: 73,
    address: 'حلوان',
    availability: 'متاح الآن',
    color: '#1E40AF',
    icon: '⚡',
    pinIcon: '/pin-icon.svg'
  },
  {
    id: '6',
    name: 'يوسف أحمد',
    type: 'plumber',
    lat: 30.0111,
    lng: 31.2111,
    phone: '+20 100 678 9012',
    rating: 4.8,
    reviews: 110,
    address: 'كايرو مول',
    availability: 'متاح الآن',
    color: '#FFA500',
    icon: '🔧',
    pinIcon: '/pin-icon-2.svg'
  }
];

const SERVICE_TYPES = {
  plumber: { label: 'سباك', icon: '🔧', color: '#FFA500' },
  electrician: { label: 'كهربائي', icon: '⚡', color: '#1E40AF' },
  carpenter: { label: 'نجار', icon: '🪛', color: '#FFA500' },
  painter: { label: 'دهان', icon: '🎨', color: '#9333EA' }
};

export default function MapPage() {
  const [, setLocation] = useLocation();
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [map, setMap] = useState<any>(null);

  const filteredProviders = PROVIDERS.filter(provider => {
    const matchesSearch = provider.name.includes(searchTerm) || provider.address.includes(searchTerm);
    const matchesType = !selectedType || provider.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleMapReady = useCallback((mapInstance: any) => {
    setMap(mapInstance);
    
    // إضافة العلامات على الخريطة
    if (window.google) {
      PROVIDERS.forEach(provider => {
        const marker = new window.google.maps.Marker({
          position: { lat: provider.lat, lng: provider.lng },
          map: mapInstance,
          title: provider.name,
          icon: {
            url: provider.pinIcon,
            scaledSize: new window.google.maps.Size(40, 50),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(20, 50)
          }
        });

        marker.addListener('click', () => {
          setSelectedProvider(provider);
          mapInstance.setCenter({ lat: provider.lat, lng: provider.lng });
          mapInstance.setZoom(15);
        });
      });
    }
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSelectedProvider(null);
  };

  const handleTypeFilter = (type: string | null) => {
    setSelectedType(type === selectedType ? null : type);
    setSelectedProvider(null);
  };

  const handleRequestService = () => {
    setLocation('/register-service');
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
      />
    ));
  };

  return (
    <div className="h-screen w-full flex flex-col bg-white" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 shadow-sm z-10">
        <div className="max-w-full px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-xl">🔧</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">UberFix.shop</h1>
                <p className="text-xs text-gray-500">خدمات الصيانة السريعة</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-700">Quick Maintenance Methods</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3 flex-wrap items-center">
            <div className="flex-1 min-w-64 relative">
              <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="ابحث عن خدمة أو موقع..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pr-10 h-10 text-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(SERVICE_TYPES).map(([key, value]) => (
                <Button
                  key={key}
                  variant={selectedType === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeFilter(key)}
                  className={`whitespace-nowrap text-xs h-9 ${
                    selectedType === key ? 'bg-blue-600 text-white' : ''
                  }`}
                >
                  {value.icon} {value.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Map */}
        <MapView
          center={{ lat: 30.0444, lng: 31.2357 }}
          zoom={12}
          className="w-full h-full"
          onMapReady={handleMapReady}
        />

        {/* Selected Provider Card - Floating on Map */}
        {selectedProvider && (
          <div className="absolute bottom-6 left-6 right-6 max-w-sm mx-auto z-20">
            <Card className="p-4 shadow-xl border-2 border-blue-200 bg-white" style={{paddingTop: '7px', paddingLeft: '26px'}}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedProvider.icon}</div>
                  <div className="text-right">
                    <h3 className="font-bold text-lg text-gray-900">{selectedProvider.name}</h3>
                    <p className="text-sm text-gray-600">{SERVICE_TYPES[selectedProvider.type].label}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProvider(null)}
                  className="p-0 h-auto"
                >
                  <X size={18} />
                </Button>
              </div>

              <div className="space-y-3">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">{getRatingStars(selectedProvider.rating)}</div>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedProvider.rating}
                  </span>
                  <span className="text-xs text-gray-600">
                    ({selectedProvider.reviews} تقييم)
                  </span>
                </div>

                {/* Address */}
                <div className="flex gap-2 text-sm">
                  <MapPin size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-right">{selectedProvider.address}</span>
                </div>

                {/* Phone */}
                <div className="flex gap-2 text-sm">
                  <Phone size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <a href={`tel:${selectedProvider.phone}`} className="text-blue-600 hover:underline text-right">
                    {selectedProvider.phone}
                  </a>
                </div>

                {/* Availability */}
                <div className="flex gap-2 text-sm">
                  <Clock size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-right">{selectedProvider.availability}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleRequestService}
                  >
                    اطلب الخدمة
                  </Button>
                  <Button variant="outline" className="flex-1">
                    تواصل
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Providers List - Floating on Map (Top Left) */}
        <div className="absolute top-6 left-6 max-w-sm max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-20">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white">
            <h2 className="font-bold text-lg text-gray-900 text-right">
              الخدمات المتاحة ({filteredProviders.length})
            </h2>
          </div>
          <div className="p-3 space-y-2">
            {filteredProviders.map(provider => (
              <Card
                key={provider.id}
                className={`p-3 cursor-pointer transition-all ${
                  selectedProvider?.id === provider.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 shadow-md'
                    : 'hover:shadow-md hover:bg-gray-50'
                }`}
                onClick={() => {
                  setSelectedProvider(provider);
                  if (map) {
                    map.setCenter({ lat: provider.lat, lng: provider.lng });
                    map.setZoom(15);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{provider.icon}</span>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-gray-900">{provider.name}</p>
                      <p className="text-xs text-gray-600">{SERVICE_TYPES[provider.type].label}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {getRatingStars(provider.rating)}
                  <span className="text-xs text-gray-600 mr-1">
                    {provider.rating}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {provider.availability}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
