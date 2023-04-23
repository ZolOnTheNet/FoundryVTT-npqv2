/*----------------------------------------------------------------
* lanceLesDes : lancer le nombre de dé (lancer), avec le nombre de dé en réserve (res)
*               la difficulté(diff)
*/
function lanceLesDes(lancer = 2, res = 0, formDe="D6", diff=5, obj = {} ){
  let r = new Roll(""+(lancer)+formDe);
  r.evaluate({async :false });
  let resultat = r.total; // r.total entier, r.result chaine de caractère
  let nbsucces = parseInt((resultat - diff + 5) / 5)  ;
  if (nbsucces <= 0) nbsucces = 0;
  if (nbsucces > 0) nbsucces += parseInt(res);
// --------------------------------------------

  let monTexte = "";
  let strObj = JSON.stringify(obj).replaceAll('"','|');
  if(isSucces >0 ) monTexte= "Votre jet ("+ lancer + "D6) ainsi que "+ parseInt(res)+ 
" succès en réserve contre un seuil de "+ diff + ', vous donne <font size="+5"><b>'+nbsucces+
' qualité</b></font>.<br><a class="btn apply-dmg" data-apply="attackTo"><i class="fas fas fa-swords" title="Faire une attaque"></i></a>'+ 
'<a class="btn apply-dmg" data-apply="full" data-obj="'+strObj+'"><i class="fas fa-user-minus" title="lancer les dommage" data-obj="'+strObj+'"></i></a>';
  else monTexte = "Désolé ! mais vous n'avez pas réussi votre jet (="+ resultat+") contre une difficulte de : "+diff+".<br>"; 
  // sortie du texte
   let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        flavor: monTexte,
        rollMode: game.settings.get('core', 'rollMode')
    };
    //ChatMessage.create(chatData);
   let cm = r.toMessage(chatData);
}

function handleSubmit(html) {
  const formElement = html[0].querySelector('form');
  const formData = new FormDataExtended(formElement);
  const formDataObject = formData.toObject();

  // expects an object: { input-1: 'some value' }
 console.log('output form data object', formDataObject);
//  console.log('Nb dés', formDataObject);
//  console.log('Réserve', formDataObject["reserve"]);
  // ne mache pas : game.chatMessageLancerDes("coucou",5,3,5);
// traitement de retour du dialogue
  let res = parseInt( formDataObject["reserve"]);
  let nbdes = parseInt( formDataObject["nbdes"]);
  let diff = parseInt( formDataObject["seuil"]);
  let bonus = parseInt( formDataObject["bonus"]);
  let obj = JSON.parse(formDataObject["obj"].replaceAll("|",'"'));
//  let expl = (formDataObject["exploser"] === null)? 0 : parseInt( formDataObject["exploser"]); 
  // au moins un dé à lancer !
  if(res >= nbdes) res = nbdes-1;
  let lancer = nbdes - res; 
  let formDe = "D6";
  lanceLesDes(lancer, res, formDe, diff, obj);
}

 function simpleDialogue(nbdes = 5, paris = 0, seuil = 6, obj = {}){
  let i = 10;
  let sp = ChatMessage.getSpeaker();
  let form = `<form>
    <table>
        <tbody>
            <tr><td>Nb dés</td>
                <td><input name="nbdes" type="integer" value=`+nbdes+` />` 
    // bon c'est pas trop joli mais c'est plus clair !
    if(expl == 0) form = form + `<input name="exploser" value="1" type="checkbox">`;
    if(expl == 1) form = form + `<input name="exploser" value="1" checked="checked" type="checkbox">`;
    form = form +`</td></tr>
            <tr><td>Réserve</td>
                <td><input name="reserve" type="integer" value=`+reserve+` /></td></tr>
            <tr><td>Difficulté</td>
                <td><input name="difficulte" type="integer" value=`+diff+` /></td></tr>
        </tbody>
        </table>
        <input name="obj" type="text" value='`+JSON.stringify(obj).replaceAll('"','|')+`' />
    </form>`;
    DialogueElementaire("lancer de dé pour "+sp.alias, form, handleSubmit);
}
/////-------------------------------------------------------------------
// DialogueDommage
//-------------------------------------------------------------------------
function justeDesFaces(BDom = "1d6") { // il faudra renforcer les tests ici (pas de deux dés, D et d dispo etc...)
  let posd = BDom.indexOf("d");
  let posD = BDom.indexOf("D");
  let ret = "d6";
  let pos = Math.max(posd, posD); // on supprime le -1 (non trouvé)
  if(pos > -1 ) {
    ret = BDom.substring(pos);
  } 
  return ret;
}

