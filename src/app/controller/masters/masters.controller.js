const Model = require("../../models");
var commonfunction = require("../commanFunctions/commanFunctions.controller");
var response = require("../../middleware/response.middleware");

// master create and update
exports.createAndUpdateMaster = async (req, res) => {
    try {
        if (!req.body.modelName) {
            return response.fail(res, "Model Name is Required", "");
        }
        if (!req.body.inputData) {
            return response.fail(res, "Input Data is Required", "");
        }
        const id = req.body.id;
        const modelName = req.body.modelName;
        var inputData = req.body.inputData;
        var relation = req.body.relation;

        if (Model[modelName]) {
            if (id) {
                // upload image function
                const uploadImage = req.body.uploadImage;
                await commonfunction.uploadImageCreateOrUpdate('update', inputData, uploadImage);

                // update data
                await Model[modelName].update(inputData, { where: { id: id, }, });

                // insert or update sub module
                const relation = req.body.relation;
                if (relation != undefined) {
                    const subModuleUpdateResponse = await commonfunction.updateMultipleRecords(id, relation);
                    if (subModuleUpdateResponse.code != 1) {
                        return response.catchError(res, subModuleUpdateResponse.message);
                    }
                }
                return response.success(res, "Record Updated", await Model[modelName].findByPk(id));
            } else {
                // insert data
                // insert sub module
                if (relation != undefined) {
                    var includeVar = relation.map((item, i) => {
                        var subIncludeVar = [];
                        if (item.subModelName != undefined && item.subModelName != "") {
                            subIncludeVar.push({ model: Model[item.subModelName], as: item.subModelName });
                        }
                        return { model: Model[item.modelName], as: item.modelName, include: subIncludeVar }
                    })
                }

                // unique number function 
                const uniqueNo = req.body.uniqueNo;
                await commonfunction.uniqueNumberCreate(inputData, uniqueNo);

                // image upload function
                const uploadImage = req.body.uploadImage;
                await commonfunction.uploadImageCreateOrUpdate('create', inputData, uploadImage);

                // insert data
                var MasterCreateDataResponse = await Model[modelName].create(inputData, { include: includeVar, });
                return response.success(res, "Record Created", MasterCreateDataResponse);
            }
        } else {
            return response.fail(res, "Invalide Model Name", "");
        }
    } catch (err) {
        console.log("err-", err);
        return response.catchError(res, err);
    }
};

// get master list
exports.getMasterList = async (req, res) => {
    try {
        if (!req.body.modelName) {
            return response.fail(res, "Model Name is Required", "");
        }
        const modelName = req.body.modelName;
        var relations = req.body.relations;
        var whereCondition = req.body.whereCondition;
        var subWhereCondition = req.body.subWhereCondition;

        if (Model[modelName]) {
            if (relations != undefined) {
                // getMasterListFunction for left join includeVar
                var includeVar = await commonfunction.getMasterListFunction(relations, subWhereCondition);
            }
            var MasterAllDataResponse = await Model[modelName].findAll({ where: whereCondition, order: [["id", "DESC"]], include: includeVar, },);

            return response.success(res, "Success", MasterAllDataResponse);
        } else {
            return response.fail(res, "Invalide Model Name", "");
        }
    } catch (err) {
        console.log("err", err);
    }
};

