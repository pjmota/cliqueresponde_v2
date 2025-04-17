import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import Tag from "../../models/Tag";
import Permission from "../../models/Permission";

const ShowUserService = async (id: string | number, companyId?: string | number): Promise<User> => {
  const user = await User.findOne(
    {
      where: {
        id,
        companyId
      },
      attributes: [
        "id",
        "name",
        "email",
        "profile",
        "profileImage",
        "super",
        "whatsappId",
        "online",
        "startWork",
        "endWork",
        "allTicket",
        "companyId",
        "tokenVersion",
        "defaultTheme",
        "allowGroup",
        "defaultMenu",
        "farewellMessage",
        "userClosePendingTicket",
        "showDashboard",
        "defaultTicketsManagerWidth",
        "allUserChat",
        "allHistoric",
        "allowRealTime",
        "allowConnections",
        "allTicketsQueuesWaiting",
        "allTicketsQueuesAttending",
        "sendWhatsAppInLeadMessage",
        "leadMessage",
        "tokenWhats",
        "userWhats",
        "scheduleSendAt",
        "scheduleNotifyBeforeText",
        "scheduleNotifyBefore",
        "scheduleNotifyNowText",
        "daysUntilNextScheduleNotify",
        "scheduleConnection"
      ],
      include: [
        { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
        { model: Tag, as: "tags", attributes: ["id", "name", "color"] },
        {
          model: Permission,
          as: "permissions",
          attributes: ["id", "name", "code"]
        },
        {
          model: Company,
          as: "company",
          attributes: ["id", "name", "dueDate", "document"],
          include: [
            {
              model: Plan, as: "plan",
              attributes: ["id",
                "name",
                "amount",
                "useWhatsapp",
                "useFacebook",
                "useInstagram",
                "useCampaigns",
                "useSchedules",
                "useInternalChat",
                "useExternalApi",
                "useIntegrations",
                "useOpenAi",
                "useKanban"
              ]
            },
          ]
        },
      ],
      //logging: console.log
    });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return user;
};

export default ShowUserService;
