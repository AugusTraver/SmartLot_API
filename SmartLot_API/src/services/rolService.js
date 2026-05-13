// rolService.js
import RolRepository from '../repositories/rolRepository.js';

export default class RolService {
    constructor() {
        console.log('Estoy en: RolService.constructor()');
        this.repo = new RolRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);
    createAsync = async (entity) => await this.repo.createAsync(entity);
    updateAsync = async (id, entity) => await this.repo.updateAsync(id, entity);
    deleteAsync = async (id) => await this.repo.deleteAsync(id);
}
