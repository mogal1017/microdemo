
const Model = require("../../models");
const fs = require("fs");
const path = require("path");
const config = require("../../config/jwt.secret");
const moment = require("moment");
var http = require("http");
const axios = require('axios');
var momentfunction = require("./moment.controller");
var bcrypt = require("bcryptjs");

// unique number function
async function uniqueNumberFunction(transactionId) {
    var financialYearMasterId = 1;
    var today = new Date();
    var currentDate = moment(today).format("YYYY-MM-DD");
    // check current financial entry is in financial_year_masters or not
    var sql = `SELECT * FROM financial_year_masters WHERE ('${currentDate}' >= start_date AND '${currentDate}' <= end_date) AND is_active = 1`;
    var financialYearMasterData = await Model.sequelize.query(sql, { type: Model.sequelize.QueryTypes.SELECT, })
    var fyCode = '';
    if (financialYearMasterData.length === 0) {
        const financialYearOutput = momentfunction.calculateFinancialYear(new Date())
        fyCode = "20" + financialYearOutput;
        var startDate = moment(currentDate).format("YYYY") + '-04-01'
        var endDate = moment(currentDate).add(1, 'year').format("YYYY") + '-03-31';

        // insert into financial year master
        const financialYearMasterCreate = {
            fy_code: fyCode,
            start_date: startDate,
            end_date: endDate,
            is_active: 1
        }
        var financialYeardInsert = await Model.financial_year_masters.create(financialYearMasterCreate);
        financialYearMasterId = financialYeardInsert.dataValues.id
    } else {
        financialYearMasterId = financialYearMasterData[0].id;
        fyCode = financialYearMasterData[0].fy_code;
    }
    // check financial master entry in year master or not
    var yearTransactionMasterData = await Model.year_transaction_masters.findAll({ where: { fy_master_id: financialYearMasterId } });
    if (yearTransactionMasterData.length == 0) {
        // if not then create entry of this year transaction master
        var transactionmasterResponse = await Model.transaction_masters.findAll({ where: { is_active: 1 } });
        if (transactionmasterResponse.length > 0) {
            const yearTransactionMasterCreate = transactionmasterResponse.map((item) => ({
                fy_master_id: financialYearMasterId,
                transaction_master_id: item.transaction_id,
                transaction_series: item.transaction_name + "_" + fyCode.replace('-', ''),
                is_active: 1,
                series_start_no: 1,
            }));
            await Model.year_transaction_masters.bulkCreate(yearTransactionMasterCreate);
        }
    }

    // then again check in year transaction master
    var yearTransactionMasterResponse = await Model.year_transaction_masters.findAll({ where: { transaction_master_id: transactionId, fy_master_id: financialYearMasterId } });
    if (yearTransactionMasterResponse.length > 0) {
        const id = yearTransactionMasterResponse[0].id;
        const seriesStartNo = Number(yearTransactionMasterResponse[0].series_start_no) + 1;
        const fyMasterId = yearTransactionMasterResponse[0].fy_master_id;
        const transactionId = yearTransactionMasterResponse[0].transaction_master_id;
        const transactionSeries = yearTransactionMasterResponse[0].transaction_series;
        const uniqueId = transactionSeries + "_0" + seriesStartNo;
        const updateData = {
            fy_master_id: fyMasterId,
            transaction_master_id: transactionId,
            transaction_series: transactionSeries,
            series_start_no: seriesStartNo,
            is_active: 1,
        };
        await Model.year_transaction_masters.update(updateData, { where: { id: id }, })
        return { code: 1, data: uniqueId };
    } else {
        var transactionmasterResponse2 = await Model.transaction_masters.findAll({ where: { transaction_id: transactionId } });
        if (transactionmasterResponse2.length > 0) {
            // if transaction master having entry then create entry in year transaction masters
            const transactionMasterId = transactionmasterResponse2[0].transaction_id;
            const transactionSeries = transactionmasterResponse2[0].transaction_name + "_" + fyCode.replace('-', '');
            const uniqueId = transactionSeries + "_01";

            const yearTransactionMasterCreate = {
                fy_master_id: financialYearMasterId,
                transaction_master_id: transactionMasterId,
                transaction_series: transactionSeries,
                series_start_no: 1,
                is_active: 1,
            }
            await Model.year_transaction_masters.create(yearTransactionMasterCreate);
            return { code: 1, data: uniqueId };
        } else {
            // if no entry in transaction master then send error message
            return { code: 0, data: `Transaction Id : ${transactionId} Having No Records in transaction masters` };
        }
    }
};

