import npqv2ItemSheet from "./sheets/Npqv2ItemSheet.js";
import npqv2ActorSheet from "./sheets/Npqv2ActorSheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";

Hooks.once("init", async function () {
    console.log("Minisix | Initialisation du système Minisix");
    //console.log("Minisix | ZOL SEE ME ?!");

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("minisix", npqv2ItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("minisix", npqv2ActorSheet, { makeDefault: true });
})