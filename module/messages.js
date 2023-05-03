import { lstCibles, cibleTxt, isFormule } from "./utils.js";
// traitements des messages du chats par click

/**
 * gestion de ce qui doit être traité à partir du chat dont le code commence par "msg"
 * en deuxième argument : arme ou dom, et en troisième pour arme : attaque ou défense
 *
 * @param {string} [cmdArgs=["msg","rien"]]
 * @param {*} [obj={idActeur, idToken}]
 * @return {*} 
 */
function aiguillageGeMsg(cmdArgs=["msg","rien"], obj={}){
    let objAct = {}; let objToken = null;
  // aiguillage des options (voir utils.js) : msg.arme.attaque,
  if(obj?.idToken !== null) {
    objToken = game.scenes.get(game.user.viewedScene).tokens.get(obj.idToken);
    jQuery.extend(true, objAct, objToken.actor, objToken.actorData)
  }  else if(obj?.idActeur) objAct = game.actors.get(obj.idActeur); // peut être un message ui ?.
  if(cmdArgs[1]=== "arme") {
    if(cmdArgs[2]=== "attaque") {
      // transformer le jet en jet d'attaque courant !
      passerJetAttaque(objAct, objToken, obj);
    }
    else if (cmdArgs[2]==="defense") {
      // transformer le jet en jet de défense !
      passerJetDefense(objAct, objToken, obj);
    }
  } else if(cmdArgs[1]==="dom") {
    
  }else if(cmdArgs[1]==="jet" ) {
    if(cmdArgs[2]==="relance") {
      // taiter la possibiltié de relance avec un aspect autorisé 
    }
  }
  return ;
}

// Functions principales lié au messages
function messageTxt(txt = "rien à dire") {
    messageObj({ flavor : txt });
}

function messageObj(objTxt = {}){
    let speak = objTxt.idActor?game.actors.get(objTxt.idActor).name: ChatMessage.getSpeaker();
    let chatData = {
        user: game.user._id,
        //actor: game.actors.get(obj._id),
        speaker: speak,
        flavor: "rien a dire",
        // rollMode: game.settings.get("core", "rollMode"), // devra être défini par l'appelant
        // roll: r
    };
    let chatDataFin = jQuery.extend(true, chatData, objTxt); // fusion 
    if(chatDataFin?.roll) chatDataFin.roll.toMessage(chatDataFin);
        else ChatMessage.create(chatDataFin);
}

