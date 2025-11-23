import React from 'react';
import { INITIAL_INVENTORY, INITIAL_ENVIRONMENTAL_LOGS } from '../services/mockData';
import { TacticalCard } from './Shared';
import { MapPin, Thermometer, Droplets, AlertCircle, Truck, Navigation } from 'lucide-react';
import { ComplianceMode } from '../types';

interface LogisticsViewProps {
    complianceMode?: ComplianceMode;
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({ complianceMode }) => {
  // Extract unique locations from inventory for Facility Grid
  const uniqueLocations = Array.from(new Set(INITIAL_INVENTORY.map(i => i.location))).map(loc => {
    return {
      name: loc,
      status: loc.includes('SECURE') ? 'Restricted' : 'Nominal',
      occupancy: Math.floor(Math.random() * 40) + 50 // Mock percentage
    };
  });

  const isPharmaMode = complianceMode === ComplianceMode.PHARMA_US || complianceMode === ComplianceMode.PHARMA_EU;

  return (
    <div className="h-full flex flex-col bg-white p-4 md:p-8 gap-4 md:gap-6 overflow-y-auto">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* Facility Locations Grid */}
        <TacticalCard title="Facility Locations Grid" className="h-96 overflow-hidden flex flex-col">
           <div className="overflow-y-auto pr-2 space-y-3 mt-2 flex-1">
              {uniqueLocations.map((loc, idx) => (
                 <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-xl ${loc.status === 'Restricted' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                          <MapPin size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-900">{loc.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">{loc.status} Access</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-gray-600">{loc.occupancy}% Full</p>
                       <div className="w-12 h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div className={`h-full ${loc.occupancy > 80 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: `${loc.occupancy}%` }}></div>
                       </div>
                    </div>
                 </div>
              ))}
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm font-medium hover:bg-gray-50 cursor-pointer transition-colors">
                 + Add New Zone
              </div>
           </div>
        </TacticalCard>

        {/* Pharma GxP Modules (Conditional) */}
        {isPharmaMode ? (
            <TacticalCard title="Cleanroom Monitoring Feed" className="h-96">
                <div className="space-y-3 overflow-y-auto h-full pr-2">
                    {INITIAL_ENVIRONMENTAL_LOGS.map((log, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${log.alertLevel === 'Warning' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {log.metric === 'Temp' ? <Thermometer size={16} /> : <Droplets size={16} />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{log.location}</p>
                                    <p className="text-xs text-gray-500">{log.timestamp.split('T')[1].substring(0,5)} &bull; {log.metric}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`font-mono font-bold ${log.alertLevel === 'Warning' ? 'text-red-600' : 'text-gray-900'}`}>{log.value}</span>
                                {log.alertLevel === 'Warning' && <AlertCircle size={12} className="text-red-500 inline ml-1" />}
                            </div>
                        </div>
                    ))}
                </div>
            </TacticalCard>
        ) : (
            <TacticalCard title="Fleet Status" className="h-96">
                 <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-black text-white rounded-xl">
                            <Truck size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Heavy Transport Unit 04</p>
                            <p className="text-xs text-gray-500">En route to Nevada Depot &bull; ETA 2h 15m</p>
                        </div>
                        <div className="ml-auto">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-lg">Moving</span>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                        <div className="p-3 bg-gray-200 text-gray-500 rounded-xl">
                            <Truck size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Local Delivery Van 02</p>
                            <p className="text-xs text-gray-500">Docked at WH-A &bull; Loading</p>
                        </div>
                        <div className="ml-auto">
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded-lg">Idle</span>
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
                         <Navigation size={18} className="text-blue-600" />
                         <p className="text-xs font-bold text-blue-700">Route optimization active. 14% fuel savings projected.</p>
                    </div>
                 </div>
            </TacticalCard>
        )}
      </div>
      
      {/* Lower Section Map Placeholder */}
      <TacticalCard title="Real-Time Asset Map" className="flex-1 min-h-[300px] bg-gray-50 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="grid grid-cols-12 gap-4 w-full h-full p-8 transform rotate-12 scale-150">
                  {Array.from({length: 48}).map((_, i) => (
                      <div key={i} className="bg-black rounded-full w-2 h-2"></div>
                  ))}
              </div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
               <div className="text-center">
                   <div className="inline-flex p-4 bg-white rounded-full shadow-lg mb-4 text-gray-400">
                       <MapPin size={32} />
                   </div>
                   <p className="text-gray-500 font-medium">Interactive Map Module</p>
                   <p className="text-xs text-gray-400">Loading Geospatial Data...</p>
               </div>
          </div>
      </TacticalCard>

    </div>
  );
};