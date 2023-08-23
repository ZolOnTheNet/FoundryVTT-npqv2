/*
 * // fichier inutile : a suppr, la fonction ci dessous est une copie original de l'aiguiallage Metal
 */
function aiguillageGeMsgFusion(cmdArgs=["msg","rien"], obj={}){
//--- spécifité Fusion : système de conflit avec le minimum de jet
// pas de jet en défense ou en attaque : tous les jets sont mis en attaque, mais on compare les résultat brut de qualité
// celui qui gagne : ajoute sa menace, quite à les lancer, et applique le resltat à sa cible 
// celui qui perd : ajoute sa ou ses couvertures active, quite à les lancer, et prendra son encaissement
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
          passerJetAttaqueFusion(objAct, objToken, obj, avecDom);
        }
        else if (cmdArgs[2]==="defense") {
          // transformer le jet en jet de défense !
          let avecPr = (cmdArgs[3] !== undefined);
          passerJetAttaqueFusion(objAct, objToken, obj, avecPr);
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

/***
 * EXPORT ---------------
 */
export { aiguillageGeMsgFusion }
