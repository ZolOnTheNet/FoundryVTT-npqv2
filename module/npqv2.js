import { npqv2Actor } from "./actors/Npqv2Actor.js";
import { npqv2Item } from "./actors/Npqv2Item.js";
import npqv2ItemSheet from "./sheets/Npqv2ItemSheet.js";
import npqv2ActorSheet from "./sheets/Npqv2ActorSheet.js";
import { preloadHandlebarsTemplates } from "./templates.js";
import { simpleDialogue, lanceLesDes, DialogueDommage } from "./utils.js";
import { updateInitiative } from "./updateInitiative.js";

//  a metre au bon endroit
function EnventDuChat(event, html, data){
 // const btn = $(event.currentTarget);
 // const btnType = btn.data("apply");
  // cette partie peut être toujours utile ou non, mais nécessaire pour full, et DomApply
  //console.log("EventDuChat:",btn);
  let dataSet = event.currentTarget.dataset;
  let obj = JSON.parse(dataSet.roll);
  let cmdArgs = dataSet.cmd.split(".");
  let objAction = null;
  // aiguillage des options (voir utils.js) : msg.arme.attaque, 
  if(obj?._id) objAction = game.actors.get(obj._id); else return; // peut être un message ui ?.
  switch(cmdArgs[0]){
    case "msg":
        if(cmdArgs[1]=== "arme") {
          if(cmdArgs[2]=== "attaque") {
            // transformer le jet en jet d'attaque courant !
            objAction.passerJetAttaque(obj);
          }
          else if (cmdArgs[2]==="defense") {
            // transformer le jet en jet de défense !
          }
        }
      break;
  }
  return;
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
    case "double" : console.log("lancer dommage !"); 
      break;
    case "attackTo"   : 
      console.log("faire lancer la défense du personnage opposé !");
      //on obtient ces cibles
      let targets = ([...game.user.targets].length > 0) ? [...game.user.targets] : canvas.tokens.objects.children.filter(t => t._controlled);
      //on obtient le personnage en cours de selections
      let actor = ChatMessage.getSpeaker().actor;
      if(actor==null) {
        console.log("Selectionner un personnage");
      } else {
        // faire une demande de défense, puis appliquer les calcul (@Nom)
        // let template = "systems/hitos/templates/chat/chat-drama.html";
        // dialogData = {
        //     title: game.i18n.localize("Drama"),
        //     total: result,
        //     damage: damage,
        //     dicesOld: dicesOld,
        //     dices: dicesNew.sort((a, b) => a - b),
        //     actor: actor.id,
        //     mods: mods,
        //     weaponDamage: weaponDamage,
        //     weaponKindBonus: weaponKindBonus,
        //     data: actor.system,
        //     config: CONFIG.hitos,
        // };
        // html = await renderTemplate(template, dialogData);
        // ChatMessage.create({
        //     content: html,
        //     speaker: {alias: actor.name},
        //     type: CONST.CHAT_MESSAGE_TYPES.ROLL, 
        //     rollMode: game.settings.get("core", "rollMode"),
        //     roll: newRoll
        // });
      }
      break;
  }
}

// trouver dans cof dans un fichier, ici pour test
function registerHooks() {
  Hooks.on("renderChatMessage", (message, html, data) => {
    // Affiche ou non les boutons d'application des dommages
//     if (game.settings.get("cof", "displayChatDamageButtonsToAll")) {
  html.find(".apply-dmg").click((ev) => Hitpoints.onClickChatMessageApplyButton(ev, html, data));
        html.find(".apply-cmd").click((ev) =>EnventDuChat(ev, html, data));
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
    console.log("NPQv7 | Initialisation du système NPQv7");

  // Define custom Document classes
    CONFIG.Actor.documentClass = npqv2Actor;
    CONFIG.Item.documentClass = npqv2Item;
    CONFIG.explode = false;
    
    /**
     * Pour les Macro, on ajoute les petites fonction des macros sympa
     * Simplelancer est sympa...
     */
    game.McDialogues = {
      "SimpleCmp": simpleDialogue,
      "Simplelancer" : lanceLesDes,
      "SimpleDom" : DialogueDommage
    };

    /** constantes du jeu ajouter 
     * 
     */
    game.Constantes = {
      "cranDe" : [ "1", "d2", "d3","d4", "d6", "d8","d10", "d12", "d15","d20","d24", "d30"],
      "deBonus" : [ "1d2", "1d4", "1d6", "1d8", "1d10", "1d12"] // astuce pour que val à 1 donne D4
    }

     // ça marche si on ouvre la feuille de perso, sinon c'est 0 (pas possible).
     CONFIG.Combat.initiative = {
      //  formula: "1d20 + @abilities.dex.mod",
        formula: "@initEtat.value"
        //,
        //decimals: 2
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

