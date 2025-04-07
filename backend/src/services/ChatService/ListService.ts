import { Op } from "sequelize";
import Chat from "../../models/Chat";
import ChatUser from "../../models/ChatUser";
import User from "../../models/User";

interface Request {
  ownerId: number;
  pageNumber?: string;
  users?: number[];
  limitChat?: number;
  
}

interface Response {
  records: Chat[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  ownerId,
  pageNumber = "1",
  limitChat,
  users,
  
}: Request): Promise<Response> => {
  const user = await User.findOne({where: { id: ownerId }});
  let chatUsers = [];

  if (!user.super && user.profile !== 'admin'){
    chatUsers = await ChatUser.findAll({
      where: { userId: ownerId }
    });

  }  else if (Array.isArray(users) && users?.length) {
    chatUsers = await ChatUser.findAll({
      where: { userId: {
        [Op.in]: users
        },
        
      }
    });
  } else {
    chatUsers = await ChatUser.findAll();
  }

  
  const chatIds = [...new Set(chatUsers.map(chat => chat.chatId))];
  
  const limit = limitChat? limitChat : 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: records } = await Chat.findAndCountAll({
    where: {
      id: {
        [Op.in]: chatIds
      },
      companyId: user.companyId
    },
    include: [
      { model: User, as: "owner" },
      { model: ChatUser, as: "users", include: [{ model: User, as: "user" }] }
    ],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const hasMore = count > offset + records.length;

  return {
    records,
    count,
    hasMore
  };
};

export default ListService;
