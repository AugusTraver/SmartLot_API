import pool from '../src/database/db.js';

async function fixOcupacion() {
    const client = await pool.connect();
    try {
        const result = await client.query(`
            UPDATE garages g
            SET ocupacion_reservas = (
                SELECT COUNT(*)
                FROM reservas r
                WHERE r.id_garage = g.id
                  AND r.entro = true
                  AND r.salio = false
                  AND COALESCE(r."Borrado", false) = false
            )
            WHERE COALESCE(g."Borrado", false) = false
            RETURNING g.id, g.nombre, g.ocupacion_reservas
        `);

        console.log(`✓ ${result.rowCount} garages actualizados.`);
        for (const row of result.rows) {
            console.log(`  Garage ${row.id} (${row.nombre}): ocupacion_reservas = ${row.ocupacion_reservas}`);
        }
    } catch (error) {
        console.error('Error al actualizar ocupacion_reservas:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

fixOcupacion();
