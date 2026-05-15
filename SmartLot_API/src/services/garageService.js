// garageService.js
import GarageRepository from '../repositories/garageRepository.js';

export default class GarageService {
    constructor() {
        console.log('Estoy en: GarageService.constructor()');
        this.repo = new GarageRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);
    createAsync = async (entity) => await this.repo.createAsync(entity);
    updateAsync = async (id, entity) => await this.repo.updateAsync(id, entity);
    deleteAsync = async (id) => await this.repo.deleteAsync(id);
    getOcupacionAsync = async (id) => await this.repo.getOcupacionAsync(id);
    getOcupacionReservaAsync = async (id) => await this.repo.getOcupacionAsync(id);
}
