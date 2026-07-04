import { loadPage, jsonResponse } from "./lib/http.mjs";

export default async () => {
  const url = "https://mobile-legends.fandom.com/wiki/List_of_heroes";
  try {
    const $ = await loadPage(url);
    const heroes = [];
    $(".wikitable tbody tr").each((i, element) => {
      const icon = $(element).find("td:nth-child(1) img").attr("data-src");
      const heroName = $(element).find("td:nth-child(2)").text().trim();
      const heroOrder = $(element).find("td:nth-child(3)").text().trim();
      const role = $(element).find("td:nth-child(4) a").map((i, el) => $(el).text()).get().join("/");
      const specialty = $(element).find("td:nth-child(5) a").map((i, el) => $(el).text()).get().join("/");
      const laneRecommendation = $(element).find("td:nth-child(6) a").text().trim();
      const region = $(element).find("td:nth-child(7) a").text().trim();
      const price = $(element).find("td:nth-child(8) li").map((i, el) => $(el).text().trim()).get().join(", ");
      const releaseDate = $(element).find("td:nth-child(9)").text().trim();
      heroes.push({
        icon,
        heroName,
        heroOrder,
        role,
        specialty,
        laneRecommendation,
        region,
        price,
        releaseDate,
      });
    });
    heroes.pop();
    heroes.shift();
    return jsonResponse(heroes);
  } catch (error) {
    return jsonResponse({ error: "Failed to fetch Hero-List" }, 500);
  }
};

export const config = {
  path: "/api/hero-list",
};
