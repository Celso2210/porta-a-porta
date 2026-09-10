import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  /**
   * Endpoint de Cálculo Real de Rota e Distância (Google Distance Matrix API + Routes API com fallback rodoviário)
   * Suporta qualquer endereço, cidade ou estado do Brasil, substituindo distâncias fixas por valores reais
   */
  const handleCalcularDistancia = async (req: express.Request, res: express.Response) => {
    try {
      const { origin, destination } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({
          error: 'Origem e destino são obrigatórios para calcular a rota.'
        });
      }

      const origTexto = String(origin).trim();
      const destTexto = String(destination).trim();

      // Normaliza adicionando Brasil caso não especificado
      const origCompleto = origTexto.toLowerCase().includes('brasil') ? origTexto : `${origTexto}, Brasil`;
      const destCompleto = destTexto.toLowerCase().includes('brasil') ? destTexto : `${destTexto}, Brasil`;

      const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.MAPS_API_KEY;

      // 1. Google Distance Matrix API Oficial
      if (apiKey) {
        try {
          const matrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origCompleto)}&destinations=${encodeURIComponent(destCompleto)}&mode=driving&language=pt-BR&key=${apiKey}`;
          const matrixRes = await fetch(matrixUrl);
          if (matrixRes.ok) {
            const matrixData = await matrixRes.json();
            if (matrixData.status === 'OK' && matrixData.rows?.[0]?.elements?.[0]?.status === 'OK') {
              const element = matrixData.rows[0].elements[0];
              const meters = element.distance?.value || 0;
              const distanciaKm = Math.max(1, Math.round(meters / 1000));
              const duracaoSegundos = element.duration?.value || 0;
              const duracaoMinutos = Math.round(duracaoSegundos / 60);

              return res.json({
                success: true,
                provedor: 'google_distance_matrix',
                distanciaKm,
                duracaoMinutos,
                duracaoTexto: element.duration?.text || formatarMinutos(duracaoMinutos),
                distanciaTexto: element.distance?.text || `${distanciaKm} km`,
                origem: matrixData.origin_addresses?.[0] || origTexto,
                destino: matrixData.destination_addresses?.[0] || destTexto
              });
            } else {
              console.warn('[Google Distance Matrix API] Status:', matrixData.status, matrixData.error_message || matrixData.rows?.[0]?.elements?.[0]?.status);
            }
          }
        } catch (matrixErr) {
          console.warn('[Google Distance Matrix API] Falha na chamada:', matrixErr);
        }

        // 2. Google Maps Routes API (Directions v2) como fallback do ecossistema Google
        try {
          const gmpUrl = 'https://routes.googleapis.com/directions/v2:computeRoutes';
          const gmpResponse = await fetch(gmpUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': apiKey,
              'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration,routes.description,routes.polyline.encodedPolyline',
              'X-Goog-User-Agent': 'gmp_mcp_codeassist_v1_aistudio'
            },
            body: JSON.stringify({
              origin: { address: origCompleto },
              destination: { address: destCompleto },
              travelMode: 'DRIVE',
              routingPreference: 'TRAFFIC_AWARE'
            })
          });

          if (gmpResponse.ok) {
            const gmpData = await gmpResponse.json();
            if (gmpData.routes && gmpData.routes.length > 0) {
              const route = gmpData.routes[0];
              const meters = route.distanceMeters || 0;
              const distanciaKm = Math.max(1, Math.round(meters / 1000));
              const durationSeconds = parseInt((route.duration || '0s').replace('s', ''), 10);
              const duracaoMinutos = Math.round(durationSeconds / 60);

              return res.json({
                success: true,
                provedor: 'google_maps',
                distanciaKm,
                duracaoMinutos,
                duracaoTexto: formatarMinutos(duracaoMinutos),
                origem: origTexto,
                destino: destTexto,
                polyline: route.polyline?.encodedPolyline
              });
            }
          }
        } catch (gmpErr) {
          console.warn('[Google Maps Routes API] Falha na chamada:', gmpErr);
        }
      }

      // 3. Fallback inteligente de alta precisão: Malha Rodoviária Real via Geocodificação + OSRM
      // Garante que qualquer endereço ou cidade do Brasil tenha distância real calculada mesmo sem API key ativa
      try {
        const rotaOsrm = await calcularRotaOsrm(origTexto, destTexto);
        if (rotaOsrm && rotaOsrm.distanciaKm > 0) {
          return res.json({
            success: true,
            provedor: rotaOsrm.provedor || 'rodoviario_real',
            distanciaKm: rotaOsrm.distanciaKm,
            duracaoMinutos: rotaOsrm.duracaoMinutos,
            duracaoTexto: formatarMinutos(rotaOsrm.duracaoMinutos),
            origem: origTexto,
            destino: destTexto
          });
        }
      } catch (osrmErr) {
        console.warn('[Cálculo Rodoviário Real] Falha:', osrmErr);
      }

      return res.status(422).json({
        success: false,
        error: 'Não foi possível calcular a distância real entre os pontos informados. Verifique se o nome da cidade ou endereço está correto.',
        origem: origTexto,
        destino: destTexto
      });

    } catch (error: any) {
      console.error('Erro ao calcular rota:', error);
      res.status(500).json({
        error: 'Erro interno ao processar cálculo de distância',
        detalhe: error?.message
      });
    }
  };

  app.post('/api/routes/calculate', handleCalcularDistancia);
  app.post('/api/distancematrix', handleCalcularDistancia);

  // Setup Vite middleware for development or serve dist in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Porta a Porta Server running on http://0.0.0.0:${PORT}`);
  });
}

