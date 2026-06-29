import axios from 'axios';
import GarageRepository from '../repositories/garageRepository.js';

const RADIO_KM = 50;

export const obtenerDistanciaEntrePuntos = async (origenLat, origenLng, destLat, destLng) => {
    const apiKey = process.env.GOOGLE_MAPS_BACKEND_KEY;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origenLat},${origenLng}&destinations=${destLat},${destLng}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const element = response.data.rows[0].elements[0];

        return {
            distanciaTexto: element?.distance?.text || null,
            distanciaValor: element?.distance?.value || null,
            duracionTexto: element?.duration?.text || null,
            duracionValor: element?.duration?.value || null,
            origen: { lat: parseFloat(origenLat), lng: parseFloat(origenLng) },
            destino: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
        };
    } catch (error) {
        console.error('Error consultando Distance Matrix:', error.message);
        return {
            distanciaTexto: null,
            distanciaValor: null,
            duracionTexto: null,
            duracionValor: null,
            origen: { lat: parseFloat(origenLat), lng: parseFloat(origenLng) },
            destino: { lat: parseFloat(destLat), lng: parseFloat(destLng) },
        };
    }
};

export const obtenerGaragesCercanosConTiempoReal = async (sedeLat, sedeLng) => {
    const repo = new GarageRepository();
    const garages = await repo.getCercanosAsync(sedeLat, sedeLng, RADIO_KM);

    if (!garages || garages.length === 0) {
        return [];
    }

    try {
        const destinos = garages.map(g => `${g.latitud},${g.longitud}`).join('|');
        const origen = `${sedeLat},${sedeLng}`;
        const apiKey = process.env.GOOGLE_MAPS_BACKEND_KEY;

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origen}&destinations=${destinos}&key=${apiKey}`;

        const response = await axios.get(url);
        const elementos = response.data.rows[0].elements;

        const resultados = garages.map((garage, index) => ({
            ...garage,
            distanciaTexto: elementos[index]?.distance?.text || null,
            tiempoConduccion: elementos[index]?.duration?.text || null,
            tiempoSegundos: elementos[index]?.duration?.value || Infinity,
        }));

        return resultados.sort((a, b) => a.tiempoSegundos - b.tiempoSegundos);
    } catch (error) {
        console.error('Error consultando Distance Matrix, usando distancia geométrica:', error.message);

        return garages.sort((a, b) => a.distance - b.distance);
    }
};
