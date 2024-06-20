const { FeedbackModel } = require("../model");
const catchAsync = require("../utils/ApiHandler");
const ApiError = require("../utils/ErrorHandler");

const postFeedback = catchAsync(async (req, res) => {
    try {
        const { userId, feedbackText } = req.body;

        if (!userId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User id is required.", true);
        }
        const feedbacks = await FeedbackModel.findOne({ user: userId });
        if (feedbacks) {
            res.status(409).json({
                message: "Feedback Already submitted",
                success: false,
            });
            return;
        }
        if (feedbackText) {
            const feedback = new FeedbackModel({
                user: userId,
                feedback_response: feedbackText,
            });

            await feedback.save();

            res.status(200).json({
                feedback: feedback,
                success: true,
            });
        } else {
            res.status(400).json({
                message: "Feedback text is required.",
                success: false,
            });
        }
    } catch (error) {
        console.error("Error while posting feedback:", error);
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Internal server error while posting feedback.",
            true
        );
    }
});

const getFeedbackByUserId = catchAsync(async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(httpStatus.BAD_REQUEST, "User ID is required.", true);
        }

        const feedbacks = await FeedbackModel.findOne({ user: userId });

        if (!feedbacks) {
            res.status(404).json({
                message: "No feedback found for this user.",
                success: false,
            });
            return;
        }

        res.status(200).json({
            feedbacks,
            success: true,
        });
    } catch (error) {
        console.error("Error retrieving feedback:", error);
        throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Internal server error while retrieving feedback.",
            true
        );
    }
});

module.exports = {
    postFeedback,
    getFeedbackByUserId
};
