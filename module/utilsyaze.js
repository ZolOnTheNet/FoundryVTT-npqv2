
const cranDeDes = [ "d4", "d6", "d8", "d10", "d12","d15","d20"];

function yazeJet(desAttr="d4",desCmp="d4",nbStress=0, avantage=0, inconvenient=0, decalage=false, obj={}){
    let monTexte = "";
    let formule = "{"+desAttr+"x[attr],"+desCmp+"x[cmp]";
    if(nbStress>0){ 
        if(decalage){ // dé(s) de stress échelonnée
               formule = formule + "," + formuleDeEchelonne(nbStress, true)+'[stress]';
        } else formule +=","+nbStress+"d6[stress]"; // manque la fermuture
    }
    
    let bonus = avantage - inconvenient;

    if(avantage > 0 || inconvenient>0) {
         if(bonus > 0){
            // rajouter un ou plusierus dés d'avantages
            formule += "," + formuleDeEchelonne(bonus);
        }else if (bonus<0){
            // ajouter un ou plusieurs dés de désavantages
            formule += ", " + formuleDeEchelonne(-bonus);
        } // pas de cas ou s'est égale
    }
    formule += "}";
    let r = new Roll(formule);
    let lancerDe={};
    r.evaluate({async :false });
    console.log("Valeur du jet :",r);
    if(decalage) monTexte="lancer de "+desAttr+" avec "+desCmp+" et "+(nbStress?formuleDeEchelonne(nbStress)+" en stress":"")+" donne le resultat<br>";
        else monTexte="lancer de "+desAttr+" avec "+desCmp+" et "+(nbStress?nbStress+" dés de stress":"")+" donne le resultat<br>";
    let nbsucces = 0; let totSuccess = 0
    for(let roll of r.terms[0].rolls){
        nbsucces = nbSucces(roll._total,4); // getion par seuil 
        switch(roll.terms[0].options.flavor){
            case 'attr':
                //monTexte +='<div class="dice-roll dice-result"><section class="tooltip-part"><div="dice">Attibut <ol class="dice-rolls"> <li class="roll die d'+roll.terms[0].faces+'">'+roll._total+'</li></ol> donne '+nbsucces+'</div></section></div><br>';
                monTexte += 'Attribut('+desAttr+') donne '+nbsucces+'<br>' ;
                totSuccess += nbsucces;
                lancerDe.attr = nbsucces;
                break;
            case 'cmp':
                //monTexte +='cmp  <span class="roll die d'+roll.terms[0].faces+'">'+roll.terms[0].results[0].result+'</span> donne '+nbsucces+'<br>';
                monTexte += 'Compétence('+desCmp+') donne '+nbsucces+'<br>'; 
                totSuccess += nbsucces;
                lancerDe.cmp = nbsucces;
                break;
            case 'stress':
                //monTexte +='stress  <span class="roll die d'+roll.terms[0].faces+'">'+roll.terms[0].results[0].result+'</span> donne '+nbsucces+'<br>';
                monTexte += 'Le stress('+desAttr+') donne '+nbsucces+'<br>'; 
                if(roll.terms[0].results[0].result == 1) monTexte += '<strong>Vous avez un malheur qui surgit<br></strong>';
                totSuccess += nbsucces;
                lancerDe.stress = nbsucces;
                break;
        }
    }
    // information transmise
    obj.codeAttr = "Force"; obj.valAttr = cranDeDes.indexOf(desAttr)+1; obj.codeCmp = "Baston" ; obj.libelle = ""; obj.valCmp = cranDeDes.indexOf(desCmp);
    obj.stress = nbStress; obj.avantage = avantage; obj.inconvenient= inconvenient; obj.decalage = decalage; obj.relance = true; obj.jet = lancerDe;
    monTexte += '<div class="plusPolice">vous avez '+totSuccess+" points d'actions.</div>"
    //`<a class="apply-cmd grdPolice" data-cmd="msg.arme.attaque.+" data-roll='`+ JSON.stringify(obj)+ `' title="passer le resultat en mode attaque (avec calcul des dommages)"> <i class="fad fa-sword"></i><i class="fad fa-comment-alt-plus"></i>&nbsp;</a>&nbsp;&nbsp;`+
    monTexte += `<br><a class="apply-cmd" data-cmd="yaze.push.lancer" data-roll='`+ JSON.stringify(obj)+ `' title="Cela augmentera le stress">Voulez vous Poussez votre Jet immediatement?</a><br> 
                <a class="apply-cmd" data-cmd="yaze.push.free" data-roll='`+ JSON.stringify(obj)+ `' title="cela n'augmentera pas le stress">ou pour pour l'action suivante ?`;
    //let speak = obj._uid?game.actors.get(obj._uid).name: ChatMessage.getSpeaker();
    // { "codeAttr":"Force", "valAttr":1, "codeCmp":"Baston", "libelle":"", "valCmp":1, "stress":0, "avantage":0, "inconvenient":0, "decalage":true, "relance":0  }
    let speak = ChatMessage.getSpeaker();
    let chatData = {
      user: game.user._id,
      speaker: speak,
      flavor: monTexte,
      rollMode: game.settings.get("core", "rollMode"),
      roll: r
    };
    let cm = r.toMessage(chatData);
}

