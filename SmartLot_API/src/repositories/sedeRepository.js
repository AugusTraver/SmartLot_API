
const { Pool } = pkg;

export default class SedeRepository {
    constructor() {
        console.log('Estoy en: SedeRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }
}
