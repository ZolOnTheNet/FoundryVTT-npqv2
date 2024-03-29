import {lanceLesDes, simpleDialogue, lancerDeBrut, DialogueDommage, AppliqueEtatValeur } from "../utils.js";
import {lanceLesDes7, simpleDialogue7, lancerInit7 } from "../utils7.js";
import { messageTxt } from "../messages.js";
import { updateInitiative } from "../updateInitiative.js";

export default class npqv2ActorSheet extends ActorSheet {

    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["npqv2", "sheet", "actor"],
        template: "systems/npqv2/templates/personnage-sheet.html", // attention c'est template() qui retourne le véritable nom
        width: 763,
        height: 750,
        tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "caracteristiques" }]
      });
    }
  
    /** @override , selection du fichier front end en fonction du type d'acteur (ici PJ, Boss, demi-Boss et figurant) */
    get template() {
      console.log("NPQv7 | ouvre : systems/npqv2/templates/sheets/actor-"+this.actor.type+"-sheet.html");
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

      context.DeInit = { "1":"d4","2":"d6","3":"d8","4":"d10","5":"d12","6":"d15", "7":"d20"};
      context.DeCharges = { "d4":"d4","d6":"d6","d8":"d8","d10":"d10","d12":"d12","d15":"d15", "d20":"d20"};
      context.FormuleInitDi = [2,2,3,3,4];
      context.FormuleInitBonus = ["","+1d4","+1d4","+1d8", "+1d10", "+1d12", "+1d15", "+1d20"]

      context.system.chatCom = { "idActor": actorData.id,  "armurePortee" : [] }; // objet pour aider à la communication avec le chat.
      
      if(this.token !== null) context.system.chatCom.idToken = this.token.id;
        else context.system.chatCom.idToken = "";
      let lstTokens = this.actor.getActiveTokens();
      if(lstTokens.length > 1) { // en fait la liste des tous les tokens référençant l'acteur
        context.system.chatCom.publicName = this.actor.name;
      }else if(lstTokens.length == 1) { // appel est fait par un ddbl clique sur un token
        context.system.chatCom.publicName = lstTokens[0].name;
      }
      // Prepare character data and items.
      // quel type de jeu ?
      let modeMetal = game.settings.get("npqv2", "modeMetal");
      context.modeMetal = modeMetal;
      context.system.chatCom["modeMetal"]= modeMetal;
      context.system.chatCom["perteFatigue"]= false;

      if(actorData.type == 'pj') {
        this._prepareItems(context);
        this._prepareCharacterData7(context);
        this._prepareCharacterCmb7(actorData,context);
      }

      if (actorData.type == 'pj6') {
        this._prepareItems(context);
        this._prepareCharacterData6(context);
        this._prepareCharacterCmb6(actorData,context);
      }

      // ------ Les différents NPC ---------------
      // Prepare NPC data and items.
/*      if (actorData.type == 'pnj') {
        this._prepareItems(context);
        this._preparePNJData(context);
      } */
      if (actorData.type == 'figurant') {
        this._prepareItemsFig(context);
        this._preparePNJData(context);
      }
      // Add roll data for TinyMCE editors.
      context.rollData = context.actor.getRollData();
      
      console.log("NPQv7| context:", context);
      return context;
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
      const gears = [];
      const features = [];
      const aspects = [];
      const armes = [];
      const armures = [];
      const sequelles = [];
      const secrets = [];
      const favoris = [];
      const bourses = [];
      const bonus = { "seuilRupture" : 0, "formulaSR": "", "Me": "", "Co" : "", "Pr" : "", "So" : 0, "NdDes":0, "CodeDommage":"+0", "PdM":0, "PdF":0, "PdT":0, "PdFa" : 0 };
      const sorts = {
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
        if (i.type === 'aspect') {
          // on lui ajoute le résumé (pour l'instant jusqu'au premier point)
          //i.data.descRapide = (i.data.description).substring(0,(i.data.description+".").indexOf("."));
          if(i.system.codeSpe === 'NORM') {
            aspects.push(i);
          }else if(i.system.codeSpe === 'SEQ') {
            sequelles.push(i);
          }

        } else if (i.type === 'objet') {
          // { "OBJET":"objet", "ARME" : "Arme", "ARMURE" : "Armure"} codeSpe
          if(i.system.codeSpe === 'OBJET') {
            gears.push(i);
          }else if(i.system.codeSpe === 'ARME') {
            armes.push(i);
            if( i.system.estActif) {
              context.system.chatCom["armeEnMain"] = i._id;
              context.system.chatCom["domF"] = i.system.menace;
              context.system.chatCom["bonusDom"] = i.system.bonus.CodeDommage;
              context.system.chatCom["NbDes"] = i.system.bonus.NbDes;
              // --- jet d'attaque pré remplissage
              context.system.attResultat.MeFormule = i.system.menace;
              context.system.defResultat.MeFormule = i.system.couverture;
            }
          }else if(i.system.codeSpe === 'ARMURE') {
            // bouclier peuvent aussi avoir des Couvertures) TODO : integrer
            armures.push(i);
            if( i.system.estActif) {
              context.system.chatCom["armurePortee"].push(i._id);
              if( Number.isNumeric(i.system.protection)) {  
              bonus.seuilRupture += parseInt(i.system.protection);
              } else {
                if(i.system.protection.indexOf("d") + i.system.protection.indexOf("D")+2 ) {
                  bonus.formulaSR += " + "+i.system.protection;
                }
              }
            }
          }
        }  else if (i.type === 'secret') {
          if(i.system.niveau >0 && i.system.niveau < i.system.niveauMax) {
            i.system.nomMax = i.system["niv"+i.system.niveau].nom;  
          } else  i.system.nomMax = "";
          secrets.push(i);
        }
        // Append to spells.
        else if (i.type === 'sort') {
          i.system.descRapide = i.system.description.substring(0,(i.system.description+".").indexOf("."));
          if (i.system.niveau != undefined) {
            sorts[i.system.niveau].push(i);
          }
        }
        else if (i.type === 'argent') {
          bourses.push(i);
        }
      }
      // enlevons le "0 + " pour un bonus de seuildereupture à 0
      if(bonus.formulaSR != "") bonus.formulaSR = ((bonus.seuilRupture == 0)?"": bonus.seuilRupture + " + " )+ bonus.formulaSR.substring(3); // on rajoute sur les deux
      context.gears = gears;
      context.features = features;
      context.sorts = sorts;
      context.aspects = aspects;
      context.armes = armes;
      context.armures = armures;
      context.sequelles = sequelles;
      context.secrets = secrets;
      context.favoris = favoris;
      context.bourses = bourses;
      context.bonus = bonus;
    }
  
    _prepareItemsFig(context) {
      // tableau minimu des items. Specialité, extra et normalement, besogne sont des items "Aspects"
      const gears = [];
      const armes = [];  // les armes utilisables par le figurant
      const armures = [];  // armure portée au moment de la rencontre
      const specialites = []; // Aspect spécialité
      const extras = []; // Aspect considéré comme extra si on réduit le compteur
      const sequelles = []; // pour la gestion de sequelles
      const secrets = []; // si on veut k²isé les figurants
      const bourses = []; // différentes bourses et trésort
      const bonus = { "seuilRupture" : 0, "formulaSR": "", "Me": "", "Co" : "", "Pr" : "", "So" : 0, "NdDes":0, "CodeDommage":"+0", "PdM":0, "PdF":0, "PdT":0, "PdFa" : 0 };
      const sorts = { // si c'est un magicien
        1: [],
        2: [],
        3: [],
        4: [],
        5: []
      };
      for (let i of context.items) {
        if (i.type === 'aspect') {
          // on lui ajoute le résumé (pour l'instant jusqu'au premier point)
          //i.data.descRapide = (i.data.description).substring(0,(i.data.description+".").indexOf("."));
          switch(i.system.codeSpe) {
            case 'EXTRA':
              extras.push(i); // astuce : on le met aussi en "spécialité"
            case 'NORM':
            case 'SPE':
              specialites.push(i);
              break;
            case 'SEQ':
              sequelles.push(i);
              break;

          }
        } else if (i.type === 'objet') {
          // { "OBJET":"objet", "ARME" : "Arme", "ARMURE" : "Armure"} codeSpe
          if(i.system.codeSpe === 'OBJET') {
            gears.push(i);
          }else if(i.system.codeSpe === 'ARME') {
            armes.push(i);
            if( i.system.estActif) {
              context.system.chatCom["armePortee"] = i._id;
              context.system.chatCom["domF"] = i.system.menace;
              context.system.chatCom["bonusDom"] = i.system.bonus.CodeDommage;
              context.system.chatCom["NbDes"] = i.system.bonus.NbDes;
              // --- jet d'attaque pré remplissage
              context.system.attResultat.MeFormule = i.system.menace;
              context.system.defResultat.MeFormule = i.system.couverture;              
            }
          }else if(i.system.codeSpe === 'ARMURE') {
            armures.push(i);
            if( i.system.estActif) {
              context.system.chatCom["armurePortee"].push(i._id);
              if( Number.isNumeric(i.system.protection)) {  
                bonus.seuilRupture += i.system.protection;
              } else {
                if(i.system.protection.indexOf("d") + i.system.protection.indexOf("D")+2 ) {
                  bonus.formulaSR += " + "+i.system.protection;
                }
              }
            }
          }
        }  else if (i.type === 'secret') {
          if(i.system.niveau >0 && i.system.niveau < i.system.niveauMax) {
            i.system.nomMax = i.system["niv"+i.system.niveau].nom;  
          } else  i.system.nomMax = "";
          secrets.push(i);
        }
        // Append to spells.
        else if (i.type === 'sort') {
          i.system.descRapide = i.system.description.substring(0,(i.system.description+".").indexOf("."));
          if (i.system.niveau != undefined) {
            sorts[i.system.niveau].push(i);
          }
        }
        else if (i.type === 'argent') {
          bourses.push(i);
        }
      }
      // enlevons le "0 + " pour un bonus de seuildereupture à 0
      if(bonus.formulaSR != "") bonus.formulaSR = ((bonus.seuilRupture == 0)?"": bonus.seuilRupture + " + " )+ bonus.formulaSR.substring(3); // on rajoute sur les deux 
      context.gears = gears;
      context.armes = armes;
      context.armures = armures;
      context.specialites = specialites;
      context.extras = extras;
      context.sequelles = sequelles;
      context.secrets = secrets;
      context.bourses = bourses;
      context.bonus = bonus;
      context.sorts = sorts;

    }
  
    _preparePNJData(context) {
      // prérapation des données calculé 
      let calcSR = 0;
      if(context.system.bonusDrama !== undefined && Number.isNumeric(context.system.bonusDrama)) calcSR = context.system.bonusDrama;
      context.seuilRupture = context.system.valeur + calcSR; // faut rajouter l'amure 
      context.nbActions = Math.ceil((context.estInitHaute ? context.system.plus : context.system.valeur) / 2);
      let valcour = 0;
      AppliqueEtatValeur(context.system.compteur);
      for(let j = 1; j < 5 ; j++) { // nombre de rang
        context.system.compteur.rangs["rang"+j].ligne = this.visuRang(context.system.compteur.rangs["rang"+j], "compteur", j, valcour);
        valcour += context.system.compteur.rangs["rang"+j].max;
      }
      // calcul du seuil de Rupture
      if(context.bonus.formulaSR != "") {
        context.system.formulaSR = context.bonus.formulaSR + " +" + ( context.system.valeur+1+context.system.bonusDrama );
        context.seuilRupture = context.system.seuilRupture;
        // sinon c'est fixe : donc pas de calcul
      } else {
        if(Number.isNumeric(context.bonus.seuilRupture)) context.bonus.seuilRupture = parseInt(context.bonus.seuilRupture);
        context.seuilRupture =  context.system.valeur+1+context.system.bonusDrama + context.bonus.seuilRupture;
      }
      // initiative : la valeur donne le dé 
      context.system.initEtat.nbDi = context.FormuleInitDi[context.system.valeur];
      //let BonusNb = (context.system.initEtat.idAspect1 === ""?0:1) + (context.system.initEtat.idAspect2 === ""?0:1) + (context.system.initEtat.idAspect3 === ""?0:1);
      context.system.initEtat.formule = context.system.initEtat.nbDi+context.DeInit[context.system.initEtat.value-context.system.valeur] + context.FormuleInitBonus[context.system.initEtat.value-context.system.valeur] ;
  
      context.system.chatCom.formulaSR = context.system.formulaSR;
      context.system.chatCom.SeuilRupture = context.system.SeuilRupture;
      context.lstCodeSpe = { "MON": "Monstre", "FIG" : "Figurant"};
      //--- défense et menaces
      context.quickDeAtt = [];
      if(context.system.attResultat.info !=="") { // attention à plusieurs type de jet !! terms peut être plus nombreu
        let objR = JSON.parse(context.system.attResultat.info);
        for(let r of objR.terms[0].results)  context.quickDeAtt.push(r.result);
      };
      context.quickDeDef= [];
      if(context.system.defResultat.info !=="") {
        let objR = JSON.parse(context.system.defResultat.info);
        for(let r of objR.terms[0].results)  context.quickDeDef.push(r.result);
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
    if(dataset.cmd === undefined || dataset.cmd=="") dataset.cmd ="uknw";
    let cmd = ""; let cmdArgs = []; let txtCode = dataset.roll; // soit l'id soit le code cmp
    if(dataset.cmd.indexOf(".") > 0 ){
      cmdArgs = dataset.cmd.split(".");
      cmd = cmdArgs[0];
    } else {
      cmd = dataset.cmd;
      cmdArgs[0] = cmd;
    }
    // Handle item rolls.
    if(this.document.type === "pj") {
      this.onRoll7(dataset,cmdArgs, txtCode);
      return ;
     } else if (this.document.type === "pj6") {
      this.onRoll6(dataset,cmdArgs, txtCode);
     }else { // adaptation pour FIG 
      this.onRollFig(dataset,cmdArgs, txtCode);
     }
     // prétraitement suivant le rolltype et le champs
  }

  // ----------------------------------- Utils ------------------------------------------
  // gestion des efforts 
visuEffort(Effort, nbEffortWait = 0) {
  let ret = ''; let max = (18 > Effort.max)? Effort.max: 18;
  let i = 0; let e = Effort.value - nbEffortWait;
  for(i = 1; i <= e; i++){
    ret += '<span class="rollable txtUtiOui" data-cmd="set.etat.effort" data-roll="' + i + '" title="' + i + '" >'+i+' </span>'
  }
  if(nbEffortWait > 0) {
    e += +nbEffortWait;
    for(; i <= e; i++ ){
      ret += '<span class="rollable txtUtiEnCours" data-cmd="set.etat.effort" data-roll="' + i + '" title="' + i + '" >'+i+' </span>'
    }
  }
  for(; i <= max; i++){
    ret += '<span class="rollable txtUtiNon" data-cmd="set.etat.effort" data-roll="' + i + '" title="' + i + '" >'+i+' </span>'
  }
  return ret ; 
}

/**
 * visuRang : visualise un Rang founis en paramètre
 *
 * @param {*} rang : un rang { value, max, seuil} (seuil est rajouté dans obj Acteur)
 * @memberof npqv2ActorSheet
 * 
 * <i data-name="system.etats.tension.rangs.rang1" data-value="{{@index}}" data-type="etats" class="fillable fas fa-square"></i>
 * <i data-name="system.traits.{{trait.name}}.value" data-name="system.etats.tension.rangs.rang1" data-value="{{@index}}" data-type="etats" class="fillable far fa-square"></i>
 * retourne un chaine html des petits carrés  data-cmd="set.etat.'+etat+'" data-roll="' (i + offset) '"
 */
visuRang(rang, etat, noRang, offset=0){
  let ret = ''; let i = 1;
  for(; i <= rang.value; i++) {
    ret += '<i data-name="system.' + etat + '.rangs.rang' + noRang + '" title="' + (i + offset) + '" data-cmd="set.etat.'+etat+'" data-roll="' + (i + offset )+ '" data-type="etats" class="rollable fillable fas fa-square"></i>&nbsp;';
    if(i % 5 == 0) ret += '&nbsp;'; // tout les 5 unités un espace
  }
  for(;i <= rang.max ; i++){
    ret += '<i data-name="system.' + etat + '.rangs.rang' + noRang + '" title="' + (i + offset) + '" data-cmd="set.etat.'+etat+'" data-roll="' + (i + offset) + '" data-type="etats" class="rollable fillable far fa-square"></i>&nbsp;';
    if(i % 5 == 0 ) ret += '&nbsp;'; // tout les 5 unités un espace
  }
  return ret;
}
/**
 * remet les aspects ou la liste (de 1 à 3) en commancant par le haut
 * valide pour : le jet et l'initiative
 *
 * @param {*} parent : jet ou initiative
 */
packId(parent) {
  let tab = []; let c = "";
  for(let i =1; i < 4 ; i++) {
    c =parent["idAspect"+i];
    if( c != "") {
      tab.push(c);
    }
  }
  let lng = tab.length;
  if(lng > 0) {
    for(let i =0; i < 3 ; i++) {
      if(i >= lng) {
        parent["idAspect"+(i+1)]="";
      } else {
        parent["idAspect"+(i+1)]=tab[i];
      }
    }
  }
  
}

_prepareCharacterData7(context) {
  const choixjets = [];
  // for (let [k, v] of Object.entries(context.data.attributs)) {
  //   v.label = game.i18n.localize(CONFIG.NPQV1.attributs[k]) ?? k;
  // }
  context.lstCMP= { }; // récupération des attributs (ici cmp)
  for(const element in context.system.cmp){
    context.lstCMP[element] = element; // devra mettre le bon code de traduction (game.i18n.localize)
  };      // traitement des jets  création d'un mini objet { t, txt, d } pour type, texte, nbdés
  //const lesEtats=['DPdM','fatigue','faiblesse','tension']; // Mes quatre type d'état
  const lesEtats=['fatigue']; // Mes quatre type d'état
  let valcour = 0
  for(let i = 0 ;  i < lesEtats.length; i++) {
    valcour = 0;
    AppliqueEtatValeur(context.system.etats[lesEtats[i]])
    for(let j = 1; j < 5 ; j++) {
      context.system.etats[lesEtats[i]].rangs["rang"+j].ligne = this.visuRang(context.system.etats[lesEtats[i]].rangs["rang"+j], lesEtats[i], j, valcour);
      valcour += context.system.etats[lesEtats[i]].rangs["rang"+j].max;
    }
  }

  // --------- Gestion des états (generer les affichages)
}

_prepareCharacterCmb7(actorData, context){
  // "cmpCirconstance":"", "initiative":1, "nbActions":1, "seuilRupture":2
  // "jet": { "codecmp":"artisan",  "idAspect1":"",  "idAspect2":"", "idAspect3":"",  "nblancer":3, "paris":0,  "seuil":6, "autoEffort":1,  "coutMagique":0 }
  let c = "";
  // calcul lié a la compétence de circonstance : system.cmpCirconstance ******************
  if(context.system.cmpCirconstance === ""){
    // peut être quelque chose a faire !
  }else {      
    // traitement de la formule de l'init (et des points Efforts)
    //context.system.initEtat.value = context.system.cmp[context.system.cmpCirconstance].value;
    context.system.initEtat.nbDi = context.FormuleInitDi[context.system.initEtat.cmp];
    //let BonusNb = (context.system.initEtat.idAspect1 === ""?0:1) + (context.system.initEtat.idAspect2 === ""?0:1) + (context.system.initEtat.idAspect3 === ""?0:1);
    context.system.initEtat.formule = context.system.initEtat.nbDi+context.DeInit[context.system.cmp[context.system.cmpCirconstance].value] + context.FormuleInitBonus[context.system.initEtat.cmp] ;
    // il peut y avoir des formules :       
    //context.seuilRupture =  context.system.cmp[context.system.cmpCirconstance].value +1; // seuil de rupture (reprise de calcul)
    if(context.bonus.formulaSR != "") {
      context.system.formulaSR = context.bonus.formulaSR + " +" + ( context.system.cmp[context.system.cmpCirconstance].value +1);
      context.seuilRupture = context.system.seuilRupture;
      // sinon c'est fixe : donc pas de calcul
    } else {
      if(Number.isNumeric(context.bonus.seuilRupture)) context.bonus.seuilRupture = parseInt(context.bonus.seuilRupture);
      context.seuilRupture =  context.system.cmp[context.system.cmpCirconstance].value +1 + context.bonus.seuilRupture;
    }
    context.system.chatCom["seuiRupture"] = context.seuilRupture;
    context.system.chatCom["formulaSR"]=context.formulaSR;
    context.nbActions = Math.ceil(context.system.cmp[context.system.cmpCirconstance].value/2);
  }
  // faudra rajouter l'armure voir les bonus des armes (Co ?)
  context.system.initEtat.ptEffort = 0; context.system.initEtat.lstIteAff = []; // la liste des label et des des
  context.system.initEtat.value = context.system.initEtat.sommeDes
  context.system.initEtat.nDi = 0; // nombre de bonus lié au aspects
  for(let i = 1; i < 4; i++) {
    c = "asp"+i;
    if(context.system.initEtat["idAspect"+i] === ""){
      // la aussi on laisse car peut être utile prochainement
    }else {
      let ite = actorData.items.get(context.system.initEtat["idAspect"+i]);
      if(ite !== null) { // a tester !XXXX
        context.system.initEtat.lstIteAff.push( { "id" : context.system.initEtat["idAspect"+i], "label": "A"+i+": "+ite.name, "NbDes": ite.system.NbDes });  
        if(i>1) context.system.initEtat.ptEffort +=3; // l'effort est plus important
        context.system.initEtat.value += ite.system.NbDes;  // les inits prenne 1 Dé
        context.system.initEtat.nDi += ite.system.NbDes;
      }
    }
  }
  // calcul lié au jet générique **************************
  // on addition les nombre de dés/ le nombre d'effort
  let nbdes = 0; let nbEffort = 0;
  let choixAsp = { };
  if(context.system.jet.codecmp === ""){
    context.codeLabel = "aucune"
    context.codeCmpDe = "-"
    choixAsp["codecmp"]="";
    choixAsp["codeLabel"]="";
    choixAsp["codeCmpDe"]=0;
  }else {
    context.codeLabel = context.system.jet.codecmp; // il faudra la traduire
    context.codeCmpDe = context.system.cmp[context.codeLabel].value;
    nbdes = context.codeCmpDe;
    choixAsp["codecmp"]=context.system.jet.codecmp;
    choixAsp["codeLabel"]=context.codeLabel;
    choixAsp["codeCmpDe"]=context.codeCmpDe;
  }
  for(let i = 1; i < 4; i++) {
    c = "asp"+i;
    choixAsp[c+"Id"] = context.system.jet["idAspect"+i]
    if(context.system.jet["idAspect"+i] === ""){
      context[c+"Label"] = "aucun";
      context[c+"CodeDe"] = 0;
      choixAsp[c+"Label"] = "";
      choixAsp[c+"CodeDe"]= 0;
    }else {
      let ite = actorData.items.get(context.system.jet["idAspect"+i])
      context[c+"Label"] = ite.name;
      context[c+"CodeDe"] = ite.system.NbDes;
      if(ite.system.codeSpe == 'SEQ') context[c+"CodeDe"] *= -1; // inverse
      choixAsp[c+"Label"] = context[c+"Label"];
      choixAsp[c+"CodeDe"]= context[c+"CodeDe"];
      if(i>1) nbEffort+=3; // l'effort est plus important
      nbdes += context[c+"CodeDe"]; // peut être corigé par la notion de SEQuelle
    }
  }
  context.system.chatCom["choixAsp"]= choixAsp;
  //--- traitement défense et attaque 
  context.quickDeAtt = [];
  if(context.system.attResultat.info !=="") { // attention à plusieurs type de jet !! terms peut être plus nombreu
    let objR = JSON.parse(context.system.attResultat.info);
    for(let r of objR.terms[0].results)  context.quickDeAtt.push(r.result);
  };
  context.quickDeDef= [];
  if(context.system.defResultat.info !=="") {
    let objR = JSON.parse(context.system.defResultat.info);
    for(let r of objR.terms[0].results)  context.quickDeDef.push(r.result);
  };
  context.jetCoutEffort = nbEffort;
  context.system.jet.coutEffort = nbEffort;
  context.system.jet.nblancer = nbdes;
  //context.effortTxt = '<i data-cmd="set.etat.effort" data-roll="1" title="1" class="rollable fillable fas fa-square"></i> <i data-cmd="set.etat.effort" data-roll="{{@index}}" title="{{@index}}" class="rollable fillable far fa-square"></i> <i data-cmd="set.etat.effort" data-roll="{{@index}}" title="{{@index}}" class="rollable fillable fad fa-square"></i>'
  context.effortTxt = this.visuEffort(context.system.etats.effort, nbEffort+ context.system.initEtat.ptEffort);
}

/**
 * onRoll7 gere les évenement de la feuille PJ7
 *
 * @param {*} dataset
 * @param {*} cmdArgs
 * @param {*} txtCode
 * @memberof npqv2ActorSheet
 */
onRoll7(dataset,cmdArgs, txtCode){
  let cmd = cmdArgs[0];
  switch(cmd) {
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
    case 'activation':
      let itemA = this.document.items.get(txtCode);
      let testA =  cmdArgs[1] === "oui";
      itemA.update({ 'system.estActif' : testA });
      // en fonction si armure => changement dans la seuil de ruptures
    case 'calc': // rafrechissement des valeurs ou forçage de calculs
      if( cmdArgs[1] === "rupture") {
        if(this.document.system.formulaSR == "") {
            // pas besoin de le faire deux fois : voir getData
          } else { // besoin de relancer la formule par contre... c'est this.
          let r = new Roll(this.document.system.formulaSR);
          r.evaluate({async :false }); // pas de jet dans le chat pour l'instant
          this.document.update( { "system.seuilRupture" : r.total }); 
          //console.log(this.document, "Tirage Rupture : ", r.total, r);
        }
      }
      break;
    case 'edit': // ouvrir pour modificaiton d'un aspect
      const item = this.document.items.get(txtCode);
      item.sheet.render(true);
      break;
    case 'initCmp' : // changement de la compétence pour l'init, a partir du i de la compétence
      this.document.update( { "system.cmpCirconstance": txtCode })
      break;
    case 'initAsp' :
      let i = 1;
      for(; i < 4; i++){
        if(this.document.system.initEtat["idAspect"+i] === "") break;
        if(this.document.system.initEtat["idAspect"+i] === txtCode) break; // evitons les doublons !
      } 
      if(i > 3) i = 3;
      this.document.system.initEtat["idAspect"+i] = txtCode;
      // let obj= {};
      // obj["system.initEtat.idAspect"+i] = txtCode;
      // this.document.update(obj);
      this.document.update({ "system.initEtat" : this.document.system.initEtat});
      break;
    // case 'jet': // jet direct d'un compétence, idem paris
    //   if(this.system.jet.valAttr = this.system.cmps[context.system.jet.codecmp].value !="") this.system.jet.valAttr = this.system.cmps[context.system.jet.codecmp].value;
    //   simpleDialogue7(this.system.jet,this.system.chatCom);
    //   break;
    case 'lancerInit': // modification de l'init, si dans le + dépense de l'éffort, l'info est dans this.document.system.initEtat.
      //this.document.system.initEtat.value 
      let rep = lancerInit7(this.document.system.initEtat.formule,this.document.system.initEtat.nDi );
      if(rep.initEffort !== undefined) {
        let ObjU = { };
        ObjU["system.initEtat.sommeDes"] = rep.total;
        ObjU["system.etats.effort.value"]= rep.initEffort;
        this.document.update(ObjU);
      }
      updateInitiative(this.document._id, this.document.system.initEtat.value);
      break;
    case 'jet':
      switch(cmdArgs[1]){
        case 'attaque': // enchainement du lancer de dé + mise en attaque direct si réussie
          break;
        case 'defense': //enchainement du lancer de dé + mise en défense direct si réussie
          break;
        case 'clean' : 
          let objUdp = {};
          switch(cmdArgs[2]){
            case 'defense': // les champs son compréssé pour être plus visible 
              objUdp = {
                "system.defResultat.code": "NORM", "system.defResultat.score": 0, "system.defResultat.nbQualites" : 0, 
                "system.defResultat.cibles" : "", "system.defResultat.info": "", "system.defResultat.MeFormule":"", "system.defResultat.MeTot" : 0,
                "system.defResultat.infoJet": "", "system.defResultat.dataJet": ""
              };
              break;
            case 'attaque' : 
              objUdp = {
                "system.attResultat.code": "NORM", "system.attResultat.score": 0, "system.attResultat.nbQualites" : 0, 
                "system.attResultat.cibles" : "", "system.attResultat.info": "",  "system.attResultat.MeFormule":"", "system.attResultat.MeTot" : 0,
                 "system.attResultat.infoJet": "", "system.attResultat.dataJet": ""
              };
              break;
            default: 
              objUdp = {
                "system.jet.codecmp":"", "system.jet.idAspect1":"", "system.jet.idAspect2":"", "system.jet.idAspect3":"", "system.jet.nblancer":3, 
                "system.jet.paris":0, "system.jet.seuil": this.document.system.etats.value, "system.jet.coutEffort":0, "system.jet.autoEffort":1,
                "system.jet.coutMagique":0, "system.jet.nomRaccourci":""
              }
              break
          }
          this.document.update(objUdp,{renderSheet:true}); // sheet obligatoire
          break;
      }
      break;
    case 'lancerJet':
      // simpleDialogue7(jetP, this.document.system.chatCom );
      // { 'nde' : {{system.jet.nblancer}}, 'paris' : {{system.jet.paris}}, 'seuil' : {{system.jet.seuil}}, 'nbEffort': {{jetCoutEffort}},  'Auto' : {{system.jet.autoEffort}}  }
      let objRel =(cmdArgs[2]==="paris")? { "nde" : this.document.system.cmp.value, "paris":0, "seuil": this.document.system.value, 'nbEffort': 0,  'Auto' : 1 } : 
                                          //objRel = JSON.parse(txtCode.replaceAll("'",'"')); // aime pas avoir des ' au lieu des "
                                          { "nde" : this.document.system.jet.nblancer, "paris": this.document.system.jet.paris, "seuil": this.document.system.etats.value, 'nbEffort': this.document.system.jet.coutEffort,  'Auto' : this.document.system.jet.autoEffort }
      simpleDialogue(objRel.nde , objRel.paris, objRel.seuil, { idActor: this.document.system.chatCom.idActor, idToken : this.document.system.chatCom.idToken, "nbEffort": objRel.nbEffort, "Auto": objRel.Auto, "choixAsp": this.document.system.chatCom.choixAsp });
      break;
    case 'magie':
      if(cmdArgs[1]==="clean") {
        if(cmdArgs[2]=='pdm')this.document.update({"system.jet.pouvoir":0}); 
      }else if(cmdArgs[1]=='lancer') { // lancement d'un sort niveau cmdArgs[2]
        let coutPouvoir = parseInt(cmdArgs[2])*10; let coutEffort = this.document.system.jet.pouvoir;
        coutEffort = (coutEffort)?coutPouvoir-coutEffort: coutPouvoir;
        let monTexte = "<h3>"+this.document.system.chatCom.publicName+"</h3> Vous tentez de lancer un sort de niveau "+ cmdArgs[2]+". cela vous coutera "+
          coutEffort+` points d'effort.`;
        messageTxt(monTexte);
      }
      break;  
    case 'remove':
      let ind =(cmdArgs[2] === 'cmp')? cmd: parseInt(cmdArgs[2])+1;
      switch(cmdArgs[1]){ // actuellement : init, select
        case 'init':
          this.document.system.initEtat["idAspect"+ind] = ""; // c'est oas bo mais ça marche !!!
          let obj= {};
          obj["system.initEtat.idAspect"+ind] = "";
          this.document.system.initEtat.lstIteAff.pop(ind-1)
          this.document.update(obj);
          // pack ?
          this.packId(this.document.system.initEtat);
          this.document.render(true);
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
            this.packId(this.document.system.jet);
          }
          break;
      }
      break;
      case 'reset':
        if(cmdArgs[1]==='effort') { // recalcul de l'effort
          let objUpd = { "system.etats.effort.value": 0};
          objUpd[ "system.etats.effort.value"] = 10 -  this.document.system.etats.fatigue.value; 
          if(objUpd[ "system.etats.effort.value"] < 0) objUpd[ "system.etats.effort.value"] = 0;
          this.document.update( objUpd);
        } // lancer de dés avec réserve ou pas
      break;
      case 'roll': // lancer de dés avec réserve ou pas
      break;
    case 'suppr': // supprime l'aspect de la feuille de perso: dialog, pas encore
      let itemD = this.document.items.get(txtCode);
      if(itemD != undefined) itemD.delete();
      break;
    case 'set': // fixer par clique direct sur les petites case ou les valeurs
      let champ = {};
      if(cmdArgs[1] === 'etat') {
        //if(cmdArgs[2] === 'effort'
        champ["system.etats."+cmdArgs[2]+".value"] = parseInt(txtCode);
      } else if(cmdArgs[1] === 'compteur') {
        champ["system."+cmdArgs[2]+".value"] = parseInt(txtCode);
      }
      this.document.update(champ);
      break;
    case 'trans': 
      if(cmdArgs[1] === 'fatigue' && cmdArgs[2] === 'effort') {
        let r = new Roll(this.document.system.cmp[this.document.system.cmpCirconstance].debonus);
        r.evaluate({async :false });
        let resultat = r.total; // 
        let objUpd = {};
        objUpd['system.etats.effort.value'] = this.document.system.etats.effort.value + resultat;
        objUpd['system.etats.fatigue.value'] = this.document.system.etats.fatigue.value + 1;
        let monTexte = "récupère "+ resultat + " points d'effort pour 1 point de fatigue."
        this.document.update( objUpd);
        let chatData = {
          user: game.user._id,
          speaker: this.document.name,
          flavor: monTexte,
          rollMode: game.settings.get("core", "rollMode"),
          roll: r
      };
      //ChatMessage.create(chatData);
     let cm = r.toMessage(chatData);
      }
      break;
    default:
      console.log("ActorSheet > _onRoll : cmd inconnu =>",cmd,dataset);
  }

}

