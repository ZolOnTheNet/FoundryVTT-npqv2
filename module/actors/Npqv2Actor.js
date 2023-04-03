/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 * pas de default !
 */
import { quelRang } from "../utils.js";

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
        this._prepareCharacterData(actorData);
        this._prepareNpcData(actorData);
      }
    
      /**
       * Prepare Character type specific data
       */
      _prepareCharacterData(actorData) {
        if (actorData.type !== 'pj') return; // Seulement PJ !
     // TODO : modifier le code pour les bonus
        // Make modifications to data here. For example:
        //const data = actorData.data;
        const data = actorData.system;
        //----------------- Calcul de la valeur d'état : seuil de réussite -------------------------------
        const lesEtats=['DPdM','fatigue','faiblesse','tension']; // Mes quatre type d'état
        let i = 0;
        if(data.etats.incMagie >0) i = 1; // la magie n'est pas compté dans le seuil de calcul
        let seuilRangFinal = 0;
        let curRang = 0;
        for(;i < lesEtats.length; i++) {
          curRang = quelRang(data.etats[lesEtats[i]])
          if(curRang > seuilRangFinal) seuilRangFinal = curRang;
        }
        data.etats.value = data.etats.diff["rang"+seuilRangFinal]; //tableau des seuil
        
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
        if (actorData.type == 'pj') return; // càd pour l'instant Monstre, figurants
        const data = actorData.system;
        // Make modifications to data here. For example:
        //const data = actorData.data;
        //data.xp = (data.cr * data.cr) * 100;
         //----------------- Calcul de la valeur de compteur : seuil de réussite -------------------------------
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
    
    }