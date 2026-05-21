// usuarioService.js
import UsuarioRepository from '../repositories/usuarioRepository.js';
import SedeRepository from '../repositories/sedeRepository.js';
import EmpresaRepository from '../repositories/empresaRepository.js';
import RolRepository from '../repositories/rolRepository.js';

export default class UsuarioService {
    constructor() {
        console.log('Estoy en: UsuarioService.constructor()');
        this.repo = new UsuarioRepository();
        this.sedeRepo = new SedeRepository();
        this.empresaRepo = new EmpresaRepository();
        this.rolRepo = new RolRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();
    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);

    /**
     * Valida que las entidades relacionadas (rol, sede, empresa) existan en la BD.
     * Lanza un error descriptivo si alguna no existe.
     */
    _validarRelacionesAsync = async (entity) => {
        const errores = [];

        // Validar que el rol exista
        if (entity.id_rol) {
            const rol = await this.rolRepo.getByIdAsync(entity.id_rol);
            if (!rol) {
                errores.push(`El rol con ID ${entity.id_rol} no existe.`);
            }
        }

        // Validar que la empresa exista
        if (entity.id_empresa) {
            const empresa = await this.empresaRepo.getByIdAsync(entity.id_empresa);
            if (!empresa) {
                errores.push(`La empresa con ID ${entity.id_empresa} no existe.`);
            }
        }

        // Validar que la sede exista
        if (entity.id_sede) {
            const sede = await this.sedeRepo.getByIdAsync(entity.id_sede);
            if (!sede) {
                errores.push(`La sede con ID ${entity.id_sede} no existe.`);
            }
        }

        if (errores.length > 0) {
            const error = new Error(errores.join(' '));
            error.statusCode = 400;
            throw error;
        }
    }

    createAsync = async (entity) => {
        await this._validarRelacionesAsync(entity);

        // Validar email único
        if (entity.email) {
            const existing = await this.repo.getByEmailAsync(entity.email);
            if (existing) {
                const error = new Error(`Ya existe un usuario con el email ${entity.email}.`);
                error.statusCode = 400;
                throw error;
            }
        }

        return await this.repo.createAsync(entity);
    }

    updateAsync = async (id, entity) => {
        await this._validarRelacionesAsync(entity);

        // Validar email único (excluyendo al usuario actual)
        if (entity.email) {
            const existing = await this.repo.getByEmailAsync(entity.email);
            if (existing && existing.id !== id) {
                const error = new Error(`Ya existe un usuario con el email ${entity.email}.`);
                error.statusCode = 400;
                throw error;
            }
        }

        return await this.repo.updateAsync(id, entity);
    }

    deleteAsync = async (id) => await this.repo.deleteAsync(id);
}
