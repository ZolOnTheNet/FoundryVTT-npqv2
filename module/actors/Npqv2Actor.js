/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 * pas de default !
 */
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
        const actorData = this.data;
        const data = actorData.data;
        const flags = actorData.flags.boilerplate || {};
    
        // Make separate methods for each Actor type (character, npc, etc.) to keep
        // things organized.
        this._prepareCharacterData(actorData);
        this._prepareNpcData(actorData);
      }
    
      /**
       * Prepare Character type specific data
       */
      _prepareCharacterData(actorData) {
        if (actorData.type !== 'pj') return;
     // TODO : modifier le code pour les bonus
        // Make modifications to data here. For example:
        const data = actorData.data;
        const bonus = {"score":0,"dommage":"","pinit":0,"PdM":0,"PdV":0};
        // mettre ici les bonus !
        const bonusLst = actorData.items.filter(item => item.type === "objet" && item.data.data.actif==true);
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
    }
      /**
       * Prepare NPC type specific data.
       */
      _prepareNpcData(actorData) {
        if (actorData.type !== 'pnj') return;
    
        // Make modifications to data here. For example:
        //const data = actorData.data;
        //data.xp = (data.cr * data.cr) * 100;
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
        if (this.data.type !== 'pj') return;
    
        // Copy the ability scores to the top level, so that rolls can use
        // formulas like `@str.mod + 4`.
        if (data.attributs) {
          for (let [k, v] of Object.entries(data.attributs)) {
            data[k] = foundry.utils.deepClone(v);
          }
        }
       // Add level for easier access, or fall back to 0.
       //   if (data.attributes.level) {
       //     data.lvl = data.attributes.level.value ?? 0;
       //   }
        
       }
    
      /**
       * Prepare NPC roll data.
       */
      _getNpcRollData(data) {
        if (this.data.type !== 'pnj') return;
    
        // Process additional NPC data here.
      }
    
    }