// garageRepository.js
import pool from '../database/db.js';

export default class GarageRepository {
    constructor() {
        console.log('Estoy en: GarageRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query('SELECT * FROM garages ORDER BY id');
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM garages WHERE id = $1', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                `INSERT INTO garages (id_sede, nombre, piso, ubicacion, estado, capacidad, capacidad_para_no_reservas, capacidad_reservas,ocupacion_reservas, ocupacion_no_reservas)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [entity.id_sede, entity.nombre, entity.piso, entity.ubicacion, entity.estado,
                entity.capacidad, entity.capacidad_para_no_reservas, entity.capacidad_reservas, entity.ocupacion_reservas, entity.ocupacion_no_reservas]
            );
            return result.rows[0];
        } catch (error) { console.error(error); return null; }
    }

updateAsync = async (id, entity) => {
    // No usamos try/catch aquí para que el error real llegue al controller
    const result = await pool.query(
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
            ocupacion_no_reservas = $10 
         WHERE id=$11 
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
            id
        ]
    );

    // Si no afectó ninguna fila, devuelve null (aquí sí es un 404 real)
    return result.rows[0] ?? null;
}

    deleteAsync = async (id) => {
        try {
            const result = await pool.query('DELETE FROM garages WHERE id = $1', [id]);
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }
    getOcupacionReservaAsync = async (id) => {
        try {
            const result = await pool.query('SELECT ocupacion_reservas FROM garages WHERE id = $1', [id]);
            return result.rowCount ?? NULL;
        } catch (error) { console.error(error); return NULL; }
    }
    getOcupacionNoReservaAsync = async (id) => {
        try {
            const result = await pool.query('SELECT ocupacion_no_reservas FROM garages WHERE id = $1', [id]);
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }
}
