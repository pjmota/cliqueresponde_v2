import { Op } from "sequelize";
import AfterSalesDetails from "../../models/AfterSalesDetails";

const DeleteAfterSalesDetailsService = async (ids: string[]) => {
    await AfterSalesDetails.destroy({where: {
        id: {
            [Op.in]: ids
        }
    }});
}


export default DeleteAfterSalesDetailsService;