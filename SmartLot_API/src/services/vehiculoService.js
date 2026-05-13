// vehiculoService.js
import VehiculoRepository from '../repositories/vehiculoRepository.js';

export default class VehiculoService {
    constructor() {
        console.log('Estoy en: VehiculoService.constructor()');
        this.repo = new VehiculoRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);
    createAsync = async (entity) => await this.repo.createAsync(entity);
    updateAsync = async (id, entity) => await this.repo.updateAsync(id, entity);
    deleteAsync = async (id) => await this.repo.deleteAsync(id);
}
