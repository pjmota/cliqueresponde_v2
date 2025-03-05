import AppError from "../../errors/AppError";
import Rotations from "../../models/Rotations";
import RotationUsers from "../../models/RotationUsers";
import logger from "../../utils/logger";


const DeleteService = async (id: number): Promise<void> => {
  const record = await RotationUsers.findOne({
    where: {id},
    logging: console.log
  });

  if(!record) {
    throw new AppError("ERRO_NO_ROTATION_FOUND", 404)
  };

  await record.destroy();
};

export default DeleteService;