//---- roll pour les figurants
onRollFig(dataset,cmdArgs, txtCode){
  let cmd = cmdArgs[0];
  switch(cmd) {
    case 'activation':
      let itemA = this.document.items.get(txtCode);
      let testA =  cmdArgs[1] === "oui";
      itemA.update({ 'system.estActif' : testA });
      // en fonction si armure => changement dans la seuil de ruptures
      break;
    case 'calc': // rafrechissement des valeurs ou forçage de calculs
      if( cmdArgs[1] === "rupture") {
        if(this.document.system.formulaSR == "") {
            // pas besoin de le faire deux fois : voir getData
          } else { // besoin de relancer la formule par contre... c'est this.
          let r = new Roll(this.document.system.formulaSR);
          r.evaluate({async :false }); // pas de jet dans le chat pour l'instant
          this.document.update( { "system.seuilRupture" : r.total }); 
          //console.log(this.document, "Tirage Rupture : ", r.total, r);
        }
      }
      break;
    case 'edit': // ouvrir pour modificaiton d'un aspect
      const item = this.document.items.get(txtCode);
      item.sheet.render(true);
      break;
    case 'fig': // ouvrir pour modificaiton d'un
      if(cmdArgs[1] === 'init') {
        let objI = {};
        if(cmdArgs[2] === 'valeur') {
          objI["system.estInitHaute"] = false;
          objI["system.initEtat.value"] = this.document.system.valeur+1;
        } else if(cmdArgs[2] === 'plus'){
          objI["system.estInitHaute"] = true;
          objI["system.initEtat.value"] = this.document.system.plus;
        }
        this.document.update(objI);          
      } 
      break;
    case 'jet': // jet direct d'un compétence, idem paris
      let choixAsp = null;
      this.document.system.chatCom["perteFatigue"]= false;
      if(cmdArgs[2]==='val') {
        if(txtCode == "plus") {
          txtCode = " sa valeur Haute"
        } else {
          txtCode = " ses compétences de base"
        }
        choixAsp = { 
          "codeCmd": "val",
          "codeLabel" : txtCode,
          "codeCmpDe" : parseInt(cmdArgs[3]),
          "asp1Id":"", "asp2Id":"", "asp3Id": ""
        };
      } else {
        let it = this.document.items.get(txtCode);
        choixAsp = { 
            "codeCmd": txtCode,
            "codeLabel" : it.name,
            "codeCmpDe" : parseInt(cmdArgs[3]),
            "asp1Id":"", "asp2Id":"", "asp3Id": ""
          };
          if(cmdArgs[2]==="extra") this.document.system.chatCom["perteFatigue"]= true;
      }
      this.document.system.chatCom["choixAsp"]= choixAsp;
      if(cmdArgs[1] === 'direct') {
        // c'est normalement lancerLesDes : a tester
        simpleDialogue(parseInt(cmdArgs[3]) , this.document.system.parisDefaut,  this.document.system.compteur.seuil,this.actor.system.chatCom);
      } else { // avec paris
        simpleDialogue(parseInt(cmdArgs[3]) , this.document.system.parisDefaut,  this.document.system.compteur.seuil,this.actor.system.chatCom);
      }
      break;
    case 'magie':
      if(cmdArgs[1]==="clean") {
        if(cmdArgs[2]=='pdm')this.document.update({"system.compteur.PdM":0}); 
      }     
      break;
    case 'lancerInit': // modification de l'init, si dans le + dépense de l'éffort, l'info est dans this.document.system.initEtat.
      let r = new Roll(this.document.system.initEtat.formule);
      r.evaluate({async: false});
      //this.document.system.initEtat.final = r.total
      this.document.update({ "system.initEtat.finale": r.total}, {async: false});
      updateInitiative(this.document._id, this.document.system.initEtat.finale);
      let monTexte = "<h2>"+this.document.system.chatCom.publicName+"</h2>Initiative fixée  à "+(r.total);
      let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        flavor: monTexte,
        rollMode: game.settings.get("core", "rollMode"),
        roll: r
    };
    //ChatMessage.create(chatData);
    let cm = r.toMessage(chatData);
      break;
    case 'resultat':
      switch(cmdArgs[1]){
        case 'attaque': // enchainement du lancer de dé + mise en attaque direct si réussie
          break;
        case 'defense': //enchainement du lancer de dé + mise en défense direct si réussie
          break;
        case 'clean' : 
          let objUdp = {};
          switch(cmdArgs[2]){
            case 'defense': // les champs son compréssé pour être plus visible 
              objUdp = {
                "system.defResultat.code": "NORM", "system.defResultat.score": 0, "system.defResultat.nbQualites" : 0, 
                "system.defResultat.cibles" : "", "system.defResultat.info": "", "system.defResultat.MeFormule":"", "system.defResultat.MeTot" : 0,
                "system.defResultat.infoJet": "", "system.defResultat.dataJet": ""
              };
              break;
            case 'attaque' : 
              objUdp = {
                "system.attResultat.code": "NORM", "system.attResultat.score": 0, "system.attResultat.nbQualites" : 0, 
                "system.attResultat.cibles" : "", "system.attResultat.info": "",  "system.attResultat.MeFormule":"", "system.attResultat.MeTot" : 0,
                 "system.attResultat.infoJet": "", "system.attResultat.dataJet": ""
              };
              break;
            default: 
              objUdp = {
                "system.jet.codecmp":"", "system.jet.idAspect1":"", "system.jet.idAspect2":"", "system.jet.idAspect3":"", "system.jet.nblancer":3, 
                "system.jet.paris":0, "system.jet.seuil": this.document.system.etats.value, "system.jet.coutEffort":0, "system.jet.autoEffort":1,
                "system.jet.coutMagique":0, "system.jet.nomRaccourci":""
              }
              break
          }
          this.document.update(objUdp,{renderSheet:true}); // sheet obligatoire
          break;
      }
      break;

    case 'set': // fixer par clique direct sur les petites case ou les valeurs
      let champ = {};
        champ["system.compteur.value"] = parseInt(txtCode);
      this.document.update( champ);
      break;
    case 'suppr': // supprime l'aspect de la feuille de perso: dialog, pas encore
      let itemD = this.document.items.get(txtCode);
      if(itemD != undefined) itemD.delete();
      break;
  }
}

