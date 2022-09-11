import { npqv2Actor } from "./actors/Npqv2Actor.js";
import { npqv2Item } from "./actors/Npqv2Item.js";
import npqv2ItemSheet from "./sheets/Npqv2ItemSheet.js";
import npqv2ActorSheet from "./sheets/Npqv2ActorSheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import simpleDialogue from "./utils.js";

Hooks.once("init", async function () {
    console.log("NPQv3 | Initialisation du système NPQv3");

  // Define custom Document classes
    CONFIG.Actor.documentClass = npqv2Actor;
    CONFIG.Item.documentClass = npqv2Item;
    CONFIG.explode = false;
    

    game.macroDialogue = simpleDialogue;
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("npqv2", npqv2ItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("npqv2", npqv2ActorSheet, { makeDefault: true });

    return preloadHandlebarsTemplates();
})