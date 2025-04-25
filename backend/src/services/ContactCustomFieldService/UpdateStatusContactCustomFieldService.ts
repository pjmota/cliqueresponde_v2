import ContactCustomField from "../../models/ContactCustomField";

const UpdateStatusContactCustomFieldService = async (
  contactId: string,
  statusId: string
) => {
  const fields = await ContactCustomField.findAll({ where: { contactId } });
  let field = fields.find(field => field.name === "status");

  if (!field) {
    /* field = await ContactCustomField.create({
      name: "status",
      value: statusId,
      contactId
    }); */
  } else {
    await field.update({ value: statusId });
    field.reload();
  }

  return field;
};

export default UpdateStatusContactCustomFieldService;