// image upload function
function uploadFileFunction(base64Data, folderPath, fileName) {
    // Extract the MIME type from base64 data
    const mimeType = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/);
    const fileExtension = (mimeType && mimeType[1]) ? mimeType[1].split('/')[1] : null;

    if (!fileExtension) {
        console.error('Unable to determine file extension.');
        return { code: 0, status: 'Error determining file extension.' };
    }

    // Remove data URL prefix (e.g., "data:image/png;base64,")
    const base64File = base64Data.replace(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,/, '');

    // Create a buffer from the base64 string
    const fileBuffer = Buffer.from(base64File, 'base64');

    // Create the destination folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
    // Write the buffer to a file
    fs.writeFileSync(`${folderPath}/${fileName}.${fileExtension}`, fileBuffer);

    console.log('File uploaded successfully.');
    return { code: 1, status: 'File Uploaded', data: `${fileName}.${fileExtension}` };
}


// send mail function
function sendMailFunction(emailTo, emailCC, emailBCC, subject, body) {
    if (!emailTo) {
        callback({ code: 0, status: "Email To is Required", data: "" });
        return;
    }
    if (!subject) {
        callback({ code: 0, status: "Subject is Required", data: "" });
        return;
    }
    if (!body) {
        callback({ code: 0, status: "Mail body is Required", data: "" });
        return;
    }
    var nodemailer = require("nodemailer");
    console.log('here');
    var transporter = nodemailer.createTransport({
        host: "smtpout.secureserver.net",
        port: 587,
        secure: false,
        auth: {
            user: "invoice@yumpum.co.in",
            pass: "Yumpum@2022",
        },
    });
    var mailOptions = {
        from: "invoice@yumpum.co.in",
        to: emailTo,
        cc: emailCC,
        bcc: emailBCC,
        subject: subject,
        html: body,
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("error---", error);
            return { code: 0, status: error, data: "" };
        } else {
            console.log("Email sent: " + info.response);
            return { code: 1, status: "Email Sent", data: "" };
        }
    });
};

function smsGateWayFunction(mobile) {
    if (!mobile) {
        return { code: 0, status: "Mobile Number is Required", data: "" };
    }
    var otp = generateOTP()
    var options = {
        host: config.smsHost,
        path: config.path + mobile + "/" + otp,
    };
    const callback1 = function (response) {
        var str = "";
        response.on("data", function (chunk) {
            str += chunk;
        });
        response.on("end", function () {
            const objdata = JSON.parse(str);
            if (objdata.Status == "Success") {
                return { code: 1, status: "OTP Sent", data: "" };
            } else {
                return { code: 0, status: error, data: "" };
            }
        });
    };
    http.request(options, callback1).end();
};

// one signale push notification
function sendPushNotification(playerIds, title, message) {
    const notificationData = {
        app_id: config.app_id,
        contents: { en: message },
        headings: { en: title },
        included_segments: ['Subscribed Users'],
        included_player_ids: playerIds,
        content_available: true,
        small_icon: 'ic_notification_icon', // can not be an url
        data: {
            PushTitle: 'CUSTOM NOTIFICATION',
        },
    };

    axios.post(config.onesignale_push_notification_url, notificationData, {
        headers: {
            'Authorization': config.authorization,
            'Content-Type': 'application/json'
        }
    }).then(response => {
        return { code: 1, status: "Notification Sent.", data: "" };
    }).catch(error => {
        return { code: 0, status: 'Error sending push notification:', data: "" };
    });
}

// graphql
async function graphql(endpoint, operationName, query, variables) {
    const headers = {
        "content-type": "application/json",
        Authorization: config.graphql_authorization,
    };
    const graphqlQuery = {
        operationName: operationName,
        query: query,
        variables: variables,
    };

    const options = {
        method: "POST",
        headers: headers,
        body: JSON.stringify(graphqlQuery),
    };
    const response1 = await fetch(endpoint, options);
    const data = await response1.json();
    if (data.data) {
        return { code: 1, status: "Success", data: data.data };
    } else {
        return { code: 0, status: "Fail", data: [] };
    }
};

// whatapp message send
async function whatAppMessageSend(orderData) {
    var recipient = orderData.recipient
    var sendData = getTextMessageInput(recipient, 'Welcome to the Movie Ticket Demo App for Node.js!');
    await sendMessage(sendData);
};

