import ContactList from "../../models/ContactList";
import Company from "../../models/Company";
import User from "../../models/User";

type Params = {
  companyId: string;
  userId?: number | string;
};

const FindService = async ({ companyId, userId }: Params): Promise<ContactList[]> => {
  const notes: ContactList[] = await ContactList.findAll({
    where: {
      companyId,
      ...(userId ? {userId} : {})
    },
    include: [
      { model: Company, as: "company", attributes: ["id", "name"] },
      { model: User, attributes: ["id", "name"] }
    ],
    order: [["name", "ASC"]],
    //logging: console.log
  });

  return notes;
};

export default FindService;
