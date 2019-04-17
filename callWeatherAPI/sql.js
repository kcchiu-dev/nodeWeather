'use strict';

const { Pool } = require('pg');
const dbConfig = require('./dbConfig');
const pool = new Pool(dbConfig); // init connection

function queryData(params) {
    return new Promise((resolved, rejected) => {
        const statment = `
        SELECT 
            jsonb_build_object(
                'lat', lat, 
        'lon', lon, 
        'locationName', locationName, 
        'stationId', stationId, 
        'obsTime', COALESCE(TO_CHAR(obsTime, 'YYYYMMDDHH24MISS')), 
        'ELEV', ELEV, 
        'WDIR', WDIR, 
        'WDSD', WDSD, 
        'TEMP', TEMP, 
        'HUMD', HUMD, 
        'PRES', PRES, 
        'SUN', SUN, 
        'H_24R', H_24R, 
        'H_FX', H_FX, 
        'H_XD', H_XD, 
        'H_FXT', H_FXT, 
        'D_TX', D_TX, 
        'D_TXT', D_TXT, 
        'D_TN', D_TN, 
        'D_TNT', D_TNT, 
        'CITY', CITY, 
        'CITY_SN', CITY_SN, 
        'TOWN', TOWN, 
        'TOWN_SN', TOWN_SN
                ) AS info
                from CWBDATA 
                WHERE 
                CITY_SN = $1 AND
                obsTime BETWEEN TO_TIMESTAMP($2, 'YYYYMMDDHH24MISSMS') AND	
                    TO_TIMESTAMP($3, 'YYYYMMDDHH24MISSMS') `;

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

module.exports.queryData = queryData;
