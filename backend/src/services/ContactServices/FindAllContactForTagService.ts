import ContactTag from "../../models/ContactTag";

type Param = {
  tagId: string
};

const FindAllContactForTags = async ({
    tagId
  }: Param): Promise<ContactTag[]> => {
    let where: any = {
      tagId
    };

    const contactsTags = await ContactTag.findAll({
      where
    });
  return contactsTags;
};

export default FindAllContactForTags;
