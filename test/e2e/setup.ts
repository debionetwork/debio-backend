module.exports = async () => {
  const path = require('path'); // eslint-disable-line
  const compose = require('docker-compose'); // eslint-disable-line
  const fixture = require('./fixture'); // eslint-disable-line
  const substrateFixture = require('./substrate-fixture'); // eslint-disable-line
  const elasticsearchFixture = require('./elasticsearch-fixture'); // eslint-disable-line

  const promise = new Promise((resolve, reject) => {
    // eslint-disable-line
    compose.upAll({ cwd: path.join(__dirname), log: true }).then(
      () => {
        fixture()
          .then(() => {
            substrateFixture()
              .then(() => {
                elasticsearchFixture()
                  .then(() => {
                    resolve('DeBio Backend Dependencies is Up!');
                  })
                  .catch((err) => {
                    reject(
                      `Something went wrong when migrating DeBio Network Indexer: ${err.message}`,
                    );
                  });
              })
              .catch((err) => {
                reject(
                  `Something went wrong when migrating DeBio Network Node: ${err.message}`,
                );
              });
          })
          .catch((err) => {
            reject(
              `Something went wrong when migrating DeBio Network database: ${err.message}`,
            );
          });
      },
      (err) => {
        reject(
          `Something went wrong when spawning DeBio Backend Dependencies: ${err.message}`,
        );
      },
    );
  });

  console.log(await promise);
};
