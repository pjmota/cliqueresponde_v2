import AfterSalesDetails from "../../models/AfterSalesDetails";

const ListAfterSalesDetailsService = async (afterSalesId: string) => {

  const data = await AfterSalesDetails.findAll({ where: { afterSalesId }, order: [['name', 'asc']]})

  return data;
};

export default ListAfterSalesDetailsService;