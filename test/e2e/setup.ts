module.exports = async () => {
    const path = require('path');
    const compose = require('docker-compose');
    const fixture = require('./fixture');

    const promise = new Promise((resolve, reject) => { // eslint-disable-line
        compose.upAll({ cwd: path.join(__dirname), log: true }).then(
            () => {
                fixture()
                    .then(() => {
                        resolve('DeBio Backend Dependencies is Up!');
                    })
                    .catch((err) => {
                        resolve(`Something went wrong when migrating DeBio Network database: ${err.message}`);
                    });
            },
            (err) => {
                resolve(`Something went wrong when spawning DeBio Backend Dependencies: ${err.message}`);
            }
        );
    });

    console.log(await promise);
}