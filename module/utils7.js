/*----------------------------------------------------------------
* lanceLesDes7 : utilise le système 7.1 pour rendre le résultat :
* 4d6 + un bonus 

*/
function lanceLesDes7(nbDes = 4, bonus=0, obj = {}, diff=[10,15,20]  ){
    let r = new Roll(""+(nbDes)+"D6");
    r.evaluate({async :false });
    let resultat = r.total; // r.total entier, r.result chaine de caractère
    let ret = { "nb1":0, "nb6":0, "nbPairs":0, "resultat" : 0, "codeResultat" : -1, "txtResultat" : ""};
    let nbsucces = 0;
    let isSucces = 0; //parseInt((resultat - diff + 5) / 5)  ;
    for (const value of r.terms[0].results) {
        if(value.result%2 == 0) ret.nbPairs++;
        if(value.result === 1) ret.nb1++;
        if(value.result === 6) ret.nb6++;
    }
    if(resultat < diff[0]) { // Non
        ret.codeResultat = 0; // "Non" 
    } else if ( resultat < diff[1])  { //Non mais
        ret.codeResultat = 1; // "Non mais"

    } else if ( resultat < diff[2]) { // Oui mais
        ret.codeResultat = 2;
    } else ret.codeResultat = 3; // "oui"
    const CodeTxtRes = ["Non", "Non Mais", "Oui Mais", "Oui"];
    ret.txtResultat = CodeTxtRes[ret.codeResultat];
  // --------------------------------------------
  let monTexte = "";
  let strObj = JSON.stringify(obj).replaceAll('"','|');
  if(ret.codeResultat >1 ) {
    monTexte= "Votre jet d'action (4D6) avec" + (bonus>=0? " le bonus": " le malus") + " de "+ bonus  +
        ', vous donne le resulat :'+ resultat +' et donc, un <font size="+5"><b>' +  ret.txtResultat + ' </b></font>.<br>'+
        'Vous avez : ' + ret.nbPairs +' Pairs (Qualité), '+ ret.nb1 +' malheurs contre '+ ret.nb6 + ' exploits'+
        ((ret.nb6-ret.nb1>0)?  ' donnant :'+(ret.nb6-ret.nb1)+" Critiques !<br>" : "") +
        '<br><a class="btn apply-dmg" data-apply="attackTo"><i class="fas fas fa-swords" title="Faire une attaque"></i></a>'+ 
        '<a class="btn apply-dmg" data-apply="full" data-obj="'+strObj+'"><i class="fas fa-user-minus" title="lancer les dommage" data-obj="'+strObj+'"></i></a>';
  } else {
     monTexte = "Désolé ! votre jet n'est pas si bon (="+ resultat+') vous obtenez seulement un "'+ret.txtResultat+'".<br>'+
     'Vous avez : ' + ret.nbPairs +' Pairs (Qualité), '+ ret.nb1 +' malheurs contre '+ ret.nb6 + ' exploits '+
     ((ret.nb6-ret.nb1>0)? (ret.nb6-ret.nb1)+" Critiques !<br>" : (ret.nb1-ret.nb6)+" Fumble");

  }
    // sortie du texte
  let speak = obj._uid?game.actors.get(obj._uid).name: ChatMessage.getSpeaker();
  let chatData = {
      user: game.user._id,
      speaker: speak,
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
    console.log('output form data object', formDataObject);
  //  console.log('output form data object', formDataObject);
  //  console.log('Nb dés', formDataObject);
  //  console.log('Réserve', formDataObject["reserve"]);
    // ne mache pas : game.chatMessageLancerDes("coucou",5,3,5);
  // traitement de retour du dialogue
    let res = parseInt( formDataObject[""]);
    //let nbdes = parseInt( formDataObject["nbdes"]);
    //let diff = parseInt( formDataObject["seuil"]);
    let bonus = parseInt( formDataObject["bonus"]);
    let obj = JSON.parse(formDataObject["obj"].replaceAll("|",'"'));
  //  let expl = (formDataObject["exploser"] === null)? 0 : parseInt( formDataObject["exploser"]);  
    // au moins un dé à lancer !
    //res = res + bonus
    //if(res >= nbdes) res = nbdes-1;
    
    let formDe = "D6";
    lanceLesDes7(4, bonus,obj);
  }
  
   function simpleDialogue7(oJet = { "codecmp":"artisan", "valAttr":0, "idAspect1":"", "idAspect2":"", "idAspect3":"",  "autoEffort":1, "coutMagique":0  },  obj = {}){
    let i = 10; let cumul = 0;
    let sp = ChatMessage.getSpeaker();
    let valJetAttr = oJet.valAttr;
    obj.valJetCor = valJetAttr-3; // Changement de référence (-3)
    let txtAsp = "";
    let form = `<form>
      <h2> Lancer de dés</h2>
      <p>Voici vos Choix</p>
      <table>
          <tbody>
              <tr><td>Attribut</td>
                  <td>`+oJet.codecmp + " ("+valJetAttr+"=>"+ (obj.valJetCor)  +")"+`</td>
              </tr>`;
              for(i = 1; i < 4; i++){
                 txtAsp = (oJet["idAspect"+i]===""? "aucun (0)": oJet["idAspectL"+i]); 
                if(oJet["idAspect"+i] ===  "") {
                  txtAsp = "aucun(0)";
                } else {
                  txtAsp = oJet["idAspectL"+i];
                  cumul++;
                }
                 form = form + `<str><td>Aspect `+ i + `</td>
                 <td>`+txtAsp + `</td>
              </tr>`;
              }
              obj.cumul = cumul;
              cumul = cumul + obj.valJetCor;
      form = form +`<tr><td>Total</td>
                      <td>`+ cumul+`</td></tr>
                    <tr><td>Bonus/Malus</td>
                        <td><input name="bonus" type="integer" value=0 /></td></tr>
          </tbody>
          </table>
          <input name="cumul" type="text" value='`+cumul+`' />
          <input name="obj" type="text" value='`+JSON.stringify(obj).replaceAll('"','|')+`' />
      </form>`;
      DialogueElementaire("lancer de dé pour "+sp.alias, form, handleSubmit);
  }

/****
 * repeter de utils 
 */

/***
 * Dialogue élémentaire : une liste de champs et deux boutons : cancle
 * principe on fournis les gros paramètre : 
 * le titre, le contenu (form), la fonction callback
 */

function DialogueElementaire (titre = "lancer de dé", form="<h2>coucou</h2", fnctCallBack = null) {
  const confirmation = new Dialog({
      title: titre,
      content: form,
      buttons: {
          cancel: { label: "Cancel" },
          submit: { label: "Submit", callback: fnctCallBack },
      },
      }).render(true);
      console.log("test dialogue",confirmation);
  }

function lancerInit7(formule, bonus = 0) {
  // rajouter les aspect selectionnée !
  if(formule==="") return 0;
  
  let r = new Roll(formule);
  r.evaluate({async :false });
  let max1 = 0; let i = 0; let loc = -1;
  for(const term of r.terms) {     
    if(term.number !== undefined) {
      for (const value of term.results) {
        if(value.result > max1) {
          max1 = value.result;
          loc = i;
        }
        i++;
      }
    }
  }
  let max2 = 0; i = 0;
  for(const term of r.terms) {     
    if(term.number !== undefined) {
      for (const value of term.results) {
        if(value.result > max2 && loc != i) {
          max2 = value.result;
        }
        i++;
      }
    }
  }
  let initEffort = max1+max2;
  // le lancer de dé est calculé et garder à part, donc le bonus
  // venant des Aspect (1 à 3) est rajouté pour garder un cohérence avec la feuille et l'affichage 
  let monTexte = "Initiative fixée à "+(r.total+bonus)+". le gain d'effort est "+initEffort;
  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    flavor: monTexte,
    rollMode: game.settings.get("core", "rollMode"),
    roll: r
};
//ChatMessage.create(chatData);
let cm = r.toMessage(chatData);
return { "total": r.total, "initEffort" : initEffort}
}
/***
 * EXPORT ---------------
 */
//export { simpleDialogue, lanceLesDes, DialogueDommage, lancerDeBrut, quelRang, AppliqueEtatValeur }
export { simpleDialogue7, lanceLesDes7, lancerInit7 };