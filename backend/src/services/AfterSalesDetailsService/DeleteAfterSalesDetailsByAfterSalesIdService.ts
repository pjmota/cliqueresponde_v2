import AfterSalesDetails from "../../models/AfterSalesDetails";

const DeleteAfterSalesDetailsByAfterSalesIdService = async (afterSalesId: number) => {
    await AfterSalesDetails.destroy({where: { afterSalesId }});
}

export default DeleteAfterSalesDetailsByAfterSalesIdService;