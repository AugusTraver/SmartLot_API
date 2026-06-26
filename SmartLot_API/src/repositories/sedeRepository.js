// sedeRepository.js
import pool from '../database/db.js';

export default class SedeRepository {
    constructor() {
        console.log('Estoy en: SedeRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query('SELECT * FROM sedes WHERE COALESCE("Borrado", false) = false ORDER BY id');
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM sedes WHERE id = $1 AND COALESCE("Borrado", false) = false', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                'INSERT INTO sedes (id_empresa, nombre, descripcion, ubicacion, latitud, longitud) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [entity.id_empresa, entity.nombre, entity.descripcion, entity.ubicacion, entity.latitud ?? null, entity.longitud ?? null]
            );
            return result.rows[0];
        } catch (error) { console.error(error); return null; }
    }

    updateAsync = async (id, entity) => {
        try {
            const result = await pool.query(
                'UPDATE sedes SET id_empresa = $1, nombre = $2, descripcion = $3, ubicacion = $4, latitud = $5, longitud = $6 WHERE id = $7 AND COALESCE("Borrado", false) = false RETURNING *',
                [entity.id_empresa, entity.nombre, entity.descripcion, entity.ubicacion, entity.latitud ?? null, entity.longitud ?? null, id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    deleteAsync = async (id) => {
        try {
            const result = await pool.query('UPDATE sedes SET "Borrado" = true WHERE id = $1 AND COALESCE("Borrado", false) = false', [id]);
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }
}