function formatarMinutos(minutos: number): string {
  if (!minutos || minutos <= 0) return 'Tempo estimado indisponível';
  const horas = Math.floor(minutos / 60);
  const restoMin = minutos % 60;
  if (horas === 0) return `${restoMin} min`;
  return `${horas}h ${restoMin.toString().padStart(2, '0')}min`;
}

// Coordenadas das principais cidades e municípios brasileiros para resolução ultra-rápida e precisa
const COORDENADAS_CIDADES_BR: Record<string, { lat: number; lon: number }> = {
  'agua doce do norte': { lat: -18.5482, lon: -40.9790 },
  'barra de sao francisco': { lat: -18.7571, lon: -40.8916 },
  'mantena': { lat: -18.7825, lon: -40.9767 },
  'colatina': { lat: -19.5398, lon: -40.6302 },
  'linhares': { lat: -19.3911, lon: -40.0722 },
  'sao mateus': { lat: -18.7161, lon: -39.8589 },
  'nova venecia': { lat: -18.7114, lon: -40.4006 },
  'ecoporanga': { lat: -18.3733, lon: -40.8306 },
  'sao gabriel da palha': { lat: -19.0167, lon: -40.5361 },
  'aracruz': { lat: -19.8203, lon: -40.2733 },
  'serra': { lat: -20.1286, lon: -40.3078 },
  'vitoria': { lat: -20.3155, lon: -40.3128 },
  'vila velha': { lat: -20.3297, lon: -40.2925 },
  'cariacica': { lat: -20.2639, lon: -40.4200 },
  'guarapari': { lat: -20.6756, lon: -40.4975 },
  'cachoeiro de itapemirim': { lat: -20.8489, lon: -41.1128 },
  'marataizes': { lat: -21.0433, lon: -40.8244 },
  'sao paulo': { lat: -23.5505, lon: -46.6333 },
  'campinas': { lat: -22.9056, lon: -47.0608 },
  'santos': { lat: -23.9619, lon: -46.3322 },
  'rio de janeiro': { lat: -22.9068, lon: -43.1729 },
  'niteroi': { lat: -22.8832, lon: -43.1034 },
  'belo horizonte': { lat: -19.9167, lon: -43.9345 },
  'governador valadares': { lat: -18.8511, lon: -41.9494 },
  'teofilo otoni': { lat: -17.8575, lon: -41.5053 },
  'ipatinga': { lat: -19.4683, lon: -42.5367 },
  'salvador': { lat: -12.9777, lon: -38.5016 },
  'porto seguro': { lat: -16.4497, lon: -39.0647 },
  'itabuna': { lat: -14.7939, lon: -39.2789 },
  'ilheus': { lat: -14.7889, lon: -39.0494 },
  'teixeira de freitas': { lat: -17.5361, lon: -39.7422 },
  'brasilia': { lat: -15.7975, lon: -47.8919 },
  'goiania': { lat: -16.6869, lon: -49.2648 },
  'curitiba': { lat: -25.4290, lon: -49.2671 },
  'florianopolis': { lat: -27.5954, lon: -48.5480 },
  'porto alegre': { lat: -30.0346, lon: -51.2177 },
  'recife': { lat: -8.0476, lon: -34.8770 },
  'fortaleza': { lat: -3.7172, lon: -38.5433 }
};

