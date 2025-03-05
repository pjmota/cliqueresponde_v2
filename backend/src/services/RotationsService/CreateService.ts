import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Rotations from "../../models/Rotations";
import ShowService from "../RotationsService/ShowService";

interface Request {
  queueId: number;
  companyId: number;
  rotationId: number;
}

const CreateService = async ({
  queueId,
  companyId,
  rotationId
}: Request): Promise<Rotations> => {
  if(rotationId) {
    console.log('rotationId', rotationId)
    const getRotation = ShowService(rotationId)
    return getRotation
  }

  const schema = Yup.object().shape({
    queueId: Yup.number().required(),
    companyId: Yup.number().required(),
  });

  try {
    await schema.validate({
      queueId,
      companyId
    });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const rotation = await Rotations.create(
    {
      queueId,
      companyId
    }
  );

  await rotation.reload();

  return rotation;
};

export default CreateService;
