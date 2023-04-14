import {lanceLesDes, simpleDialogue, lancerDeBrut, DialogueDommage, packId} from "../utils.js"
export default class npqv2ActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["npqv2", "sheet", "actor"],
        template: "systems/npqv2/templates/personnage-sheet.html", // attention c'est template() qui retourne le véritable nom
        width: 655,
        height: 519,
        tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "caracteristiques" }]
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
  
      // comment modifier si c'est un clone ?
      // Use a safe clone of the actor data for further operations.
      //const actorData = this.actor.toObject(false);
      const actorData = this.actor
      // Add the actor's data to context.data for easier access, as well as flags.
      context.system = actorData.system;  // peut être changer data en système après relecture
      context.flags = actorData.flags;
  
      // Prepare character data and items.
      if (actorData.type == 'pj') {
        this._prepareItems(context);
        this._prepareCharacterData(context);
        this._prepareCharacterCmb(actorData,context);
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
      const choixjets = [];
      // for (let [k, v] of Object.entries(context.data.attributs)) {
      //   v.label = game.i18n.localize(CONFIG.NPQV1.attributs[k]) ?? k;
      // }
      context.lstCMP= { };
      for(const element in context.system.cmp){
        context.lstCMP[element] = element; // devra mettre le bon code de traduction (game.i18n.localize)
      };      // traitement des jets  création d'un mini objet { t, txt, d } pour type, texte, nbdés
      // "jet": { "codecmp":"artisan",  "idAspect1":"",  "idAspect2":"",  "idAspect3":"",  "nblancer":3, "paris":0, "seuil":6, "autoEffort":1, "coutMagique":0 }
      if(context.lstCMP[context.system.jet.codecmp] == undefined) {
        choixjets.push({"t":"cmp","txt": game.i18n.localize("int.aucun"), "d": 0 } );
      } else choixjets.push({"t":"cmp","txt": game.i18n.localize(context.system.cmp[context.system.jet.codecmp].label), "d":context.system.cmp[context.system.jet.codecmp].value});
      // Assign and return
      for(let i = 1; i < 4; i++) {
        let c = context.system.jet["idAspect"+i];
        if( c === "aucun" || c ==="") {
          choixjets.push({ "t":"asp","txt":"aucun", "d":0})
        } else {
          let lite = context.aspects.findIndex(elem => elem._id == c);
          if( lite === 0) {// pas trouvé : vide ?
            choixjets.push({ "t":"asp","txt":"aucun", "d":0})
          } else {
            choixjets.push({ "t":"asp","txt":context.aspects[lite].name, "d":context.aspects[lite].NbDes})
          }
        }
        //context.AttribV = { "for":"Force", "ag":"Agilité", "con":"Constitution", "p":"Présence", "ig":"Intelligence", "it":"Intuition", "v":"Volonté" };
      }
    }
 /**
  *  cacul sur la partie lancé de dés 
  *
  * @param {*} actorData
  * @param {*} context
  * @memberof npqv2ActorSheet
  */
 _prepareCharacterCmb(actorData, context){
    // "cmpCirconstance":"", "initiative":1, "nbActions":1, "seuilRupture":2
    // "jet": { "codecmp":"artisan",  "idAspect1":"",  "idAspect2":"", "idAspect3":"",  "nblancer":3, "paris":0,  "seuil":6, "autoEffort":1,  "coutMagique":0 }
    let c = "";
    // calcul lié a la compétence de circonstance : system.cmpCirconstance ******************
    if(context.system.cmpCirconstance === ""){
      // peut être quelque chose a faire !
    }else {      
      context.system.initiative.value = context.system.cmp[context.system.cmpCirconstance].value;
      context.seuilRupture =  context.system.cmp[context.system.cmpCirconstance].value +1; // seuil de rupture (reprise de calcul)
      context.nbActions = Math.ceil(context.system.cmp[context.system.cmpCirconstance].value/2);
    }
    // faudra rajouter l'armure voir les bonus des armes (Co ?)
    context.system.initiative.ptEffort = 0; context.system.initiative.lstIteAff = []; // la liste des label et des des
    for(let i = 1; i < 4; i++) {
      c = "asp"+i;
      if(context.system.initiative["idAspect"+i] === ""){
        // la aussi on laisse car peut être utile prochainement
      }else {
        let ite = actorData.items.get(context.system.initiative["idAspect"+i]);
        if(ite !== null) { // a tester !XXXX
          context.system.initiative.lstIteAff.push( { "id" : context.system.initiative["idAspect"+i], "label": ite.name, "NbDes": ite.system.NbDes });  
          if(i>1) context.system.initiative.ptEffort +=3; // l'effort est plus important
          context.system.initiative.value += ite.system.NbDes; 
        }
      }

    // calcul lié au jet générique **************************
    // on addition les nombre de dés/ le nombre d'effort
    let nbdes = 0; let nbEffort = 0;
      if(context.system.jet.codecmp === ""){
        context.codeLabel = "aucune"
        context.codeCmpDe = "-"
      }else {
        context.codeLabel = context.system.jet.codecmp; // il faudra la traduire
        context.codeCmpDe = context.system.cmp[context.codeLabel].value;
        nbdes = context.codeCmpDe;
      }
      
      for(let i = 1; i < 4; i++) {
        c = "asp"+i;
        if(context.system.jet["idAspect"+i] === ""){
          context[c+"Label"] = "aucun";
          context[c+"CodeDe"] = 0;
        }else {
          let ite = actorData.items.get(context.system.jet["idAspect"+i])
          context[c+"Label"] = ite.name;
          context[c+"CodeDe"] = ite.system.NbDes;
          if(i>1) nbEffort+=3; // l'effort est plus important
          nbdes += ite.system.NbDes;
        }
  
      }
      context.jetCoutEffort = nbEffort;
      context.system.jet.nblancer = nbdes;
    }
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
      const aspects = [];
      const choixjets = [];
      const sequelles = [];
      const competences = [];
      const secrets = [];
      const favoris = [];
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
  
      // Iterate through items, allocating to containers
      for (let i of context.items) {
/*        i.img = i.img || DEFAULT_TOKEN;
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
        else */
        if (i.type === 'aspect') {
          // on lui ajoute le résumé (pour l'instant jusqu'au premier point)
          //i.data.descRapide = (i.data.description).substring(0,(i.data.description+".").indexOf("."));
          if(i.system.codeSpe === 'NORM') {
            aspects.push(i);
          }else if(i.system.codeSpe === 'SEQ') {
            sequelles.push(i);
          }
          
        } else if (i.type === 'sort'){
/*          i.data.descRapide = (i.data.description+".").substring(0,(i.data.description+".").indexOf("."));
          if(i.data.idLien != ""){
            // calcul si spécialisation
            let it = context.actor.items.get(i.data.idLien);
            i.data.scoreRel = i.data.score + it.data.data.score;
          }else {
            i.data.scoreRel = i.data.score;
          }
          competences.push(i);
        */
        }
        /*
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
  */
      }
      context.gear = gear;
      context.features = features;
      context.spells = spells;
      context.aspects = aspects;
      context.sequelles = sequelles;
      context.competences = competences;
      context.secrets = secrets;
      context.favoris = favoris;
      context.bourses = bourses;
      // context.bonus = bonus;
      //context.bonus = this.actor.system.data.bonus;
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
  /*
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
  */
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
    // gestion des Rollable : a modifier XXX
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    if(dataset.cmd === undefined || dataset.cmd=="") dataset.cmd ="add";
    let cmd = ""; let cmdArgs = []; let txtCode = dataset.roll; // soit l'id soit le code cmp
    if(dataset.cmd.indexOf(".") > 0 ){
      cmdArgs = dataset.cmd.split(".");
      cmd = cmdArgs[0];
    } else {
      cmd = dataset.cmd;
      cmdArgs[0] = cmd;
    }
    // Handle item rolls.
    // prétraitement suivant le rolltype et le champs
    switch(cmd) {
      case 'initCmp' : // changement de la compétence pour l'init, a partir du i de la compétence
        this.document.update( { "system.cmpCirconstance": txtCode })
        break;
      case 'initAsp' :
        let i = 1;
        for(; i < 4; i++){
          if(this.document.system.initiative["idAspect"+i] === "") break;
          if(this.document.system.initiative["idAspect"+i] === txtCode) break; // evitons les doublons !
        } 
        if(i > 3) i = 3;
        let obj= {};
        obj["system.initiative.idAspect"+i] = txtCode;
        this.document.update(obj);
        break;
      case 'jet': // jet direct d'un compétence, idem paris
      case 'jet.paris': // formulaire pour faire un paris
        simpleDialogue(this.actor.system.cmp[txtCode].value , 0, this.actor.system.etats.value )
        break;
      case 'lancerInit': // modification de l'init, si dans le + dépense de l'éffort, l'info est dans this.document.system.initiative.
        break;
      case 'lancerJet':
        simpleDialogue(this.document.system.jet.nblancer, this.document.system.jet.paris, this.document.system.jet.seuil )
        break;
      case 'add': 
         //ajouter à la selection
         let obj1 = { };
         switch(cmdArgs[1]){ // actuellement : init, select
          case 'cmp':
              obj1 = { "system.jet.codecmp": txtCode };
            break;
          case 'asp':
            if( this.document.system.jet.idAspect1 === "" || this.document.system.jet.idAspect1 == txtCode) {
              obj1 = { "system.jet.idAspect1": txtCode };
            } else if( this.document.system.jet.idAspect2 === "" || this.document.system.jet.idAspect2 == txtCode) {
              obj1 = { "system.jet.idAspect2": txtCode };
            } else { // toujorus la troisieme ! if( this.docment.system.jet.idAspect1 === "")
              obj1 = { "system.jet.idAspect3": txtCode };
            } 
         }
         this.document.update( obj1 );
        break;
      case 'edit': // ouvrir pour modificaiton d'un aspect
        const item = this.document.items.get(txtCode);
        item.sheet.render(true);
        break;
      case 'remove':
        let ind =(cmdArgs[2] === 'cmp')? cmd: parseInt(cmdArgs[2])+1;
        switch(cmdArgs[1]){ // actuellement : init, select
          case 'init':
            this.document.system.initiative["idAspect"+ind] = ""; // c'est oas bo mais ça marche !!!
            let obj= {};
            obj["system.initiative.idAspect"+ind] = "";
            this.document.update(obj);
            // pack ?
            packId(this.document.system.initiative);
            break;
          case 'select':
            if(cmdArgs[2]==='cmp') {
              this.document.system.jet.codecmp= ""; // pas beau mais ça marche !
              this.document.update({ "system.jet.codecmp" : "" });
            }else{
              this.document.system.jet["idAspect"+ind]="";
              let obj= {};
              obj["system.jet.idAspect"+ind] = "";
              this.document.update(obj);
              packId(this.document.system.jet);
            }
            break;
        }
        break;
      case 'sppr': // supprime l'aspect de la feuille de perso: dialog, pas encore
        break;
      case 'roll': // lancer de dés avec réserve ou pas
        break;
    //   case 'pourcode':
    //     if(dataset.label.substring(0,4) == "BDom") {
    //       dataset.rollType = 'dedirectdom';
    //     } else if(dataset.label.substring(0,4) == "Recup") {
    //       dataset.rollType = 'recup';
    //     } else dataset.rollType = 'rien';
    //     break;
    //   case 'pourcode2':
    //     if(dataset.label.substring(0,4) == "BDom") {
    //       dataset.rollType = 'diagdom';
    //     } else if(dataset.label.substring(0,4) == "Recup") {
    //       dataset.rollType = 'recup';
    //     } else dataset.rollType = 'rien';
    //     break;
    }
    // // --------- garder pour le code
/*     let expl = (game.explode)?"D6x6":"D6";
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
*/
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
     // case 'rien' :
    // }

    // Handle rolls that supply the formula directly.
    // if (dataset.roll) {
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
     // } else {
       //game.macroDialogue(dataset.roll, 0, 5, CONFIG.explode);
      // let roll = new Roll(dataset.roll, this.actor.getRollData());
      // let cm = roll.toMessage({
      //   speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      //   flavor: label,
      //   //content:"Super jet !!",
      //   rollMode: game.settings.get('core', 'rollMode'),
      //   });
   // }
  }
}
 