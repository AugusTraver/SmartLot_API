// garageRepository.js
import pool from '../database/db.js';
import { getDiasSemana } from '../helpers/validatorHelper.js';

export default class GarageRepository {
    constructor() {
        console.log('Estoy en: GarageRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query(`
                SELECT g.*, COALESCE(
                    (SELECT array_agg(gd.dia ORDER BY gd.dia) FROM garage_dias gd WHERE gd.id_garage = g.id AND gd.activo = true),
                    '{}'::dia_semana[]
                ) AS dias
                FROM garages g
                WHERE COALESCE(g."Borrado", false) = false
                ORDER BY g.id
            `);
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query(`
                SELECT g.*, COALESCE(
                    (SELECT array_agg(gd.dia ORDER BY gd.dia) FROM garage_dias gd WHERE gd.id_garage = g.id AND gd.activo = true),
                    '{}'::dia_semana[]
                ) AS dias
                FROM garages g
                WHERE g.id = $1 AND COALESCE(g."Borrado", false) = false
            `, [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    getByIdForUpdateWithClientAsync = async (id, client) => {
        const result = await client.query('SELECT * FROM garages WHERE id = $1 AND COALESCE("Borrado", false) = false FOR UPDATE', [id]);
        return result.rows[0] ?? null;
    }

    getOcupacionReservaAsync = async (id) => {
        try {
            const result = await pool.query('SELECT ocupacion_reservas FROM garages WHERE id = $1 AND COALESCE("Borrado", false) = false', [id]);
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getOcupacionNoReservaAsync = async (id) => {
        try {
            const result = await pool.query('SELECT ocupacion_no_reservas FROM garages WHERE id = $1 AND COALESCE("Borrado", false) = false', [id]);
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                `INSERT INTO garages (id_sede, nombre, piso, ubicacion, estado, capacidad, capacidad_para_no_reservas, capacidad_reservas, ocupacion_reservas, ocupacion_no_reservas, hora_apertura, hora_cierre)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
                [entity.id_sede, entity.nombre, entity.piso, entity.ubicacion, entity.estado,
                entity.capacidad, entity.capacidad_para_no_reservas, entity.capacidad_reservas, entity.ocupacion_reservas, entity.ocupacion_no_reservas,
                entity.hora_apertura, entity.hora_cierre]
            );
            const garage = result.rows[0];
            if (garage && entity.dias && entity.dias.length > 0) {
                const todosLosDias = getDiasSemana();
                for (const dia of todosLosDias) {
                    const activo = entity.dias.includes(dia);
                    await pool.query(
                        'INSERT INTO garage_dias (id_garage, dia, activo) VALUES ($1, $2, $3) ON CONFLICT (id_garage, dia) DO UPDATE SET activo = $3',
                        [garage.id, dia, activo]
                    );
                }
            }
            return garage;
        } catch (error) { console.error(error); return null; }
    }

    updateAsync = async (id, entity) => {
        let result;
        try {
            result = await pool.query(
            `UPDATE garages SET 
                id_sede=$1, 
                nombre=$2, 
                piso=$3, 
                ubicacion=$4, 
                estado=$5,
                capacidad=$6, 
                capacidad_para_no_reservas=$7, 
                capacidad_reservas=$8, 
                ocupacion_reservas = $9, 
                ocupacion_no_reservas = $10,
                hora_apertura=$11,
                hora_cierre=$12
             WHERE id=$13
               AND COALESCE("Borrado", false) = false
             RETURNING *`,
            [
                entity.id_sede, 
                entity.nombre, 
                entity.piso, 
                entity.ubicacion, 
                entity.estado,
                entity.capacidad, 
                entity.capacidad_para_no_reservas, 
                entity.capacidad_reservas, 
                entity.ocupacion_reservas, 
                entity.ocupacion_no_reservas,
                entity.hora_apertura,
                entity.hora_cierre,
                id
            ]
        );

            const garage = result.rows[0] ?? null;
            if (garage && entity.dias) {
                const todosLosDias = getDiasSemana();
                for (const dia of todosLosDias) {
                    const activo = entity.dias.includes(dia);
                    await pool.query(
                        'INSERT INTO garage_dias (id_garage, dia, activo) VALUES ($1, $2, $3) ON CONFLICT (id_garage, dia) DO UPDATE SET activo = $3',
                        [id, dia, activo]
                    );
                }
            }
            return garage;
        } catch (error) { console.error(error); return null; }
    }

    deleteAsync = async (id) => {
        try {
            const result = await pool.query(
                `UPDATE garages
                 SET "Borrado" = true
                 WHERE id = $1
                   AND COALESCE("Borrado", false) = false`,
                [id]
            );
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }

    incrementOcupacionReservasAsync = async (id) => {
        try {
            const result = await pool.query(
                'UPDATE garages SET ocupacion_reservas = COALESCE(ocupacion_reservas, 0) + 1 WHERE id = $1 AND COALESCE("Borrado", false) = false RETURNING *',
                [id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    incrementOcupacionReservasWithClientAsync = async (id, client) => {
        const result = await client.query(
            `UPDATE garages
             SET ocupacion_reservas = COALESCE(ocupacion_reservas, 0) + 1
             WHERE id = $1
               AND estado IS DISTINCT FROM false
               AND COALESCE("Borrado", false) = false
               AND COALESCE(ocupacion_reservas, 0) < COALESCE(capacidad_reservas, capacidad, 0)
             RETURNING *`,
            [id]
        );
        return result.rows[0] ?? null;
    }

    decrementOcupacionReservasAsync = async (id) => {
        try {
            const result = await pool.query(
                'UPDATE garages SET ocupacion_reservas = GREATEST(0, COALESCE(ocupacion_reservas, 0) - 1) WHERE id = $1 AND COALESCE("Borrado", false) = false RETURNING *',
                [id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    decrementOcupacionReservasWithClientAsync = async (id, client) => {
        const result = await client.query(
            `UPDATE garages
             SET ocupacion_reservas = COALESCE(ocupacion_reservas, 0) - 1
             WHERE id = $1
               AND COALESCE("Borrado", false) = false
               AND COALESCE(ocupacion_reservas, 0) > 0
             RETURNING *`,
            [id]
        );
        return result.rows[0] ?? null;
    }

    incrementOcupacionNoReservasAsync = async (id) => {
        try {
            const result = await pool.query(
                'UPDATE garages SET ocupacion_no_reservas = COALESCE(ocupacion_no_reservas, 0) + 1 WHERE id = $1 AND COALESCE("Borrado", false) = false RETURNING *',
                [id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    decrementOcupacionNoReservasAsync = async (id) => {
        try {
            const result = await pool.query(
                'UPDATE garages SET ocupacion_no_reservas = GREATEST(0, COALESCE(ocupacion_no_reservas, 0) - 1) WHERE id = $1 AND COALESCE("Borrado", false) = false RETURNING *',
                [id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    getDiasAsync = async (id_garage) => {
        try {
            const result = await pool.query(
                'SELECT dia FROM garage_dias WHERE id_garage = $1 AND activo = true ORDER BY dia',
                [id_garage]
            );
            return result.rows.map(r => r.dia);
        } catch (error) { console.error(error); return null; }
    }

    addDiaAsync = async (id_garage, dia) => {
        try {
            const result = await pool.query(
                'INSERT INTO garage_dias (id_garage, dia, activo) VALUES ($1, $2, true) ON CONFLICT (id_garage, dia) DO UPDATE SET activo = true RETURNING *',
                [id_garage, dia]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    removeDiaAsync = async (id_garage, dia) => {
        try {
            const result = await pool.query(
                'UPDATE garage_dias SET activo = false WHERE id_garage = $1 AND dia = $2 RETURNING *',
                [id_garage, dia]
            );
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }
}
