import npqv2ItemSheet from "./sheets/Npqv2ItemSheet.js";
import npqv2ActorSheet from "./sheets/Npqv2ActorSheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";

Hooks.once("init", async function () {
    console.log("NPQv3 | Initialisation du système NPQv3");
    //console.log("Minisix | ZOL SEE ME ?!");

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("npqv2", npqv2ItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("npqv2", npqv2ActorSheet, { makeDefault: true });

    return preloadHandlebarsTemplates();
})