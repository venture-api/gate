const appReady = require('./app');


async function main()  {

    const app = await appReady();
    const server = app.get('server');
    const pack = app.get('package');
    const config = app.get('config');


    // SERVER LAUNCH

    server.listen(config.port, () => {
        console.log(` `);
        console.log(`*********************************************************************`);
        console.log(` ⛖ ${pack.name}@${pack.version} listening on ${config.host}:${config.port} [${config.environment}]`);
        console.log(`*********************************************************************`);
        console.log(` `);
    });

}

main();
