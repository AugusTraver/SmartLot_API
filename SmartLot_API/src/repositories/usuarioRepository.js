// usuarioRepository.js
import pool from '../database/db.js';

export default class UsuarioRepository {
    constructor() {
        console.log('Estoy en: UsuarioRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query('SELECT * FROM usuarios ORDER BY id');
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    getByEmailAsync = async (email) => {
        try {
            const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                `INSERT INTO usuarios (id_rol, nombre, apellido, id_sede, email, telefono, contraseña, id_empresa)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
                [entity.id_rol, entity.nombre, entity.apellido, entity.id_sede,
                 entity.email, entity.telefono, entity.contraseña, entity.id_empresa]
            );
            return result.rows[0];
        } catch (error) { console.error(error); return null; }
    }

    createWithClientAsync = async (entity, client) => {
        // En una transacción, no hacemos try/catch interno para que los errores
        // se propaguen y provoquen el ROLLBACK en la transacción.
        const result = await client.query(
            `INSERT INTO usuarios (id_rol, nombre, apellido, id_sede, email, telefono, contraseña, id_empresa)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [entity.id_rol, entity.nombre, entity.apellido, entity.id_sede,
             entity.email, entity.telefono, entity.contraseña, entity.id_empresa]
        );
        return result.rows[0];
    }

    updateAsync = async (id, entity) => {
        try {
            const result = await pool.query(
                `UPDATE usuarios SET id_rol=$1, nombre=$2, apellido=$3, id_sede=$4,
                 email=$5, telefono=$6, contraseña=$7, id_empresa=$8 WHERE id=$9 RETURNING *`,
                [entity.id_rol, entity.nombre, entity.apellido, entity.id_sede,
                 entity.email, entity.telefono, entity.contraseña, entity.id_empresa, id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    deleteAsync = async (id) => {
        try {
            const result = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }
}
