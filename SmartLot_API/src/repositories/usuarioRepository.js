// usuarioRepository.js
import pool  from '../database/db.js';  


export default class UsuarioRepository {
    constructor() {
        console.log('Estoy en: UsuarioRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }
}
getAllAsync = async () => {
    console.log(`UsuariosRepository.getAllAsync()`);
    let returnArray = null;

    try {
        const query = `SELECT * FROM usuarios`;
        const result = await this.pool().query(query);
        returnArray = result.rows;
    } catch (error) {
        LogHelper.logError(error);
    }
    return returnArray;
}