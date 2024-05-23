const httpStatus = require('http-status');
const { ModulesModel } = require('../model');
const catchAsync = require('../utils/ApiHandler');
const ApiError = require('../utils/ErrorHandler');
const { default: mongoose } = require('mongoose');

const createOrUpdateModule = catchAsync(async (req, res) => {
    try {
        const { moduleNumber, userId, questionnaires: inputQuestionnaires } = req.body;
        if (!moduleNumber || !userId || !inputQuestionnaires) {
            return res.status(400).json({ message: "Missing required fields." });
        }

        const questionnaires = Array.isArray(inputQuestionnaires) ? inputQuestionnaires : [inputQuestionnaires];

        let module = await ModulesModel.findOne({ user: userId, moduleNumber });

        if (!module) {
            module = new ModulesModel({
                user: userId,
                moduleNumber,
                questionnaires: []
            });
        }

        let updatesNeeded = false;

        questionnaires.forEach(newQuestionnaire => {
            if (!newQuestionnaire.questionID) {
                newQuestionnaire.questionID = new mongoose.Types.ObjectId();
            }

            const index = module.questionnaires.findIndex(q => q.questionID.toString() === newQuestionnaire.questionID.toString());

            if (index !== -1) {
                // Update existing questionnaire
                const existingQuestionnaire = module.questionnaires[index];
                const isSame = existingQuestionnaire.response_type === newQuestionnaire.response_type &&
                    existingQuestionnaire.question_text === newQuestionnaire.question_text &&
                    JSON.stringify(existingQuestionnaire.answers) === JSON.stringify(newQuestionnaire.answers) &&
                    JSON.stringify(existingQuestionnaire.selection) === JSON.stringify(newQuestionnaire.selection || []) &&
                    existingQuestionnaire.scale_value === (newQuestionnaire.scale_value || null);

                if (!isSame) {
                    Object.assign(existingQuestionnaire, newQuestionnaire);
                    updatesNeeded = true;
                }
            } else {
                // Add new questionnaire
                module.questionnaires.push(newQuestionnaire);
                updatesNeeded = true;
            }
        });

        if (updatesNeeded) {
            const updatedModule = await module.save();
            res.status(200).json(updatedModule);
        } else {
            res.status(200).json({ message: "No updates necessary; all questionnaires match existing data." });
        }
    } catch (error) {
        console.error('Error creating or updating module:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error while updating module.", true);
    }
});

const getQuestionIdByQuestionText = catchAsync(async (req, res) => {
    try {
        const { question, userId, moduleNumber } = req.body
        if (!question || !userId || !moduleNumber) {
            throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields.", true)
        }

        let module = await ModulesModel.findOne({ user: userId, moduleNumber, questionnaires: { $elemMatch: { question_text: question } } }).select({
            'questionnaires': { $elemMatch: { question_text: question } }
        });
        // .select('questionnaires');

        if (module) {
            res.status(200).json({
                data: module.questionnaires[0],
                success: true
            });
        } else {
            res.status(404).json({
                message: "Data with this question not found",
                success: true
            });
        }


    } catch (error) {
        console.error('Error creating or updating module:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error while updating module.", true);
    }


})

const getAllModulesByUserId = catchAsync(async (req, res) => {
    try {
        const { userId } = req.params
        if (!userId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User id is required.", true)
        }

        let module = await ModulesModel.findOne({ user: userId });


        if (module) {
            res.status(200).json({
                data: module,
                success: true
            });
        } else {
            res.status(404).json({
                message: "This user has no questionnaires",
                success: true
            });
        }


    } catch (error) {
        console.error('Error creating or updating module:', error);
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Internal server error while updating module.", true);
    }


})


module.exports = {
    createOrUpdateModule,
    getQuestionIdByQuestionText,
    getAllModulesByUserId
};