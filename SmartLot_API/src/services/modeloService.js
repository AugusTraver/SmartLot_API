// modeloService.js
import ModeloRepository from '../repositories/modeloRepository.js';

export default class ModeloService {
    constructor() {
        console.log('Estoy en: ModeloService.constructor()');
        this.repo = new ModeloRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);
    createAsync = async (entity) => await this.repo.createAsync(entity);
    updateAsync = async (id, entity) => await this.repo.updateAsync(id, entity);
    deleteAsync = async (id) => await this.repo.deleteAsync(id);
}
