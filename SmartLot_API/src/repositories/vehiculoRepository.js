// vehiculoRepository.js

const { Pool } = pkg;

export default class VehiculoRepository {
    constructor() {
        console.log('Estoy en: VehiculoRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }
}