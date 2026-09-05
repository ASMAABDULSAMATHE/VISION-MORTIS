import app from "../server";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

export default function handler(req: any, res: any) {
  return app(req, res);
}
