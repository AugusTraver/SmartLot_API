// rolRepository.js
import pkg from 'pg';
import LogHelper from './../helpers/log-helper.js';
import config from './../configs/db-config.js';

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