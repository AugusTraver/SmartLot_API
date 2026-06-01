// reservaRepository.js
import pool from '../database/db.js';

export default class ReservaRepository {
    constructor() {
        console.log('Estoy en: ReservaRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query('SELECT * FROM reservas ORDER BY id');
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM reservas WHERE id = $1', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    getByUsuarioAsync = async (id_usuario) => {
        try {
            const result = await pool.query(
                `SELECT * FROM reservas
                 WHERE id_usuario = $1
                 ORDER BY fecha_entrada`,
                [id_usuario]
            );
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getActivasByUsuarioAsync = async (id_usuario) => {
        try {
            const result = await pool.query(
                `SELECT * FROM reservas
                 WHERE id_usuario = $1
                   AND COALESCE(salio, false) = false
                 ORDER BY fecha_entrada`,
                [id_usuario]
            );
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getActivasByGarageAsync = async (id_garage) => {
        try {
            const result = await pool.query(
                `SELECT * FROM reservas
                 WHERE id_garage = $1
                   AND COALESCE(salio, false) = false
                 ORDER BY fecha_entrada`,
                [id_garage]
            );
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getOverlapByVehiculoAsync = async (id_vehiculo, fecha_entrada, fecha_salida, excludeId = null) => {
        try {
            const result = await pool.query(
                `SELECT * FROM reservas 
                 WHERE id_vehiculo = $1 
                   AND (fecha_entrada < $2 AND fecha_salida > $3)
                   AND COALESCE(salio, false) = false
                   AND ($4::integer IS NULL OR id != $4)`,
                [id_vehiculo, fecha_salida, fecha_entrada, excludeId]
            );
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getOverlapByUsuarioAsync = async (id_usuario, fecha_entrada, fecha_salida, excludeId = null) => {
        try {
            const result = await pool.query(
                `SELECT * FROM reservas 
                 WHERE id_usuario = $1 
                   AND (fecha_entrada < $2 AND fecha_salida > $3)
                   AND COALESCE(salio, false) = false
                   AND ($4::integer IS NULL OR id != $4)`,
                [id_usuario, fecha_salida, fecha_entrada, excludeId]
            );
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getOverlapByGarageAsync = async (id_garage, fecha_entrada, fecha_salida, excludeId = null) => {
        try {
            const result = await pool.query(
                `SELECT * FROM reservas 
                 WHERE id_garage = $1 
                   AND (fecha_entrada < $2 AND fecha_salida > $3)
                   AND COALESCE(salio, false) = false
                   AND ($4::integer IS NULL OR id != $4)`,
                [id_garage, fecha_salida, fecha_entrada, excludeId]
            );
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                `INSERT INTO reservas (id_usuario, id_garage, id_vehiculo, fecha_entrada, fecha_salida, entro, salio)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                [entity.id_usuario, entity.id_garage, entity.id_vehiculo,
                 entity.fecha_entrada, entity.fecha_salida, entity.entro, entity.salio]
            );
            return result.rows[0];
        } catch (error) { console.error(error); return null; }
    }

    updateAsync = async (id, entity) => {
        try {
            const result = await pool.query(
                `UPDATE reservas SET id_usuario=$1, id_garage=$2, id_vehiculo=$3,
                 fecha_entrada=$4, fecha_salida=$5, entro=$6, salio=$7 WHERE id=$8 RETURNING *`,
                [entity.id_usuario, entity.id_garage, entity.id_vehiculo,
                 entity.fecha_entrada, entity.fecha_salida, entity.entro, entity.salio, id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    updateWithClientAsync = async (id, entity, client) => {
        const result = await client.query(
            `UPDATE reservas SET id_usuario=$1, id_garage=$2, id_vehiculo=$3,
             fecha_entrada=$4, fecha_salida=$5, entro=$6, salio=$7 WHERE id=$8 RETURNING *`,
            [entity.id_usuario, entity.id_garage, entity.id_vehiculo,
             entity.fecha_entrada, entity.fecha_salida, entity.entro, entity.salio, id]
        );
        return result.rows[0] ?? null;
    }

    registrarIngresoWithClientAsync = async (id, client) => {
        const result = await client.query(
            'UPDATE reservas SET entro = true WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0] ?? null;
    }

    registrarSalidaWithClientAsync = async (id, client) => {
        const result = await client.query(
            'UPDATE reservas SET salio = true WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0] ?? null;
    }

    deleteAsync = async (id) => {
        try {
            const result = await pool.query('DELETE FROM reservas WHERE id = $1', [id]);
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }

    cancelarAsync = async (id) => await this.deleteAsync(id);
}
