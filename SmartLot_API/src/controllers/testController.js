import { TestService } from '../services/test.service.js';


export class TestController {

    static async crearEmpresa(req, res) {

        const data = await TestService.crearEmpresa();

        res.json(data);
    }


    static async listarEmpresas(req, res) {

        const data = await TestService.listarEmpresas();

        res.json(data);
    }


    static async listarReservas(req, res) {

        const data = await TestService.listarReservas();

        res.json(data);
    }

}