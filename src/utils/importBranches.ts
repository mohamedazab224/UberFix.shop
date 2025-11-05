import { supabase } from '@/integrations/supabase/client';

interface CSVBranch {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  category: string;
  status: string;
  area: string;
  opening_date: string;
  region_id: string;
  map_url: string;
}

// استخراج اسم المكان من map_url
const extractLocationFromMapUrl = (mapUrl: string): string => {
  try {
    const url = new URL(mapUrl);
    const query = url.searchParams.get('q') || '';
    // إزالة "City" والأرقام من النهاية
    return query.replace(/\+City\d+$/, '').replace(/\+/g, ' ').trim();
  } catch {
    return '';
  }
};

// استخدام Google Geocoding API لتحويل العنوان إلى إحداثيات
const geocodeAddress = async (address: string, apiKey: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    }
    
    console.warn(`Geocoding failed for: ${address}`, data.status);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// تحليل CSV
const parseCSV = (csvText: string): CSVBranch[] => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    // تحليل بسيط - قد يحتاج تحسين إذا كانت القيم تحتوي على فواصل
    const values = line.split(',');
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });
    
    return row as CSVBranch;
  });
};

export const importBranchesFromCSV = async (csvText: string, onProgress?: (current: number, total: number) => void) => {
  try {
    console.log('🚀 بدء استيراد الفروع...');
    
    // الحصول على Google Maps API Key
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API Key not found');
    }
    
    // تحليل CSV
    const branches = parseCSV(csvText);
    console.log(`📊 تم العثور على ${branches.length} فرع`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // استيراد كل فرع
    for (let i = 0; i < branches.length; i++) {
      const branch = branches[i];
      
      try {
        // استخراج اسم المكان من map_url
        const locationName = extractLocationFromMapUrl(branch.map_url);
        
        // تحويل إلى إحداثيات
        const coords = await geocodeAddress(locationName || branch.name, apiKey);
        
        // تحضير البيانات للإدراج
        const branchData = {
          id: branch.id,
          name: branch.name,
          description: branch.description || null,
          location: coords ? JSON.stringify(coords) : branch.location || null,
          phone: branch.phone || null,
          email: branch.email || null,
          category: branch.category || null,
          status: branch.status || 'active',
          area: branch.area ? parseFloat(branch.area) : null,
          opening_date: branch.opening_date || null,
          region_id: branch.region_id || null,
          map_url: branch.map_url || null,
          is_deleted: false,
        };
        
        // إدراج في قاعدة البيانات
        const { error } = await supabase
          .from('branches2')
          .upsert(branchData, { onConflict: 'id' });
        
        if (error) {
          console.error(`❌ خطأ في إدراج ${branch.name}:`, error);
          errorCount++;
        } else {
          console.log(`✅ تم استيراد ${branch.name} ${coords ? `(${coords.lat}, ${coords.lng})` : ''}`);
          successCount++;
        }
        
        // تحديث التقدم
        if (onProgress) {
          onProgress(i + 1, branches.length);
        }
        
        // تأخير بسيط لتجنب تجاوز حدود API
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ خطأ في معالجة ${branch.name}:`, error);
        errorCount++;
      }
    }
    
    console.log(`\n✅ اكتمل الاستيراد: ${successCount} نجح، ${errorCount} فشل`);
    
    return {
      success: successCount,
      errors: errorCount,
      total: branches.length
    };
    
  } catch (error) {
    console.error('❌ خطأ في استيراد الفروع:', error);
    throw error;
  }
};
