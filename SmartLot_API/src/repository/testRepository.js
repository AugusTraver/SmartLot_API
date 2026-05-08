import pool from '../database/db.js';


export class TestRepository {

    static async insertarEmpresa() {

        const query = `
            INSERT INTO empresas(nombre, descripcion)
            VALUES($1,$2)
            RETURNING *;
        `;

        const values = [
            'Empresa desde API',
            'Insert de prueba'
        ];

        const result = await pool.query(
            query,
            values
        );

        return result.rows[0];
    }


    static async obtenerEmpresas() {

        const query = `
            SELECT *
            FROM empresas
            ORDER BY id;
        `;

        const result = await pool.query(query);

        return result.rows;
    }


    static async obtenerReservas() {

        const query = `
            SELECT
                r.id,
                u.nombre,
                g.nombre as garage,
                v.patente
            FROM reservas r
            JOIN usuarios u ON u.id = r.id_usuario
            JOIN garages g ON g.id = r.id_garage
            JOIN vehiculos v ON v.id = r.id_vehiculo;
        `;

        const result = await pool.query(query);

        return result.rows;
    }

}