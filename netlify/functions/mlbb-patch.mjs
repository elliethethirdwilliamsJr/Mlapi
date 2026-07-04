import { loadPage, jsonResponse } from "./lib/http.mjs";

export default async () => {
  const url = "https://liquipedia.net/mobilelegends/Portal:Patches";
  try {
    const $ = await loadPage(url);
    const patches = [];
    $("table.wikitable tbody tr").each((index, element) => {
      const version = $(element).find("td:nth-child(1) a").text().trim();
      const releaseDate = $(element).find("td:nth-child(2)").text().trim();
      const changeLogs = $(element).find("td:nth-child(3)").text().trim();
      if (version && releaseDate) {
        patches.push({ version, releaseDate, changeLogs });
      }
    });
    return jsonResponse(patches);
  } catch (error) {
    return jsonResponse({ error: "Failed to fetch PATCHES" }, 500);
  }
};

export const config = {
  path: "/api/mlbb-patch",
};
