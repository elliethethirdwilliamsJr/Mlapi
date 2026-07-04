import axios from "axios";
import { load } from "cheerio";

export async function loadPage(url) {
  const response = await axios.get(url);
  return load(response.data);
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
