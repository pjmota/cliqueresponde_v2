import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
import User from "../../models/User";
import ShowContactByNumberService from "../ContactServices/ShowContactByNumberService";
import CreateContactService from "../ContactServices/CreateContactService";
import ShowUserService from "../UserServices/ShowUserService";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import Tag from "../../models/Tag";
import TicketTag from "../../models/TicketTag";
import FindNotesByContactIdAndTicketId from "../TicketNoteService/FindNotesByContactIdAndTicketId";
import TicketNote from "../../models/TicketNote";

interface Request {
  body: string;
  sendAt: string;
  contactId: number | string;
  companyId: number | string;
  userId?: number | string;
  ticketUserId?: number | string;
  queueId?: number | string;
  openTicket?: string;
  statusTicket?: string;
  whatsappId?: number | string;
  intervalo?: number;
  valorIntervalo?: number;
  enviarQuantasVezes?: number;
  tipoDias?: number;
  contadorEnvio?: number;
  assinar?: boolean;
  justNotifyMe?: boolean;
  ticketId?: number | string;
  notifyBefore?: number;
  notifyBeforeText?:string,
  notifyNowText?:string,
}

const CreateService = async ({
  body,
  sendAt,
  contactId,
  companyId,
  userId,
  ticketUserId,
  queueId,
  openTicket,
  statusTicket,
  whatsappId,
  intervalo,
  valorIntervalo,
  enviarQuantasVezes,
  tipoDias,
  assinar,
  contadorEnvio,
  justNotifyMe,
  ticketId = null,
  notifyBefore = 0,
  notifyBeforeText,
  notifyNowText,
}: Request): Promise<void | Schedule> => {

  const user = await ShowUserService(userId, companyId as number);
  /* console.log("REQUEST:", {
    body,
    sendAt,
    contactId,
    companyId,
    userId,
    ticketUserId,
    queueId,
    openTicket,
    statusTicket,
    whatsappId,
    intervalo,
    valorIntervalo,
    enviarQuantasVezes,
    tipoDias,
    assinar,
    contadorEnvio,
    justNotifyMe,
    ticketId,
    notifyBefore
  }) */

  const schema = Yup.object().shape({
    body: !justNotifyMe ? Yup.string().required().min(5) : Yup.string(), //Se for just notify me, não precisa de body
    sendAt: Yup.string().required()
  });

  try {
    await schema.validate({ body, sendAt });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (justNotifyMe) {
    //se o sendAt for menor que a data atual, não pode criar o agendamento joga para o proximo dia

    const date = new Date(sendAt);
    const now = new Date();
    if (date < now) {
      console.log("Data menor que a data atual, jogando para o proximo dia");
      date.setDate(date.getDate() + 1);
      sendAt = date.toISOString();
    }
    return await justNotifyMeFunc(
      userId,
      companyId,
      contactId,
      sendAt,
      notifyBefore,
      whatsappId,
      ticketId
    );
  }



  const schedule = await Schedule.create(
    {
      body,
      sendAt,
      contactId,
      companyId,
      userId,
      status: 'PENDENTE',
      ticketUserId,
      queueId,
      openTicket,
      statusTicket,
      whatsappId,
      intervalo,
      valorIntervalo,
      enviarQuantasVezes,
      tipoDias,
      assinar,
      contadorEnvio,
      justNotifyMe,
      ticketId
    }
  );

  if (notifyBefore && notifyBeforeText) {
    console.log("notifyBefore && notifyBeforeText", {
      notifyBefore,
      notifyBeforeText
    });
    const sendAtBefore = new Date(sendAt);

    sendAtBefore.setMinutes(sendAtBefore.getMinutes() - notifyBefore);

    
    await (async function (id) {
      try {
        await Schedule.create({
          body: notifyBeforeText,
          sendAt: sendAtBefore.toUTCString(),
          contactId: id,
          companyId,
          userId,
          status: "PENDENTE",
          type: "BEFORE",
          whatsappId,
          ticketId,
          justNotifyMe: false,
          openTicket
        });
      } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
          throw new AppError("Já há agendamentos com os dados informados.");
        }
      }
    })(contactId);

    try {
      await createScheduleToMe(
        
        user,
        notifyBeforeText,
        sendAtBefore.toUTCString(),
        +companyId,
        +userId,
        "BEFORE",
        false, //notifyMe,
        whatsappId as number,
        ticketId as number,
        openTicket
      );
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new AppError("Já há agendamentos com os dados informados.");
      }
    }
  }

  if (notifyNowText) {

    console.log("notifyNowText", {
      notifyNowText
    });

    const sendAtNow = new Date();

    sendAtNow.setMinutes(sendAtNow.getMinutes() + 1);

    await (async function  (id)  {
      try {
        await Schedule.create({
          body: notifyNowText,
          sendAt: sendAtNow.toUTCString(),
          contactId: id,
          companyId,
          userId,
          status: "PENDENTE",
          type: "NOW",
          whatsappId,
          ticketId,
          justNotifyMe: false,
          openTicket
        });
      } catch (error) {
        if (error.name === "SequelizeUniqueConstraintError") {
          throw new AppError("Já há agendamentos com os dados informados.");
        }
      }
    })(contactId);

    try {
      await createScheduleToMe(
        
        user,
        notifyNowText,
        sendAtNow.toUTCString(),
        +companyId,
        +userId,
        "NOW",
        false, //notifyMe,
        whatsappId as number,
        ticketId as number
      );
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new AppError("Já há agendamentos com os dados informados.");
      }
    }
  }

  await schedule.reload();

  return schedule;
};

