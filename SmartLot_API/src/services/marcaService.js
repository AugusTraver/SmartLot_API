// marcaService.js
import MarcaRepository from '../repositories/marcaRepository.js';

export default class MarcaService {
    constructor() {
        console.log('Estoy en: MarcaService.constructor()');
        this.repo = new MarcaRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);
    createAsync = async (entity) => await this.repo.createAsync(entity);
    updateAsync = async (id, entity) => await this.repo.updateAsync(id, entity);
    deleteAsync = async (id) => await this.repo.deleteAsync(id);
}
