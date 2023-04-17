/*----------------------------------------------------------------
* lanceLesDes : lancer le nombre de dé (lancer), avec le nombre de dé en réserve (res)
*               la difficulté(diff)
*/
function lanceLesDes(lancer = 2, res = 0, formDe="D6", diff=5 ){
  let r = new Roll(""+(lancer)+formDe);
  r.evaluate({async :false });
  let resultat = r.total; // r.total entier, r.result chaine de caractère
  let nbsucces = 0;
  let isSucces = 0; //parseInt((resultat - diff + 5) / 5)  ;
  if(resultat >= diff) { // le jet est un succès
    isSucces = 1; // c'est une réussite
    for (const value of r.terms[0].results) {
      if(value.result%2 == 0) nbsucces++;
    }
    if (nbsucces > 0) nbsucces += parseInt(res);
  }
  if (nbsucces <= 0) nbsucces = 0;
  
// --------------------------------------------

  let monTexte = "";
  if(isSucces >0 ) monTexte= "Votre jet ("+ lancer + "D6) ainsi que "+ parseInt(res)+ 
" succès en réserve contre une difficulté de "+ diff + ', vous donne <font size="+5"><b>'+nbsucces+
' qualité</b></font>.<br><a class="btn apply-dmg" data-apply="init"><i class="fas fas fa-swords" title="report Initiative"></i></a> &lt;Init __ Lancer Dom&gt;'+ 
'<a class="btn apply-dmg" data-apply="full"><i class="fas fa-user-minus" title="lancer les dommage"></i></a>';
  else monTexte = "Désolé ! mais vous n'avez pas réussi votre jet (="+ resultat+") contre une difficulte de : "+diff+".<br>"; 
  // sortie du texte
   let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        flavor: monTexte,
        rollMode: game.settings.get("core", "rollMode"),
        roll: r
    };
    //ChatMessage.create(chatData);
   let cm = r.toMessage(chatData);
}

function handleSubmit(html) {
  const formElement = html[0].querySelector('form');
  const formData = new FormDataExtended(formElement);
  const formDataObject = formData.toObject();

  // expects an object: { input-1: 'some value' }
//  console.log('output form data object', formDataObject);
//  console.log('Nb dés', formDataObject);
//  console.log('Réserve', formDataObject["reserve"]);
  // ne mache pas : game.chatMessageLancerDes("coucou",5,3,5);
// traitement de retour du dialogue
  let res = parseInt( formDataObject["paris"]);
  let nbdes = parseInt( formDataObject["nbdes"]);
  let diff = parseInt( formDataObject["seuil"]);
  let bonus = parseInt( formDataObject["bonus"])
//  let expl = (formDataObject["exploser"] === null)? 0 : parseInt( formDataObject["exploser"]); 
  // au moins un dé à lancer !
  res = res + bonus
  if(res >= nbdes) res = nbdes-1;
  let lancer = nbdes - res; 
  let formDe = "D6";
  lanceLesDes(lancer, res, formDe, diff)
}

 function simpleDialogue(nbdes = 5, paris = 0, seuil = 6){
  let i = 10;
  let sp = ChatMessage.getSpeaker();
  let form = `<form>
    <h2> Lancer de dés</h2>
    <p>le nombre de dés mis en paris est soustrait du nombre de dés total, le bonus est ajouté</p>
    <table>
        <tbody>
            <tr><td>Nb dés total initial</td>
                <td><input name="nbdes" type="integer" value=`+nbdes+` />` 
    // bon c'est pas trop joli mais c'est plus clair !
    //if(expl == 0) form = form + `<input name="exploser" value="1" type="checkbox">`;
    //if(expl == 1) form = form + `<input name="exploser" value="1" checked="checked" type="checkbox">`;
    form = form +`</td></tr>
            <tr><td>Paris : nb dés gardés </td>
                <td><input name="paris" type="integer" value=`+paris+` /></td></tr>
            <tr><td>Bonus/Malus</td>
                <td><input name="bonus" type="integer" value=0 /></td></tr>
            <tr><td>Seuil</td>
                <td><input name="seuil" type="integer" value=`+seuil+` /></td></tr>
        </tbody>
        </table>
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

function lanceLesDom(NbMises = 2, DommageArm = "1d6", BDom = "d6"){
  // pour BDom faudra faire des tests : pas de chiffre avant (ou sinon prendre en compte), attention au + (deux dés)
  NbMises--; let Dommage = "";
  BDom = justeDesFaces(BDom);
  if( BDom)
  Dommage = (NbMises < 1)?DommageArm: DommageArm+"+"+NbMises+BDom; 
  
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
/*
 * Outils propre a metal (NPQv6)
/**
 * quelRang retourne le rang d'un objet contenant 4 rang (rangx) ayant une valeur (value)
 * et un maximum (max), la ligne est dite complète si value = max
 * 
 * @param {*} objAvecRang objet de la forme suivante :
 * obj = {
 *        "rangs": {
 *          "rang1": { "value":0, "max":3},
 *          "rang2": { "value":0, "max":3},
 *          "rang3": { "value":0, "max":3},
 *          "rang4": { "value":0, "max":3} 
 *         }
 *       }
 */
function quelRang(objAvecRang) {
  let reponse = 0;
  for(let i=1; i < 5; i++){
    if(objAvecRang.rangs["rang"+i].value < objAvecRang.rangs["rang"+i].max ) {
      reponse = i;
      break;
    }
  }
  return reponse;
}

function AppliqueEtatValeur(parent) {
  // objectif : repercuter la valeur de l'état sur les rangs 10 => 10 première case remplies
  let i = parent.value;
  for(const rang in parent.rangs) {
    if(parent.rangs[rang].max < i ) {
      parent.rangs[rang].value = parent.rangs[rang].max;
      i -= parent.rangs[rang].max;
    } else if(i > 0) {
      parent.rangs[rang].value = i;
      i = 0;
    } else parent.rangs[rang].value = 0; // mettre à zero le "reste"
  }
}

//----------------------------------------------------------------
//----------------------------------------------------------------
/***
 * EXPORT ---------------
 */
export { simpleDialogue, lanceLesDes, DialogueDommage, lancerDeBrut, quelRang, AppliqueEtatValeur }