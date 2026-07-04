import { jsonResponse } from "./lib/http.mjs";

export default async () => {
  return jsonResponse({
    message: "Welcome to MLBB APi.",
  });
};

export const config = {
  path: "/",
};
