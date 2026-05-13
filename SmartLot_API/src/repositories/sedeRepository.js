// sedeRepository.js
import pool from '../database/db.js';

export default class SedeRepository {
    constructor() {
        console.log('Estoy en: SedeRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query('SELECT * FROM sedes ORDER BY id');
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM sedes WHERE id = $1', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                'INSERT INTO sedes (id_empresa, nombre, descripcion, ubicacion) VALUES ($1, $2, $3, $4) RETURNING *',
                [entity.id_empresa, entity.nombre, entity.descripcion, entity.ubicacion]
            );
            return result.rows[0];
        } catch (error) { console.error(error); return null; }
    }

    updateAsync = async (id, entity) => {
        try {
            const result = await pool.query(
                'UPDATE sedes SET id_empresa = $1, nombre = $2, descripcion = $3, ubicacion = $4 WHERE id = $5 RETURNING *',
                [entity.id_empresa, entity.nombre, entity.descripcion, entity.ubicacion, id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    deleteAsync = async (id) => {
        try {
            const result = await pool.query('DELETE FROM sedes WHERE id = $1', [id]);
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }
}
