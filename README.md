<div align="center">
<img src="https://avatars.githubusercontent.com/u/76637246?s=200&v=4">
</div>

<div align="Center">
<h1> DeBio Network Backend</h1>
<h2> Decentralized Sovereign Biomed </h2>
The Anonymous-First Platform for Medical and Bioinformatics Data.

<br>
<br>

[![Node.js version](https://img.shields.io/badge/Node.js-%5E14.0.0-green?logo=Node.Js)](https://nodejs.org/)
[![NestJS version](https://img.shields.io/badge/NestJS-%5E8.0.0-red?logo=NestJS)](https://github.com/nestjs/nest)
[![Medium](https://img.shields.io/badge/Medium-DeBio%20Network-brightgreen?logo=medium)](https://blog.debio.network)

</div>

---

DeBio Network is a decentralized anonymous-first platform for medical and bioinformatics data. It uses blockchain technology as the immutable transaction ledger to support its processes.

## Getting Started

Follow these steps to get started with our Backend

### Node.js Setup

All <a href="http://nodejs.org" target="_blank">Node.js</a> versions `14.0.0` above are compatible with our Backend.

### Installation

```bash
$ npm install
```

### Running a Development Server

Start the development server with detailed logging:

```bash
npm run start:dev
```

Build for production environments:

```bash
npm run build
```

Execute tests:

```bash
npm run test
```

### Run in Docker

First, install [Docker](https://docs.docker.com/get-docker/) and
[Docker Compose](https://docs.docker.com/compose/install/).

Then run the following command to start a Backend server using Docker Compose.

```sh
./.maintain/docker/create-network.sh
```

```bash
./.maintain/docker/start-docker-compose.sh
```

Server running on http://127.0.0.1:3003.
