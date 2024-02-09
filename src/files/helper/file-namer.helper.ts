import { v4 as uuid } from "uuid";

export const filenamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: Function,
) => {
  if (file) {
    const fileExtension = file.mimetype.split("/")[1];
    const fileName = `${uuid()}.${fileExtension}`;
    callback(null, fileName);
  } else {
    callback(null, "");
  }
};
