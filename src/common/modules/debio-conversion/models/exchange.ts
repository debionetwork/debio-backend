export class Exchange {
  constructor(
    _sodakiExchange?: SodakiExchange,
    _daiToUsd?: number,
    _dbioToUsd?: number,
  ) {
    this.dbioToWNear = _sodakiExchange.dbioToWNear;
    this.wNearToDai = _sodakiExchange.wNearToDai;
    this.dbioToDai = _sodakiExchange.dbioToDai;
    this.daiToUsd = _daiToUsd;
    this.dbioToUsd = _dbioToUsd;
  }
  dbioToWNear?: number;
  wNearToDai?: number;
  dbioToDai?: number;
  dbioToUsd?: number;
  daiToUsd?: number;
}

export class SodakiExchange {
  constructor(
    _dbioToWNear?: number,
    _wNearToDai?: number,
    _dbioToDai?: number,
  ) {
    this.dbioToWNear = _dbioToWNear;
    this.wNearToDai = _wNearToDai;
    this.dbioToDai = _dbioToDai;
  }
  dbioToWNear?: number;
  wNearToDai?: number;
  dbioToDai?: number;
}