function lanceLesDom(NbMises = 2, DommageArm = "1d6", BDom = "d6", obj={}){
  // pour BDom faudra faire des tests : pas de chiffre avant (ou sinon prendre en compte), attention au + (deux dés)
  // NbMises--; let Dommage = "";
  // BDom = justeDesFaces(BDom);
  // if( BDom)
  // Dommage = (NbMises < 1)?DommageArm: DommageArm+"+"+NbMises+BDom; 
  
  let r = new Roll(Dommage);
  r.evaluate({async :false });
  let resultat = parseInt(r.total);

// --------------------------------------------

  let monTexte = "Votre jet ("+ Dommage + ") vous donne <b>"+resultat+" points de dommage</b> à jouer.<br>Bouton Cible";
  // sortie du texte
   let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        flavor: monTexte,
        rollMode: game.settings.get('core', 'rollMode')
    };
    //ChatMessage.create(chatData);
   let cm = r.toMessage(chatData);
}


function handleSubmitDom(html) {
  const formElement = html[0].querySelector('form');
  const formData = new FormDataExtended(formElement);
  const formDataObject = formData.toObject();

// traitement de retour du dialogue
  let nbMises = parseInt( formDataObject["nbMises"]);
  let DommageArm = formDataObject["DommageArm"];
  let BDom = formDataObject["BDom"];
  // let expl = (formDataObject["exploser"] === null)? 0 : parseInt( formDataObject["exploser"]); 
  // gestion des dés de dommage
  lanceLesDom(nbMises, DommageArm, BDom);
  
}

function DialogueDommage(nbMises = 5, DommageArm = "1d6", BDom = "d6"){
  let sp = ChatMessage.getSpeaker();
  // pour les dés on peut définir deux ensembles caractéristiques (le BDom)
  let form = `<form>
    <table>
        <tbody>
            <tr><td>Nb dés</td>
                <td><input name="nbMises" type="integer" value=`+nbMises+` />` 
    // bon c'est pas trop joli mais c'est plus clair !
    //if(expl == 0) form = form + `<input name="exploser" value="1" type="checkbox">`;
    //if(expl == 1) form = form + `<input name="exploser" value="1" checked="checked" type="checkbox">`;
    form = form +`</td></tr>
            <tr><td>Dommage de l'arme</td>
                <td><input name="DommageArm" type="integer" value=`+DommageArm+` /></td></tr>
            <tr><td>Bonus de dommage adapté</td>
                <td><input name="BDom" type="integer"value=`+BDom+` /></td></tr>
        </tbody>
        </table>
    </form>`;
    DialogueElementaire("lancer de dé pour "+sp.alias, form, handleSubmitDom);
}

/**********************
 * lancer un dé de bonus au Dommage
 * 
 */
 function lancerDeBrut(Formule = "1d6", Texte = "", dom = true){ 
  let r = new Roll(Formule);
  r.evaluate({async :false });
  let resultat = parseInt(r.total);

// --------------------------------------------
  let monTexte = ""
  if( Texte == "") {
    monTexte = "Votre jet ("+ Formule + ") vous donne <b>"+resultat
    if(dom) {
      monTexte += ' points de dommages</b> en supplément.<br><a class="btn apply-dmg" data-apply="DomApply"><i class="fas fa-user-minus" title="Appliquer les dommages"></i></a>';
    } else {
      monTexte += '</b>';
    }
  } else monTexte = Texte;
  
  // sortie du texte
   let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        flavor: monTexte,
        rollMode: game.settings.get('core', 'rollMode')
    };
    //ChatMessage.create(chatData);
   let cm = r.toMessage(chatData);
}

/***
 * Dialogue élémentaire : une liste de champs et deux boutons : cancle
 * principe on fournis les gros paramètre : 
 * le titre, le contenu (form), la fonction callback
 */

function DialogueElementaire (titre = "lancer de dé", form="<h2>coucou</h2", fnctCallBack = null) {
  new Dialog({
    title: titre,
    content: form,
    buttons: {
        cancel: { label: "Cancel" },
        submit: { label: "Submit", callback: fnctCallBack },
    },
    }).render(true);

}

function repartiVal(objAvecRang, modif = 0, bfixe = 0){
  let tot = 0; let obj = {};
  if(bfixe) {
    if(modif < 0 ) modif = -modif; // valeur toujours positive
    tot = modif; 
  } else {
    for(let i = 1; i < 4 ; i++) {
      obj = objAvecRang.rangs["rang"+1];
      if( obj.value > obj.max) {
        tot += obj.value - obj.max;
        obj.value = obj.max;
      }
      tot += obj.value; 
    }
    tot += modif; // correction supplémentaire
  }
  // nous avons le total, répartissons le 
  let rep = tot; // sauvont le total
  for(let i = 1; i < 4 ; i++) {
    obj = objAvecRang.rangs["rang"+1];
    if( (rep - obj.max) > 0) {
      obj.value = obj.max;
      rep -= obj.value;
    } else { // ce coup-ci c'est inf, on doit y mettre la somme
      obj.value = rep;
      rep = 0; 
    }
  }
  return { 'somme': tot, 'dep' : rep};
}

/**
 * remet les aspects ou la liste (de 1 à 3) en commancant par le haut
 * valide pour : le jet et l'initiative
 *
 * @param {*} parent : jet ou initiative
 */
function packId(parent) {
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
/***
 * EXPORT ---------------
 */
export { simpleDialogue, lanceLesDes, DialogueDommage, lancerDeBrut, quelRang, packId, repartiVal}
