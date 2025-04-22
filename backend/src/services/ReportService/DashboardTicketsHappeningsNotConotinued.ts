import { QueryTypes } from "sequelize";
import sequelize from "../../database";

interface DataReturn {
  ticketId: number;
  attendant?: string;
  updatedAt?: string;
  fromMe?: boolean;
  contact?: string;
  contactNumber?: string;
  queueId?: number;
  queueName?: string;
  lastDate?: string;
}

export default async function getHappeningsNotContinued(
  companyId: string | number,
  date: string
) {

  const query = `
      select
        t.id as "ticketId",
        u."name" as "attendant",
        t."updatedAt",
        t."fromMe",
        c."name" as "contact",
        c."number" as "contactNumber",
        t."queueId",
        q."name" as "queueName",
        q."color" as "queueColor",
        max(m."createdAt") as "lastDate"
      from
        "Tickets" t
      join "Messages" m on
        t.id = m."ticketId"
      left join "Queues" q on
        t."queueId" = q.id
      left join "Contacts" c on
        t."contactId" = c.id
      left join "Users" u on
        t."userId" = u.id
      where
        t.status = 'open'
        and t."companyId" = ${companyId}
        and t."fromMe" = 'false'
        and t."isGroup" = 'false'
        --and t."updatedAt" < '${date}'
      group by
        t.id,
        t."queueId",
        q."name",
        q."color",
        c."name" ,
        c."number",
        t."updatedAt",
        u."name"
      order by t."updatedAt" asc
    `  
  const happeningsNotContinued: DataReturn[] = await sequelize.query(
    query,
    { type: QueryTypes.SELECT }
  );
  
  return happeningsNotContinued
}