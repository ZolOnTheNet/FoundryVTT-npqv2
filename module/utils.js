/*----------------------------------------------------------------
* lanceLesDes : lancer le nombre de dé (lancer), avec le nombre de dé en réserve (res)
*               la difficulté(diff)
*/
export function lanceLesDes(lancer = 2, res = 0, formDe="D6", diff=5 ){
  let r = new Roll(""+(lancer)+formDe);
  r.evaluate({async :false });
  let resultat = parseInt(r.result);
  let nbsucces = parseInt((resultat - diff + 5) / 5)  ;
  if (nbsucces <= 0) nbsucces = 0;
  if (nbsucces > 0) nbsucces += parseInt(res);
// --------------------------------------------

  let monTexte = "Votre jet ("+ lancer + "D6) ainsi que "+ parseInt(res)+ 
" succès en réserve contre une difficulté de "+ diff + ", vous donne <b>"+nbsucces+" mises</b> à jouer";
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

 export default function simpleDialogue(nbdes = 5, reserve = 0, diff = 5, expl = 0){
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

