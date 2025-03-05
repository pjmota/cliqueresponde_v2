import ShowService from "./ShowService";
import RotationUsers from "../../models/RotationUsers";

interface RotationUserData {
  sequence?: number;
  rotationId?: number;
  userId?: number;
}

interface Request {
  rotationUserData: RotationUserData;
  id: string | number;
}

const UpdateUserService = async ({
  rotationUserData,
  id
}: Request): Promise<RotationUsers | undefined> => {
  const rotationUser = await ShowService(id);

  const {
    sequence,
    rotationId,
    userId
  } = rotationUserData;

  let data = {
    sequence,
    rotationId,
    userId
  } as RotationUserData;

  await rotationUser.update(data);

  await rotationUser.reload();
  return rotationUser;
};

export default UpdateUserService;
