/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 * pas de default !
 */
import { quelRang, AppliqueEtatValeur } from "../utils.js";

 export class npqv2Actor extends Actor {
    prepareData() {
        // Prepare data for the actor. Calling the super version of this executes
        // the following, in order: data reset (to clear active effects),
        // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
        // prepareDerivedData().
        super.prepareData();
      }
    
      /** @override */
      prepareBaseData() {
        // Data modifications in this step occur before processing embedded
        // documents or derived data.
      }
    
      /**
       * @override
       * Augment the basic actor data with additional dynamic data. Typically,
       * you'll want to handle most of your calculated/derived data in this step.
       * Data calculated in this step should generally not exist in template.json
       * (such as ability modifiers rather than ability scores) and should be
       * available both inside and outside of character sheets (such as if an actor
       * is queried and has a roll executed directly from it).
       */
      prepareDerivedData() {
        // mise en conformité v10
        //const actorData = this.data;
        //const data = actorData.data;
        const actorData = this;
     // Pour l'instant non utilisé
     //   const data = actorData.system;
     //   const flags = actorData.flags.boilerplate || {};
    
        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        this._prepareCharacterData6(actorData);
        this._prepareCharacterData7(actorData);
        this._prepareNpcData(actorData);
      }
    
      /**
       * Prepare Character type specific data
       */
      _prepareCharacterData7(actorData) {
        if (actorData.type !== 'pj') return; // Seulement PJ !
     // TODO : modifier le code pour les bonus
        // Make modifications to data here. For example:
        //const data = actorData.data;
        const data = actorData.system;
        // migration template -----------------------------------------------

        // début du traitement de  l'état ------ certain traitement pourraient être dans la partie feuille (sheet)
        //const lesEtats=['DPdM','fatigue','faiblesse','tension']; // Mes quatre type d'état
        const lesEtats=['fatigue']; // des 4 état il ne reste que fatigue
        const EtatsMin =[ 3 ];
        // const EtatRMax = [ -1, 3, 3, 3]; // le dernier rang ne fonctionne pas comme les 3 premiers -1 => faire comme les autres, 3 fixe à 3. Pbl gestion PMax
        let i = 0;
        // Etre sur que les seuils et les max sont ok ---------------------------
        // faudra surment repoter cela qqpart pour que cela soit pris en compte au maj
        // faire traitement pour le cas du magic (cmp sorcier ou magicien)
        for(i = 0;i < lesEtats.length; i++) {
          data.etats[lesEtats[i]].max = 0;
          for(let j = 1; j < 5; j++) {// attention faudra modifier le dernier rang vis à vis de autres
            if(data.etats[lesEtats[i]].rangs["rang"+j].offset === undefined) data.etats[lesEtats[i]].rangs["rang"+j].offset = EtatsMin[lesEtats[i]]; // correction tant que le champs n'est pas créer automatiquement
            data.etats[lesEtats[i]].rangs["rang"+j].seuil = data.etats.diff["rang"+j];
            data.etats[lesEtats[i]].rangs["rang"+j].max = data.etats[lesEtats[i]].cmp + data.etats[lesEtats[i]].rangs["rang"+j].offset; // doit être fait au momen du changement
            data.etats[lesEtats[i]].max += data.etats[lesEtats[i]].rangs["rang"+j].max;
          }
        }
        //----------------- equilibrage des états -------------------------------
        // let etatEtats= [];
        for(i = 0;i < lesEtats.length; i++) {
        //   etatEtats[i] = this.repartiVal(data.etats[lesEtats[i]]);
          AppliqueEtatValeur(data.etats[lesEtats[i]]);
        }

        //----------------- Calcul de la valeur d'état : seuil de réussite -------------------------------
        //if(data.etats.incMagie >0) i = 1; // la magie n'est pas compté dans le seuil de calcul
        let seuilRangFinal = 0;
        let curRang = 0;
        for(i = 0;i < lesEtats.length; i++) {
          curRang = quelRang(data.etats[lesEtats[i]])
          data.etats[lesEtats[i]].seuilAct = data.etats.diff["rang"+curRang];
          if(curRang > seuilRangFinal) seuilRangFinal = curRang;
        }
        data.etats.value = data.etats.diff["rang"+seuilRangFinal]; //tableau des seuil
        data.jet.seuil = data.etats.value ;
        
        // dés Bonus des attributs 
        for(const element in data.cmp){
          data.cmp[element].debonus = game.Constantes.deBonus[data.cmp[element].value]; // devra mettre le bon code de traduction (game.i18n.localize)
        };      // traitement des jets  création d'un mini objet { t, txt, d } pour type, texte, nbdés
      
        // mettre ici les bonus ! Pour l'instant hors système 
        // const bonus = {"score":0,"dommage":"","pinit":0,"PdM":0,"PdV":0};
/*        const bonusLst = actorData.items.filter(item => item.type === "objet" && item.data.data.actif==true);
        for(let i of bonusLst){
          bonus.score += (i.data.data.bonus.score != 0)?(i.data.data.bonus.score):0;
          bonus.dommage += (i.data.data.bonus.dommage != "")?"+("+i.data.data.bonus.dommage+")":"";
          bonus.PdM  += (i.data.data.bonus.PdM)?i.data.data.bonus.PdM:0;
          bonus.PdV  += (i.data.data.bonus.PdV)?i.data.data.bonus.PdV:0;
        }
        data.PdMTot = data.PdM.max+bonus.PdM; // correction rapide pour les points de magie et de vie
        data.PdVTot = data.PdV.max+bonus.PdV;
        //if(typeof data.attrder.pinit_base.value === 'string')data.attrder.pinit_base.value = parseInt(data.attrder.pinit_base.value,10)
        //data.attrder.pinit_finaux.value = data.attrder.pinit_base.value+bonus.pinit;
        data.bonus = bonus;
 */
    }
      /**
       * Prepare NPC type specific data. 
       */
      _prepareNpcData(actorData) {
        if (actorData.type.substring(0,2) == 'pj') return; // càd pour l'instant Monstre, figurants
        const data = actorData.system;
        let curRang = quelRang(data.compteur);
        data.compteur.seuil = data.compteur.diff["rang"+curRang];
        let valcour = 0
        for(let j = 1; j < 5 ; j++) { // nombre de rang
          valcour += data.compteur.rangs["rang"+j].max;
          data.compteur.rangs["rang"+j].seuil = data.compteur.diff["rang"+j];
        }
        data.compteur.max = valcour; 
      }
    
      /**
       * Override getRollData() that's supplied to rolls.
       */
      getRollData() {
        const data = super.getRollData();
    
        // Prepare character roll data.
        this._getCharacterRollData(data);
        this._getNpcRollData(data);
    
        return data;
      }
    
      /**
       * Prepare character roll data.
       */
      _getCharacterRollData(data) {
        if (this.type !== 'pj') return;
    
        // Copy the ability scores to the top level, so that rolls can use
        // formulas like `@str.mod + 4`.
/*        if (data.attributs) {
          for (let [k, v] of Object.entries(data.attributs)) {
            data[k] = foundry.utils.deepClone(v);
          }
        }
*/
       // Add level for easier access, or fall back to 0.
       //   if (data.attributes.level) {
       //     data.lvl = data.attributes.level.value ?? 0;
       //   }
        
       }
    
      /**
       * Prepare NPC roll data.
       */
      _getNpcRollData(data) {
        if (this.type == 'pj') return;
    
        // Process additional NPC data here.
      }

// _onUpdate(data, options, userId) {

//   if(data.system.etats !== undefined) { // modif de la partie état
//     for( const txtetat in data.system.etats)  {
//       if(data.system.etats[txtetat].rangs !== undefined) { // modi
//         for(const txtrng in data.system.etats[txtetat].rangs) {
//           if(data.system.etats[txtetat].rangs[txtrng].max !== undefined) { // c'est max qui est changé => effort doit être recalculer
//             data.system.etats[txtetat].rangs[txtrng].offset = data.system.etats[txtetat].rangs[txtrng].max - data.system.etats[txtetat].rangs[txtrng].cmp
//           }
//         } 
//       }     
//       if(data.system.etats[txtetat].cmp !== undefined) { // changement

//       }
//     } 
//   }
//   super._onUpdate(data, options, userId);  
// }
_prepareCharacterData6(actorData) {
  if (actorData.type !== 'pj6') return; // Seulement PJ !
// TODO : modifier le code pour les bonus
  // Make modifications to data here. For example:
  //const data = actorData.data;
  const data = actorData.system;

  // migration template -----------------------------------------------
  //if(actorData.system.formulaSR === undefined) context.system.formulaSR = ""; // migrantion template

  // début du traitement des états ------ certain traitement pourraient être dans la partie feuille (sheet)
  const lesEtats=['DPdM','fatigue','faiblesse','tension']; // Mes quatre type d'état
  const EtatsMin =[ 0, 3, 3 , 3 ];
  // const EtatRMax = [ -1, 3, 3, 3]; // le dernier rang ne fonctionne pas comme les 3 premiers -1 => faire comme les autres, 3 fixe à 3. Pbl gestion PMax
  let i = 0;
  // Etre sur que les seuils et les max sont ok ---------------------------
  // faudra surment repoter cela qqpart pour que cela soit pris en compte au maj
  // faire traitement pour le cas du magic (cmp sorcier ou magicien)
  for(i = 0;i < lesEtats.length; i++) {
    data.etats[lesEtats[i]].max = 0;
    for(let j = 1; j < 5; j++) {// attention faudra modifier le dernier rang vis à vis de autres
      if(data.etats[lesEtats[i]].rangs["rang"+j].offset === undefined) data.etats[lesEtats[i]].rangs["rang"+j].offset = EtatsMin[lesEtats[i]]; // correction tant que le champs n'est pas créer automatiquement
      data.etats[lesEtats[i]].rangs["rang"+j].seuil = data.etats.diff["rang"+j];
      data.etats[lesEtats[i]].rangs["rang"+j].max = data.etats[lesEtats[i]].cmp + data.etats[lesEtats[i]].rangs["rang"+j].offset; // doit être fait au momen du changement
      data.etats[lesEtats[i]].max += data.etats[lesEtats[i]].rangs["rang"+j].max;
    }
  }
  //----------------- equilibrage des états -------------------------------
  // let etatEtats= [];
  for(i = 0;i < lesEtats.length; i++) {
  //   etatEtats[i] = this.repartiVal(data.etats[lesEtats[i]]);
    AppliqueEtatValeur(data.etats[lesEtats[i]]);
  }

  //----------------- Calcul de la valeur d'état : seuil de réussite -------------------------------
  //if(data.etats.incMagie >0) i = 1; // la magie n'est pas compté dans le seuil de calcul
  let seuilRangFinal = 0;
  let curRang = 0;
  for(i = 0;i < lesEtats.length; i++) {
    curRang = quelRang(data.etats[lesEtats[i]])
    data.etats[lesEtats[i]].seuilAct = data.etats.diff["rang"+curRang];
    if(curRang > seuilRangFinal) seuilRangFinal = curRang;
  }
  data.etats.value = data.etats.diff["rang"+seuilRangFinal]; //tableau des seuil
  data.jet.seuil = data.etats.value ;
  
  // mettre ici les bonus ! Pour l'instant hors système 
  // const bonus = {"score":0,"dommage":"","pinit":0,"PdM":0,"PdV":0};
/*        const bonusLst = actorData.items.filter(item => item.type === "objet" && item.data.data.actif==true);
  for(let i of bonusLst){
    bonus.score += (i.data.data.bonus.score != 0)?(i.data.data.bonus.score):0;
    bonus.dommage += (i.data.data.bonus.dommage != "")?"+("+i.data.data.bonus.dommage+")":"";
    bonus.PdM  += (i.data.data.bonus.PdM)?i.data.data.bonus.PdM:0;
    bonus.PdV  += (i.data.data.bonus.PdV)?i.data.data.bonus.PdV:0;
  }
  data.PdMTot = data.PdM.max+bonus.PdM; // correction rapide pour les points de magie et de vie
  data.PdVTot = data.PdV.max+bonus.PdV;
  //if(typeof data.attrder.pinit_base.value === 'string')data.attrder.pinit_base.value = parseInt(data.attrder.pinit_base.value,10)
  //data.attrder.pinit_finaux.value = data.attrder.pinit_base.value+bonus.pinit;
  data.bonus = bonus;
*/
}

passerJetAttaque(params={}) {
  // "attResultat": { "code": "NORM", "score": 0, "nbQualites" : 0, "cibles" : "", "info": "", "MeFormule":"", "MeTot" : 0, "infoJet":"", "dataJet": ""}
  // infoJet récupère le max de donnée du jet et dataJet récupère le max d'info du roll du jet
  // params devra complété...
  let actorData = this;
  let objUpd = {};
  objUpd["system."]
}

}