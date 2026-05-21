// vehiculoRepository.js
import pool from '../database/db.js';

export default class VehiculoRepository {
    constructor() {
        console.log('Estoy en: VehiculoRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query('SELECT * FROM vehiculos ORDER BY id');
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM vehiculos WHERE id = $1', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    getByPatenteAsync = async (patente) => {
        try {
            const result = await pool.query('SELECT * FROM vehiculos WHERE patente = $1', [patente]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                'INSERT INTO vehiculos (id_usuario, id_modelo, patente) VALUES ($1, $2, $3) RETURNING *',
                [entity.id_usuario, entity.id_modelo, entity.patente]
            );
            return result.rows[0];
        } catch (error) { console.error(error); return null; }
    }

    updateAsync = async (id, entity) => {
        try {
            const result = await pool.query(
                'UPDATE vehiculos SET id_usuario = $1, id_modelo = $2, patente = $3 WHERE id = $4 RETURNING *',
                [entity.id_usuario, entity.id_modelo, entity.patente, id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    deleteAsync = async (id) => {
        try {
            const result = await pool.query('DELETE FROM vehiculos WHERE id = $1', [id]);
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }
}
