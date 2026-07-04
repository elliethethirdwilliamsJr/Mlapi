import axios from "axios";
import { load } from "cheerio";
import { loadPage, jsonResponse } from "./lib/http.mjs";

export default async (req) => {
  const hero = new URL(req.url).searchParams.get("hero") || "Miya";
  const url = "https://liquipedia.net/mobilelegends/" + hero;
  const urlLore = "https://liquipedia.net/mobilelegends/" + hero + "/Lore";

  try {
    const $ = await loadPage(url);

    let lores = { title: "", lore: "" };
    try {
      const responseLore = await axios.get(urlLore);
      const lore = load(responseLore.data);
      const judul = lore("h1.firstHeading").text().trim();
      const cerita = lore("div.mw-parser-output p").first().text().trim();
      lores = {
        title: judul,
        lore: cerita || "",
      };
    } catch (loreError) {
      console.error("Failed to fetch lore for hero " + hero, loreError);
    }

    const relationships = [];
    $("span#Relationships").parent().next("ul").find("li").each((index, element) => {
      const name = $(element).find("a").attr("title");
      const relation = $(element).text().split("—")[1]?.trim();
      const imgAlt = $(element).find("img").attr("alt");
      if (name && relation && imgAlt) {
        relationships.push({
          name: name,
          relation: relation,
        });
      }
    });

    const quote = $("div.infobox-center i").text().trim();
    const passiveDescription = $("div.spellcard-wrapper").first().find(".spellcard-description").first().text().trim();
    const skill1Description = $("div.spellcard-wrapper").eq(1).find(".spellcard-description").first().text().trim();
    const skill1Cooldown = $("div.spellcard-wrapper").eq(1).find(".spellcard-description").last().text().trim();
    const skill2Description = $("div.spellcard-wrapper").eq(2).find(".spellcard-description").first().text().trim();
    const skill2Cooldown = $("div.spellcard-wrapper").eq(2).find(".spellcard-description").last().text().trim();
    const ultimateDescription = $("div.spellcard-wrapper").eq(3).find(".spellcard-description").first().text().trim();
    const ultimateCooldown = $("div.spellcard-wrapper").eq(3).find(".spellcard-description").last().text().trim();

    const Role = $("div.infobox-cell-2.infobox-center img[alt]").first().attr("alt");
    const Lane = $("div.infobox-cell-2.infobox-center img[alt]").last().attr("alt");

    const skillInfo = {
      passive: passiveDescription,
      skill_1_description: skill1Cooldown,
      skill_2_description: skill2Cooldown,
      skill_3_description: ultimateCooldown,
    };

    const specialties = [];
    $('div.infobox-cell-2:contains("Specialty")').nextAll().each((i, el) => {
      const text = $(el).text().trim();
      if (text) specialties.push(text);
    });
    const specialty = specialties.join(", ");

    const heroInfo = {
      name: hero,
      price: $('div.infobox-cell-2:contains("Price")').next().text().trim(),
      lane: $('div.infobox-cell-2:contains("Lane")').next().text().trim(),
      role: $('div.infobox-cell-2:contains("Role")').next().text().trim(),
      specialty: specialty,
      region: $('div.infobox-cell-2:contains("Region")').next().text().trim(),
      city: $('div.infobox-cell-2:contains("City")').next().text().trim(),
      quote: quote || "No quote.",
      resourceBar: $('div.infobox-cell-2:contains("Resource Bar")').next().text().trim(),
      releaseDate: $('div.infobox-cell-2:contains("Release Date")').next().text().trim(),
      voiceActor: $('div.infobox-cell-2:contains("Voice Actor(s)")').next().text().trim(),
      winRate: $('div.infobox-cell-2:contains("Win Rate")').next().text().trim(),
      baseStats: {
        health: $('div.infobox-cell-2:contains("Health")').next().text().trim() || $('div.infobox-cell-2:contains("HP")').next().text().trim(),
        healthRegen: $('div.infobox-cell-2:contains("Health Regen")').next().text().trim() || $('div.infobox-cell-2:contains("HP Regen")').next().text().trim(),
        mana: $('div.infobox-cell-2:contains("Mana")').next().text().trim(),
        manaRegen: $('div.infobox-cell-2:contains("Mana Regen")').next().text().trim(),
        physicalAttack: $('div.infobox-cell-2:contains("Physical Attack")').next().text().trim(),
        physicalDefense: $('div.infobox-cell-2:contains("Physical Defense")').next().text().trim(),
        magicPower: $('div.infobox-cell-2:contains("Magic Power")').next().text().trim(),
        magicDefense: $('div.infobox-cell-2:contains("Magic Defense")').next().text().trim(),
        attackSpeed: $('div.infobox-cell-2:contains("Attack Speed")').next().text().trim(),
        attackSpeedRatio: $('div.infobox-cell-2:contains("Attack Speed Ratio")').next().text().trim(),
        movementSpeed: $('div.infobox-cell-2:contains("Movement Speed")').next().text().trim(),
      },
    };

    const proPlayers = [];
    $("tr td").each((index, element) => {
      const nameEl = $(element).find("div.wiki-backgroundcolor-light a");
      const imgEl = $(element).find("img");
      const playerName = nameEl.attr("title");
      const imageUrl = imgEl.attr("src");
      if (playerName && imageUrl) {
        proPlayers.push({
          name: playerName,
          image: "https://liquipedia.net" + imageUrl,
        });
      }
    });

    let skins = [];
    try {
      const galleryUrl = `https://liquipedia.net/mobilelegends/${hero}/Gallery`;
      const responseGallery = await axios.get(galleryUrl);
      const $gallery = load(responseGallery.data);

      $gallery("div.template-box").each((i, el) => {
        const skinName = $gallery(el).find("th").first().text().trim();
        const imgSrc = $gallery(el).find("img").first().attr("src");
        const imageUrl = imgSrc ? "https://liquipedia.net" + imgSrc : null;

        let diamond = 0;
        let battlepoint = 0;

        const priceText = $gallery(el).find('tr:contains("Price")').next("tr").text().trim();

        const diamondMatch = priceText.match(/(\d[\d,]*)\s*(Diamond|Diamonds)/i);
        const bpMatch = priceText.match(/(\d[\d,]*)\s*(Battle|Point|BP)/i);

        if (diamondMatch) {
          diamond = parseInt(diamondMatch[1].replace(/,/g, ""), 10);
        }
        if (bpMatch) {
          battlepoint = parseInt(bpMatch[1].replace(/,/g, ""), 10);
        }

        if (skinName && imageUrl) {
          skins.push({
            name: skinName,
            image: imageUrl,
          });
        }
      });
    } catch (galleryError) {
      console.error("Failed to fetch skins for hero " + hero, galleryError);
      skins = [];
    }

    const result = {
      heroInfo,
      proPlayers,
      relationships,
      skillInfo,
      lores,
      skins,
    };

    return jsonResponse(result);
  } catch (error) {
    console.error("Failed to fetch hero, or hero not found for " + hero, error);
    return jsonResponse({ error: "Failed to fetch hero, or hero not found for " + hero + ", " + error }, 500);
  }
};

export const config = {
  path: "/api/mlbb",
};
