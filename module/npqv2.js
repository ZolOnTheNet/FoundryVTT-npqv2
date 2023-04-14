import { npqv2Actor } from "./actors/Npqv2Actor.js";
import { npqv2Item } from "./actors/Npqv2Item.js";
import npqv2ItemSheet from "./sheets/Npqv2ItemSheet.js";
import npqv2ActorSheet from "./sheets/Npqv2ActorSheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { simpleDialogue, lanceLesDes, DialogueDommage } from "./utils.js";
import { updateInitiative } from "./updateInitiative.js";

//  a metre au bon endroit
function XXX(event, html, data){
  const btn = $(event.currentTarget);
  const btnType = btn.data("apply");
  // cette partie peut être toujours utile ou non, mais nécessaire pour full, et DomApply
  let c = html.find(".flavor-text").text();
  let st = c.indexOf("donne ") + "donne ".length;
  let ed = c.indexOf(" ", st);
  switch(btnType){
    case "full"   : 
      console.log("lancer dommage !"); 
      let nbMises = parseInt(c.substring(st,ed));
      DialogueDommage(nbMises);
      break;
    case "DomApply"   : 
      console.log("appliquer les dommages !"); 
      let DomTot = parseInt(c.substring(st,ed));
      break;
    case "double" : console.log("lancer dommage !"); break;
    case "init"   : 
      console.log("modifier l'init du perso !");
      //on obtient le personnage en cours de selections
      let actor = ChatMessage.getSpeaker().actor;
      if(actor==null) {
        console.log("Selectionner un personnage");
      } else {
        // let idcmb = game.combat.combatants.find(x => x.actorId=actor);
        const result = parseInt(html.find(".dice-total").text())
 /*        //let id = "RdFhwUs3vkKPqVFB"
        if(game.users.current.role == 4) {
          game.combat.setInitiative(idcmb._id, result);
        } else {
          idcmb.update({ initiative: result})
          game.actors.get(actor).update({ data: { initiative: result } });
        }
 */    // piquer à seventhsea
        updateInitiative(actor, result);
      }
      break;
  }
}

// trouver dans cof dans un fichier, ici pour test
function registerHooks() {
  Hooks.on("renderChatMessage", (message, html, data) => {
    // Affiche ou non les boutons d'application des dommages
//     if (game.settings.get("cof", "displayChatDamageButtonsToAll")) {
        html.find(".apply-dmg").click(ev => XXX(ev, html, data));    
//     }
    // else {
    //     if (game.user.isGM){
    //         html.find(".apply-dmg").click(ev => XXX(ev, html, data));    
    //     }
    //     else {
    //         html.find(".apply-dmg").each((i, btn) => {
    //             btn.style.display = "none"
    //           });
    //         html.find(".dr-checkbox").each((i, btn) => {
    //             btn.style.display = "none"
    //         });
    //     }        
    // }      
  });
}

Hooks.once("init", async function () {
    console.log("NPQv3 | Initialisation du système NPQv3");

  // Define custom Document classes
    CONFIG.Actor.documentClass = npqv2Actor;
    CONFIG.Item.documentClass = npqv2Item;
    CONFIG.explode = false;
    
    game.McDialogues = {
      "SimpleCmp": simpleDialogue,
      "Simplelancer" : lanceLesDes,
      "SimpleDom" : DialogueDommage
    };

    game.macroDialogue = simpleDialogue; // atransfere dans McDialogues
    game.macroSimpleJet = lanceLesDes;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("npqv2", npqv2ItemSheet, { makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("npqv2", npqv2ActorSheet, { makeDefault: true });
    
    registerHooks();
    // ----------------------------------
    // piquer de sevensea : svnsea2e. Hooks.once("init",...)
    // ajoute : for et iff
    // ----------------------------------
    Handlebars.registerHelper('for', function (from, to, incr, block) {
      var accum = '';
  
      const count = parseInt(from) + parseInt(to);
      for (var i = from; i < count; i += incr) {
        block.data.index = i;
        block.data.first = i === 0;
        block.data.last = i === to;
        block.data.mod = Math.trunc(i / 5);
        block.data.remain = i % 5;
        accum += block.fn(this);
      }
      return accum;
    });
  
    Handlebars.registerHelper('iff', function (a, operator, b, opts) {
      var bool = false;
      switch (operator) {
        case '==':
          bool = a == b;
          break;
        case '!=':
          bool = a != b;
          break;
        case '>=':
          bool = a >= b;
          break;
        case '<=':
          bool = a <= b;
          break;
        case '>':
          bool = a > b;
          break;
        case '<':
          bool = a < b;
          break;
        default:
          throw 'Unknown operator ' + operator;
      }
  
      if (bool) {
        return opts.fn(this);
      } else {
        return opts.inverse(this);
      }
    });
    return preloadHandlebarsTemplates();
})

