export function registerSettings() {
    // on pose la question avec : game.settings.get("npqv2", "modeMetal")? Number(REPOUI) : REPNON;
    game.settings.register("npqv2", "modeMetal", {
        name: game.i18n.localize("npqv2.EnableMetalConflit"),
        hint: game.i18n.localize("npqv2.EnableMentalConflitHint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });

    game.settings.register("npqv2", "CritiqueCartes", {
        name: game.i18n.localize("npqv2.EnableJeuxDeCartes"),
        hint: game.i18n.localize("npqv2.EnableJeuxDeCartesHint"),
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
    });

    //------- Exemple de choix multiple 
    // game.settings.register("npqv2", "gameModule", {
    //     name: game.i18n.localize("npqv2.EnableMentalHealth"),
    //     hint: game.i18n.localize("npqv2.EnableMentalHealthHint"),
    //     scope: "world",
    //     config: true,
    //     requiresReload: true,
    //     type: String,
    //     choices: {
    //         "cultos": game.i18n.localize("npqv2.CultosInnombrables"),
    //         "lcdt": game.i18n.localize("npqv2.LasCorrientesDelTiempo"),
    //         "core": game.i18n.localize("npqv2.Core")
    //     },
    //     default: "cultos",
    // });
}
