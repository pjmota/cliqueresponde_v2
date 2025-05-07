import { Op, QueryTypes } from "sequelize";
import Company from "../../models/Company";
import ScheduleTagIntegration from "../../models/ScheduleTagIntegration";
import TicketTag from "../../models/TicketTag";
import logger from "../../utils/logger";
import StartTicketIntegrationService from "../TicketServices/StartTicketIntegrationService";
import Whatsapp from "../../models/Whatsapp";
import sequelize from "../../database";
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";

const CronScheduleTagIntegrationService = async () => {
  const companies = await Company.findAll();

  for (const company of companies) {
    const schedules = await ScheduleTagIntegration.findAll({
      where: { companyId: company.id },
      include: [
        {
          model: Whatsapp,
          as: "whatsapps",
          attributes: ["id"]
        }
      ]
    });

    logger.info(
      `[Automação de tag] ${schedules.length} automações encontradas para a compania ${company.id}`
    );

    for (const schedule of schedules) {
      const beginDate = new Date();
      beginDate.setMinutes(beginDate.getMinutes() - schedule.delay - 2);

      const endDate = new Date();
      endDate.setMinutes(endDate.getMinutes() - schedule.delay);

      let sql = `
        select
          distinct t.id
        from
          "Tickets" t
        inner join "TicketTags" tt on
          tt."ticketId" = t.id
        where
          tt."tagId" = ${schedule.tagId}
          and (tt."executedQueueIntegration" is null
            or tt."executedQueueIntegration" = false)
          and tt."updatedAt" between '${beginDate.toISOString()}' and '${endDate.toISOString()}'
      `;

      if (schedule.whatsapps.length) {
        sql += `
        and t."whatsappId" in (${schedule.whatsapps
          .map(whatsapp => whatsapp.id)
          .join(",")})
      `;
      }

      const tickets: { id: number }[] = await sequelize.query(sql, {
        type: QueryTypes.SELECT
      });

      const ticketIds = tickets.map(ticket => ticket.id);

      logger.info(`[Automação de tag] ${ticketIds.length} tickets encontrados`);

      for (const ticketId of ticketIds) {
        logger.info(
          `[Automação de tag] integração iniciada para o ticket ${ticketId}`
        );

        await StartTicketIntegrationService(
          ticketId,
          company.id,
          schedule.queueIntegrationId
        );

        if (schedule.nextTagId) {
          
          //TRATATIVA PARA FINALIZAR INTEGRAÇÕES CASO A PRÓXIMA LANE DO KANBAN
          //QUE SERÁ INSERIDA, NÃO TENHA INTEGRAÇÃO
          const hasIntegration = await Tag.findByPk(schedule.nextTagId)
          if(!hasIntegration.queueIntegrationId) {
            await Ticket.update(
              { useIntegration: false },
              { where: { id: ticketId } }
            );
          }

          await TicketTag.destroy({ where: { ticketId } });
          await TicketTag.create({
            ticketId,
            tagId: schedule.nextTagId,
            executedQueueIntegration: false
          });

        } else {
          TicketTag.update(
            { executedQueueIntegration: true },
            { where: { ticketId } }
          );
        }
      }
    }
  }
};

export default CronScheduleTagIntegrationService;
