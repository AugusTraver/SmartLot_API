// empresaService.js
import EmpresaRepository from '../repositories/empresaRepository.js';

export default class EmpresaService {
    constructor() {
        console.log('Estoy en: EmpresaService.constructor()');
        this.repo = new EmpresaRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);
    getAuditAsync = async () => await this.repo.getAuditAsync();
    createAsync = async (entity) => await this.repo.createAsync(entity);
    updateAsync = async (id, entity, requestingUser = null) => await this.repo.updateAsync(id, entity, requestingUser?.id ?? null);
    deleteAsync = async (id, requestingUser = null) => await this.repo.deleteAsync(id, requestingUser?.id ?? null);
}
