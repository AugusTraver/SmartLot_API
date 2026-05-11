// rolRepository.js

const { Pool } = pkg;

export default class RolRepository {
    constructor() {
        console.log('Estoy en: RolRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }
}