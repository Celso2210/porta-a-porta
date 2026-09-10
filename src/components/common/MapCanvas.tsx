import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapCanvasProps {
  origemLat?: number;
  origemLng?: number;
  origemNome?: string;
  destinoLat?: number;
  destinoLng?: number;
  destinoNome?: string;
  driverLat?: number;
  driverLng?: number;
  driverNome?: string;
  paradas?: {
    lat: number;
    lng: number;
    nome: string;
    tipo: 'embarque' | 'desembarque';
    ordem: number;
    concluido?: boolean;
  }[];
  height?: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  origemLat = -18.4812,
  origemLng = -40.7621,
  origemNome = 'Água Doce do Norte',
  destinoLat = -20.3155,
  destinoLng = -40.3128,
  destinoNome = 'Vitória',
  driverLat,
  driverLng,
  driverNome = 'José (Motorista)',
  paradas = [],
  height = '100%'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Se já existe um mapa, limpa
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Calcula centro do mapa
    const centerLat = (origemLat + destinoLat) / 2;
    const centerLng = (origemLng + destinoLng) / 2;

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    }).setView([centerLat, centerLng], 9);

    mapInstanceRef.current = map;

    // Adiciona TileLayer moderno estilo dark / cartodb basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    // Custom Icons
    const createCustomIcon = (bgColor: string, text: string, shape: string = 'circle') => {
      return L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="
            background-color: ${bgColor};
            color: #0f172a;
            font-weight: 800;
            font-family: sans-serif;
            font-size: 12px;
            width: 32px;
            height: 32px;
            border-radius: ${shape === 'circle' ? '50%' : '8px'};
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            border: 2px solid #ffffff;
          ">
            ${text}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
    };

    const markersGroup: L.Marker[] = [];
    const polylineCoords: [number, number][] = [];

    // Adiciona Origem
    const iconOrigem = createCustomIcon('#10b981', 'A'); // verde
    const mOrigem = L.marker([origemLat, origemLng], { icon: iconOrigem })
      .addTo(map)
      .bindPopup(`<b>Embarque Origem</b><br/>${origemNome}`);
    markersGroup.push(mOrigem);
    polylineCoords.push([origemLat, origemLng]);

    // Adiciona Paradas do Algoritmo Porta a Porta se houver
    paradas.forEach((p) => {
      const isEmbarque = p.tipo === 'embarque';
      const color = p.concluido ? '#94a3b8' : (isEmbarque ? '#3b82f6' : '#f59e0b');
      const iconParada = createCustomIcon(color, `${p.ordem}`);
      const mParada = L.marker([p.lat, p.lng], { icon: iconParada })
        .addTo(map)
        .bindPopup(`<b>#${p.ordem} Parada (${isEmbarque ? 'Embarque' : 'Desembarque'})</b><br/>${p.nome}`);
      markersGroup.push(mParada);
      polylineCoords.push([p.lat, p.lng]);
    });

    // Adiciona Destino
    const iconDestino = createCustomIcon('#ef4444', 'B'); // vermelho
    const mDestino = L.marker([destinoLat, destinoLng], { icon: iconDestino })
      .addTo(map)
      .bindPopup(`<b>Desembarque Destino</b><br/>${destinoNome}`);
    markersGroup.push(mDestino);
    polylineCoords.push([destinoLat, destinoLng]);

    // Adiciona Posição Atual do Motorista se fornecido
    if (driverLat && driverLng) {
      const iconDriver = L.divIcon({
        className: 'driver-car-icon',
        html: `
          <div style="
            background: #10b981;
            color: #ffffff;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.5);
            border: 2px solid #ffffff;
            white-space: nowrap;
          ">
            <span>🚗</span> ${driverNome}
          </div>
        `,
        iconSize: [120, 32],
        iconAnchor: [60, 16]
      });
      L.marker([driverLat, driverLng], { icon: iconDriver })
        .addTo(map)
        .bindPopup(`<b>Motorista Ativo</b><br/>${driverNome}`);
    }

    // Linha da Rota
    if (polylineCoords.length >= 2) {
      L.polyline(polylineCoords, {
        color: '#10b981',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8'
      }).addTo(map);
    }

    // Enquadra todos os pontos
    if (markersGroup.length > 0) {
      const group = L.featureGroup(markersGroup);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origemLat, origemLng, origemNome, destinoLat, destinoLng, destinoNome, driverLat, driverLng, driverNome, paradas]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-slate-800 shadow-xl" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/60 text-xs font-semibold text-emerald-400 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
        GPS Telemetria Ao Vivo
      </div>
    </div>
  );
};
