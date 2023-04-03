/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
 export default class npqv2ItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
      return mergeObject(super.defaultOptions, {
        classes: ["npqv2", "sheet", "item"],
        width: 520,
        height: 480,
        tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
      });
    }
  
    /** @override */
    get template() {
      const path = "systems/npqv2/templates/item";
      // Return a single sheet for all item types.
      // return `${path}/item-sheet.html`;
  
      // Alternatively, you could use the following return statement to do a
      // unique item sheet by type, like `weapon-sheet.html`.
      console.log("NPQV2"+path+"/item-"+this.item.type+"-sheet.html" );
      return `${path}/item-${this.item.type}-sheet.html`;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData() {
      // Retrieve base data structure.
      const context = super.getData();
  
      // Use a safe clone of the item data for further operations.
      const itemSystem = context.item.system;
  
      // Retrieve the roll data for TinyMCE editors.
/*      context.rollData = {};
      context.A1Acteur = false;
      context.NomCmpV =  "";
      context.NomCode = "";
  */
      let actor = this.object?.parent ?? null;
      if (actor) {
    /*    context.rollData = actor.getRollData();
        let lesDomaines = actor.data.items.filter(item => item.type === "domaine");
        let lesCmp = actor.data.items.filter(item => item.type === "competence");
        let CmpV = new Object();
        // liste des compétences (domaine et cmp)
        CmpV[""]="aucune";
        for( let dom of lesDomaines){
          CmpV[dom.data._id] = dom.data.data.code;
          */
        }
        // boucle sympa pour récuperer les code dans une liste
/*        for( let cmp of lesCmp){
          CmpV[cmp.data._id] = cmp.data.data.code;
        }
        context.CmpV = CmpV;
        
        if(context.data.data.idLien===undefined) context.data.data.idLien = "";
        if(context.data.data.idLien !=="") {
          let it =actor.data.items.get(context.data.data.idLien);
          context.NomCmp = it.name ;
          context.NomCode = it.data.data.code ;
        }
        if(context.data.type == "arme_resum") { //gestion de la désyncho ? A faire !
          // il faut récuperer les données des armes et de la compétence
          context.ArmesV = new Object();
          context.ArmesV[""]="aucune";
          let lesArmes = actor.data.items.filter(item => item.type === "objet" && item.data.typeObjet != "O"); // pour l'instant je n'ai que O, C, M, L
          for(let arme of lesArmes) {
            context.ArmesV[arme.data._id] = arme.name;
          }
          if(! context.data.data.desync)  {
            let cmp =actor.data.items.get(context.data.data.idcmpref);
            if(cmp !== undefined) itemSystem.data.score = cmp.data.data.score;
            let arme = actor.data.items.get(context.data.data.idarmeref);
            if(arme !== undefined) {
              itemSystem.data.degat = arme.data.data.dommage;
              itemSystem.data.bris = arme.data.data.bris;
              itemSystem.data.resistance = arme.data.data.resistance;
            }
          } 
        }
        context.A1Acteur = true;
      }
      // le nombre de dés peut être plus gand que le score de la compétence, mais pas l'inverse
      if(context.data.type == "competence") {
        if((itemSystem.data.score/10) > itemSystem.data.NbDes) {
          itemSystem.data.NbDes = Math.floor(itemSystem.data.score/10)
        }
      }
  /*    if(context.data.type == "secret") { // utilise editor
        if(itemData.data.description == "") itemData.data.description= "initialiser<br> et 1<br> et 2<br>et 3<br>";
        for(let i = 1; i < itemData.data.niveauMax; i++ ) {
          if(itemData.data["niv"+i].description == "") itemData.data["niv"+i].description= "initialiser<br> et 1<br> et 2<br>et 3<br>";  
          if(itemData.data["niv"+i].effet == "") itemData.data["niv"+i].effet= "initialiser<br> et 1<br> et 2<br>et 3<br>";  
        }
      }
      */
      // Add the actor's data to context.data for easier access, as well as flags.
      // if(context.data.type == "objet") {
      //   switch(context.data.data.typeObjet){
      //     case "C":
      //       itemData.data.pinitDes = "3D6";
      //       itemData.data.EstArme = true;
      //       break;
      //     case "M":
      //       itemData.data.pinitDes = "2D6";
      //       itemData.data.EstArme = true;
      //       break;
      //     case "L":
      //       itemData.data.pinitDes = "1D6";
      //       itemData.data.EstArme = true;
      //       break;
      //     default :
      //       itemData.data.pinitDes = "";
      //       itemData.data.EstArme = false;
      //       break;
      //   }
  
      // } 
  
      // attention modification du degrée de data.. !
/*      context.data = itemData.data;
      context.flags = itemData.flags;
      context.TypeObjets = { "O":"Objet","C":"Arme Courte", "M":"Arme Moyenne","L":"Arme Longue" };
      context.AttribV = { "for":"Force", "ag":"Agilité", "con":"Constitution", "p":"Présence", "ig":"Intelligence", "it":"Intuition", "v":"Volonté" };
  */
      context.CodifAspect = { "NORM":"Standard", "SEQ":"séquelles", "PLUS":"plus", "SPE":"spécialité","EXTRA":"extra"};
  //    data.TypeValue = persodata.type; 
      context.system = itemSystem;
      return context;
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    activateListeners(html) {
      super.activateListeners(html);
  
      // Everything below here is only needed if the sheet is editable
      if (!this.isEditable) return;
  
      // Roll handlers, click handlers, etc. would go here.
      //html.find('.item-edit').click(
      //  html.find('.rollable').click(this._onRoll.bind(this));
    }
  }
  