function nbSucces(aval=0, seuil = 0 ){
    let ret = 0;
    if(seuil >0) { // seuil multiple
        ret = Math.floor(aval/seuil);
    } else {
        if(aval>=10) ret++;
        if(aval>=6) ret++;
        //if(aval==1) ret = -1;
    }
    return ret;
}

function formuleDeEchelonne(aVal = 1, bExplode = false) {
    let nbD12 = aVal / 5;
    let ret = ""
    if(nbD12 > 1){ // il y a plus qu'un dé
        ret = "" + (Math.floor(nbD12))+cranDeDes[4]; // nombre de D12 
        nbD12 = nbD12 - Math.floor(nbD12); // reste de la division
        if(nbD12 > 0) ret += ((bExplode)?"x +": " +") + cranDeDes[math.floor(nbD12*5)-1]; // enfin le reste de la division
    } else ret = cranDeDes[aVal-1];
    return ret+((bExplode)?"x": ""); // exploser !
}

//-----------------
// Zone de dialogue et leurs gestions
//----------------------------

function handleSubmit(html) {
    const formElement = html[0].querySelector('form');
    const formData = new FormDataExtended(formElement);
    const formDataObject = formData.toObject();
  
    // expects an object: { input-1: 'some value' }
    console.log('output form data object', formDataObject);
    // traitement de retour du dialogue
    //let res = parseInt( formDataObject[""]);
    let attr = formDataObject["attrForm"];
    let cmp = formDataObject["cmpForm"];
    let stress = parseInt( formDataObject["stress"]);
    let avantage = parseInt( formDataObject["avantage"]);
    let inconvenient = parseInt( formDataObject["inconvenient"]);
    let obj = JSON.parse(formDataObject["obj"].replaceAll("|",'"'));
  //  let expl = (formDataObject["exploser"] === null)? 0 : parseInt( formDataObject["exploser"]);  
    // au moins un dé à lancer !
    //res = res + bonus
    //if(res >= nbdes) res = nbdes-1;
    
    let formDe = "D6";
    //lanceLesDes7(4, bonus,obj);
    yazeJet(attr, cmp, stress, avantage,inconvenient, true, obj);
}
  
function simpleDialogueYaze(oJet = { "codeAttr":"Force", "valAttr":1, "codeCmp":"Baston", "libelle":"", "valCmp":1, "stress":0, "avantage":0, "inconvenient":0, "decalage":true, "relance":0, "jet":{}  },  obj = {}){
let i = 10; let cumul = 0;
let sp = ChatMessage.getSpeaker();
let valJetAttr = oJet.valAttr;
//let txtAsp = ""; // `+((oJet.relance)?"":oJet.Jet.attr+" Success")+`
if(jQuery.isEmptyObject(obj)) obj = oJet; 
let form = `<form>
    <h2> Lancer de dés Yaze Echelonnées</h2>
        <label for="attrForm">Attribut -Dés-`+((oJet.relance)?"":oJet.jet.attr+" Success")+`</label>
        <input name="attrForm" type="text" value="`+formuleDeEchelonne(oJet.valAttr)+`"> 
        <label for="cmpForm">Compétence -Dés-`+((oJet.relance)?"":oJet.jet.cmp+" Success")+`</label>
        <input name="cmpForm" type="text" value='`+formuleDeEchelonne(oJet.valCmp)+`' />
        <label for="stress">Stress -Nombre-`+((oJet.relance)?"":oJet.jet.stess+" Success")+`</label>
        <input name="stress" type="text" value='`+(oJet.stress)+`' />
        <label for="avantage">Avantage -Nombre-</label>
        <input name="avantage" type="text" value='`+(oJet.avantage)+`' />
        <label for="inconvenient">Malus -Nombre -</label>
        <input name="inconvenient" type="text" value='`+(oJet.inconvenient)+`' />
        <label for="obj">objet propagagé</label>
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

/***
 * EXPORT ---------------
 */

export { yazeJet, simpleDialogueYaze };