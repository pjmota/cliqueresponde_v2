import ShowService from "./ShowService";
import Rotations from "../../models/Rotations";
import logger from "../../utils/logger";

interface RotationData {
  lastSequence?: number;
  queueId?: number;
  companyId?: number;
}

interface Request {
  rotationData?: RotationData;
  id: number;
}

const UpdateRotationService = async ({
  rotationData,
  id
}: Request): Promise<Rotations | undefined> => {
  const rotation = await ShowService(id);

  const {
    lastSequence,
    queueId,
    companyId
  } = rotationData;

  let data = {
    lastSequence,
    queueId,
    companyId
  } as RotationData;

  await rotation.update(data);

  await rotation.reload();
  return rotation;
};

export default UpdateRotationService;
