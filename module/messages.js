// Functions principales
function messageTxt(txt = "rien à dire") {
    messageObj({ flavor : txt });
}

function messageObj(objTxt = {}){
    let chatData = {
        user: game.user._id,
        actor: game.actors.get(obj._id),
        speaker: speak,
        flavor: monTexte,
        // rollMode: game.settings.get("core", "rollMode"), // devra être défini par l'appelant
        // roll: r
    };
    let chatDataFin = jQuery.extend(true, chatData, objTxt); // fusion 
    if(chatDataFin?.roll) chatDataFin.roll.toMessage(chatDataFin);
        else ChatMessage.create(chatDataFin);
}

// Fonctions utilitaires -------------- A metre dans utils ?
//function lstDesCibles() {}

/***
 * EXPORT ---------------
 */
export { messageTxt, messageObj}