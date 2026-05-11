// garageRepository.js


const { Pool } = pkg;

export default class GarageRepository {
    constructor() {
        console.log('Estoy en: GarageRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }
}