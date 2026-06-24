// conflictoRepository.js
import pool from '../database/db.js';

let superAdminColumnCache;

const quoteIdentifier = (identifier) => `"${String(identifier).replaceAll('"', '""')}"`;

const getSuperAdminColumnAsync = async () => {
    if (superAdminColumnCache !== undefined) return superAdminColumnCache;

    const result = await pool.query(
        `SELECT column_name
         FROM information_schema.columns
         WHERE table_schema = 'public'
           AND table_name = 'conflictos'
           AND lower(column_name) = 'superadmin'
         LIMIT 1`
    );

    superAdminColumnCache = result.rows[0]?.column_name ?? null;
    return superAdminColumnCache;
};

export default class ConflictoRepository {
    constructor() {
        console.log('Estoy en: ConflictoRepository.constructor()');
    }

    getAllAsync = async (superAdmin = false) => {
        try {
            const superAdminColumn = await getSuperAdminColumnAsync();
            const superAdminExpression = superAdminColumn ? `COALESCE(${quoteIdentifier(superAdminColumn)}, false)` : 'false';
            const result = await pool.query(
                `SELECT *
                 FROM conflictos
                 WHERE COALESCE("Borrado", false) = false
                   AND ${superAdminExpression} = $1
                 ORDER BY id`,
                [superAdmin]
            );
            return result.rows;
        } catch (error) { console.error(error); return null; }
    }

    getDeletedByUserAsync = async (deletedBy, superAdmin = false) => {
        try {
            const superAdminColumn = await getSuperAdminColumnAsync();
            const superAdminExpression = superAdminColumn ? `COALESCE(${quoteIdentifier(superAdminColumn)}, false)` : 'false';
            const result = await pool.query(
                `SELECT *
                 FROM conflictos
                 WHERE COALESCE("Borrado", false) = true
                   AND ${superAdminExpression} = $1
                   AND "DeleteBy" = $2
                 ORDER BY "DeleteAt" DESC NULLS LAST, id DESC`,
                [superAdmin, deletedBy]
            );
            return result.rows;
        } catch (error) {
            if (error.code === '42703') {
                const superAdminColumn = await getSuperAdminColumnAsync();
                const superAdminExpression = superAdminColumn ? `COALESCE(${quoteIdentifier(superAdminColumn)}, false)` : 'false';
                const result = await pool.query(
                    `SELECT *
                     FROM conflictos
                     WHERE COALESCE("Borrado", false) = true
                       AND ${superAdminExpression} = $1
                     ORDER BY id DESC`,
                    [superAdmin]
                );
                return result.rows;
            }

            console.error(error);
            return null;
        }
    }

    getByIdAsync = async (id) => {
        try {
            const result = await pool.query('SELECT * FROM conflictos WHERE id = $1 AND COALESCE("Borrado", false) = false', [id]);
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    createAsync = async (entity) => {
        try {
            const superAdminColumn = await getSuperAdminColumnAsync();
            if (!superAdminColumn) {
                const result = await pool.query(
                    `INSERT INTO conflictos (id_usuario, descripcion, prioridad, estado)
                     VALUES ($1, $2, $3, $4) RETURNING *`,
                    [entity.id_usuario, entity.descripcion, entity.prioridad, entity.estado || 'Pendiente']
                );
                return result.rows[0];
            }

            const result = await pool.query(
                `INSERT INTO conflictos (id_usuario, descripcion, prioridad, estado, ${quoteIdentifier(superAdminColumn)})
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [
                    entity.id_usuario,
                    entity.descripcion,
                    entity.prioridad,
                    entity.estado || 'Pendiente',
                    entity.SuperAdmin === true
                ]
            );
            return result.rows[0];
        } catch (error) { console.error(error); return null; }
    }

    updateAsync = async (id, entity) => {
        try {
            const superAdminColumn = await getSuperAdminColumnAsync();
            if (!superAdminColumn) {
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
            }

            const result = await pool.query(
                `UPDATE conflictos
                 SET id_usuario = $1,
                     descripcion = $2,
                     prioridad = $3,
                     estado = $4,
                     ${quoteIdentifier(superAdminColumn)} = $5
                 WHERE id = $6
                   AND COALESCE("Borrado", false) = false
                 RETURNING *`,
                [
                    entity.id_usuario,
                    entity.descripcion,
                    entity.prioridad,
                    entity.estado,
                    entity.SuperAdmin === true,
                    id
                ]
            );
            return result.rows[0] ?? null;
        } catch (error) { console.error(error); return null; }
    }

    deleteAsync = async (id, deletedBy = null) => {
        try {
            const result = await pool.query(
                `UPDATE conflictos
                 SET "Borrado" = true,
                     "DeleteBy" = $2,
                     "DeleteAt" = NOW()
                 WHERE id = $1
                   AND COALESCE("Borrado", false) = false`,
                [id, deletedBy]
            );
            return result.rowCount > 0;
        } catch (error) {
            if (error.code === '42703') {
                const result = await pool.query(
                    `UPDATE conflictos
                     SET "Borrado" = true
                     WHERE id = $1
                       AND COALESCE("Borrado", false) = false`,
                    [id]
                );
                return result.rowCount > 0;
            }

            console.error(error);
            return false;
        }
    }

    restoreAsync = async (id, deletedBy = null) => {
        try {
            const result = await pool.query(
                `UPDATE conflictos
                 SET "Borrado" = false,
                     "DeleteBy" = NULL,
                     "DeleteAt" = NULL
                 WHERE id = $1
                   AND COALESCE("Borrado", false) = true
                   AND ($2::int IS NULL OR "DeleteBy" = $2)
                 RETURNING *`,
                [id, deletedBy]
            );
            return result.rows[0] ?? null;
        } catch (error) {
            if (error.code === '42703') {
                const result = await pool.query(
                    `UPDATE conflictos
                     SET "Borrado" = false
                     WHERE id = $1
                       AND COALESCE("Borrado", false) = true
                     RETURNING *`,
                    [id]
                );
                return result.rows[0] ?? null;
            }

            console.error(error);
            return null;
        }
    }
}
