import { Op, Sequelize } from "sequelize";
import AppError from "../../errors/AppError";
import UserTag from "../../models/UserTags";

const ListUserTagServices = async (queueId: string | number): Promise<UserTag> => {
    const userTag = await UserTag.findOne({
        where: {
            queueId: {
                [Op.or]: [queueId]
            }
        },
        order: Sequelize.literal('random()')
    });

    if (!userTag) {
        throw new AppError("ERR_NOT_FOUND_USER_IN_TAG", 404);
    }

    return userTag;
};

export default ListUserTagServices;
