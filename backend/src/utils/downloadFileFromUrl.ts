import axios from "axios";
import * as fs from "fs";

async function downloadFileFromUrl(
  imageUrl: string,
  outputPath: string
): Promise<void> {
  const response = await axios({
    url: imageUrl,
    method: "GET",
    responseType: "stream"
  });

  const writer = fs.createWriteStream(outputPath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

export default downloadFileFromUrl;
