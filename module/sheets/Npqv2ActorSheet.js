import {lanceLesDes, simpleDialogue, lancerDeBrut, DialogueDommage} from "../utils.js"
export default class npqv2ActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["npqv2", "sheet", "actor"],
        template: "systems/npqv2/templates/personnage-sheet.html", // attention c'est template() qui retourne le véritable nom
        width: 655,
        height: 519,
        tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "features" }]
      });
    }
  
    /** @override , selection du fichier front end en fonction du type d'acteur (ici PJ, Boss, demi-Boss et figurant) */
    get template() {
      console.log("NPQv2 | ouvre : systems/npqv2/templates/sheets/actor-"+this.actor.type+"-sheet.html");
      return `systems/npqv2/templates/sheets/actor-${this.actor.type}-sheet.html`;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      // Retrieve the data structure from the base sheet. You can inspect or log
      // the context variable to see the structure, but some key properties for
      // sheets are the actor object, the data object, whether or not it's
      // editable, the items array, and the effects array.
      const context = super.getData();
  
      // Use a safe clone of the actor data for further operations.
      const actorData = this.actor.toObject(false);
  
      // Add the actor's data to context.data for easier access, as well as flags.
      context.system = actorData.system;  // peut être changer data en système après relecture
      context.flags = actorData.flags;
  
      // Prepare character data and items.
      if (actorData.type == 'pj') {
        this._prepareItems(context);
        this._prepareCharacterData(context);
      }
  
      // ------ Les différents NPC ---------------
      // Prepare NPC data and items.
      if (actorData.type == 'pnj') {
        this._prepareItems(context);
      }
      if (actorData.type == 'figurant') {
        this._prepareItemsFig(context);
      }
      // Add roll data for TinyMCE editors.
      context.rollData = context.actor.getRollData();
      
      console.log("NPQv2| context:", context);
      return context;
    }
  
    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareCharacterData(context) {
      // // Handle ability scores.
      // for (let [k, v] of Object.entries(context.data.attributs)) {
      //   v.label = game.i18n.localize(CONFIG.NPQV1.attributs[k]) ?? k;
      // }
    }
  
    /**
     * Organize and classify Items for Character sheets.
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareItems(context) {
      // Initialize containers.
      const gear = [];
      const features = [];
      const domaines = [];
      const competences = [];
      const secrets = [];
      const ArmesResum = [];
      const bourses = [];
      const bonus = {"score":0,"deSup":0,"dommage":"","PdM":0,"PdV":0};
      const spells = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
      };
  
      let bib = context.system.biography.split('</p>');
      if (Array.isArray(bib)){
        if (bib.length < 6){
          //context.data.biography += "<br>&nbsp<br><br><br>";
          context.system.biography += "<p><br></p><p><br></p><p><br></p><p><br></p><p><br></p>";
        }
      }
  /*
      // Iterate through items, allocating to containers
      for (let i of context.items) {
        i.img = i.img || DEFAULT_TOKEN;
        // Append to gear.
        if (i.type === 'objet') {
          i.data.descRapide = i.data.description.substring(0,(i.data.description+".").indexOf("."));
          i.data.utiRapide  = i.data.utilisation.substring(0,(i.data.utilisation+".").indexOf("."));
          i.data.isArme = !(i.data.typeObjet=='O'); // c'est une arme si c'est pas un objet de type O
          if(i.data.actif) {
            bonus.score += (i.data.bonus.score != 0)?(i.data.bonus.score):0;
            bonus.dommage += (i.data.bonus.dommage != "")?"+("+i.data.bonus.dommage+")":"";
            bonus.deSup += (i.data.bonus.deSup != 0)?i.data.bonus.deSup:0;
            bonus.PdM  += (i.data.bonus.PdM)?i.data.bonus.PdM:0;
            bonus.PdV  += (i.data.bonus.PdV)?i.data.bonus.PdV:0;
           }
          gear.push(i);
        }
        else if (i.type === 'domaine') {
          // on lui ajoute le résumé (pour l'instant jusqu'au premier point)
          i.data.descRapide = (i.data.description).substring(0,(i.data.description+".").indexOf("."));
          domaines.push(i);
        } 
        else if (i.type === 'competence'){
          i.data.descRapide = (i.data.description+".").substring(0,(i.data.description+".").indexOf("."));
          if(i.data.idLien != ""){
            // calcul si spécialisation
            let it = context.actor.items.get(i.data.idLien);
            i.data.scoreRel = i.data.score + it.data.data.score;
          }else {
            i.data.scoreRel = i.data.score;
          }
          competences.push(i);
        }
        // Append to features.
        else if (i.type === 'feature') {
          features.push(i);
        }
        else if (i.type === 'secret') {
          if(i.data.niveau >0 && i.data.niveau < i.data.niveauMax) {
            i.data.nomMax = i.data["niv"+i.data.niveau].nom;  
          } else  i.data.nomMax = "";
          secrets.push(i);
        }
        // ajouter dans les résumés des armes
        else if( i.type === 'arme_resum'){
          i.data.descRapide = i.data.special.substring(0,(i.data.special+".").indexOf('.'));
          i.data.NomAffiche = "-non déf-";
          if(i.data.desync == 0) {
            i.data.score = 0;
            i.data.deSup = 0;
            i.data.degat ="";
            i.data.bris = -1;
          }
          if(i.data.idarmeref !== "") {
            //let a = context.items[i.data.idarmeref];
            let a = context.actor.items.get(i.data.idarmeref);
            if(a !== undefined){
              // si synchro alors on ajouter les bonus 
              i.data.NomAffiche = a.name;
              if(i.data.desync == 0) {
                // if(a.data.data.initiative ==""){
                //   i.data.jetinit = a.data.data.pinitDes 
                //   if(a.data.data.bonus.pinit != 0 ) i.data.jetinit += "+ (" +a.data.data.bonus.pinit +")";
                // } else {
                //   i.data.jetinit = a.data.data.initiative; // l'initiative de l'arme modifié
                // }
                i.data.score = i.data.score + a.data.data.bonus.score;
                i.data.bris = a.data.data.bris; // a mettre dans objet
                i.data.resistance = a.data.data.resistance // a metrte dans objet
                i.data.degat = a.data.data.dommage ;
                // ça fonctione pus comme ça !  : if(a.data.data.bonus.dommage !="+0") i.degat = i.degat + " +("+a.data.data.bonus.dommage+")";
                //i.data.Bdc = a.data.data.attrder.BDomC ; // il faudra changer cela (peut être une liste)
              }
            } 
          }
          if(i.data.idcmpref !== ""){
            //let c = context.items[i.data.idcmpref];
            let c = context.actor.items.get(i.data.idcmpref);
            if(c !== undefined){
              i.data.NomAffiche = i.data.NomAffiche + "("+c.name+")";
              i.data.BPro = c.data.data.BPro;
              // calcul
              if(i.data.desync == 0) {
                i.data.score = i.data.score + c.data.data.score;
              }    
            } 
          }
          if(i.data.munitions > -1) {
            i.data.AMunition = true;
          } else i.data.AMunition = false;
          ArmesResum.push(i);
        }
        // Append to spells.
        else if (i.type === 'sort') {
          i.data.descRapide = i.data.description.substring(0,(i.data.description+".").indexOf("."));
          if(i.data.idLien != ""){
            // calcul si spécialisation
            let it = context.actor.items.get(i.data.idLien);
            i.data.scoreRel = i.data.score + it.data.data.score;
          }else {
            i.data.scoreRel = i.data.score;
          }
          if (i.data.niveau != undefined) {
            spells[i.data.niveau].push(i);
          }
        }
        else if (i.type === 'argent') {
          bourses.push(i);
        }
     }
  */
      // Assign and return
      context.gear = gear;
      context.features = features;
      context.spells = spells;
      context.domaines = domaines;
      context.competences = competences;
      context.secrets = secrets;
      context.ArmesResum = ArmesResum;
      context.bourses = bourses;
      // context.bonus = bonus;
      context.bonus = this.actor.system.data.bonus;
    }
  
    _prepareItemsFig(context) {
      // tableau minimu des items. Specialité, extra et normalement, besogne sont des items "Aspects"
      const armes = [];  // les armes utilisables par le figurant
      const armures = [];  // armure portée au moment de la rencontre
      const specialite = []; // Aspect spécialité
      const extra = []; // Aspect considéré comme extra si on réduit le compteur
      const secrets = []; // si on veut k²isé les figurants
      const bourses = []; // différentes bourses et trésort
      const mago = false; 
      const sorts = { // si c'est un magicien
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
      };
  

    }
  
    /* -------------------------------------------- */
  
    /** @override */
    activateListeners(html) {
      super.activateListeners(html);
  
      // Render the item sheet for viewing/editing prior to the editable check.
      html.find('.item-edit').click(ev => {
        const li = $(ev.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("itemId"));
        item.sheet.render(true);
      });
  
      // -------------------------------------------------------------
      // Everything below here is only needed if the sheet is editable
      if (!this.isEditable) return;
  
      // Add Inventory Item
      html.find('.item-create').click(this._onItemCreate.bind(this));
  
      // Delete Inventory Item
      html.find('.item-delete').click(ev => {
        const li = $(ev.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("itemId"));
        item.delete();
        li.slideUp(200, () => this.render(false));
      });
  
    //   // Active Effect management
    //   html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));
  
      // Rollable abilities.
      html.find('.rollable').click(this._onRoll.bind(this));
  
    //   // Drag events for macros.
    }
  
  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `Nouveau ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }
  
  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if(dataset.rollType === undefined || dataset.rollType=="") dataset.rollType ="debase";
    // Handle item rolls.
    // prétraitement suivant le rolltype et le champs
    switch(dataset.rollType) {
      case 'attribr_direct':
        if(dataset.label.substring(0,4) == "BDom") {
          dataset.rollType = 'dedirectdom';
        } else if(dataset.label.substring(0,4) == "Recup") {
          dataset.rollType = 'recup';
        } else dataset.rollType = 'rien';
        break;
      case 'attribr':
        if(dataset.label.substring(0,4) == "BDom") {
          dataset.rollType = 'diagdom';
        } else if(dataset.label.substring(0,4) == "Recup") {
          dataset.rollType = 'recup';
        } else dataset.rollType = 'rien';
        break;
    }
    let expl = (game.explode)?"D6x6":"D6";
    switch(dataset.rollType) {
      
      case 'cmp':
        //  element.closest('.item').childNodes[11].childNodes[1].value  (pour la mise)
        let res =  element.closest('.item').childNodes[11].childNodes[1].value ?  parseInt(element.closest('.item').childNodes[11].childNodes[1].value) :0;
        // attention : roll + res == roll ori... ! a modifier
        lanceLesDes(dataset.roll,res,expl,5)
        break;
      case 'item':
        console.log("Compétence : trouver le code et ajouter les dés !");
      case 'dedirect' : 
        //game.macroDialogue(dataset.roll, 0, 5, CONFIG.explode)
        lanceLesDes(dataset.roll,0,expl,5)
        break;
      case 'debase' :
        simpleDialogue(dataset.roll, 0, 5, CONFIG.explode)
        break;
      case 'dedirectdom': //lance le dés tel que 
        lancerDeBrut(dataset.roll,"",true);
        break;
      case 'diagdom':
        DialogueDommage(1,"1d6",dataset.roll);
        break;
      case 'lancerbrut':
        lancerDeBrut(dataset.roll, "", false);
      // if (dataset.rollType.substring(0,4) == 'item') {
      //   const itemId = element.closest('.item').dataset.itemId;
      //   const item = this.actor.items.get(itemId);
      //   if(item) {
      //     if(item.type == "arme_resum") {
      //          if(dataset.rollType.substring(0,5) == "itemI"){
      //            // lance le dé d'init, il faut le mettre dans init
                
      //            let formula = dataset.rollType.substring("ItemI=".length);
      //            this.actor.data.data.attrder.initformule = formula + " + " + this.actor.data.data.attrder.pinit_finaux.value;
      //            this.render(true);
      //            /*
      //            let roll = new Roll(formula, this.actor.getRollData());
      //            let cm = roll.toMessage({
      //              speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      //              flavor: "<b>Jet d'init</b>",
      //              //content:"Super jet !!",
      //              rollMode: game.settings.get('core', 'rollMode'),
      //            });
      //            */
      //          } else if(dataset.rollType.substring(0,5) == "itemA"){
      //           // utlisation de l'attribut comme reférence
      //          } else if(dataset.rollType.substring(0,5) == "itemS"){
      //           promptForLancer(element.closest('.item').firstElementChild.innerText,item.data.data.score,item.data.data.attributd, this.actor.data.data[item.data.data.attributd].value, 
      //               item.data.data.degat).then(value => {
      //             console.log("lancer de dés ",value);
      //             console.log("acteur ",this.actor);
      //             //jetdata = { "roll":r, "eval":txtEval, "score":scoreTot, "des": attr, "nom":txtNom, "Code":codeRet };
      //             let qui = ChatMessage.getSpeaker({ actor: this.actor });
      //             let jetdata = utils.lancerJet(value.txtNom, value.des, value.score + value.bonus, qui); 
      //             utils.lanceDommage(jetdata.Code, value.dommage,qui)    
      //           }).catch(e => 0);
                
      //          } else if(dataset.rollType.substring(0,5) == "itemD"){
      //            // jet de dommage 
      //             let formula = dataset.rollType.substring("ItemD=".length);
      //             let label = "<h2>Jet de dommage</h2> ";
      //             if(item.data.data.idarmeref != "") {
      //               let arm = this.actor.items.get(item.data.data.idarmeref)
      //               label = arm.data.name +" fait les dommages :";
      //             }
      //             label += "</h2>ayant pour dommage : ";
      //             let roll = new Roll(formula, this.actor.getRollData());
      //             let cm = roll.toMessage({
      //                   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      //                   flavor: label,
      //                   //content:"Super jet !!",
      //                   rollMode: game.settings.get('core', 'rollMode'),
      //             });
      //             //return utils.SimpleLancerSousCmp(this.actor, item.data,ChatMessage.getSpeaker({ actor: this.actor }));
      //          }
      //     }
      //     else return item.roll();
      //   }
      // }
      case 'rien' :
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      // let label = dataset.label ? `[Attribut] ${dataset.label}` : '';
      // if(dataset.form === undefined) dataset.form = "no";
      // if(dataset.form == "yes") {
      //   promptForLancer(label,25,dataset.label, dataset.roll,"").then(value => {
      //     // on peut traiter si le score n'a pas été indiqué comme un simple lancé
      //             console.log("lancer de dés ",value);
      //             console.log("acteur ",this.actor);
      //             //jetdata = { "roll":r, "eval":txtEval, "score":scoreTot, "des": attr, "nom":txtNom, "Code":codeRet };
      //             let qui = ChatMessage.getSpeaker({ actor: this.actor });
      //             let jetdata = utils.lancerJet(value.txtNom, value.des, value.score + value.bonus, qui); 
      //             if(value.dommage != "") utils.lanceDommage(jetdata.Code, value.dommage,qui)    
      //           }).catch(e => 0);
       // game.macroDialogue(dataset.roll, 0, 5, CONFIG.explode)
      } else {
        //game.macroDialogue(dataset.roll, 0, 5, CONFIG.explode);
      // let roll = new Roll(dataset.roll, this.actor.getRollData());
      // let cm = roll.toMessage({
      //   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      //   flavor: label,
      //   //content:"Super jet !!",
      //   rollMode: game.settings.get('core', 'rollMode'),
      //   });
    }
  }
}
 