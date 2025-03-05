import AppError from "../../errors/AppError";
import Rotations from "../../models/Rotations";
import logger from "../../utils/logger";

const RotationService = async (id: string | number): Promise<Rotations> => {
  const rotation = await Rotations.findByPk(id, 
    {
      //logging: console.log
    }
  );

  if (!rotation) {
    throw new AppError("ERR_NO_ROTATION_FOUND", 404);
  }

  return rotation;
};

export default RotationService;
