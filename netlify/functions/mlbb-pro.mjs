import { loadPage, jsonResponse } from "./lib/http.mjs";

export default async (req) => {
  const name = new URL(req.url).searchParams.get("name") || "Kairi";
  const url = "https://liquipedia.net/mobilelegends/" + name;
  try {
    const $ = await loadPage(url);

    const statisticsSection = $("#Statistics");
    const statisticsItems = [];
    statisticsSection.closest("h2").next("ul").find("li").each((index, element) => { statisticsItems.push($(element).text().trim().replace("[1]", "")); });

    const triviaSection = $("#Trivia");
    const triviaListItems = [];
    triviaSection.closest("h2").next("ul").find("li").each((index, element) => {
      triviaListItems.push($(element).text().trim().replace("[1]", ""));
    });

    const heroNames = [];
    $('div[style="width:50%"] a').each((index, element) => {
      const heroName = $(element).attr("title");
      if (heroName) {
        heroNames.push(heroName);
      }
    });

    const images = [];
    $('img[width="600"][height="600"]').each((index, element) => {
      const imgSrc = $(element).attr("src");
      images.push(imgSrc);
    });

    const currentPhoto = images.slice(1);
    const masterHero = heroNames.slice(4);
    const trophies = [];
    $("span.league-icon-small-image a").each((i, el) => {
      const trophyName = $(el).attr("title");
      if (trophyName) {
        trophies.push(trophyName);
      }
    });

    const socialLinks = {};
    $("a.external").each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        if (href.includes("instagram")) {
          socialLinks["Instagram"] = href;
        } else if (href.includes("tiktok")) {
          socialLinks["TikTok"] = href;
        } else if (href.includes("youtube")) {
          socialLinks["YouTube"] = href;
        }
      }
    });

    const playerName = $("div.infobox-cell-2.infobox-description")
      .filter((i, el) => $(el).text().trim() === "Name:")
      .next()
      .text()
      .trim();

    const nationality = $("div.infobox-cell-2.infobox-description")
      .filter((i, el) => $(el).text().trim() === "Nationality:")
      .next()
      .text()
      .trim()
      .split(" ")[0];

    const born = $("div.infobox-cell-2.infobox-description")
      .filter((i, el) => $(el).text().trim() === "Born:")
      .next()
      .text()
      .trim();

    const status = $("div.infobox-cell-2.infobox-description")
      .filter((i, el) => $(el).text().trim() === "Status:")
      .next()
      .text()
      .trim();

    const role = $("div.infobox-cell-2.infobox-description")
      .filter((i, el) => $(el).text().trim() === "Role(s):")
      .next()
      .text()
      .trim();

    const team = $("div.infobox-cell-2.infobox-description")
      .filter((i, el) => $(el).text().trim() === "Team:")
      .next()
      .text()
      .trim();

    const alternateIDs = $("div.infobox-cell-2.infobox-description")
      .filter((i, el) => $(el).text().trim() === "Alternate IDs:")
      .next()
      .text()
      .trim();

    const totalWinnings = $("div.infobox-cell-2.infobox-description")
      .filter((i, el) => $(el).text().trim() === "Approx. Total Winnings:")
      .next()
      .text()
      .trim();

    const playerData = {
      "Name": playerName || "N/A",
      "Nationality": nationality || "N/A",
      "Born": born || "N/A",
      "Status": status || "N/A",
      "Role": role || "N/A",
      "Team": team || "N/A",
      "Expert Hero": masterHero,
      "Social Media": socialLinks,
      "Trophies": trophies,
      "Trivia": triviaListItems,
      "Statistics": statisticsItems,
      "Pro Photo": "https://liquipedia.net" + currentPhoto,
      "Alternate IDs": alternateIDs || "N/A",
      "Approx. Total Winnings": totalWinnings || "N/A",
    };
    return jsonResponse(playerData);
  } catch (error) {
    return jsonResponse({ error: "Failed to fetch MLBB PRO, or PRO PLAYER not found for: " + name }, 500);
  }
};

export const config = {
  path: "/api/mlbb-pro",
};
