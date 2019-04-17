'use strict';

const request = require('request');
const JSONPath = require('jsonpath');
const config = require('./config');
const sql = require('./sql');

module.exports.service = async (event) => {
	let options = {
		uri: "https://opendata.cwb.gov.tw/api/v1/rest/datastore/" + config.dataId + "?Authorization=" + config.accessKey,
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 10
	}

	try {
		let apiResult = await callCwb(options);
		let records = apiResult.records;
		let locations = records.location;
		let listCwbResult = [];
		let count = 0;
		for (let idx in locations) {
			let location = locations[idx];
			let bLocation = checkCity(location, config.extractCity);
			if (bLocation) {
				listCwbResult[count] = consistElem(location);
				await sql.insertData(prepareParam(listCwbResult[count]));
				count++;
			}
		}
		console.log(listCwbResult.length);
	} catch (err) {
		console.error(err);
	}
};

/*
@options = request parm setting.
@retrun =  body of result
*/
function callCwb(options) {
	return new Promise((resolved, rejected) => {
			request(options, (error, response, body) => {
					if (error) rejected(error);
					try {
							let pBody = JSON.parse(body);
							if (pBody.success === "true") {
									resolved(pBody);
							} else {
									rejected("request failed.");
							}
					} catch (err) {
							rejected(err);
					}
			});
	});
}


/*
@location = array of location.
@city = extract city
@retrun = when location is you want city will return true, if not return false
*/
function checkCity(location, city) {
	let bResult = false;
	for (let idx in city) {
			let temp = JSONPath.query(location, "$.parameter[?(@.parameterValue == '" + city[idx] + "')]");
			if (temp.length > 0) bResult = true;
	}
	return bResult;
}

function consistElem(location) {
	let result = {};
	for (let idx in location) {
			let temp = location[idx];
			if (Array.isArray(temp)) {
					temp.map(item => {
							result[Object.values(item)[0]] = Object.values(item)[1]
					});
			} else {
					if (typeof location[idx] === "string") {
							result[idx] = location[idx];
					} else {
							let time = JSONPath.query(location, "$.time['obsTime']");
							if (time.length > 0) {
									result['obsTime'] = time[0];
							}
					}
			}
	}
	return result;
}

function prepareParam(obj) {
	let list = [];
	for (let idx in obj) {
			if (obj[idx] === '-99' || obj[idx] === 'null') {
					list.push(null);
			} else {
					list.push(obj[idx]);
			}
	}
	return list;
}