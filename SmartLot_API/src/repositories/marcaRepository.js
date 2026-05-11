// marcaRepository.js


const { Pool } = pkg;

export default class MarcaRepository {
    constructor() {
        console.log('Estoy en: MarcaRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }
}