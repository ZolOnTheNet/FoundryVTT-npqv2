/*----------------------------------------------------------------
* lanceLesDes : lancer le nombre de dé (lancer), avec le nombre de dé en réserve (res)
*               la difficulté(diff)
*/
function lanceLesDes(lancer = 2, res = 0, formDe="D6", diff=5 ){
  let r = new Roll(""+(lancer)+formDe);
  r.evaluate({async :false });
  let resultat = parseInt(r.result);
  let nbsucces = parseInt((resultat - diff + 5) / 5)  ;
  if (nbsucces <= 0) nbsucces = 0;
  if (nbsucces > 0) nbsucces += parseInt(res);
// --------------------------------------------

  let monTexte = "Votre jet ("+ lancer + "D6) ainsi que "+ parseInt(res)+ 
" succès en réserve contre une difficulté de "+ diff + ', vous donne <font size="+5"><b>'+nbsucces+
' mises</b></font> à jouer.<br><a class="btn apply-dmg" data-apply="init"><i class="fas fas fa-swords" title="report Initiative"></i></a> &lt;Init __ Lancer Dom&gt;'+ 
'<a class="btn apply-dmg" data-apply="full"><i class="fas fa-user-minus" title="lancer les dommage"></i></a>';
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
//  console.log('output form data object', formDataObject);
//  console.log('Nb dés', formDataObject);
//  console.log('Réserve', formDataObject["reserve"]);
  // ne mache pas : game.chatMessageLancerDes("coucou",5,3,5);
// traitement de retour du dialogue
  let res = parseInt( formDataObject["reserve"]);
  let nbdes = parseInt( formDataObject["nbdes"]);
  let diff = parseInt( formDataObject["difficulte"]);
  let expl = (formDataObject["exploser"] === null)? 0 : parseInt( formDataObject["exploser"]); 
  // au moins un dé à lancer !
  if(res >= nbdes) res = nbdes-1;
  let lancer = nbdes - res; 
  let formDe = (expl ==0)? "D6":"D6x6";
  lanceLesDes(lancer, res, formDe, diff)
}

 function simpleDialogue(nbdes = 5, reserve = 0, diff = 5, expl = 0){
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
                <td><input name="difficulte" type="integer"value=`+diff+` /></td></tr>
        </tbody>
        </table>
    </form>`;

    new Dialog({
    title: "lancer de dé pour "+sp.alias,
    content: form,
    buttons: {
        submit: { label: "Submit", callback: handleSubmit },
        cancel: { label: "Cancel" },
    },
    }).render(true);
}
/////-------------------------------------------------------------------
// DialogueDommage
//-------------------------------------------------------------------------
function lanceLesDom(NbMises = 2, DommageArm = "1d6", BDom = "d6"){
  // pour BDom faudra faire des tests : pas de chiffre avant (ou sinon prendre en compte), attention au + (deux dés)
  NbMises--; let Dommage = "";
  Dommage = (NbMises < 1)?DommageArm: DommageArm+"+"+NbMises+BDom; 
  
  let r = new Roll(Dommage);
  r.evaluate({async :false });
  let resultat = parseInt(r.result);

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
    new Dialog({
      title: "lancer de dé pour "+sp.alias,
      content: form,
      buttons: {
          submit: { label: "Submit", callback: handleSubmitDom },
          cancel: { label: "Cancel" },
      },
      }).render(true);
}

/**********************
 * lancer un dé de bonus au Dommage
 * 
 */
 function lancerDeBrut(Formule = "1d6", Texte = "", dom = true){
  // pour BDom faudra faire des tests : pas de chiffre avant (ou sinon prendre en compte), attention au + (deux dés)

  
  let r = new Roll(Formule);
  r.evaluate({async :false });
  let resultat = parseInt(r.result);

// --------------------------------------------
  let monTexte = ""
  if( Texte == "") {
    monTexte = "Votre jet ("+ Formule + ") vous donne <b>"+resultat
    if(dom) {
      monTexte += ' points de dommages</b> en supplément.<br><a class="btn apply-dmg" data-apply="full"><i class="fas fa-user-minus" title="lancer les dommage"></i></a>';
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
 * EXPORT ---------------
 */
export { simpleDialogue, lanceLesDes, DialogueDommage, lancerDeBrut}