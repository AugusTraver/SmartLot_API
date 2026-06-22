// conflictoRepository.js
import pool from '../database/db.js';

export default class ConflictoRepository {
    constructor() {
        console.log('Estoy en: ConflictoRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query('SELECT * FROM conflictos WHERE COALESCE("Borrado", false) = false ORDER BY id');
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM conflictos WHERE id = $1 AND COALESCE("Borrado", false) = false', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                `INSERT INTO conflictos (id_usuario, descripcion, prioridad, estado)
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [entity.id_usuario, entity.descripcion, entity.prioridad, entity.estado || 'Pendiente']
            );
            return result.rows[0];
        } catch (error) { console.error(error); return null; }
    }

    updateAsync = async (id, entity) => {
        try {
            const result = await pool.query(
                `UPDATE conflictos
                 SET id_usuario = $1,
                     descripcion = $2,
                     prioridad = $3,
                     estado = $4
                 WHERE id = $5
                   AND COALESCE("Borrado", false) = false
                 RETURNING *`,
                [entity.id_usuario, entity.descripcion, entity.prioridad, entity.estado, id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    deleteAsync = async (id) => {
        try {
            const result = await pool.query(
                `UPDATE conflictos
                 SET "Borrado" = true
                 WHERE id = $1
                   AND COALESCE("Borrado", false) = false`,
                [id]
            );
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }
}