const createScheduleToMe = async (
  
  user: User,
  body: string,
  sendAt: string,
  companyId: number,
  userId: number,
  type: string,
  notifyMe?: boolean,
  whatsappId?: number,
  ticketId?: number,
  openTicket?: string
) => {
  if (!notifyMe || !user.userWhats) {
    return;
  }

  let contact = await ShowContactByNumberService(user.userWhats, +companyId);

  if (!contact) {
    contact = await CreateContactService({
      name: user.name,
      number: user.userWhats,
      companyId: +companyId,
      userId: user.id.toString()
    });
  }

  await Schedule.create({
    body,
    sendAt,
    contactId: contact.id,
    companyId,
    userId,
    status: "PENDENTE",
    type,
    whatsappId,
    ticketId,
    justNotifyMe: false,
    openTicket
  });
};

const justNotifyMeFunc = async (
  userId: number | string,
  companyId: number | string,
  contactId: number | string,
  sendAt: string,
  notifyBefore: number,
  whatsappId: number | string,
  ticketId: number | string
) => {



  const getLastObserveAboutContact = async (contactId: number, ticketId: number) => {

    return await FindNotesByContactIdAndTicketId({
      contactId,
      ticketId
    }).then((notes) => {
      const lastNote = notes.sort((a: TicketNote, b: TicketNote) => {
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
      ).pop();
      return lastNote;
    }).catch((err) => {
      console.log("Erro ao buscar as notas do contato", err);
      return null;
    })

  }
  let lastNote = null;
  if (contactId && ticketId) {
    lastNote = await getLastObserveAboutContact(contactId as number, ticketId as number);
  }else{
  }
  //console.log("Ultima observação do contato", lastNote);
  // console.log("justNotifyMeFunc", {
  //   userId,
  //   companyId,
  //   contactId,
  //   sendAt,
  //   notifyBefore,
  //   whatsappId,
  //   ticketId
  // });
  const user = await ShowUserService(userId, companyId as number);
  //console.log("user", user);
  let myContact = await ShowContactByNumberService(user.userWhats, companyId as number);
  // console.log("Meu contato Registrado:", myContact.name, myContact.number);
  if (!myContact) {
    myContact = await CreateContactService({
      name: user.name,
      number: user.userWhats,
      companyId: +companyId,
      userId: user.id.toString()
    });
  }

  const sendToNotifyToContact = async (contactId) => {
    const contact = await Contact.findByPk(contactId);
    const ticket = await Ticket.findOne({
      where: { contactId },
      include: [{ model: Whatsapp, attributes: ["name"] }]
    });

    // const tags = await Tag.findAll({
    //   include: [
    //     {
    //       model: TicketTag,
    //       where: {
    //         ticketId: ticket?.id
    //       }
    //     }
    //   ]
    // });

    const _sendAt = new Date(sendAt);

    const date = new Date(sendAt);
    date.setMinutes(date.getMinutes() - (notifyBefore ?? 15));

  
    const formattedHours = _sendAt.getHours().toString().padStart(2, "0");
    const formattedMinutes = _sendAt.getMinutes().toString().padStart(2, "0");

    const body = `
  🔔 Aviso Agendamento

  📅 *Data do Agendamento:* ${_sendAt.getDate()}/${_sendAt.getMonth() + 1}/${_sendAt.getFullYear()} ${formattedHours}:${formattedMinutes}
  
  ☎️ *Nome do Contato:* ${contact.name}

  🟢 *Whatsapp:* https://wa.me/${contact.number}

  ↩️ *Origem:* ${ticket?.whatsapp?.name}

  ${lastNote ? `📃 *Ultima Observação:* ${lastNote.note}` : ""}
    `;




    //Funil: ${tags.map(tag => tag.name).join(", ")} LINHA COMENTADA PARA QUE INFORMAÇÃO SEJA INSERIDA NO ENVIO DA MENSAGEM AFIM DE PEEGAR A TAG ATUALIZADA
    // console.log("Parametros para criar o agendamento", {
    //   body,
    //   sendAt: date,
    //   contactId: myContact.id,
    //   companyId,
    //   userId,
    //   status: "PENDENTE",
    //   type: "BEFORE",
    //   whatsappId,
    //   ticketId
    // });
    try {
      await Schedule.create({
        body,
        sendAt: sendAt,
        contactId: myContact.id,
        companyId,
        userId,
        status: "ENVIADA",
        type: "COMMON",
        whatsappId,
        ticketId,
        justNotifyMe: false
      });

      await Schedule.create({
        body,
        sendAt: date,
        contactId: myContact.id,
        companyId,
        userId,
        status: "PENDENTE",
        type: "BEFORE",
        whatsappId,
        ticketId,
        justNotifyMe: true
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        throw new AppError("Já há agendamentos com os dados informados.");
      }
    }

  }

  await sendToNotifyToContact(contactId);



};


export default CreateService;
