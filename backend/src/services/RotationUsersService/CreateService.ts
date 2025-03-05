import * as Yup from "yup";

import AppError from "../../errors/AppError";
import RotationUsers from "../../models/RotationUsers";

interface Request {
  sequence: number;
  userId: number;
  rotationId: number;
}

const CreateServiceUser = async ({
  sequence,
  userId,
  rotationId
}: Request): Promise<RotationUsers> => {
  const schema = Yup.object().shape({
    sequence: Yup.number().required(),
    rotationId: Yup.number().required(),
    userId: Yup.number().required(),
  });

  try {
    await schema.validate({
      sequence,
      rotationId,
      userId
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const rotationUser = await RotationUsers.create(
    {
      sequence,
      rotationId,
      userId
    }
  );

  await rotationUser.reload();

  return rotationUser;
};

export default CreateServiceUser;
