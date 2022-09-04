export const preloadHandlebarsTemplates = async function() {
    return loadTemplates([
  
      // Actor partials.
     // "systems/npqv1/templates/actor/parts/actor-features.html",
      "systems/npqv2/templates/sheets/parts/actor-bibiographie.html",
      "systems/npqv2/templates/sheets/parts/actor-synthese.html",
      "systems/npqv2/templates/sheets/parts/actor-items.html",
      "systems/npqv2/templates/sheets/parts/actor-sorts.html",
      "systems/npqv2/templates/sheets/parts/actor-effects.html",
      "systems/npqv2/templates/sheets/parts/actor-secrets.html",
      "systems/npqv2/templates/sheets/parts/actor-competences.html"
    ]);
  };