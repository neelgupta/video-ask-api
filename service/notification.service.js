const { modelName } = require("../utils/constant");
const mongoService = require("../config/mongoService");

const get_team_invitation = async (email) => {
  try {
    const pipeline = [
      {
        $match: {
          member_email: email,
          invitation_status: "pending",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "added_by",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];
    return await mongoService.aggregation(
      modelName.ORGANIZATION_MEMBER,
      pipeline
    );
  } catch (error) {
    return error;
  }
};

module.exports = {
  get_team_invitation,
};
