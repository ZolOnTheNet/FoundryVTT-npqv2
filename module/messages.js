import { lstCibles, cibleTxt, isFormule, DonnerNomReelActeur } from "./utils.js";
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
  if(obj?.idToken !== null && obj.idToken !=="") {
    objToken = game.scenes.get(game.user.viewedScene).tokens.get(obj.idToken);
    //jQuery.extend(true, objAct, objToken.actor, objToken.actorData)
    objAct = objToken.actor; // fusion Acteur+ dataActeur, lié au token
  }  else if(obj?.idActeur) objAct = game.actors.get(obj.idActeur); // peut être un message ui ?.
  switch(cmdArgs[1]) {
    case "arme":
      let avecDom = (cmdArgs[3] !== undefined);
      if(cmdArgs[2]=== "attaque") {
        // transformer le jet en jet d'attaque courant !
        passerJetAttaque(objAct, objToken, obj, avecDom);
      }
      else if (cmdArgs[2]==="defense") {
        // transformer le jet en jet de défense !
        let avecPr = (cmdArgs[3] !== undefined);
        passerJetDefense(objAct, objToken, obj, avecPr);
      }
      break;
    case "dom":
    case "cible":
      if(cmdArgs[2]==="dom") { // faire les dommages sur cette cible
        if(obj.cible !==undefined) {
          let oc = game.scenes.get(game.user.viewedScene).tokens.get(obj.cible);
          if(oc !== undefined){ // a ton une cible (objet cible)
            let valDef = (oc.actor.system.defResultat.code==="DEF")?oc.actor.system.defResultat.MeTot:0;
            let valAtt = objAct.system.attResultat.MeTot;
            let monTexte = "";
            if(valAtt > valDef) {
              let diff = valAtt - valDef;
              if(diff <= oc.actor.system.seuilRupture) {
                monTexte += "Attaque réussite : vous lui occasionnez "+ (diff)+" points de effort";
                let champ = (oc.actor.type === "figurant")? "system.compteur.value":"system.etats.effort";
                let nouvelleFatigue = ((oc.actor.type === "figurant")? oc.actor.system.compteur.value+diff: oc.actor.system.etats.effor.value-diff) ;
                let obj={}; obj[champ] = nouvelleFatigue;
                oc.actor.update(obj);
              } else { // dépassement de seuil de rupture !
                let tranche = oc.actor.system.compteur.decoupe * Math.floor(diff/oc.actor.system.compteur.decoupe);
                monTexte += "Attaque dangereuse réussite : vous lui occasionnez "+ tranche + " points de fatigue";
                let nouvelleFatigue = ((oc.actor.type === "figurant")? oc.actor.system.compteur.value+tranche: oc.actor.system.etats.fatigue.value+tranche) ;
                let champ = (oc.actor.type === "figurant")? "system.compteur.value":"system.etats.fatigue";
                let obj={}; obj[champ] = nouvelleFatigue;
                oc.actor.update(obj);
              }
            } else {
              monTexte += "Désolé vous n'avez pas réussi votre attaque : sa défense(" + valDef +") est plus grande que votre attaque("+valAtt+")."
            }
            messageTxt(monTexte)
          }
        }
      }
    case "jet":
      if(cmdArgs[2]==="relance") {
        // taiter la possibiltié de relance avec un aspect autorisé 
      }
      break;  
    case "magie":
      if(cmdArgs[2]==="add"){
        //ajouter les points de magie à la personne
      }
      break;
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
function passerJetAttaque(objAct={}, objToken, obj = {}, avecDom = false) {
    // obj contien les infos sur l'objet original, objToken est l'objet, objAct est un compie fusionné car il peut venir de deux source : token et acteur
    // "attResultat": { "code": "NORM", "score": 0, "nbQualites" : 0, "cibles" : "", "info": "", "MeFormule":"", "MeTot" : 0, "infoJet":"", "dataJet": ""}
    // infoJet récupère le max de donnée du jet et dataJet récupère le max d'info du roll du jet
    // params devra complété...
    let fromActor = (objToken.actorData === undefined) || isEmpty(objToken.actorData); 
    fromActor = (objToken.isLinked)?true:fromActor; 
    let codePrefix = ""; // token.actor = fusion entre Actor et actorData
    let actorData = objToken?.actor.system;
    if(fromActor) {
        actorData = game.actors.get(obj.idActor).system;
        //codePrefix = "";
    }
//    actorData = (fromActor)?objToken.actor.system: objToken.actorData.system;
    let valAtt = (actorData.attResultat.MeRJet>0)?actorData.attResultat.MeRJet:actorData.attResultat.MeFormule;
    if(valAtt ==="") valAtt =0;
    let valAttAff = 0; let r = null;
    if( isFormule(valAtt)) {
      if(avecDom) {
        r = new Roll(valAtt);
        r.evaluate({async :false });
        //actorData.attResultat.MeRJet = r.total;
        obj.rollDom = r;
        valAttAff = r.total;
      }
    } else {
      valAttAff = parseInt(valAtt);
      avecDom = true;
    } 

    let objUpd = {};
    objUpd[codePrefix +"system.jet.pouvoir"]= obj.pouvoir; // transfert de point de pouvoir
    objUpd[codePrefix +"system.attResultat.pouvoir"]= obj.pouvoir;
    objUpd[codePrefix +"system.attResultat.score"]= obj.resultat;
    objUpd[codePrefix +"system.attResultat.nbQualites"]= obj.qualite;
    objUpd[codePrefix +"system.attResultat.cibles"]= obj.cibles;
    objUpd[codePrefix +"system.attResultat.code"]= "ATT";
    objUpd[codePrefix +"system.attResultat.lancer"]= obj.lancer;
    objUpd[codePrefix +"system.attResultat.paris"]= obj.paris;
    if(avecDom) objUpd[codePrefix +"system.attResultat.MeRJet"]= valAttAff;
    if(avecDom) objUpd[codePrefix +"system.attResultat.MeTot"]= valAttAff+obj.qualite;
    objUpd[codePrefix +"system.attResultat.MeFormule"]= valAtt;
    objUpd[codePrefix +"system.attResultat.info"]= JSON.stringify(obj.roll);
    objUpd[codePrefix +"system.attResultat.dataJet"]= JSON.stringify(actorData.jet);
    if(fromActor) objAct.update(objUpd);
      else objToken.actor.update(objUpd);
    //---- message pour les dommages
    //actorData.attResultat.MeRJet // faudra peut être la lancer
    let monText ="";
    if(avecDom) {
      monText = "Votre valeur d'attaque est de ("+obj.qualite + "+" + valAttAff+")="+(valAttAff+obj.qualite)+"<br>";
      let cibles = lstCibles(obj.idActeur); 
      for(let e of cibles){ // ou le token
        obj.cible = e.id;
        monText += `<a class="apply-cmd" title="Faire les Dommage à `+ DonnerNomReelActeur(e.actor, e) + `" data-cmd="msg.cible.dom" data-roll='`+ JSON.stringify(obj)+ `'><i class="fas fa-user-minus"></i></a>&nbsp;`;
      }
    } else {
      monText = "Votre valeur d'attaque est de " + obj.qualite+ "+" +valAtt + "<br>"+
      `<a class="apply-cmd" data-cmd="msg.arme.dom" data-roll='`+ JSON.stringify(obj)+ `'> <i class="fal fa-swords"></i>&nbsp; lancer les dommages </a>`;
    }
    let objDef = {};
    let lstcibles = lstCibles();
    if(lstcibles.length ===0) lstcibles =obj.cibles; // si pas de cible courante : prendre les cibles classiques
    if(lstcibles === undefined) lstcibles =[];
    if(lstcibles.length > 0) {
      // traiter toutes les cibles et pas que seulement la premère
      objDef = lstcibles[0]; // le token selectionnée (obligatiorement)      
      //jQuery.extend(true, objUpd, objDef.actor, objDef.actorData);
      objUpd = objDef.actor;
      monText += `<br>votre cible est ` +  objDef.name + " (Acteur :"+ objUpd.name +") ";
      if(objDef.isLinked) monText += ": "+cibleTxt(objDef.actorId, objDef.name);
      if(objUpd.system.defResultat.code === "DEF" || objUpd.system.defResultat.code === "DEFX") { // elle possède une défense 
        monText += `possède une valeur de défense de` +  (parseInt(objUpd.system.defResultat.nbQualites) + parseInt(objUpd.system.defResultat.MeRJet));
      }
    } else {
      monText += `aucune cible n'est selectionnée, choisissez un personnage et utiliser le bouton ci-dessous `+
            ` <br> <a class="apply-cmd" data-cmd="msg.perso.dom" data-roll='`+ JSON.stringify(obj)+ `'><i class="fas fa-user-minus"></i>Enlever les Dommages</a>`
    }
    // faire le jet ou utiliser la base/
    messageTxt(monText);
  }

  function passerJetDefense(objAct={}, objToken, obj = {},  avecPr = false) {
    // obj contien les infos sur l'objet original, objToken est l'objet, objAct est un compie fusionné car il peut venir de deux source : token et acteur
    // "attResultat": { "code": "NORM", "score": 0, "nbQualites" : 0, "cibles" : "", "info": "", "MeFormule":"", "MeRJet" : 0, "infoJet":"", "dataJet": ""}
    // infoJet récupère le max de donnée du jet et dataJet récupère le max d'info du roll du jet
    // params devra complété...
    // -----------------------------------------------------------
    // objToken peut être null TODO : gerer
    // let fromActor = (objToken.actorData === undefined) || isEmpty(objToken.actorData); 
    // fromActor = (objToken.isLinked)?true:fromActor; 
    // let codePrefix = "actorData."
    // let actorData = objToken?.actorData.system;
    // if(fromActor) {
    //     actorData = game.actors.get(obj.idActor).system;
    //     codePrefix = "";
    // }
    // -----------------------------------------
    let fromActor = (objToken.actorData === undefined) || isEmpty(objToken.actorData); 
    fromActor = (objToken.isLinked)?true:fromActor; 
    let codePrefix = ""; // token.actor = fusion entre Actor et actorData
    let actorData = objToken?.actor.system;
    if(fromActor) {
        actorData = game.actors.get(obj.idActor).system;
        //codePrefix = "";
    }
    let valDef = (actorData.defResultat.MeRJet>0)?actorData.defResultat.MeRJet:actorData.defResultat.MeFormule;
    if(valDef ==="") valDef = 0;
    let valDefAff = 0; let r = null;
    if(isFormule(valDef)){
      if(avecPr){
        r = new Roll(valAtt)
        r.evaluate({async :false });
        //actorData.attResultat.MeRJet = r.total;
        obj.rollPr = r;
        valDefAff = r.total;
      }
    } else { // valeur purement numérique
      valDefAff = parseInt(valDef);
      avecPr = true;
    }
    let objUpd = {};
    objUpd[codePrefix +"system.defResultat.score"]= obj.resultat;
    objUpd[codePrefix +"system.defResultat.nbQualites"]= obj.qualite;
    objUpd[codePrefix +"system.defResultat.cibles"]= obj.cibles;
    objUpd[codePrefix +"system.defResultat.code"]= "DEF";
    objUpd[codePrefix +"system.defResultat.lancer"]= obj.lancer;
    objUpd[codePrefix +"system.defResultat.paris"]= obj.paris;
    if(avecPr) objUpd[codePrefix +"system.defResultat.MeRJet"]= valDefAff;
    if(avecPr) objUpd[codePrefix +"system.defResultat.MeTot"]= valDefAff+obj.qualite;
    objUpd[codePrefix +"system.defResultat.MeFormule"]= valDef;
    objUpd[codePrefix +"system.defResultat.info"]= JSON.stringify(obj.roll);
    objUpd[codePrefix +"system.defResultat.dataJet"]= JSON.stringify(actorData.jet);
    if(fromActor) objAct.update(objUpd);
      else objToken.actor.update(objUpd);
    let monText = "";
    if(avecPr) {
      monText +="votre valeur de défense est ("+obj.qualite + "+" + valDefAff+")="+(valDefAff+obj.qualite)+"<br>";
    } else { // uniquement si formule 
      monText += "Votre valeur de défense est de " + obj.qualite+ "+" +valDefAff + "<br>"+
      `<a class="apply-cmd" data-cmd="msg.def.pr" data-roll='`+ JSON.stringify(obj)+ `'> <i class="fal fa-shield"></i>&nbsp; lancer la protection </a>`
    }
    monText += "l'attaquant peut vous faire une attaque..."
    messageTxt(monText);
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