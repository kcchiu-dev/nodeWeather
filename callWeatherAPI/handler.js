'use strict';
const moment = require("moment-timezone");
const sql = require("./sql");

module.exports.service = async (event) => {

	let logFun = {};
	logFun.info = function (comment) {
		let time = moment().tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss.SSS");
		if (typeof comment === 'object') {
			comment = JSON.stringify(comment);
		}
		console.log(time + " [INFO] - " + comment);
	}
	logFun.error = function (comment, errorCode = "0.0.0.0") {
		let time = moment().tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss.SSS");
		if (typeof comment === 'object') {
			comment = JSON.stringify(comment);
		}
		console.log(time + " [ERROR][" + errorCode + "] - " + comment);
	}

	try {
		logFun.info(event);
		let queryParam = event.queryStringParameters;
		// check value
		let errorDetails = await validFormat(queryParam);
		if (errorDetails !== "") {
			return {
				statusCode: 400,
				body: JSON.stringify({
					errorDetails: errorDetails
				})
			};
		}
		let list = [];
		list.push(queryParam.cityId);
		list.push(queryParam.fromTime);
		list.push(queryParam.toTime);
		let data = await sql.queryData(list);
		console.log(data);
		return {
			statusCode: 200,
			body: JSON.stringify({
				data: data
			})
		};
		// check default setting:
	} catch (err) {
		console.log(err);
	}

	function validFormat(queryParam) {

		return new Promise((resolved, rejected) => {
			let paramCount = 0;
			let errorDetails = '';
			let cityId = '';
			let fromTime = '';
			let toTime = '';
			for (let key in queryParam) {
				console.log(key);
				switch (key) {
					case 'cityId':
						cityId = queryParam[key];
						break;
					case 'fromTime':
						fromTime = queryParam[key];
						break;
					case 'toTime':
						toTime = queryParam[key];
						break;
					default:
						paramCount++;
						break;
				}
			}
			console.log("cityId : " + cityId);
			console.log("fromTime : " + fromTime);
			console.log("toTime : " + toTime);
			console.log("paramCount : " + paramCount);
			// check query parameter include pageId only
			if (paramCount > 0) {
				errorDetails = 'Bad Request. query parameter should include cityId, fromTime, toTime only.';
				resolved(errorDetails);
			}

			if (paramCount === 0) {
				if (cityId !== '') {
					let regexp = /^\d{2}$/
					let bCityId = regexp.test(cityId);
					if (!bCityId) {
						errorDetails = 'Bad Request. query parameter cityId must be 2 digit.';
						resolved(errorDetails);
					}
				} else {
					errorDetails = 'Bad Request. query parameter must have cityId';
					resolved(errorDetails);
				}

				if (fromTime !== '' && toTime !== '') {
					let bFromTime = moment(fromTime, 'YYYYMMDDHHmmss', true).isValid();
					let bToTime = moment(toTime, 'YYYYMMDDHHmmss', true).isValid();
					if (!bFromTime || !bToTime) {
						errorDetails = 'Bad Request. Date format is must match YYYYMMDDHHmmss.';
						logFun.error(errorDetails);
						resolved(errorDetails);
					}

					// check toTime is large to fromtime
					let calTime = moment(toTime, 'YYYYMMDDHHmmss').diff(moment(fromTime, 'YYYYMMDDHHmmss'));
					if (calTime < 0) {
						errorDetails = 'Bad Request. toTime must be large than fromTime';
						logFun.error(errorDetails);
						resolved(errorDetails);
					}
				} else {
					errorDetails = 'Bad Request. query parameter must have fromTime and toTime.';
					logFun.error(errorDetails);
					resolved(errorDetails);
				}
			}
			if(errorDetails === ''){
				resolved('');
			}
		});
	}
};