/****** Ancien fonctionnement *************************************************************************
 * ****************************************************************************************************
 */
    /**
     * Organize and classify Items for Character sheets. N'est plus en dev
     *
     * @param {Object} actorData The actor to prepare.
     *
     * @return {undefined}
     */
    _prepareCharacterData6(context) {
      const choixjets = [];
      // for (let [k, v] of Object.entries(context.data.attributs)) {
      //   v.label = game.i18n.localize(CONFIG.NPQV1.attributs[k]) ?? k;
      // }
      context.lstCMP= { };
      for(const element in context.system.cmp){
        context.lstCMP[element] = element; 
        //element.labelT = game.i18n.localize(element.label);// devra mettre le bon code de traduction (game.i18n.localize) marche pas !
      };      // traitement des jets  création d'un mini objet { t, txt, d } pour type, texte, nbdés
      // --------- Gestion des états (generer les affichages)
      const lesEtats=['DPdM','fatigue','faiblesse','tension']; // Mes quatre type d'état
      //const EtatsMin =[ 0, 3, 3 , 3 ]; 
      let valcour = 0
      for(let i = 0 ;  i < lesEtats.length; i++) {
        valcour = 0;
        AppliqueEtatValeur(context.system.etats[lesEtats[i]])
        for(let j = 1; j < 5 ; j++) {
          context.system.etats[lesEtats[i]].rangs["rang"+j].ligne = this.visuRang(context.system.etats[lesEtats[i]].rangs["rang"+j], lesEtats[i], j, valcour);
          valcour += context.system.etats[lesEtats[i]].rangs["rang"+j].max;
        }
      }
    }
 /**
  *  cacul sur la partie lancé de dés : n'est plus en dev
  *
  * @param {*} actorData
  * @param {*} context
  * @memberof npqv2ActorSheet
  */
 _prepareCharacterCmb6(actorData, context){
    // "cmpCirconstance":"", "initiative":1, "nbActions":1, "seuilRupture":2
    // "jet": { "codecmp":"artisan",  "idAspect1":"",  "idAspect2":"", "idAspect3":"",  "nblancer":3, "paris":0,  "seuil":6, "autoEffort":1,  "coutMagique":0 }
    let c = "";
    // calcul lié a la compétence de circonstance : system.cmpCirconstance ******************
    if(context.system.cmpCirconstance === ""){
      // peut être quelque chose a faire !
    }else {      
      context.system.initEtat.value = context.system.cmp[context.system.cmpCirconstance].value;
      // il peut y avoir des formules :       
      //context.seuilRupture =  context.system.cmp[context.system.cmpCirconstance].value +1; // seuil de rupture (reprise de calcul)
      if(context.bonus.formulaSR != "") {
        context.system.formulaSR = context.bonus.formulaSR + " +" + ( context.system.cmp[context.system.cmpCirconstance].value +1);
        context.seuilRupture = context.system.seuilRupture;
        // sinon c'est fixe : donc pas de calcul
      } else   context.seuilRupture =  context.system.cmp[context.system.cmpCirconstance].value +1 + parseInt(context.bonus.seuilRupture);
      context.nbActions = Math.ceil(context.system.cmp[context.system.cmpCirconstance].value/2);
    }
    // faudra rajouter l'armure voir les bonus des armes (Co ?)
    context.system.initEtat.ptEffort = 0; context.system.initEtat.lstIteAff = []; // la liste des label et des des
    for(let i = 1; i < 4; i++) {
      c = "asp"+i;
      if(context.system.initEtat["idAspect"+i] === ""){
        // la aussi on laisse car peut être utile prochainement
      }else {
        let ite = actorData.items.get(context.system.initEtat["idAspect"+i]);
        if(ite !== null) { // a tester !XXXX
          context.system.initEtat.lstIteAff.push( { "id" : context.system.initEtat["idAspect"+i], "label": ite.name, "NbDes": ite.system.NbDes });  
          if(i>1) context.system.initEtat.ptEffort +=3; // l'effort est plus important
          context.system.initEtat.value += ite.system.NbDes; 
        }
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
        if(ite.system.codeSpe == 'SEQ') context[c+"CodeDe"] *= -1; // inverse
        if(i>1) nbEffort+=3; // l'effort est plus important
        nbdes += context[c+"CodeDe"]; // peut être corigé par la notion de SEQuelle
      }

    }
    context.jetCoutEffort = nbEffort;
    context.system.jet.coutEffort = nbEffort; // synchros
    context.system.jet.nblancer = nbdes;
    //context.effortTxt = '<i data-cmd="set.etat.effort" data-roll="1" title="1" class="rollable fillable fas fa-square"></i> <i data-cmd="set.etat.effort" data-roll="{{@index}}" title="{{@index}}" class="rollable fillable far fa-square"></i> <i data-cmd="set.etat.effort" data-roll="{{@index}}" title="{{@index}}" class="rollable fillable fad fa-square"></i>'
    context.effortTxt = this.visuEffort(context.system.etats.effort, context.system.jet.coutEffort + context.system.initEtat.ptEffort);
  }

  onRoll6(dataset,cmdArgs, txtCode){
    let cmd = cmdArgs[0];
    switch(cmd) {
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
      case 'activation':
        let itemA = this.document.items.get(txtCode);
        let testA =  cmdArgs[1] === "oui";
        itemA.update({ 'system.estActif' : testA });
        // en fonction si armure => changement dans la seuil de ruptures
      case 'calc': // rafrechissement des valeurs ou forçage de calculs
        if( cmdArgs[1] === "rupture") {
          if(this.document.system.formulaSR == "") {
              // pas besoin de le faire deux fois : voir getData
            } else { // besoin de relancer la formule par contre... c'est this.
            let r = new Roll(this.document.system.formulaSR);
            r.evaluate({async :false }); // pas de jet dans le chat pour l'instant
            this.document.update( { "system.seuilRupture" : r.total }); 
            //console.log(this.document, "Tirage Rupture : ", r.total, r);
          }
        }
        break;
      case 'edit': // ouvrir pour modificaiton d'un aspect
        const item = this.document.items.get(txtCode);
        item.sheet.render(true);
        break;
      case 'fig': // ouvrir pour modificaiton d'un
        if(cmdArgs[1] === 'init') {
          let objI = {};
          if(cmdArgs[2] === 'valeur') {
            objI["system.estInitHaute"] = false;
            objI["system.initEtat.value"] = this.document.system.valeur;
          } else if(cmdArgs[2] === 'plus'){
            objI["system.estInitHaute"] = true;
            objI["system.initEtat.value"] = this.document.system.plus;
          }
          this.document.update(objI);          
        } 
        break;
      case 'initCmp' : // changement de la compétence pour l'init, a partir du i de la compétence
        this.document.update( { "system.cmpCirconstance": txtCode })
        break;
      case 'initAsp' :
        let i = 1;
        for(; i < 4; i++){
          if(this.document.system.initEtat["idAspect"+i] === "") break;
          if(this.document.system.initEtat["idAspect"+i] === txtCode) break; // evitons les doublons !
        } 
        if(i > 3) i = 3;
        let obj= {};
        obj["system.initEtat.idAspect"+i] = txtCode;
        this.document.update(obj);
        break;
      case 'jet': // jet direct d'un compétence, idem paris
        if(cmdArgs[2] === 'fig') {
          simpleDialogue(parseInt(cmdArgs[3]) , this.actor.system.parisDefaut,  this.actor.system.compteur.seuil,this.actor.system.chatCom);
        } else  simpleDialogue(this.actor.system.cmp[txtCode].value , 0, this.actor.system.etats.value);
        break;
      case 'lancerInit': // modification de l'init, si dans le + dépense de l'éffort, l'info est dans this.document.system.initEtat.
        updateInitiative(this.document._id, this.document.system.initEtat.value);
        if(cmdArgs[1] !== 'fig'){ // pour les personnages ;-)
          //consommation de l'effort et réinit de la selection l'intiative XXXX
        }
        break;
      case 'lancerJet':
        simpleDialogue(this.document.system.jet.nblancer, this.document.system.jet.paris, this.document.system.jet.seuil )
        break;
      case 'remove':
        let ind =(cmdArgs[2] === 'cmp')? cmd: parseInt(cmdArgs[2])+1;
        switch(cmdArgs[1]){ // actuellement : init, select
          case 'init':
            this.document.system.initEtat["idAspect"+ind] = ""; // c'est oas bo mais ça marche !!!
            let obj= {};
            obj["system.initEtat.idAspect"+ind] = "";
            this.document.update(obj);
            // pack ?
            this.packId(this.document.system.initiative);
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
              this.packId(this.document.system.jet);
            }
            break;
        }
        break;
        case 'reset':
          if(cmdArgs[1]==='effort') { // recalcul de l'effort
            let objUpd = { "system.etats.effort.value": 0};
            objUpd[ "system.etats.effort.value"] = 10 -  this.document.system.etats.fatigue.value; 
            if(objUpd[ "system.etats.effort.value"] < 0) objUpd[ "system.etats.effort.value"] = 0;
            this.document.update( objUpd);
          } // lancer de dés avec réserve ou pas
        break;
        case 'roll': // lancer de dés avec réserve ou pas
        break;
      case 'suppr': // supprime l'aspect de la feuille de perso: dialog, pas encore
        let itemD = this.document.items.get(txtCode);
        if(itemD != undefined) itemD.delete();
        break;
      case 'set': // fixer par clique direct sur les petites case ou les valeurs
        let champ = {};
        if(cmdArgs[1] === 'etat') {
          //if(cmdArgs[2] === 'effort'
          champ["system.etats."+cmdArgs[2]+".value"] = parseInt(txtCode);
        } else if(cmdArgs[1] === 'compteur') {
          champ["system."+cmdArgs[2]+".value"] = parseInt(txtCode);
        }
        this.document.update( champ);
        break;
      case 'trans': 
        if(cmdArgs[1] === 'fatigue' && cmdArgs[2] === 'effort') {
          let objUpd = {};
          objUpd['system.etats.effort.value'] = this.document.system.etats.effort.value + 6;
          objUpd['system.etats.fatigue.value'] = this.document.system.etats.fatigue.value + 1;
          this.document.update( objUpd);
        }
        break;
    // fixer par clique
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
      default:
        console.log("ActorSheet > _onRoll : cmd inconnu =>",cmd,dataset);
    }
  }

}
 