function normalizarTextoLocal(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Geocodifica e busca a rota real na malha rodoviária pública OSRM com resolução inteligente para todo o Brasil
 */
async function calcularRotaOsrm(origem: string, destino: string): Promise<{ distanciaKm: number; duracaoMinutos: number; provedor?: string } | null> {
  const obterCoordenadas = async (local: string): Promise<{ lat: number; lon: number } | null> => {
    const limpo = normalizarTextoLocal(local);

    // 1. Verifica dicionário direto de cidades conhecidas
    for (const [cidade, coords] of Object.entries(COORDENADAS_CIDADES_BR)) {
      if (limpo.includes(cidade)) {
        return coords;
      }
    }

    // 2. Monta lista de tentativas de busca para Nominatim
    const tentativas: string[] = [];
    tentativas.push(local.includes('Brasil') ? local : `${local}, Brasil`);

    const matchUf = local.match(/([A-Za-zÀ-ÿ\s]{3,35})\s*[-,\/]\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/i);
    if (matchUf) {
      tentativas.push(`${matchUf[1].trim()}, ${matchUf[2].toUpperCase()}, Brasil`);
      tentativas.push(`${matchUf[1].trim()}, Brasil`);
    }

    const partes = local.split(/[,-]/).map(p => p.trim()).filter(Boolean);
    if (partes.length >= 2) {
      tentativas.push(`${partes[partes.length - 2]}, ${partes[partes.length - 1]}, Brasil`);
      tentativas.push(`${partes[partes.length - 1]}, Brasil`);
    }

    // Tenta geocodificar com Nominatim
    for (const termo of [...new Set(tentativas)]) {
      try {
        const q = encodeURIComponent(termo);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${q}&countrycodes=br&limit=1`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'PortaAPortaBrasil/2.0 (rotas@portaaporta.app)' }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
          }
        }
      } catch {
        // tenta próximo termo
      }
    }

    return null;
  };

  const [pOrig, pDest] = await Promise.all([
    obterCoordenadas(origem),
    obterCoordenadas(destino)
  ]);

  if (!pOrig || !pDest) return null;

  // 1. Tenta calcular via malha rodoviária pública OSRM
  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pOrig.lon},${pOrig.lat};${pDest.lon},${pDest.lat}?overview=false`;
    const routeRes = await fetch(osrmUrl, { signal: AbortSignal.timeout(4000) });
    if (routeRes.ok) {
      const routeData = await routeRes.json();
      if (routeData.routes && routeData.routes.length > 0) {
        const r = routeData.routes[0];
        const distanciaKm = Math.max(1, Math.round(r.distance / 1000));
        const duracaoMinutos = Math.max(5, Math.round(r.duration / 60));
        return { distanciaKm, duracaoMinutos, provedor: 'rodoviario_real' };
      }
    }
  } catch (err) {
    console.warn('[OSRM API] Timeout ou indisponível, usando cálculo geodésico rodoviário:', err);
  }

  // 2. Se OSRM estiver temporariamente offline, calcula a distância rodoviária geodésica real com fator de sinuosidade 1.25x
  const R = 6371; // Raio da Terra em km
  const dLat = (pDest.lat - pOrig.lat) * (Math.PI / 180);
  const dLon = (pDest.lon - pOrig.lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(pOrig.lat * (Math.PI / 180)) *
      Math.cos(pDest.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const kmRodoviario = Math.max(1, Math.round(R * c * 1.25));
  const duracaoEstMin = Math.max(10, Math.round(kmRodoviario * 1.0)); // média de 60 km/h

  return {
    distanciaKm: kmRodoviario,
    duracaoMinutos: duracaoEstMin,
    provedor: 'geodesico_rodoviario'
  };
}

startServer();
