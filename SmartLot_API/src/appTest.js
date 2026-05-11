import { TestService } from './services/testService.js';


async function main() {

    try {

        console.log('===== INSERT =====');

        const insert = await TestService.testInsert();

        console.log(insert);


        console.log('===== EMPRESAS =====');

        const empresas =
            await TestService.testSelectEmpresas();

        console.table(empresas);


        console.log('===== RESERVAS =====');

        const reservas =
            await TestService.testSelectReservas();

        console.table(reservas);

    }
    catch(error){

        console.error(error);

    }

    process.exit();
}


main();