// Fonctions utilitaires -------------- A metre dans utils ?
//function lstDesCibles() {}
function passerJetAttaque(objActTmp={}, objToken, obj = {}, avecDom = false) {
    // obj contien les infos sur l'objet original, objToken est l'objet, objActTmp est un compie fusionné car il peut venir de deux source : token et acteur
    // "attResultat": { "code": "NORM", "score": 0, "nbQualites" : 0, "cibles" : "", "info": "", "MeFormule":"", "MeTot" : 0, "infoJet":"", "dataJet": ""}
    // infoJet récupère le max de donnée du jet et dataJet récupère le max d'info du roll du jet
    // params devra complété...
    let fromActor = (objToken.actorData === undefined) || isEmpty(objToken.actorData); 
    fromActor = (objToken.isLinked)?true:fromActor; 
    let codePrefix = "actorData."
    let actorData = objToken?.actorData.system;
    if(fromActor) {
        actorData = game.actors.get(obj.idActor).system;
        codePrefix = "";
    }

    let objUpd = {};
    objUpd[codePrefix +"system.attResultat.score"]= obj.resultat;
    objUpd[codePrefix +"system.attResultat.nbQualites"]= obj.qualite;
    objUpd[codePrefix +"system.attResultat.cibles"]= obj.cibles;
    objUpd[codePrefix +"system.attResultat.code"]= "ATT";
    objUpd[codePrefix +"system.attResultat.lancer"]= obj.lancer;
    objUpd[codePrefix +"system.attResultat.paris"]= obj.paris;
//    objUpd[codePrefix +"system.attResultat.Me"]= obj.paris;
//    objUpd[codePrefix +"system.attResultat.MeFormule"]= obj.paris;
    objUpd[codePrefix +"system.attResultat.info"]= JSON.stringify(obj.roll);
    objUpd[codePrefix +"system.attResultat.dataJet"]= JSON.stringify(actorData.jet);
    if(fromActor) objToken.actor.update(objUpd);
    else objToken.update(objUpd);
    //---- message pour les dommages
    actorData = (fromActor)?objToken.actor.system: objToken.actorData.system;
    let valAtt = (actorData.attResultat.MeTot>0)?actorData.attResultat.MeTot:actorData.attResultat.MeFormule;
    if(! isFormule(valAtt)) {
      valAtt = parseInt(valAtt);
      avecDom = true;
    }
    //actorData.attResultat.MeTot // faudra peut être la lancer
    let monText ="";
    if(avecDom) {
      monText = "Votre valeur d'attaque est de "+(valAtt+obj.qualite)+"<br>";
    } else {
      monText = "Votre valeur d'attaque est de "+valAtt+"+" + obj.qualite+ "<br>"+
      `<a class="apply-cmd" data-cmd="msg.arme.dom" data-roll='`+ JSON.stringify(obj)+ `'> <i class="fal fa-swords"></i>&nbsp; lancer les dommages </a>`;
    }
    let objDef = {};
    let lstcibles = lstCibles();
    if(lstcibles.length ===0) lstcibles =obj.cibles; // si pas de cible courante : prendre les cibles classiques
    if(lstcibles.length > 0) {
      objUpd = {};
      // traiter toutes les cibles et pas que seulement la premère
      objDef = lstcibles[0].document; // le token selectionnée (obligatiorement)      
      jQuery.extend(true, objUpd, objDef.actor, objDef.actorData);
      monText += `<br>votre cible est ` +  objUpd.name + "("+ objDef.name +") : " + cibleTxt(objDef.actorId, objDef.name);
      if(objUpd.system.defResultat.code === "DEF" || objUpd.system.defResultat.code === "DEFX") { // elle possède une défense 
        monText += `possède une valeur de défense de` +  parseInt(objUpd.system.defResultat.nbQualites) + parseInt(objUpd.system.defResultat.MeTot);
      }
    } else {
      monText += `aucune cible n'est selectionnée, choisissez un personnage et utiliser le bouton ci-dessous `+
            ` <br> <a class="apply-cmd" data-cmd="msg.perso.dom" data-roll='`+ JSON.stringify(obj)+ `'><i class="fas fa-user-minus"></i>Enlever les Dommages</a>`
    }
    // faire le jet ou utiliser la base/
    messageTxt(monText);
  }

  function passerJetDefense(objActTmp={}, objToken, obj = {}) {
    // obj contien les infos sur l'objet original, objToken est l'objet, objActTmp est un compie fusionné car il peut venir de deux source : token et acteur
    // "attResultat": { "code": "NORM", "score": 0, "nbQualites" : 0, "cibles" : "", "info": "", "MeFormule":"", "MeTot" : 0, "infoJet":"", "dataJet": ""}
    // infoJet récupère le max de donnée du jet et dataJet récupère le max d'info du roll du jet
    // params devra complété...
    let fromActor = (objToken.actorData === undefined) || isEmpty(objToken.actorData); 
    fromActor = (objToken.isLinked)?true:fromActor; 
    let codePrefix = "actorData."
    let actorData = objToken?.actorData.system;
    if(fromActor) {
        actorData = game.actors.get(obj.idActor).system;
        codePrefix = "";
    }

    let objUpd = {};
    objUpd[codePrefix +"system.defResultat.score"]= obj.resultat;
    objUpd[codePrefix +"system.defResultat.nbQualites"]= obj.qualite;
    objUpd[codePrefix +"system.defResultat.cibles"]= obj.cibles;
    objUpd[codePrefix +"system.defResultat.code"]= "ATT";
    objUpd[codePrefix +"system.defResultat.lancer"]= obj.lancer;
    objUpd[codePrefix +"system.defResultat.paris"]= obj.paris;
//    objUpd[codePrefix +"system.attResultat.MeTot"]= obj.paris;
//    objUpd[codePrefix +"system.attResultat.MeFormule"]= obj.paris;
    objUpd[codePrefix +"system.defResultat.info"]= JSON.stringify(obj.roll);
    objUpd[codePrefix +"system.defResultat.dataJet"]= JSON.stringify(actorData.jet);
    if(fromActor) objToken.actor.update(objUpd);
    else objToken.update(objUpd);
  }

/***
 * EXPORT ---------------
 */
export { aiguillageGeMsg, messageTxt, messageObj}

// ----------------------------  Garder pour certains traitements
// ancienne fonction d'aguillage nommée : XXXX puis EnventDuChat
// ---------------------------
// let c = html.find(".flavor-text").text();
// let st = c.indexOf("donne ") + "donne ".length;
// let ed = c.indexOf(" ", st);
// switch(btnType){
//   case "full"   : 
//     console.log("lancer dommage !"); 
//     let nbMises = parseInt(c.substring(st,ed));
//     DialogueDommage(nbMises);
//     break;
//   case "DomApply"   : 
//     console.log("appliquer les dommages !"); 
//     let DomTot = parseInt(c.substring(st,ed));
//     break;
//   case "double" : console.log("lancer dommage !"); 
//     break;
//   case "attackTo"   : 
//     console.log("faire lancer la défense du personnage opposé !");
//     //on obtient ces cibles
//     let targets = ([...game.user.targets].length > 0) ? [...game.user.targets] : canvas.tokens.objects.children.filter(t => t._controlled);
//     //on obtient le personnage en cours de selections
//     let actor = ChatMessage.getSpeaker().actor;
//     if(actor==null) {
//       console.log("Selectionner un personnage");
//     } else {
      // faire une demande de défense, puis appliquer les calcul (@Nom)
      // let template = "systems/hitos/templates/chat/chat-drama.html";
      // dialogData = {
      //     title: game.i18n.localize("Drama"),
      //     total: result,
      //     damage: damage,
      //     dicesOld: dicesOld,
      //     dices: dicesNew.sort((a, b) => a - b),
      //     actor: actor.id,
      //     mods: mods,
      //     weaponDamage: weaponDamage,
      //     weaponKindBonus: weaponKindBonus,
      //     data: actor.system,
      //     config: CONFIG.hitos,
      // };
      // html = await renderTemplate(template, dialogData);
      // ChatMessage.create({
      //     content: html,
      //     speaker: {alias: actor.name},
      //     type: CONST.CHAT_MESSAGE_TYPES.ROLL, 
      //     rollMode: game.settings.get("core", "rollMode"),
      //     roll: newRoll
      // });
//     }
//     break;
// }