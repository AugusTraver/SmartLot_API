// usuarioGarageRepository.js
import pool from '../database/db.js';

export default class UsuarioGarageRepository {
    constructor() {
        console.log('Estoy en: UsuarioGarageRepository.constructor()');
    }

    createWithClientAsync = async (id_usuario, id_garage, client) => {
        // En una transacción, no hacemos try/catch interno para que los errores
        // se propaguen y provoquen el ROLLBACK en la transacción.
        const result = await client.query(
            `INSERT INTO usuario_garage (id_usuario, id_garage) 
             VALUES ($1, $2) RETURNING *`,
            [id_usuario, id_garage]
        );
        return result.rows[0];
    }
}
