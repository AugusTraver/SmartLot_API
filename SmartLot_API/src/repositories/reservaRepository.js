// reservaRepository.js

const { Pool } = pkg;

export default class ReservaRepository {
    constructor() {
        console.log('Estoy en: ReservaRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }
}