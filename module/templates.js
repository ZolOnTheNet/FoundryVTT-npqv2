export const preloadHandlebarsTemplates = async function() {
    return loadTemplates([
  
      // Actor partials.
     // "systems/npqv1/templates/actor/parts/actor-features.html",
     "systems/npqv2/templates/actor/parts/actor-bibiographie.html",
      "systems/npqv2/templates/actor/parts/actor-synthese.html",
      "systems/npqv21/templates/actor/parts/actor-items.html",
      "systems/npqv2/templates/actor/parts/actor-sorts.html",
      "systems/npqv2/templates/actor/parts/actor-effects.html",
      "systems/npqv2/templates/actor/parts/actor-secrets.html",
      "systems/npqv2/templates/actor/parts/actor-competences.html"
    ]);
  };