// usuarioRepository.js
import pool from '../database/db.js';

export default class UsuarioRepository {
    constructor() {
        console.log('Estoy en: UsuarioRepository.constructor()');
    }

    getAllAsync = async () => {
        try {
            const result = await pool.query(`
                SELECT u.*, 
                    CASE WHEN u.id_rol = 3 THEN ug.id_garage ELSE NULL END as id_garage
                FROM usuarios u 
                LEFT JOIN usuario_garage ug ON u.id = ug.id_usuario 
                WHERE COALESCE(u."Borrado", false) = false 
                ORDER BY u.id
            `);
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM usuarios WHERE id = $1 AND COALESCE("Borrado", false) = false', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    getByEmailAsync = async (email) => {
        try {
            const result = await pool.query('SELECT * FROM usuarios WHERE email = $1 AND COALESCE("Borrado", false) = false', [email]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    getAuditAsync = async () => {
        try {
            const result = await pool.query(
                `SELECT
                    u.id,
                    u.id_rol,
                    u.nombre,
                    u.apellido,
                    u.email,
                    u.activo,
                    u."Borrado",
                    u."UpdateBy",
                    u."UpdateAt",
                    u."DeleteBy",
                    u."DeleteAt",
                    CONCAT_WS(' ', update_user.nombre, update_user.apellido) AS "UpdateByNombre",
                    update_user.email AS "UpdateByEmail",
                    CONCAT_WS(' ', delete_user.nombre, delete_user.apellido) AS "DeleteByNombre",
                    delete_user.email AS "DeleteByEmail"
                 FROM usuarios u
                 LEFT JOIN usuarios update_user ON update_user.id = u."UpdateBy"
                 LEFT JOIN usuarios delete_user ON delete_user.id = u."DeleteBy"
                 WHERE u."UpdateAt" IS NOT NULL
                    OR u."DeleteAt" IS NOT NULL
                    OR COALESCE(u."Borrado", false) = true
                 ORDER BY COALESCE(u."DeleteAt", u."UpdateAt") DESC NULLS LAST, u.id DESC`
            );
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const result = await pool.query(
                `INSERT INTO usuarios (id_rol, nombre, apellido, id_sede, email, telefono, contraseña, id_empresa, activo, token_version)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [entity.id_rol, entity.nombre, entity.apellido, entity.id_sede,
                entity.email, entity.telefono, entity.contraseña, entity.id_empresa, entity.activo, entity.token_version ?? 0]
            );
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                const err = new Error('Ya existe un usuario con ese email.');
                err.statusCode = 409;
                throw err;
            }
            console.error(error);
            const err = new Error('Error al crear el usuario en la base de datos.');
            err.statusCode = 500;
            throw err;
        }
    }

    createWithClientAsync = async (entity, client) => {
        try {
            const result = await client.query(
                `INSERT INTO usuarios (id_rol, nombre, apellido, id_sede, email, telefono, contraseña, id_empresa, activo, token_version)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
                [entity.id_rol, entity.nombre, entity.apellido, entity.id_sede,
                entity.email, entity.telefono, entity.contraseña, entity.id_empresa, entity.activo, entity.token_version ?? 0]
            );
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                const err = new Error('Ya existe un usuario con ese email.');
                err.statusCode = 409;
                throw err;
            }
            console.error(error);
            const err = new Error('Error al crear el usuario en la base de datos.');
            err.statusCode = 500;
            throw err;
        }
    }

    updateAsync = async (id, entity, updatedBy = null) => {
        try {
            const result = await pool.query(
                `UPDATE usuarios SET id_rol=$1, nombre=$2, apellido=$3, id_sede=$4,
                 email=$5, telefono=$6, contraseña=$7, id_empresa=$8, activo=$9, token_version=$10,
                 "UpdateBy"=$11, "UpdateAt"=NOW()
                 WHERE id=$12 AND COALESCE("Borrado", false) = false RETURNING *`,
                [entity.id_rol, entity.nombre, entity.apellido, entity.id_sede,
                entity.email, entity.telefono, entity.contraseña, entity.id_empresa, entity.activo, entity.token_version ?? 0, updatedBy, id]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    updateEstadoAsync = async (id, activo, updatedBy = null) => {
        try {
            const result = await pool.query(
                `UPDATE usuarios
                 SET activo = $1,
                     "UpdateBy" = $2,
                     "UpdateAt" = NOW()
                 WHERE id = $3
                   AND COALESCE("Borrado", false) = false
                 RETURNING *`,
                [activo, updatedBy, id]
            );
            return result.rows[0] ?? null;
        } catch (error) {
            console.error('Error en updateEstadoAsync:', error);
            return null;
        }
    }

    incrementTokenVersionAsync = async (id) => {
        try {
            const result = await pool.query(
                'UPDATE usuarios SET token_version = token_version + 1 WHERE id = $1 AND COALESCE("Borrado", false) = false RETURNING token_version',
                [id]
            );
            return result.rows[0]?.token_version ?? null;
        } catch (error) { console.error(error); return null; }
    }

    deleteAsync = async (id, deletedBy = null) => {
        try {
            const result = await pool.query(
                `UPDATE usuarios
                 SET "Borrado" = true,
                     "DeleteBy" = $1,
                     "DeleteAt" = NOW()
                 WHERE id = $2
                   AND COALESCE("Borrado", false) = false`,
                [deletedBy, id]
            );
            return result.rowCount > 0;
        } catch (error) { console.error(error); return false; }
    }
}