async function sqlQueryResponse(sqlQuery) {
    const responseData = await Model.sequelize.query(sqlQuery, { type: Model.sequelize.QueryTypes.SELECT, });
    if (responseData.length > 0) {
        return { code: 1, data: responseData }
    } else {
        return { code: 0, data: [] }
    }
}

// generate uniquenumber
function generateUniqueNumber() {
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${timestamp}-${randomNumber}`;
}
// generate otp
function generateOTP() {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return randomNumber;
}
function searchItem(item, query) {
    return Object.values(item).some(value => {
        if (Array.isArray(value)) {
            return value.some(arrayValue => searchItem(arrayValue, query));
        }

        if (typeof value === 'string' || typeof value === 'number') {
            const stringValue = String(value).toLowerCase();
            return stringValue.includes(query.toLowerCase());
        }

        return false;
    });
}

// search functionality
function searchItems(items, query) {
    const filteredItems = items.filter(item => searchItem(item, query));
    return filteredItems;
}
// pagination function
function paginateResults(results, page, limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedResults = results.slice(startIndex, endIndex);
    return paginatedResults;
}
function getMasterListFunction(originalArray, subWhereCondition) {
    const includeVar = originalArray.map((item) => {
        var subIncludeVar = [];
        var subSubIncludeVar = [];
        if (item.subSubModule != undefined && item.subSubModule != "") {
            subSubIncludeVar.push({ model: Model[item.subSubModule], as: item.subSubModule, required: item.required ? item.required : false });
        }
        if (item.subModule != undefined && item.subModule != "") {
            subIncludeVar.push({ model: Model[item.subModule], as: item.subModule, required: item.required ? item.required : false, include: subSubIncludeVar });
        }
        return { model: Model[item.module], as: item.moduleas, required: item.required ? item.required : false, include: subIncludeVar, where: subWhereCondition }
    });
    return includeVar;
}

// master create update functions

// unique number create or update function
async function uniqueNumberCreate(inputData, uniqueNo) {
    if (uniqueNo != undefined) {
        const transactionId = uniqueNo.transactionId;
        const field_name = uniqueNo.field_name;
        // command function for unique number
        const uniqueNumberResponse = await uniqueNumberFunction(transactionId);
        if (uniqueNumberResponse.code === 1) {
            inputData[field_name] = uniqueNumberResponse.data;
        }
        return 1;
    } else {
        return 1;
    }
}

// image upload create or update function
async function uploadImageCreateOrUpdate(type, inputData, uploadImage) {
    if (uploadImage != undefined) {
        const imageBase64Data = uploadImage.imagePath;
        // check that given image path is base 64 or not if yes then only update that image
        const folderPath = uploadImage.folderPath;
        const imageFileName = generateUniqueNumber();
        const field_name = uploadImage.field_name;
        if (type == 'update') {
            if (isValidBase64Path(imageBase64Data)) {
                const uploadResponse = await uploadFileFunction(imageBase64Data, folderPath, imageFileName);
                if (uploadResponse.code == 1) {
                    inputData[field_name] = uploadResponse.data;
                }
            } else {
                inputData[field_name] = imageBase64Data;
            }
        }
        if (type == 'create') {
            const uploadResponse = await uploadFileFunction(imageBase64Data, folderPath, imageFileName);
            if (uploadResponse.code == 1) {
                inputData[field_name] = uploadResponse.data;
            }
            if (isValidBase64Path(imageBase64Data)) {

            }
        }

        return 1;
    } else {
        return 1;
    }
}

// Update multiple records in a single query
async function updateMultipleRecords(id, relation) {
    try {
        // second means sub module update or create
        const subModelName = relation.subModelName
        const subSubModelName = relation.subSubModelName
        const subModelInputData = relation.subModelInputData
        if (subModelName != undefined || subModelInputData != undefined) {
            await Promise.all(
                subModelInputData.map(async (record) => {
                    // Update or create the record based on the condition
                    record[relation.subModelForeignKey] = id;
                    record.id !== undefined
                        ? await Model[subModelName].update(record, { where: { id: record.id } })
                        : await Model[subModelName].create(record);

                    // sub sub model input data
                    const subSubModelInputData = record.subSubModelInputData
                    if (subSubModelName != undefined || subSubModelInputData != undefined) {
                        const updateSubSubModelResponse =
                            subSubModelInputData.map(record =>
                                record.id != undefined ?
                                    Model[subSubModelName].update(record, { where: { id: record.id } }) :
                                    Model[subSubModelName].create(record)
                            );
                        await Promise.all(updateSubSubModelResponse);
                    }
                })
            );
        }
        return { code: 1, message: "Updated!" }
    } catch (error) {
        console.log("error", error);
        return { code: 0, message: error }
    }
};

// check image base 64 path is valid or not
function isValidBase64Path(path) {
    // Remove any data URL prefixes if present
    const base64String = path.replace(/^data:[a-z]+\/[a-z]+;base64,/, '');

    // Create a regular expression pattern to match Base64 strings
    const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;

    // Check if the path matches the Base64 pattern
    if (!base64Pattern.test(base64String)) {
        return false;
    }

    // Check if the base64 string can be decoded by attempting to create a buffer
    try {
        Buffer.from(base64String, 'base64');
        return true;
    } catch (error) {
        return false;
    }
}


async function serverSideLoading(sql, start, length, searchValue) {
    var MasterResponse = await Model.sequelize.query(sql, { type: Model.sequelize.QueryTypes.SELECT, });
    if (MasterResponse.length > 0) {
        const recordsTotal = MasterResponse.length;
        // search code
        var isSearch = false;
        if (searchValue != '') {
            isSearch = true;
            const allItems = JSON.parse(JSON.stringify(MasterResponse));
            const searchQuery = searchValue
            MasterResponse = allItems.filter(item => searchItem(item, searchQuery));
        }
        // pagination code
        if (isSearch == false) {
            sql += ` LIMIT ${start}, ${length}`;
            const skuMasterLimitResponse = await Model.sequelize.query(sql, { type: Model.sequelize.QueryTypes.SELECT, });
            MasterResponse = skuMasterLimitResponse
        }
        return {
            code: 1,
            count: recordsTotal,
            data: MasterResponse,
        }
    } else {
        return { code: 0 }
    }
}

async function masterListPaginationFunction(MasterAllDataResponse, pagination, search) {
    const recordLength = MasterAllDataResponse.length;
    // search functionality
    var isSearch = false;
    if (search != undefined) {
        isSearch = true;
        const allItems = JSON.parse(JSON.stringify(MasterAllDataResponse));
        const searchQuery = search.searchName != undefined ? search.searchName : '';
        MasterAllDataResponse = await searchItems(allItems, searchQuery);
    }
    // pagination code
    if (isSearch == false) {
        if (pagination != undefined) {
            const startIndex = pagination.startIndex != undefined ? Number(pagination.startIndex) : 1;; // Starting index
            const length = pagination.itemsPerPage != undefined ? Number(pagination.itemsPerPage) : 10;; // Number of elements to extract
            const limitedArray = MasterAllDataResponse.slice(startIndex, startIndex + length);
            MasterAllDataResponse = limitedArray
        }
    }
    return { recordLength, MasterAllDataResponse }
}

// example();

function getDatesArray(startDateStr, endDateStr) {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    const datesArray = [];

    // Loop through each date and push into the array
    let currentDate = startDate;
    while (currentDate <= endDate) {
        const formattedDate = currentDate.toISOString().slice(0, 10);
        datesArray.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return datesArray;
}

const startDateStr = '2023-07-01';
const endDateStr = '2023-07-21';

const datesArray = getDatesArray(startDateStr, endDateStr);

// The datesArray will contain each date from '2023-07-01' to '2023-07-21' in yyyy-mm-dd format
async function encryptedFunction(inputData, encryptedData) {
    try {
        const encrypted_value = encryptedData.encrypted_value;
        const field_name = encryptedData.encrypted_field_name;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(encrypted_value, salt);
        inputData[field_name] = hashedPassword;
        return 1;
    } catch (err) {
        console.log("err", err);
    }
}


module.exports = {
    uniqueNumberFunction, generateUniqueNumber, generateOTP, uploadFileFunction, smsGateWayFunction, sendMailFunction, searchItems, paginateResults,
    sendPushNotification, graphql, sqlQueryResponse, getMasterListFunction, isValidBase64Path, updateMultipleRecords,
    uploadImageCreateOrUpdate, uniqueNumberCreate, serverSideLoading, masterListPaginationFunction, getDatesArray, encryptedFunction
};



