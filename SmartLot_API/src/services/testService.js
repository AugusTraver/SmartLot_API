import { TestRepository } from '../repository/testRepository.js';


export class TestService {

    static async testInsert() {

        return await TestRepository.insertarEmpresa();
    }


    static async testSelectEmpresas() {

        return await TestRepository.obtenerEmpresas();
    }


    static async testSelectReservas() {

        return await TestRepository.obtenerReservas();
    }

}