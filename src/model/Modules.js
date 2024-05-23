const mongoose = require("mongoose");

const questionnaireSchema = new mongoose.Schema({
    questionID: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    question_text: {
        type: String,
        required: true
    },
    response_type: {
        type: String,
        required: true,
        enum: ['free-response', 'multiple-selection', 'single-selection' ],
    },
    answers: {
        type: String,
        required: false,
        default: null
    },
    selection: {
        type: [String],
        required: false,
        default: []
    },
    scale_value: {
        type: String,
        required: false,
        default: null
    }
});

const modulesSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        moduleNumber: {
            type: String,
            required: true,
            enum:['Module 1', 'Module 2', 'Module 3', 'Module 4', 'Module 5']
        },
        questionnaires: [questionnaireSchema],
        ai_evaluation: {
            response_text: {
                type: String,
                required: false,
                default: null
            },
            response_html: {
                type: String,
                required: false,
                default: null
            }
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    });

module.exports = mongoose.model("Modules", modulesSchema);
