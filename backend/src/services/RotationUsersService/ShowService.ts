import AppError from "../../errors/AppError";
import RotationUsers from "../../models/RotationUsers";

const RotationUserService = async (id: string | number): Promise<RotationUsers> => {
  console.log('id', id)
  const rotationUser = await RotationUsers.findByPk(id);

  if (!rotationUser) {
    throw new AppError("ERR_NO_ROTATION_USER_FOUND", 404);
  }

  return rotationUser;
};

export default RotationUserService;