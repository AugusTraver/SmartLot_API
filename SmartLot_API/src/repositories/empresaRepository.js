// empresaRepository.js
import pool from '../database/db.js';

export default class EmpresaRepository {
    constructor() {
        console.log('Estoy en: EmpresaRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query('SELECT * FROM empresas ORDER BY id');
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM empresas WHERE id = $1', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                'INSERT INTO empresas (nombre, descripcion) VALUES ($1, $2) RETURNING *',
                [entity.nombre, entity.descripcion]
            );
            return result.rows[0];
        } catch (error) { console.error(error); return null; }
    }

    updateAsync = async (id, entity) => {
        try {
            const result = await pool.query(
                'UPDATE empresas SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
                [entity.nombre, entity.descripcion, id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    deleteAsync = async (id) => {
        try {
            const result = await pool.query('DELETE FROM empresas WHERE id = $1', [id]);
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }
}
