// empresaService.js
import EmpresaRepository from '../repositories/empresaRepository.js';

export default class EmpresaService {
    constructor() {
        console.log('Estoy en: EmpresaService.constructor()');
        this.repo = new EmpresaRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);
    createAsync = async (entity) => await this.repo.createAsync(entity);
    updateAsync = async (id, entity) => await this.repo.updateAsync(id, entity);
    deleteAsync = async (id) => await this.repo.deleteAsync(id);
}
