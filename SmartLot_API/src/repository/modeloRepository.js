// modeloRepository.js
import pkg from 'pg';
import LogHelper from './../helpers/log-helper.js';
import config from './../configs/db-config.js';

const { Pool } = pkg;

export default class ModeloRepository {
    constructor() {
        console.log('Estoy en: ModeloRepository.constructor()');
        this.DBPool = null;
    }

    getDBPool = () => {
        if (this.DBPool == null) {
            this.DBPool = new Pool(config);
        }
        return this.DBPool;
    }
}