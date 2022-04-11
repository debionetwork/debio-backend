module.exports = async () => {
  const path = require('path'); // eslint-disable-line
  const compose = require('docker-compose'); // eslint-disable-line

  const promise = new Promise((resolve, reject) => {
    console.log('Stopping docker-compose... 🐋');
    // eslint-disable-line
    compose.down({ cwd: path.join(__dirname), log: true }).then(
      () => {
        resolve('DeBio Backend Dependencies is Down!');
      },
      (err) => {
        reject(
          `Something went wrong when tearing down DeBio Backend Dependencies: ${err.message}`,
        );
      },
    );
  });

  console.log(await promise);
};
