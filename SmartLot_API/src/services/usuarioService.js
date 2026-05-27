// usuarioService.js
import pool from '../database/db.js';
import UsuarioRepository from '../repositories/usuarioRepository.js';
import SedeRepository from '../repositories/sedeRepository.js';
import EmpresaRepository from '../repositories/empresaRepository.js';
import RolRepository from '../repositories/rolRepository.js';
import GarageRepository from '../repositories/garageRepository.js';
import UsuarioGarageRepository from '../repositories/usuarioGarageRepository.js';

export default class UsuarioService {
    constructor() {
        console.log('Estoy en: UsuarioService.constructor()');
        this.repo = new UsuarioRepository();
        this.sedeRepo = new SedeRepository();
        this.empresaRepo = new EmpresaRepository();
        this.rolRepo = new RolRepository();
        this.garageRepo = new GarageRepository();
        this.usuarioGarageRepo = new UsuarioGarageRepository();
    }

    getAllAsync = async () => await this.repo.getAllAsync();

    getByIdAsync = async (id) => await this.repo.getByIdAsync(id);

    getGaragistasByGarageIdAsync = async (id_garage) => {
        // Validar que el garage exista
        const garage = await this.garageRepo.getByIdAsync(id_garage);
        if (!garage) {
            const error = new Error(`El garage con ID ${id_garage} no existe.`);
            error.statusCode = 404;
            throw error;
        }
        return await this.usuarioGarageRepo.getUsuariosByGarageIdAsync(id_garage);
    }

    createAsync = async (entity) => {
        await this._validarRelacionesAsync(entity);

        // Obtener el rol para verificar si es "garagista"
        const rol = await this.rolRepo.getByIdAsync(entity.id_rol);
        const esGaragista = rol && rol.tipo_rol && rol.tipo_rol.toLowerCase() === 'garagista';

        // Validaciones si es "garagista"
        if (esGaragista) {
            if (!entity.id_garage) {
                const error = new Error('El campo id_garage es requerido para el rol garagista.');
                error.statusCode = 400;
                throw error;
            }
            const garage = await this.garageRepo.getByIdAsync(entity.id_garage);
            if (!garage) {
                const error = new Error(`El garage con ID ${entity.id_garage} no existe.`);
                error.statusCode = 400;
                throw error;
            }
        }

        // Validar email único
        if (entity.email) {
            const existing = await this.repo.getByEmailAsync(entity.email);
            if (existing) {
                const error = new Error(`Ya existe un usuario con el email ${entity.email}.`);
                error.statusCode = 400;
                throw error;
            }
        }

        if (esGaragista) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                // Crear usuario con el cliente de la transacción
                const nuevoUsuario = await this.repo.createWithClientAsync(entity, client);
                if (!nuevoUsuario) {
                    throw new Error('Error al insertar el usuario en la base de datos.');
                }

                // Crear relación usuario_garage con el cliente de la transacción
                await this.usuarioGarageRepo.createWithClientAsync(nuevoUsuario.id, entity.id_garage, client);

                await client.query('COMMIT');
                return nuevoUsuario;
            } catch (error) {
                await client.query('ROLLBACK');
                throw error;
            } finally {
                client.release();
            }
        } else {
            return await this.repo.createAsync(entity);
        }
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

    updateEstadoAsync = async (id, activo) => {
        // 1. Validar primero que el usuario exista
        const usuario = await this.repo.getByIdAsync(id);
        if (!usuario) {
            const error = new Error(`El usuario con ID ${id} no existe.`);
            error.statusCode = 404;
            throw error;
        }

        // 2. Llamar al repositorio para hacer el update parcial
        return await this.repo.updateEstadoAsync(id, activo);
    }

    deleteAsync = async (id) => await this.repo.deleteAsync(id);

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
}
