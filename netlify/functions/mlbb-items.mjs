import { loadPage, jsonResponse } from "./lib/http.mjs";

export default async (req) => {
  const name = new URL(req.url).searchParams.get("name") || "Malefic Gun";
  const url = "https://liquipedia.net/mobilelegends/" + name;

  try {
    const $ = await loadPage(url);
    const itemData = {};
    let description = $("dl > dd").text().trim();
    const price = $(".placement-darkgrey").text().trim();
    itemData["price"] = price;

    const recipe = $(".infobox-center a img").map((i, el) => $(el).attr("alt")).get();
    recipe.splice(0, 2);
    itemData["recipe"] = recipe;

    const pText = $("p").eq(1).text().trim();
    const liTexts = $("p").first().nextAll("li").map((i, el) => $(el).text().trim()).get();
    const tipsText = [pText, ...liTexts].join(" ");
    itemData["tips"] = tipsText;

    const appText = $("p").eq(2).text().trim();
    const liApp = $("p").eq(2).nextAll("li").map((i, el) => $(el).text().trim()).get();
    const textApp = [appText, ...liApp].join(" ");
    itemData["applications"] = textApp;

    if (description) {
      description = description.split(".")[0].trim();
      itemData["description"] = description;
    }

    $("div.infobox-cell-2.infobox-description").each((index, element) => {
      const descriptionKey = $(element).text().trim();
      const value = $(element).next("div").text().trim();
      const key = descriptionKey.replace(":", "").trim();
      if (key && value) {
        itemData[key] = value;
      }
    });

    return jsonResponse(itemData);
  } catch (error) {
    return jsonResponse({ error: "Failed to fetch MLBB ITEMS, or items not found for: " + name }, 500);
  }
};

export const config = {
  path: "/api/mlbb-items",
};
