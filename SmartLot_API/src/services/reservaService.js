// reservaService.js
import ReservaRepository from '../repositories/reservaRepository.js';

export default class ReservaService {
    constructor() {
        console.log('Estoy en: ReservaService.constructor()');
        this.repo = new ReservaRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);
    createAsync = async (entity) => await this.repo.createAsync(entity);
    updateAsync = async (id, entity) => await this.repo.updateAsync(id, entity);
    deleteAsync = async (id) => await this.repo.deleteAsync(id);
}
