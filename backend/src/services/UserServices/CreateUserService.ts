import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../models/User";
import Plan from "../../models/Plan";
import Company from "../../models/Company";

interface Request {
  email: string;
  password: string;
  name: string;
  queueIds?: number[];
  tagsIds?: number[];
  permissionsIds?: number[];
  companyId?: number;
  profile?: string;
  startWork?: string;
  endWork?: string;
  whatsappId?: number;
  allTicket?: string;
  defaultTheme?: string;
  defaultMenu?: string;
  allowGroup?: boolean;
  allHistoric?: string;
  allUserChat?: string;
  userClosePendingTicket?: string;
  showDashboard?: string;
  defaultTicketsManagerWidth?: number;
  allowRealTime?: string;
  allowConnections?: string;
  allTicketsQueuesWaiting?: string;
  allTicketsQueuesAttending?: string;
  sendWhatsAppInLeadMessage?: string;
  leadMessage?: string;
  tokenWhats?: string;
  userWhats?: string;
  scheduleNotifyBeforeText?:string;
  scheduleNotifyNowText?:string;
  scheduleNotifyBefore?:string;
  scheduleSendAt?:Date;
  daysUntilNextScheduleNotify?: number;
  scheduleConnection?: number;
  viewAllContacts?: string;
  allowAfterSales?: boolean;
  isAfterSalesManager?: boolean;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
}

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  tagsIds = [],
  permissionsIds = [],
  companyId,
  profile = "admin",
  startWork,
  endWork,
  whatsappId,
  allTicket,
  defaultTheme,
  defaultMenu,
  allowGroup,
  allHistoric,
  allUserChat,
  userClosePendingTicket,
  showDashboard,
  defaultTicketsManagerWidth = 550,
  allowRealTime,
  allowConnections,
  allTicketsQueuesWaiting,
  allTicketsQueuesAttending,
  sendWhatsAppInLeadMessage,
  leadMessage,
  tokenWhats,
  userWhats,
  scheduleNotifyBeforeText,
  scheduleNotifyNowText,
  scheduleNotifyBefore,
  scheduleSendAt,
  daysUntilNextScheduleNotify,
  scheduleConnection,
  viewAllContacts,
  allowAfterSales,
  isAfterSalesManager
}: Request): Promise<Response> => {
  if (companyId !== undefined) {
    const company = await Company.findOne({
      where: {
        id: companyId
      },
      include: [{ model: Plan, as: "plan" }]
    });

    if (company !== null) {
      const usersCount = await User.count({
        where: {
          companyId
        }
      });

      if (usersCount >= company.plan.users) {
        throw new AppError(
          `Número máximo de usuários já alcançado: ${usersCount}`
        );
      }
    }
  }

  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    allHistoric: Yup.string(),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "An user with this email already exists.",
        async value => {
          if (!value) return false;
          const emailExists = await User.findOne({
            where: { email: value }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate({ email, password, name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const user = await User.create(
    {
      email,
      password,
      name,
      companyId,
      profile,
      startWork,
      endWork,
      whatsappId: whatsappId || null,
      allTicket,
      defaultTheme,
      defaultMenu,
      allowGroup,
      allHistoric,
      allUserChat,
      userClosePendingTicket,
      showDashboard,
      defaultTicketsManagerWidth,
      allowRealTime,
      allowConnections,
      allTicketsQueuesWaiting,
      allTicketsQueuesAttending,
      sendWhatsAppInLeadMessage,
      leadMessage,
      tokenWhats,
      userWhats,
      scheduleNotifyBeforeText,
      scheduleNotifyNowText,
      scheduleNotifyBefore,
      scheduleSendAt,
      daysUntilNextScheduleNotify,
      scheduleConnection,
      viewAllContacts,
      allowAfterSales,
      isAfterSalesManager
    },
    { include: ["queues", "company", "tags", "permissions"] }
  );

  await user.$set("queues", queueIds);
  await user.$set("tags", tagsIds);
  await user.$set("permissions", permissionsIds);

  await user.reload();

  const serializedUser = SerializeUser(user);

  return serializedUser;
};

export default CreateUserService;
