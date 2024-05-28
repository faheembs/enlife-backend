const httpStatus = require("http-status");
const { ModulesModel } = require("../model");
const catchAsync = require("../utils/ApiHandler");
const ApiError = require("../utils/ErrorHandler");
const { default: mongoose } = require("mongoose");

const { default: OpenAI } = require("openai");

const default_model = "gpt-3.5-turbo";

// const configuration = Configuration({
//   organization: process.env.OPENAI_ORG_ID,
//   apiKey: process.env.OPENAI_SECRET_KEY,
// });
// const openai = new OpenAIApi(configuration);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_SECRET_KEY,
});

const completionModal = async (prompt, model = default_model) => {
  try {
    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      temperature: 0.42,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return completion?.choices[0]?.text;
  } catch (err) {
    return err;
  }
};

const createOrUpdateModule = catchAsync(async (req, res) => {
  try {
    const {
      moduleNumber,
      userId,
      questionnaires: inputQuestionnaires,
    } = req.body;
    if (!moduleNumber || !userId || !inputQuestionnaires) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const questionnaires = Array.isArray(inputQuestionnaires)
      ? inputQuestionnaires
      : [inputQuestionnaires];

    let module = await ModulesModel.findOne({ user: userId, moduleNumber });

    if (!module) {
      module = new ModulesModel({
        user: userId,
        moduleNumber,
        questionnaires: [],
      });
    }

    let updatesNeeded = false;

    questionnaires.forEach((newQuestionnaire) => {
      if (!newQuestionnaire.questionID) {
        newQuestionnaire.questionID = new mongoose.Types.ObjectId();
      }

      const index = module.questionnaires.findIndex(
        (q) => q._id.toString() === newQuestionnaire.questionID.toString()
      );

      if (index !== -1) {
        // Update existing questionnaire
        const existingQuestionnaire = module.questionnaires[index];
        const isSame =
          existingQuestionnaire.response_type ===
            newQuestionnaire.response_type &&
          existingQuestionnaire.question_text ===
            newQuestionnaire.question_text &&
          JSON.stringify(existingQuestionnaire.answers) ===
            JSON.stringify(newQuestionnaire.answers) &&
          JSON.stringify(existingQuestionnaire.selection) ===
            JSON.stringify(newQuestionnaire.selection || []) &&
          existingQuestionnaire.scale_value ===
            (newQuestionnaire.scale_value || null);

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
      res.status(200).json({
        message:
          "No updates necessary; all questionnaires match existing data.",
      });
    }
  } catch (error) {
    console.error("Error creating or updating module:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Internal server error while updating module.",
      true
    );
  }
});

const getQuestionIdByQuestionText = catchAsync(async (req, res) => {
  try {
    const { question, userId, moduleNumber } = req.body;
    if (!question || !userId || !moduleNumber) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Missing required fields.",
        true
      );
    }

    let module = await ModulesModel.findOne({
      user: userId,
      moduleNumber,
      questionnaires: { $elemMatch: { question_text: question } },
    }).select({
      questionnaires: { $elemMatch: { question_text: question } },
    });
    // .select('questionnaires');
    // console.log(module)
    if (module) {
      res.status(200).json({
        data: module.questionnaires[0],
        success: true,
      });
    } else {
      res.status(404).json({
        message: "not found",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error :", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Internal server error.",
      true
    );
  }
});

const getAllModulesByUserId = catchAsync(async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "User id is required.", true);
    }

    let module = await ModulesModel.find({ user: userId });

    if (module) {
      res.status(200).json({
        data: module,
        success: true,
      });
    } else {
      res.status(404).json({
        message: "This user has no questionnaires",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error creating or updating module:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Internal server error while updating module.",
      true
    );
  }
});

const removeHtmlTags = (input) => {
  if (typeof input !== "string") {
    throw new TypeError("Expected a string as input");
  }
  return input.replace(/<\/?[^>]+(>|$)/g, "");
};

const postAssessmentByModuleId = catchAsync(async (req, res) => {
  try {
    const { moduleId, userId } = req.body;

    let module = await ModulesModel.findOne({
      user: userId,
      moduleNumber: moduleId,
    });

    if (!module) {
      return res.status(404).json({
        data: null,
        success: false,
        message: "Module not found",
      });
    }

    // const q1 = `Let's visualize this setting: It is very early in the morning, and the day is about to break over the ocean. You're looking at the horizon and thinking about what is most important in your life. You think about what society wants you to be, the ideal people you see in the advertisements, and who your family and friends want you to be. They are not right or wrong. You don't fight with these opinions. You simply accept them as opinions. Thank them and put all of those images aside.Then you focus on what is really important for you. This is your journey and yours alone. You reach deep inside to see what you value most. When you get closer to the things that are important to you, excitement and a sense of urgency fill your heart. Now you remember the things you care about. You would work on these things even when things get tough.
    // What are the things that are most important for you?
    // (For example, being honest, adventurous, fun, hard-working, a leader, keep growing and improving, funny)(please note that being successful, wealthy, happy, etc., are important for most people, but they are generally byproducts of what we do. Not our core values. So here, let's try focusing on values rather than outcomes)`;

    let prompt = `Analyze the user's answers and context provided to identify their top 3 core values in order of importance. Include explanations and suggest additional values if applicable. Core values and definitions: 


    User Asked this question as below """`;
    // """Qustion 1: ${q1}, Question 2: ${q2}, Question 3: ${q3} Question 4: ${q4} Question 5: ${q5}"""

    module.questionnaires.forEach(
      (q, index) => (prompt += ` Qustion ${index + 1}: ${q.question_text},`)
    );

    `""" User's answers with weights:"""`;

    module.questionnaires.forEach(
      (q, index) => (prompt += ` Answer ${index + 1}: ${q.answers},`)
    );
    // Object.keys(answers).forEach(
    //   (a, index) => (prompt += ` Answer ${index + 1}: ${answers[a]}`)
    // );

    prompt += `"""Speak directly to the user.
    
    Format:
    Your three core values are: Core Value 1, Core Value 2, Core Value 3 (in
    order of importance/relevance)
    · Core Value 1: Explanation for Core Value 1.
    · Core Value 2: Explanation for Core Value 2.
    · Core Value 3: Explanation for Core Value 3
         
    Additional applicable core values: Core Value 4, Core Value
    
    Output need to be in HTML5 code`;

    const response = await completionModal(prompt);

    module.ai_evaluation = {
      response_text:
        removeHtmlTags(response) || module.ai_evaluation.response_text,
      response_html: response || module.ai_evaluation.response_html,
    };

    await module.save();

    res.status(200).json({
      data: response,
      success: true,
    });
  } catch (error) {
    console.error("Error creating or updating module:", error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Internal server error while updating module.",
      true
    );
  }
});

module.exports = {
  createOrUpdateModule,
  getQuestionIdByQuestionText,
  getAllModulesByUserId,
  postAssessmentByModuleId,
};
