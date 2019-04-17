'use strict';

const { Pool } = require('pg');
const dbConfig = require('./dbConfig');
const pool = new Pool(dbConfig); // init connection

function insertData(params) {
    return new Promise((resolved, rejected) => {
        const statment = `INSERT INTO CWBDATA (
        lat, lon, locationName, stationId, obsTime, ELEV, WDIR, WDSD,
        TEMP, HUMD, PRES, SUN, H_24R, H_FX, H_XD, H_FXT,
        D_TX, D_TXT, D_TN, D_TNT, CITY, CITY_SN, TOWN, TOWN_SN
      ) VAlUES (
        $1, $2, $3, $4, to_timestamp($5,'YYYY-MM-DD HH24:mi:SS'), $6, $7, $8, 
        $9, $10, $11, $12, $13, $14, $15, $16, 
        $17, $18, $19, $20, $21, $22, $23, $24) 
        RETURNING id`;
        pool.query(statment, params, (err, result) => {
            if (err) {
                rejected(err);
            } else {
                console.log(result.rows);
                resolved(result.rows);
            }
        });
    });
}

module.exports.insertData = insertData;
