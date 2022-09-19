export function updateInitiative(actorId, nombre) {
    const nRaise = parseFloat(nombre);
    const activeCombat = game.combats.filter((combat) => combat.scene.active);
  
    if (activeCombat.length === 0) {
      ui.notifications.error(`No combat is active`);
      return;
    }
  
    activeCombat.forEach((combat) => {
      const actors = combat.combatants.filter((c) => c.actor.id === actorId);
  
      if (actors.length === 0) {
        ui.notifications.error(`This actor does not participate in this combat.`);
        return;
      }
  
      combat.combatants
        .filter((c) => c.actor.id === actorId)
        .map((c) => {
          c.update({ initiative: parseFloat(nRaise) });
        });
  
      game.actors
        .filter((a) => a.id === actorId)
        .map((a) => {
          a.update({ data: { initiative: nRaise } });
        });
    });
  }