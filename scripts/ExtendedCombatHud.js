class CombatHud {
  constructor(token) {
    this.fixFoundry = false;
    this.token = token;
    this.actor = token.actor;
  }

  async init(){
    this._itemCount = this.actor.items.size
    this.settings = {
      isMagicItems: game.modules.get("magic-items-2")?.active,
      switchEquip: game.settings.get("enhancedcombathud", "switchEquip"),
      tooltipScale: game.settings.get("enhancedcombathud", "tooltipScale"),
      fadeOutInactive: game.settings.get(
        "enhancedcombathud",
        "fadeOutInactive"
      ),
      spellMode: game.settings.get("enhancedcombathud", "preparedSpells"),
      playerDetailsBottom: game.settings.get(
        "enhancedcombathud",
        "playerDetailsBottom"
      ),
      localize: {

        AC: game.i18n.localize('DND5E.AC'),
        SpellDC: game.i18n.localize('DND5E.SpellDC'),
        InitiativeRoll: game.i18n.localize('COMBAT.InitiativeRoll'),

        mainactions: game.i18n.localize(
          "enhancedcombathud.hud.mainactions.name"
        ),
        castspell: game.i18n.localize("enhancedcombathud.hud.castspell.name"),
        usepower: game.i18n.localize("enhancedcombathud.hud.usepower.name"),
        useitem: game.i18n.localize("enhancedcombathud.hud.useitem.name"),
        bonusaction: game.i18n.localize(
          "enhancedcombathud.hud.bonusaction.name"
        ),
        reaction: game.i18n.localize("enhancedcombathud.hud.reaction.name"),
        specialaction: game.i18n.localize(
          "enhancedcombathud.hud.specialaction.name"
        ),
        pass: game.i18n.localize("enhancedcombathud.hud.pass.name"),
        endturn: game.i18n.localize("enhancedcombathud.hud.endturn.name"),
        hp: game.i18n.localize("enhancedcombathud.hud.hp.name"),
        ac: game.i18n.localize("enhancedcombathud.hud.ac.name"),
        of: game.i18n.localize("enhancedcombathud.hud.of.name"),
        inv: game.i18n.localize("enhancedcombathud.hud.inventory.name"),
        saves: game.i18n.localize("enhancedcombathud.hud.saves.name"),
        skills: game.i18n.localize("enhancedcombathud.hud.skills.name"),
        tools: game.i18n.localize("enhancedcombathud.hud.tools.name"),
        spells: {
          0: CONFIG.DND5E.spellLevels["0"],
          pact: CONFIG.DND5E.spellPreparationModes.pact,
          will: CONFIG.DND5E.spellPreparationModes.atwill,
          innate: game.i18n.localize("enhancedcombathud.hud.spells.innate"),
          item: "Magic Items",
          1: CONFIG.DND5E.spellLevels["1"],
          2: CONFIG.DND5E.spellLevels["2"],
          3: CONFIG.DND5E.spellLevels["3"],
          4: CONFIG.DND5E.spellLevels["4"],
          5: CONFIG.DND5E.spellLevels["5"],
          6: CONFIG.DND5E.spellLevels["6"],
          7: CONFIG.DND5E.spellLevels["7"],
          8: CONFIG.DND5E.spellLevels["8"],
          9: CONFIG.DND5E.spellLevels["9"],
        },
      },
    };
    this.actions = {
      attack: await this.getItems({
        actionType: ["action"],
        itemType: ["weapon"],
        equipped: false,
      }),
      spells: await this.getItems({
        actionType: ["action"],
        itemType: ["spell"],
        prepared: true,
      }),
      special: await this.getItems({
        actionType: ["action", "legendary"],
        itemType: ["feat"],
      }),
      consumables: await this.getItems({
        actionType: ["action", "legendary"],
        itemType: game.settings.get("enhancedcombathud", "showWeaponsItems") ? ["consumable", "equipment", "loot", "weapon"] : ["consumable", "equipment", "loot"],
      }),
    };
    this.bonus = {
      attack: await this.getItems({
        actionType: ["bonus"],
        itemType: ["weapon"],
        equipped: false,
      }),
      spells: await this.getItems({
        actionType: ["bonus"],
        itemType: ["spell"],
        prepared: true,
      }),
      special: await this.getItems({
        actionType: ["bonus"],
        itemType: ["feat", "equipment", "consumable"],
      }),
      consumables: await this.getItems({
        actionType: ["bonus"],
        itemType: ["consumable"],
      }),
    };
    this.reactions = {
      attack: await this.getItems({
        actionType: ["reaction", "reactiondamage", "reactionmanual"],
        itemType: ["weapon"],
        equipped: true,
      }),
      spells: await this.getItems({
        actionType: ["reaction", "reactiondamage", "reactionmanual"],
        itemType: ["spell"],
        prepared: true,
      }),
      special: await this.getItems({
        actionType: ["reaction", "reactiondamage", "reactionmanual"],
        itemType: ["feat"],
      }),
      consumables: await this.getItems({
        actionType: ["reaction", "reactiondamage", "reactionmanual"],
        itemType: ["consumable"],
      }),
    };
    this.free = {
      special: await this.getItems({ actionType: ["special"], itemType: ["feat"] }),
    };
    this.other = {
      portrait: this.actor.img,
      name: this.actor.name,
      maxHp: this.actor.system.attributes.hp.max,
      currHp: this.actor.system.attributes.hp.value,
      movement: {
        max: Math.round(
          Math.max(
            this.actor.system.attributes.movement.burrow,
            this.actor.system.attributes.movement.climb,
            this.actor.system.attributes.movement.fly,
            this.actor.system.attributes.movement.swim,
            this.actor.system.attributes.movement.walk
          ) / canvas.dimensions.distance
        ),
        current: 0,
        moved: 0,
      },
      ac: this.actor.system.attributes.ac.value,
      classes: this.getClassesAsString(),
      specialItemsNames: {
        disengage: game.i18n.localize("enhancedcombathud.items.disengage.name"),
        hide: game.i18n.localize("enhancedcombathud.items.hide.name"),
        shove: game.i18n.localize("enhancedcombathud.items.shove.name"),
        dash: game.i18n.localize("enhancedcombathud.items.dash.name"),
        dodge: game.i18n.localize("enhancedcombathud.items.dodge.name"),
        ready: game.i18n.localize("enhancedcombathud.items.ready.name"),
      },
    };
    this.resources = {
      action: true,
      bonus: true,
      other: true,
    };
    this.resources = {
      action: true,
      bonus: true,
      reaction: true,
    };
    this.skills = this.actor.system.skills;
    this.saves = this.actor.system.abilities;
    this.tools = this.actor.items
      .filter((i) => i.type == "tool")
      .map((item, index) => {
        let toolAbility =
          typeof item.system.ability == "string"
            ? item.system.ability
            : item.system.ability[0] || "str";
        let abilityModifiers = this.actor.system.abilities[toolAbility];
        let toolProficiency = Math.ceil(
          item.system.proficient * this.actor.system.attributes.prof
        );
        return {
          ability: toolAbility,
          bonus: 0,
          label: item.name,
          mod: abilityModifiers.mod,
          passive: 8 + toolProficiency + abilityModifiers.mod,
          prof: toolProficiency,
          total: toolProficiency + abilityModifiers.mod,
          type: "Number",
          proficient: item.system.proficient,
        };
      });

    // Localize skills
    Object.keys(CONFIG.DND5E.skills).forEach((skill) => {
      this.skills[skill].label = CONFIG.DND5E.skills[skill];
      this.skills[skill].proficient = this.skills[skill].value;
      this.skills[skill].tooltip = game.i18n.localize(
        `enhancedcombathud.skills.${skill}.tooltip`
      );
    });
    
    let sortableSkills = [];
    for (let skill in this.skills) {
      sortableSkills.push([skill, this.skills[skill]]);
    }
    sortableSkills.sort((a, b) => a[1].label.label < b[1].label.label ? -1 : 1);
    let tempSkills = {};
    sortableSkills.forEach(function(item){
      tempSkills[item[0]]=item[1];
    })
    this.skills = tempSkills;

    //
    Object.keys(CONFIG.DND5E.abilities).forEach((ability) => {
      this.saves[ability].label = CONFIG.DND5E.abilities[ability];
      this.saves[ability].total = this.saves[ability].save;
      this.saves[ability].tooltip = game.i18n.localize(
        `enhancedcombathud.abilities.${ability}.tooltip`
      );
    });
    return this;
  }

  getClassesAsString() {
    try {
      let classes = this.actor.system.classes;
      if (!classes) return "";
      if (Object.keys(classes).length === 0)
        return this.actor.labels.creatureType;
      let string = "";
      for (let [key, value] of Object.entries(classes)) {
        string += "lvl " + value.levels + " ";
        string += key[0].toUpperCase() + key.substring(1);
        string += value.subclass
          ? " (" +
            value.subclass[0].toUpperCase() +
            value.subclass.substring(1) +
            ") "
          : " ";
      }
      return string;
    } catch {
      return "";
    }
  }

  static async translateMagicItem(magicItem){
    if(!game.modules.get("magic-items-2")?.active) return null;
    let mi = game.items.get(magicItem.id) ?? await game.packs.get(magicItem.pack)?.getDocument(magicItem.id)
    if(mi) mi.flags.magicitemsdata = magicItem;
    return mi 
  }

  static async getMagicItemSpellBySpellName(actor, name){
    if(!game.modules.get("magic-items-2")?.active) return null;
    for(let i of MagicItems.actor(actor._id).items.filter(item => item.visible && item.active)){
      let mItem = i.spells.find(spell => spell.name == name);
      if(mItem) return await CombatHud.translateMagicItem(mItem);
    }
    return null;
  }

  //This function gets the items for the combat hud. This includes spells, magic items, and feats.
  //It also applies the items to where they should go, as far as action, bonus, reaction, etc.
  async getItems(filters) {
    const actionType = filters.actionType;
    const itemType = filters.itemType;
    const equipped = filters.equipped;
    const prepared = filters.prepared;
    let magicitemspells = [];
    if(this.settings.isMagicItems){
      for(let mi of MagicItems.actor(this.actor._id).items.filter(item => item.visible && item.active)){
        mi.item.isMagicItem=true;
        for(let spell of mi.spells){
          const item = await CombatHud.translateMagicItem(this.actor, spell);
          if(item){
            item.isMagicItem=true;
            magicitemspells.push(item);
          }
        }
      }
    }
    let items = Array.from(this.actor.items).concat(magicitemspells);

    //Filter out items that don't match the filters
    let filteredItems = items.filter((i) => {
      let itemData = i.system;
      //If the item is not equipped, return false
      if (equipped === true && !itemData.equipped) {
        return false;
      }
      //If the HUD is set to only show prepared spells and the item needs to be prepared
      //and the item is not prepared, return false?
      if (
        this.settings.spellMode &&
        prepared === true &&
        itemData.preparation?.prepared === false &&
        itemData.preparation?.mode == "prepared" &&
        itemData.level !== 0
      ){
         if(!i.isMagicItem)  return false;
      }
      //If the action type in the filter matches the activation type of the item AND the item types match the filter, return true
      if (
        actionType &&
        actionType.includes(itemData.activation?.type) &&
        itemType &&
        itemType.includes(i.type)
      ){
          return true;
      }
      //Default return false
      return false;
    });
    let spells = {};
    spells[this.settings.localize.spells["0"]] = [];
    spells[this.settings.localize.spells["innate"]] = [];
    spells[this.settings.localize.spells["will"]] = [];
    spells[this.settings.localize.spells["pact"]] = [];
    spells[this.settings.localize.spells["item"]] = [];
    spells[this.settings.localize.spells["1"]] = [];
    spells[this.settings.localize.spells["2"]] = [];
    spells[this.settings.localize.spells["3"]] = [];
    spells[this.settings.localize.spells["4"]] = [];
    spells[this.settings.localize.spells["5"]] = [];
    spells[this.settings.localize.spells["6"]] = [];
    spells[this.settings.localize.spells["7"]] = [];
    spells[this.settings.localize.spells["8"]] = [];
    spells[this.settings.localize.spells["9"]] = [];
    //This sets up the spells that are prepared and will show up
    if (prepared) {
      for (let item of filteredItems) {
        let key = item.labels.level;
        if(item.isMagicItem && item.type == "spell"){
          key = this.settings.localize.spells["item"];
        }
        else{ 
          switch (item.system.preparation.mode) {
            case "innate":
              key = this.settings.localize.spells["innate"];
              break;

            case "atwill":
              key = this.settings.localize.spells["will"];
              break;

            case "pact":
              key = this.settings.localize.spells["pact"];
              break;
          }
        }
        spells[key].push(item);
      }
      for (let spellLevel of Object.keys(spells)) {
        if (spells[spellLevel].length == 0) {
          delete spells[spellLevel];
        }
      }
    }
    if (filters.prepared === true) {
      return spells;
    } else {
      return filteredItems;
    }
  }
  findItemByName(itemName) {
    let items = this.actor.items;
    let item = items.find((i) => i.name == itemName);
    return item;
  }
  get sets() {
    let items = this.actor.items;
    let sets;
    sets = {
      set1: {
        primary: null,
        secondary: null,
      },
      set2: {
        primary: null,
        secondary: null,
      },
      set3: {
        primary: null,
        secondary: null,
      },
    };
    if (this.actor.type == "npc") {
      sets = {
        set1: {
          primary: this.actions.attack[0],
          secondary: this.bonus.attack[0],
        },
        set2: {
          primary: this.actions.attack[1],
          secondary: this.bonus.attack[1],
        },
        set3: {
          primary: this.actions.attack[2],
          secondary: this.bonus.attack[2],
        },
      };
    }
    for (let item of items) {
      if (item.flags.enhancedcombathud?.set1p) sets.set1.primary = item;
      if (item.flags.enhancedcombathud?.set2p) sets.set2.primary = item;
      if (item.flags.enhancedcombathud?.set3p) sets.set3.primary = item;
      if (item.flags.enhancedcombathud?.set1s) sets.set1.secondary = item;
      if (item.flags.enhancedcombathud?.set2s) sets.set2.secondary = item;
      if (item.flags.enhancedcombathud?.set3s) sets.set3.secondary = item;
    }

    sets.active = this.actor.flags.enhancedcombathud?.activeSet
      ? sets[`${this.actor.flags.enhancedcombathud?.activeSet}`]
      : sets.set1;

    return sets;
  }
  _render() {
    if(this.token.actor)canvas.hud.enhancedcombathud.bind(this.token);
  }
  async switchSets(active) {
    await this.actor.setFlag("enhancedcombathud", "activeSet", active);
    if (!this.settings.switchEquip) return;

    
    const updates = [];
    for(let [k,v] of Object.entries(this.sets)){
      if(v.primary) updates.push({_id: v.primary.id, "system.equipped": v.primary == this.sets.active.primary});
      if(v.secondary) updates.push({_id: v.secondary.id, "system.equipped": v.secondary == this.sets.active.secondary});
    }

    await this.actor.updateEmbeddedDocuments("Item", updates);
  }
  
  set hasAction(value) {
    $(canvas.hud.enhancedcombathud.element)
      .find('.actions-container.has-actions[data-actionbartype="actions"]')
      .toggleClass("actions-used", !value);
  }
  set hasReaction(value) {
    $(canvas.hud.enhancedcombathud.element)
      .find('.actions-container.has-actions[data-actionbartype="reactions"]')
      .toggleClass("actions-used", !value);
  }
  set hasBonus(value) {
    $(canvas.hud.enhancedcombathud.element)
      .find('.actions-container.has-actions[data-actionbartype="bonus"]')
      .toggleClass("actions-used", !value);
  }
  get spellSlots() {
    return this.actor.system.spells;
  }
  get movementColor() {}
}

class CombatHudCanvasElement extends BasePlaceableHUD {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template =
      "modules/enhancedcombathud/templates/extendedCombatHud.html";
    options.id = "enhancedcombathud";
    options.dragDrop = [{ dragSelector: null, dropSelector: null }];
    return options;
  }

  _canDragDrop(selector) {
    return true;
  }

  bind(object) {
    const actor = object.document.actor;
    if (!actor) return ui.notifications.error(game.i18n.localize("enhancedcombathud.err.invalid"));
    const type = actor.type;
    if(type !== "npc" && type !== "character") return ui.notifications.error(game.i18n.localize("enhancedcombathud.err.invalid"));
    if (this._crashed) {
      this._crashed = false;
      this._state = this.constructor.RENDER_STATES.ERROR;
    }
    return super.bind(object);
  }

  async getData() {
    try {      
      const data = super.getData();
      data.hudData = await new CombatHud(this.object).init();
      this.hudData = data.hudData;
      this.roller = new ECHDiceRoller(this.hudData.actor);
      return data;
    } catch (err) {
      this._crashed = true;
      return {};
    }
  }

  checkReRender(item){
    try{
      if(item.parent.id == this.hudData.actor.id && this.hudData._itemCount != item.parent.items.size)this.render(true)
    }catch{}
  }

  close() {
    super.close();
    this.toggleMacroPlayers(true);
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  async _onDrop(event) {
    event.preventDefault();
    let set = event.target?.dataset?.set;
    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch (err) {
      //return false;
    }
    if (set) {
      const item = await fromUuid(data.uuid)
      await this.dragDropSet(set, item.id, event.target);
      this.initSets();
    } else {
      this.dragDropSetRemove(event.dataTransfer.getData("text"));
    }
  }

  setPosition() {
    if (!this.object) return;
    // Fix foundry (or us) calling this function twice
    if (this.hudData.fixFoundry) return;
    this.hudData.fixFoundry = true;

    this.rigHtml();
    const position = {
      "z-index": 100,
      left: game.settings.get("enhancedcombathud", "leftPos") + "px",
      bottom: game.settings.get("enhancedcombathud", "botPos") + "px",
    };
    this.element.css(position);
    this.toggleMinimize($("body").hasClass("minimize-ech-hud"));
    this.toggleMacroPlayers(false);
  }

  toggleMinimize(forceState) {
    $("body").toggleClass(
      "minimize-ech-hud",
      forceState ?? !$("body").hasClass("minimize-ech-hud")
    );
    $(".extended-combat-hud").toggleClass(
      "minimize-hud",
      $("body").hasClass("minimize-ech-hud")
    );
    let echHUDWidth = $(".extended-combat-hud").outerWidth();
    let windowWidth = $(window).width() - 340;
    let scale = true//game.settings.get("enhancedcombathud", "noAutoscale")
      ? game.settings.get("enhancedcombathud", "scale")
      : (1 / (echHUDWidth / windowWidth)) *
        game.settings.get("enhancedcombathud", "scale");

    const position = {
      bottom: $(".extended-combat-hud").hasClass("minimize-hud")
        ? `0px`
        : `${game.settings.get("enhancedcombathud", "botPos")}px`,
      transform: $(".extended-combat-hud").hasClass("minimize-hud")
        ? `scale(${scale > 1 ? 1 : scale}) translateY(100%)`
        : `scale(${scale > 1 ? 1 : scale})`,
      width: `calc(100vw * ${scale < 1 ? (1 + ((parseFloat(1 - scale) * 1))) : 1})`
    };
    $(".extended-combat-hud").css(position);
  }

  rigHtml() {
    this.loadCSSSettings();
    this.clearEmpty();
    this.setColorSettings();
    this.updatePass();
    this.updateMovement();
    this.updateDS();
    this.rigButtons();
    this.rigSkills();
    this.rigAccordion();
    this.initSets();
    this.rigAutoScale();

    setTimeout(() => {
      this.element.addClass("loaded");
    }, 500);
  }

  loadCSSSettings() {
    document.documentElement.style.setProperty(
      "--ech-fadeout-deleay",
      game.settings.get("enhancedcombathud", "fadeoutDelay") + "s"
    );
    document.documentElement.style.setProperty(
      "--ech-fadeout-opacity",
      game.settings.get("enhancedcombathud", "fadeoutOpacity")
    );
  }

  setColorSettings() {
    Object.flatten = function (data) {
      var result = {};
      function recurse(cur, prop) {
        if (Object(cur) !== cur) {
          result[prop] = cur;
        } else if (Array.isArray(cur)) {
          for (var i = 0, l = cur.length; i < l; i++)
            recurse(cur[i], prop + "[" + i + "]");
          if (l == 0) result[prop] = [];
        } else {
          var isEmpty = true;
          for (var p in cur) {
            isEmpty = false;
            recurse(cur[p], prop ? prop + "." + p : p);
          }
          if (isEmpty && prop) result[prop] = {};
        }
      }
      recurse(data, "");
      return result;
    };
    function setThemeColors(colors) {
      Object.entries(Object.flatten(colors)).forEach(([key, value]) => {
        document.documentElement.style.setProperty(
          `--ech-${key.replace(/\./g, "-")}`,
          value
        );
      });
    }

    let theme = game.settings.get("enhancedcombathud", "echThemeData");

    if (theme.theme == "custom") {
      setThemeColors(theme.colors);
    } else {
      fetch(`./modules/enhancedcombathud/scripts/themes/${theme.theme}.json`)
        .then((response) => response.json())
        .then((colors) => {
          setThemeColors(colors);
        });
    }
  }

  rigAutoScale() {
    let echHUDWidth = $(".extended-combat-hud").outerWidth();
    let windowWidth = $(window).width() - 340;
    let scale = true //game.settings.get("enhancedcombathud", "noAutoscale")
      ? game.settings.get("enhancedcombathud", "scale")
      : (1 / (echHUDWidth / windowWidth)) *
        game.settings.get("enhancedcombathud", "scale");

    $(".extended-combat-hud").css({
      transform: `scale(${scale > 1 ? 1 : scale})`,
    });
  }

  rigButtons() {
    let _this = this;
    this.element.unbind("click");
    this.element.unbind("mouseenter");
    this.element.on("click", ".death-save-btn", (event) => {
      this.object.actor?.rollDeathSave({})
    });
    this.element.on("click", '[data-type="trigger"]', async (event) => {
      let itemName = $(event.currentTarget).data("itemname");
      let actionDataSet = event.currentTarget.dataset.atype;
      let specialItem;
      //If you cannot find this item in the items list, it must be a special item
      if (!_this.hudData.findItemByName(itemName))
        specialItem = this.getSpecialItem(itemName);
      const useCE = specialItem && game.modules.get("dfreds-convenient-effects")?.active && game.dfreds.effectInterface.findEffectByName(itemName);
      let confimed;
      if (useCE) {
        confimed = true;
        await game.dfreds.effectInterface.toggleEffect(itemName, { overlay: false, uuids : [this.object.actor.uuid] });
      } else {
        if(specialItem || _this.hudData.findItemByName(itemName)){
          confimed = specialItem ? await specialItem.use() : await this.roller.rollItem(itemName, event); //second rollitem
        }
        else{
          CombatHud.getMagicItemSpellBySpellName(_this.object.actor, itemName).then((i) => {
            confimed = this.roller.rollMagicItem(itemName);
          });
        }
      }
      let item = specialItem || _this.hudData.findItemByName(itemName);
      if(!item){
        CombatHud.getMagicItemSpellBySpellName(_this.object.actor, itemName).then((i) => {
          item = i;
        });
      }
      if (confimed && game.combat?.started) {
         if (actionDataSet) {
           this.updateActionEconomy(actionDataSet);
         } else {
           this.updateActionEconomy(
             item.system.activation?.type ?? item.activation.type
           );
         }
       }
       if (!item && !CombatHud.getMagicItemSpellBySpellName(_this.object.actor ,itemName))
       { 
         $(event.currentTarget).remove();
       } else {
         try {
           if (item.system.consume?.type) {
             switch (item.system.consume.type) {
               case "ammo":
                 let ammoItem = this.hudData.actor.items.find(
                       (i) => i.id == item.system.consume?.target
                     );
                 let ammoCount = confimed
                   ? ammoItem.system?.quantity -
                     item.system.consume?.amount
                   : ammoItem?.system?.quantity;
                   $(".extended-combat-hud").find(`[data-set] .action-element-title:contains(${itemName})`).closest('div').each((index, element) => element.dataset.itemCount = ammoCount)
                   event.currentTarget.dataset.itemCount = ammoCount;
                 break;
               case "attribute":
                 let value = Object.byString(
                   this.hudData.actor.system,
                   item.system.consume.target
                 );
                 let resCount = value;
                 event.currentTarget.dataset.itemCount = resCount;
             }
           } else {
             let uses = item.system.quantity || item.system.uses.value;
             event.currentTarget.dataset.itemCount = uses;
            }
          } catch (e) {
            console.log(e);
          }
        }
        this.updateSpellSlots();
    });
    this.element.on("mouseenter", '[data-type="trigger"]', (event) => {
      let $element = $(event.currentTarget);
      let itemName = $(event.currentTarget).data("itemname");
      const offset = $element.offset();
      offset.left += $element[0].getBoundingClientRect().width / 2;

      $(".ech-tooltip").remove();

      setTimeout(() => {
        this.drawTooltip(itemName, offset);
      }, 100);

      this.showRangeFinder(itemName);
    });
    this.element.on("mouseleave", '[data-type="trigger"]', (event) => {
      // Allow User to hover over Tooltip
      if (game.Levels3DPreview) {
        this.clearRanges();
        game.Levels3DPreview.rangeFinders.forEach(rf => {rf.destroy();})
      }
      setTimeout(() => {
        //$(".ech-tooltip:not(.is-hover)").remove();
        $(".ech-tooltip").remove();
      }, 100);
    });
    this.element.on(
      "mouseenter",
      ".ability-menu .ability:not(.ability-title)",
      (event) => {
        let $element = $(event.currentTarget);
        let whatToRoll = $(event.currentTarget).data("roll");
        let type = "";
        if ($element.hasClass("is-save")) type = "save";
        if ($element.hasClass("is-skill")) type = "skill";
        if ($element.hasClass("is-tool")) type = "tool";
        const offset = $element.offset();
        offset.left += $element[0].getBoundingClientRect().width + 10;

        $(".ech-tooltip").remove();

        setTimeout(() => {
          this.drawTooltip(whatToRoll, offset, type);
        }, 100);
      }
    );
    this.element.on("mouseleave", ".ability", (event) => {
      // Allow User to hover over Tooltip
      setTimeout(() => {
        $(".ech-tooltip:not(.is-hover)").remove();
      }, 100);
    });

    $("body").on("mouseenter", ".ech-tooltip", (event) => {
      $(event.currentTarget).addClass("is-hover");
    });
    $("body").on("mouseleave", ".ech-tooltip.is-hover", (event) => {
      $(event.currentTarget).remove();
    });
    this.element.on("click", '[data-pass="true"]', async (event) => {
      if (game.combat?.current?.tokenId == this.hudData.token.id)
        game.combat?.nextTurn();
    });
    this.element.on("click", '[data-type="menu"]', (event) => {
      let category = event.currentTarget.dataset.menu;
      let actionType = event.currentTarget.dataset.actiontype;
      let isActive = $(event.currentTarget).hasClass("active");
      // data-containeractiontype="actions"
      //data-actiontype="bonus"
      // Hide Open Menus
      $(_this.element).find(`div[data-iscontainer="true"]`).removeClass("show");
      // Remove Active State from Menu Toggle
      $(_this.element).find('div[data-type="menu"]').removeClass("active");
      // Add Active State to Clicked Menu
      $(event.currentTarget).toggleClass("active", !isActive);
      // Show Active Menu
      $(_this.element)
        .find(
          `div[class="features-container ${category}"][data-containeractiontype="${actionType}"]`
        )
        .toggleClass(
          "show",
          $(event.currentTarget).hasClass("active") && !isActive
        );
    });
    this.element.on("click", '[data-type="switchWeapons"]', async (event) => {
      let $element = $(event.currentTarget);
      if (!$element.hasClass("active")) {
        $(this.element)
          .find('[data-type="switchWeapons"].active')
          .removeClass("active");
        $element.addClass("active");
        this.switchSets($element[0].dataset.value);
      }
    });
    this.element.on("dragstart", ".set", async (event) => {
      event.originalEvent.dataTransfer.setData(
        "text",
        event.currentTarget.dataset.set
      );
      $(".extended-combat-hud").addClass("ech-remove-set");
    });
    this.element.on("dragend", ".set", async (event) => {
      event.originalEvent.dataTransfer.setData(
        "text",
        event.currentTarget.dataset.set
      );
      $(".extended-combat-hud").removeClass("ech-remove-set");
    });
  }

  rigSkills() {
    $(this.element).on("click", "li.is-save > div > span", (event) => {
      let $element = $(event.currentTarget);
      let $ability = $element.closest(".ability");
      let whatToRoll = $ability.data("roll");

      if ($element.data("type") == "save") {
        this.roller.rollSave(whatToRoll, event);
      } else if ($element.data("type") == "check") {
        this.roller.rollCheck(whatToRoll, event);
      }
    });

    $(this.element).on("click", "li .ability-name", (event) => {
      let whatToRoll = $(event.currentTarget).closest(".ability").data("roll");
      let abilityScoreToUse = $(event.currentTarget)
        .closest(".ability")
        .data("modifier");
      let $ability = $(event.currentTarget).closest(".ability");

      if ($ability.hasClass("is-save")) {
        this.roller.rollSave(whatToRoll, event);
      } else if ($ability.hasClass("is-skill")) {
        this.roller.rollSkill(whatToRoll, abilityScoreToUse, event);
      } else if ($ability.hasClass("is-tool")) {
        let tool = this.hudData.tools.filter(
          (tool) => tool.label == whatToRoll
        )[0];
        this.roller.rollTool(tool.label, abilityScoreToUse, event);
      } else {
        return false;
      }

      //this.roller.rollSkill(skill, abil);
    });
  }

  rigAccordion() {
    this.element.find(".features-container").each((index, featureContainer) => {
      // 375 = Portrait | 320 = Sidebar
      let spellHudWidth = 375 + 320;
      $(featureContainer)
        .find(".features-accordion")
        .each((index, element) => {
          let $element = $(element);
          let numberOfFeatures = $element.find(".feature-element").length;

          spellHudWidth +=
            numberOfFeatures > 3 ? 450 + 53 : numberOfFeatures * 150 + 53;

          $element.css({
            width: `${
              numberOfFeatures > 3 ? 450 + 53 : numberOfFeatures * 150 + 53
            }px`,
          });
          $element.find(".features-accordion-content").css({
            "min-width": `${
              numberOfFeatures > 3 ? 450 : numberOfFeatures * 150
            }px`,
          });
        });

      // If container is smaller than window size, then open containers.
      $(featureContainer)
        .find(".features-accordion")
        .toggleClass("show", spellHudWidth < $(window).width());
    });

    // If container is larger than window, allow accordion usage
    //if (spellHudWidth > $(window).width()) {
    this.element.on("click", ".feature-accordion-title", (event) => {
      let $element = $(event.currentTarget);
      let $accordion = $element.closest(".features-accordion");
      let $container = $element.closest(".features-container");

      if ($container.width() + 503 > $(window).width()) {
        $container.find(".features-accordion").removeClass("show");
      }

      $accordion.toggleClass("show");
    });
    //}
  }

  clearEmpty() {
    let menuButtons = $(this.element).find('[data-type="menu"]');
    for (let button of menuButtons) {
      let category = button.dataset.actiontype;
      let itemType = button.dataset.itemtype;
      let objectToCheck = this.hudData[category][itemType];
      if (
        objectToCheck == [] ||
        objectToCheck == {} ||
        !objectToCheck ||
        objectToCheck.length == 0 ||
        Object.keys(objectToCheck).length === 0
      ) {
        $(button).remove();
      }
    }
    let categroyContainers = $(this.element).find("[data-actionbartype]");
    for (let container of categroyContainers) {
      let actiontype = container.dataset.actionbartype;
      if (actiontype == "actions") continue;
      let remove = true;
      if (actiontype == "bonus" && this.hudData.sets.active.secondary)
        remove = false;
      if (actiontype == "reactions" && this.hudData.sets.active.primary)
        remove = false;

      for (let [key, value] of Object.entries(this.hudData[actiontype])) {
        if (
          !(
            value == [] ||
            value == {} ||
            !value ||
            value.length == 0 ||
            Object.keys(value).length === 0
          )
        ) {
          remove = false;
        }
      }
      if (remove) $(container).hide();
      else $(container).show();
    }
  }

  async switchSets(set) {
    await this.hudData.switchSets(set);
    let primary = $(this.element).find('div[data-set="setp"]');
    let secondary = $(this.element).find('div[data-set="sets"]');
    this.updateSetElement(primary, this.hudData.sets.active.primary);
    this.updateSetElement(
      secondary,
      this.hudData.sets.active.secondary?.system.activation.type
        ? this.hudData.sets.active.secondary
        : undefined
    );
    this.clearEmpty();
  }
  updateSetElement(element, item) {
    if (!item) {
      element.css({ display: "none" });
      return;
    }
    let isAmmo = item.system.consume?.type == "ammo";
    let ammoItem = isAmmo
      ? this.hudData.actor.items.find(
          (i) => i.id == item.system.consume?.target
        )
      : null;
    element.toggleClass("has-count", isAmmo);
    if (element[0])
      element[0].dataset.itemCount = ammoItem?.system.quantity;
    if (element[1])
      element[1].dataset.itemCount = ammoItem?.system.quantity;
    element
      .data("itemname", item.name)
      .prop("data-itemname", item.name)
      .css({ "background-image": `url(${item.img})`, display: "flex" })
      .find(".action-element-title")
      .text(item.name);
  }
  initSets() {
    let set =
      this.hudData.actor.flags.enhancedcombathud?.activeSet || "set1";
    this.switchSets(set);
    $(this.element)
      .find('div[data-type="switchWeapons"]')
      .removeClass("active");
    $(this.element).find(`div[data-value="${set}"]`).addClass("active");
  }

  resetActionsUses() {
    if(!this.hudData) return;
    this.hudData.hasAction = true;
    this.hudData.hasBonus = true;
    this.hudData.hasReaction = true;
  }

  newRound() {
    if(!this.hudData) return;
    this.resetActionsUses();
    this.hudData.other.movement.current = this.hudData.other.movement.max;
    this.hudData.other.movement.moved = 0;
    this.updateMovement(0, true);
  }

  updateActionEconomy(actionType) {
    switch (actionType) {
      case "action":
        this.hudData.hasAction = false;
        break;
      case "bonus":
        this.hudData.hasBonus = false;
        break;
      case "reaction":
        this.hudData.hasReaction = false;
        break;
    }
  }

  updateMovement(bars = 0, reset = false) {
    bars = game.combat?.started && !reset ? bars : 0;
    let movementColor;
    switch (bars) {
      case 0:
        movementColor = "base-movement";
        break;
      case 1:
        movementColor = "dash-movement";
        break;
      case 2:
        movementColor = "danger-movement";
        break;
    }
    let disabledBars =
      game.combat?.started && !reset ? this.hudData.other.movement.current : 0;
    let barsNumber =
      game.combat?.started && !reset
        ? this.hudData.other.movement.max - disabledBars
        : this.hudData.other.movement.max;
    let $element = $(this.element).find(".movement-spaces");
    let newHtml = "";
    for (let i = 0; i < barsNumber; i++) {
      newHtml += `<div class="movement-space  ${movementColor}"></div>`;
    }
    for (let i = 0; i < disabledBars; i++) {
      newHtml += `<div class="movement-space"></div>`;
    }
    $(this.element).find(".movement-current").text(barsNumber);
    $(this.element)
      .find(".movement-max")
      .text((bars + 1) * this.hudData.other.movement.max);
    $element.html(newHtml);
  }

  updatePortrait(hp, ac) {
    let hpelel = $(this.element).find("span[data-hp-value]");
    let maxhpel = $(this.element).find("span[data-hp-max]");
    let acelel = $(this.element).find("span[data-ac-value]");
    hpelel[0].dataset.hpValue = hp.value + hp.temp;
    maxhpel[0].dataset.hpMax = hp.max + hp.tempmax;
    acelel[0].dataset.acValue = ac;
    hpelel.css({ color: hp.temp ? "#6698f3" : "rgb(0 255 170)" });
    maxhpel.css({
      color: hp.tempmax
        ? hp.tempmax > 0
          ? "rgb(222 91 255)"
          : "#ffb000"
        : "rgb(255, 255, 255)",
    });
    this.updateDS();
  }

  updateDS(){
    const actor = this.object.actor;
    const $element = $(this.element).find(".death-saves");
    if(!actor || !actor.system.attributes.death) {
      $element.hide();
      return;
    }
    const isDead = actor.system.attributes.hp.value <= 0;
    const failed = actor.system.attributes.death.failure;
    const success = actor.system.attributes.death.success;
    if(!isDead) {
      $element.hide();
      return;
    }
    $element.show();
    $element.find(".death-save-success").find("span").text(success);
    $element.find(".death-save-fail").find("span").text(failed);
  }

  getSpecialItem(itemName) {
    if (!ECHItems[itemName]) return false;
    return new CONFIG.Item.documentClass(ECHItems[itemName], {
      parent: this.hudData.actor,
    });
  }

  updatePass() {
    let element = $(this.element).find("div[data-passcont]");
    if (this.hudData?.token?.id == game.combat?.current?.tokenId) {
      element.css({ display: "flex" });
    } else {
      element.css({ display: "none" });
    }
  }

  toggleMacroPlayers(togg) {
    if(!game.settings.get("enhancedcombathud", "hideMacroPlayers")) return;
    if (togg || !game.settings.get("enhancedcombathud", "hideMacroPlayers")) {
      $("#players")[0].style.visibility = "visible";
      $("#hotbar").show(500);
    } else {
      $("#players")[0].style.visibility = "hidden";
      $("#hotbar").hide(500);
    }
  }

  static generateSpells(obj) {
    obj = obj
      .replace("０", "0")
      .replace("１", "1")
      .replace("２", "2")
      .replace("３", "3")
      .replace("４", "4")
      .replace("５", "5")
      .replace("６", "6")
      .replace("７", "7")
      .replace("８", "8")
      .replace("９", "9");
    let _this = canvas.hud.enhancedcombathud.hudData;
    let convertSpellSlot;
    if (obj == _this.settings.localize.spells.pact) {
      convertSpellSlot = "pact";
    } else if (obj.match(/\d+/)) {
      convertSpellSlot = "spell" + obj.match(/\d+/)[0];
    }
    let spellSlots = "";
    if (
      obj == _this.settings.localize.spells["0"] ||
      obj == _this.settings.localize.spells.will ||
      obj == _this.settings.localize.spells.innate
    ) {
      spellSlots =
        '<span class="spell-slot spell-cantrip"><i class="fas fa-infinity"></i></span>';
    } 
    else if(obj === _this.settings.localize.spells.item){
      spellSlots =
        '<span class="spell-slot spell-cantrip"><i class="fas fa-infinity"></i></span>';
    }
    else {
      let spellSlotDetails = _this.spellSlots[convertSpellSlot];
      for (let index = 0; index < spellSlotDetails.max; index++) {
        spellSlots += `<span class="spell-slot spell-${
          index < spellSlotDetails.max - spellSlotDetails.value
            ? "used"
            : "available"
        }"></span>`;
      }
    }
    return spellSlots;
  }

  updateSpellSlots() {
    $(this.element)
      .find(".feature-spell-slots")
      .each((index, element) => {
        let spellSlot = element.dataset.type;
        element.innerHTML = CombatHudCanvasElement.generateSpells(spellSlot);
      });
  }

  async drawTooltip(itemName, offset, type) {
    const showTooltip = game.settings.get("enhancedcombathud", "showTooltips");
    const showTooltipSpecial = game.settings.get(
      "enhancedcombathud",
      "showTooltipsSpecial"
    );
    if (
      !showTooltip ||
      (type == "save" &&
        !game.settings.get(
          "enhancedcombathud",
          "showTooltipsAbilityMenuAbilities"
        )) ||
      (type == "skill" &&
        !game.settings.get(
          "enhancedcombathud",
          "showTooltipsAbilityMenuSkills"
        )) ||
      (type == "tool" &&
        !game.settings.get("enhancedcombathud", "showTooltipsAbilityMenuTools"))
    )
      return;
    if (!showTooltipSpecial && ECHItems[itemName]) return;
    let item = this.hudData.actor.items.find((i) => i.name == itemName) ?? await CombatHud.getMagicItemSpellBySpellName(this.hudData.actor, itemName);
    let title;
    let description;
    let itemType;
    let subtitle;
    let target;
    let range;
    let properties = [];
    let dt;
    let damageTypes = [];
    let materialComponents = "";
    if (type == "skill") {
      title = CONFIG.DND5E.skills[itemName];
      description = this.hudData.skills[itemName].tooltip;
    } else if (type == "save") {
      title = CONFIG.DND5E.abilities[itemName];
      description = this.hudData.saves[itemName].tooltip;
    } else {
      if (!item) {
        item = ECHItems[itemName];
      }
      if (!item || !item.system) return;
      title = item.name;
      description = item.system.description.value;
      itemType = item.type;
      subtitle;
      target = item.labels?.target || "-";
      range = item.labels?.range || "-";
      properties = [];
      dt = item.labels?.damageTypes?.split(", ");
      damageTypes = dt && dt.length ? dt : [];
      materialComponents = "";
      switch (itemType) {
        case "weapon":
          subtitle = CONFIG.DND5E.weaponTypes[item.system.weaponType];
          properties.push(
            CONFIG.DND5E.itemActionTypes[item.system.actionType]
          );
          for (let [key, value] of Object.entries(item.system.properties)) {
            let prop =
              value && CONFIG.DND5E.weaponProperties[key]
                ? CONFIG.DND5E.weaponProperties[key]
                : undefined;
            if (prop) properties.push(prop);
          }

          break;
        case "spell":
          subtitle = `${item.labels.level} ${item.labels.school}`;
          properties.push(
            CONFIG.DND5E.spellSchools[item.system.school]
          );
          properties.push(item.labels.duration);
          properties.push(item.labels.save);
          //if(item.labels.components.tags.includes("Concentration")) properties.push(game.i18n.localize("DND5E.Concentration"));
          for (let comp of item.labels.components.all) {
            properties.push(comp.abbr);
          }
          if (item.labels.materials) materialComponents = item.labels.materials;
          break;
        case "consumable":
          subtitle =
            CONFIG.DND5E.consumableTypes[item.system.consumableType] +
            //" " + item.system.chatFlavor;
            properties.push(
              CONFIG.DND5E.itemActionTypes[item.system.actionType]
            );
          break;
        case "feat":
          subtitle = item.system.requirements;
          properties.push(
            CONFIG.DND5E.itemActionTypes[item.system.actionType]
          );
          break;
      }
    }
    description = await TextEditor.enrichHTML(description, {async: true});

    const tooltip = ({
      title,
      subtitle,
      description,
      target,
      range,
      properties,
      materialComponents,
    }) => {
      target = target || "-";
      range = range || "-";
      return `<div class="ech-tooltip 
        ${!subtitle ? "hide-subtitle" : ""} 
        ${target == "-" && range == "-" ? "hideTargetRange" : ""}
        ${properties.length == 0 ? "hideProperties" : ""}
        " style="transform: scale(${this.hudData.settings.tooltipScale});">
          <div class="ech-tooltip-header">
            <h2>${title}</h2>
          </div>
          <div class="ech-tooltip-body">
            <h4 class="ech-tooltip-subtitle">${subtitle}</h4>
            <div class="ech-tooltip-description">${description}</div>
            <div class="ech-tooltip-details">
              <div>
                <span>${game.i18n.localize(
                  "enhancedcombathud.tooltip.target.name"
                )}</span>
                <span>${target}</span>
              </div>
              <div>
                <span>${game.i18n.localize(
                  "enhancedcombathud.tooltip.range.name"
                )}</span>
                <span>${range}</span></div>
              </div>
            <div class="ech-tooltip-properties">
              <h3>${game.i18n.localize(
                "enhancedcombathud.tooltip.properties.name"
              )}</h3>
              ${properties.join("\n")}
            </div>
            <i style="font-size: 0.8rem;">${
              materialComponents.length > 0 ? "*-" + materialComponents : ""
            }</i>
          </div>
        </div>`;
    };

    let listOfProperties = [];
    for (let damt of damageTypes) {
      if (damt)
        listOfProperties.push(
          `<span class="ech-tooltip-badge damt">${damt}</span>`
        );
    }
    for (let prop of properties) {
      if (prop)
        listOfProperties.push(
          `<span class="ech-tooltip-badge prop">${prop}</span>`
        );
    }
    $(".ech-tooltip").remove();
    $(".extended-combat-hud").before(
      tooltip({
        title: title.label ?? title,
        subtitle: subtitle,
        description: description,
        target: target,
        range: range,
        properties: listOfProperties,
        materialComponents: materialComponents,
      })
    );
    $(".extended-combat-hud").off("wheel");
    $(".extended-combat-hud").on("wheel", function (event) {
      let $tooltipDesc = $(".ech-tooltip")
        .last()
        .find(".ech-tooltip-description");
      if (!$tooltipDesc[0]) return;
      let scrollPosition = $tooltipDesc[0].scrollTop;
      $tooltipDesc[0].scrollTop = scrollPosition + event.originalEvent.deltaY;
    });
    if (type == "save" || type == "skill" || type == "tool") {
      $(".ech-tooltip").last().addClass("ability-tooltip");
      offset.top = offset.top - $(".ech-tooltip").last().height() / 2;
    } else {
      offset.top = offset.top - $(".ech-tooltip").last().height() - 10;
      offset.left = offset.left - $(".ech-tooltip").last().width() / 2;
      if (offset.left + $(".ech-tooltip").last().width() > $(window).width()) {
        offset.left -=
          offset.left + $(".ech-tooltip").last().width() - $(window).width();
      }
    }

    $(".ech-tooltip")
      .last()
      .css({
        top: `${offset.top}px`,
        left: `${offset.left}px`,
      })
      .addClass("ech-show-tooltip");
  }

  clearRanges(force = false) {
    if(this.isTargetPicker && !force) return;
    if (this.normalRange) {
      this.normalRange.remove();
      this.normalRange = null;
    }
    if (this.longRange) {
      this.longRange.remove();
      this.longRange = null;
    }
  }

  static getRangeForItem(item) {
    if (item instanceof Promise) 
      item.then(i => this.getRangeForItem(i));
    else{
      const touchRange = item.system.range.units == "touch" ? canvas?.scene?.grid?.distance : null;
      return {
          range: Math.max(item.system?.range?.value ?? touchRange, item.system?.range?.long ?? 0) ?? Infinity,
          normal: item.system?.range?.value ?? touchRange,
          long: item.system?.range?.long ?? null,
      };
    }

  }

  showRangeRings(normal, long) {
    if(!game.Levels3DPreview?._active) return;
    this.clearRanges();
    if (normal) this.normalRange = new game.Levels3DPreview.CONFIG.entityClass.RangeRingEffect(this.object, normal);
    if (long) this.longRange = new game.Levels3DPreview.CONFIG.entityClass.RangeRingEffect(this.object, long, "#ff0000");
  }

  async showRangeFinder(itemName){
    if(!game.Levels3DPreview?._active || !itemName) return;
    const sett = game.settings.get("enhancedcombathud", "rangefinder")
    const showRangeFinder = sett != "none";
    const item = this.hudData.actor.items.find((i) => i.name == itemName) ?? await CombatHud.getMagicItemSpellBySpellName(this.hudData.actor, itemName);
    if (!item) return;
    const { range, normal, long } = CombatHudCanvasElement.getRangeForItem(item);
    if (!canvas.hud.enhancedcombathud.isTargetPicker) this.showRangeRings(normal, long);
    if(!showRangeFinder) return;
    const isMidi = game.modules.get("midi-qol")?.active
    const showPercentage = sett == "full";
    const RangeFinder = game.Levels3DPreview.CONFIG.entityClass.RangeFinder; 
    game.Levels3DPreview.rangeFinders.forEach(rf => {
          rf.destroy();
    })
    const visTokens = canvas.tokens.placeables.filter(t => t.visible)
    for(let t of visTokens){
      const dist = game.Levels3DPreview.helpers.ruler3d.measureMinTokenDistance(game.Levels3DPreview.tokens[this.object.id],game.Levels3DPreview.tokens[t.id])
      const distDiff = range - dist;
      if(distDiff >= 0){
        const rollData = await this.rangeFinederGetPercent(item,t, isMidi);
        const percent = rollData.chance;
        let text = showPercentage && percent ? `${parseFloat(Math.clamped(percent, 0,100).toFixed(2))}%` : "";
        if(rollData.adv || rollData.dis){
          //text+= `(${rollData.adv ? "ADV" : ""}${rollData.dis ? "DIS" : ""})`
        }
        new RangeFinder(t, {sources: [this.object], text: text})
      }else{
        new RangeFinder(t, {
          sources: [this.object],
          text: `-${Math.abs(distDiff.toFixed(2))}${canvas.scene.grid.units}`,
          style: {
            color: 'rgb(210 119 119);',
          }
        })
      }
    }
    
  }

  async rangeFinederGetPercent(item, token, isMidi){
    if(!item || !token.actor) return false;
    const actor = token.actor
    const itemData = {
      toHit: item.abilityMod ? item.system.prof.flat + item.parent.system.abilities[item.abilityMod].mod : null,
      saveDC: item.parent.system.attributes.spelldc,
    };
    const targetData = {
        ac : actor.system.attributes.ac.value,
        save: item.system.save.ability ? actor.system.abilities[item.system.save.ability].save : null
    }
    if(item.hasAttack){
      let midiBonus = null;
      let wf = null;
      if(isMidi){
        wf = new MidiQOL.DummyWorkflow(item.parent, item, ChatMessage.getSpeaker(this.object), [], {});
        await wf.simulateAttack(token);
        midiBonus = wf.expectedAttackRoll - 10.5 + (wf.advantage ? 1 : wf.disadvantage ? -1 : 0)*3.325;
      }
      const chanceToHit = (21-targetData.ac+(midiBonus ?? itemData.toHit))/20
      return {
        chance: Math.clamped(chanceToHit*100, 5, 95),
        adv: wf?.advantage,
        dis: wf?.disadvantage
      }
    }else if(item.hasSave){
      const chanceToSave = 1-(21-itemData.saveDC+targetData.save)/20
      return {
        chance: chanceToSave * 100,
      }
    }
    return {};
  }

  async dragDropSet(set, itemid, target) {
    let item = this.hudData.actor.items.find((i) => i.id == itemid);
    if (!item) return;
    let ps = set.substring(4, set.length) == "p" ? "primary" : "secondary";
    let oldSetItem = this.hudData.sets[set.substring(0, set.length - 1)][ps];
    if (oldSetItem) await oldSetItem.setFlag("enhancedcombathud", set, false);
    await item.setFlag("enhancedcombathud", set, true);
    $(target).css({
      "background-image": `url(${
        this.hudData.sets[set.substring(0, set.length - 1)][ps].img
      }`,
    });
    this.initSets();
  }

  async dragDropSetRemove(set, target) {
    let ps = set.substring(4, set.length) == "p" ? "primary" : "secondary";
    let oldSetItem = this.hudData.sets[set.substring(0, set.length - 1)][ps];
    if (oldSetItem) {
      await oldSetItem.setFlag("enhancedcombathud", set, false);
      $(this.element)
        .find(`[data-set="${set}"]`)
        .css({ "background-image": `` });
    }
    this.initSets();
  }
}

class ECHDiceRoller {
  constructor(actor) {
    this.actor = actor;
    this.modules = {
        betterRolls: game.modules.get("betterrolls5e")?.active,
        MidiQOL: game.modules.get("midi-qol")?.active,
    };
  }
  async rollItem(itemName, event) {
    let finalItemToRoll = null;
    if (!this.modules.MidiQOL) {
        //return await BetterRolls.quickRollByName(this.actor.data.name, itemName);
        const actorId = this.actor.id;
        const actorToRoll = canvas.tokens.placeables.find((t) => t.actor?.id === actorId)?.actor ?? game.actors.get(actorId);
        const itemToRoll = actorToRoll?.items.find((i) => i.name === itemName) ?? CombatHud.getMagicItemSpellBySpellName(actorToRoll, itemName);
        if (game.modules.get("itemacro")?.active && itemToRoll.hasMacro()) {
            itemToRoll.executeMacro();
        }

        if (!itemToRoll) {
            return ui.notifications.warn(
                game.i18n.format("DND5E.ActionWarningNoItem", {
                    item: itemId,
                    name: actorToRoll?.name ?? "[Not Found]",
                }),
            );
        }
        finalItemToRoll = itemToRoll;
    }
    if (!finalItemToRoll) { 
      finalItemToRoll = this.actor.items.getName(itemName);
    }
    const useTargetPicker = game.settings.get("enhancedcombathud", "rangepicker")
    if (useTargetPicker) {  
      const release = game.settings.get("enhancedcombathud", "rangepickerclear");
      if(release) (canvas.tokens.placeables[0] ?? _token)?.setTarget(false);
      const targetPicker = new ECHTargetPicker(finalItemToRoll, this.object);
      canvas.hud.enhancedcombathud.isTargetPicker = true;
      const res = await targetPicker.promise;
      canvas.hud.enhancedcombathud.isTargetPicker = false;
      if(!res) return;
    }
    if(finalItemToRoll instanceof Promise){
      console.log(finalItemToRoll);
      return finalItemToRoll.then(item => item.use());
    }
    // else {
      // return finalItemToRoll.use(); //ERE
    // }
  }

  async rollMagicItem(itemName){
    const parent = this.getMagicItemParent(itemName)
    await MagicItems.actor(this.actor._id).rollByName(parent, itemName);
  }

  getMagicItemParent(itemName){
    const actor = this.actor;
    for(let i of MagicItems.actor(actor.id).items.filter(item => item.visible && item.active)){
      let mItem = i.spells.find(spell => spell.name == itemName);
      if(mItem) return i.name;
    }
    return null;
  }

  async rollTool(itemName, abil, event) {
    this.actor.items.find((i) => i.name == itemName).rollToolCheck();
    Hooks.once("renderDialog", (dialog, html) => {
      html.find('select[name="ability"]')[0].value = abil;
    });
    this.hijackDialog(event);
  }

  async rollSave(ability, event) {
    if (this.modules.betterRolls) BetterRolls.rollSave(this.actor, ability);
    else {
      this.actor.rollAbilitySave(ability, { event: event });
      // Set Dialog Position
      this.hijackDialog(event);
    }
  }
  async rollSkill(skill, ab, event) {
    if (this.modules.betterRolls) {
      BetterRolls.rollSkill(this.actor, skill);
      return;
    }
    let roll = this.actor.rollSkill(skill, { event: event });

    // Set Dialog Position
    this.hijackDialog(event);
    return roll;
  }
  hijackDialog(event) {
    let $element = $(event.currentTarget).closest(".ability");
    const offset = $element.offset();

    // Close Previous Highjacked Windows
    $(".ech-highjack-window .close").trigger("click");

    // Position Windows next to Saves/Skills/Tools Menu
    Hooks.once("renderDialog", (dialog, html) => {
      offset.top += -$(document).scrollTop() - dialog.position.height / 2;
      offset.left +=
        $element[0].getBoundingClientRect().width +
        10 -
        $(document).scrollLeft();

      html
        .css({
          top: offset.top > 0 ? offset.top : 0,
          left: offset.left,
        })
        .addClass("ech-highjack-window");

      // Update dialog with new position data for dragging.
      dialog.position.left = offset.left;
      dialog.position.top = offset.top > 0 ? offset.top : 0;

      // If Dialog allows you to select Modifier, use modifier from ability modifier by default
      if (!html.find('select[name="ability"]'))
        html.find('select[name="ability"]').val($element.data("modifier"));
    });
  }

  async rollCheck(ability, event) {
    // Set Dialog Position
    this.hijackDialog(event);
    if (this.modules.betterRolls)
      return await BetterRolls.rollCheck(this.actor, ability);
    return await this.actor.rollAbilityTest(ability, { event: event });
  }

  static dnd5eRollSkill(skillId, options = {}) {
    const skl = this.system.skills[skillId];
    const bonuses = getProperty(this.system, "bonuses.abilities") || {};

    // Compose roll parts and data
    const parts = ["@mod"];
    const data = { mod: skl.mod + skl.prof };

    // Ability test bonus
    if (bonuses.check) {
      data["checkBonus"] = bonuses.check;
      parts.push("@checkBonus");
    }

    // Skill check bonus
    if (bonuses.skill) {
      data["skillBonus"] = bonuses.skill;
      parts.push("@skillBonus");
    }

    // Add provided extra roll parts now because they will get clobbered by mergeObject below
    if (options.parts?.length > 0) {
      parts.push(...options.parts);
    }

    // Reliable Talent applies to any skill check we have full or better proficiency in
    const reliableTalent =
      skl.value >= 1 && this.getFlag("dnd5e", "reliableTalent");

    // Roll and return
    const rollData = foundry.utils.mergeObject(
      {
        parts: parts,
        data: data,
        title: game.i18n.format("DND5E.SkillPromptTitle", {
          skill: CONFIG.DND5E.skills[skillId],
        }),
        halflingLucky: this.getFlag("dnd5e", "halflingLucky"),
        reliableTalent: reliableTalent,
        messageData: {
          speaker: options.speaker || ChatMessage.getSpeaker({ actor: this }),
          "flags.dnd5e.roll": { type: "skill", skillId },
        },
      },
      options
    );
    return game.dnd5e.dice.d20Roll(rollData);
  }
}

class ECHTargetPicker{
  constructor (item, token) {
    this.ranges = CombatHudCanvasElement.getRangeForItem(item);
    this.item = item;
    this.token = token;
    this.resolve = null;
    this.reject = null;
    this._targetCount = game.user.targets.size;
    this._maxTargets = ECHTargetPicker.getTargetCount(item);
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
    this.targetHook = Hooks.on("targetToken", (user, token, targeted) => { 
      this.checkComplete();
    });

    this.movelistener = (event) => {
        this.update(event);
    };
    this.clicklistener = (event) => { 
      if(event.which === 3) {
        this.end(false);
      }
    };
    this.keyuplistener = (event) => { 
      //check for + and - keys
      if (event.key === "+" || event.key === "=") {
        this.maxTargets++;
      }
      if (event.key === "-" || event.key === "_") {
        if (this.maxTargets > 1) this.maxTargets--;
      }
    };
    document.addEventListener("mousemove", this.movelistener);
    document.addEventListener("mouseup", this.clicklistener);
    document.addEventListener("keyup", this.keyuplistener);
    this.init();
  }

  checkComplete() { 
      this.targetCount = game.user.targets.size;
      if (this.targetCount >= this.maxTargets) {
          this.end(true);
      }
  }

  static getTargetCount(item) {
    if(item instanceof Promise) {
      item.then((i) => {
        const validTargets = ["creature", "ally", "enemy"];
        const actionType = i.system.actionType;
        const targetType = i.system.target.type;
        if (validTargets.includes(targetType)) {
            return i.system.target.value;
        } else {
            if (actionType === "mwak" || actionType === "rwak") {
                return 1;
            }
        }
        return null;
      });
    }
    else {  
      const validTargets = ["creature", "ally", "enemy"];
      const actionType = item.system.actionType;
      const targetType = item.system.target.type;
      if (validTargets.includes(targetType)) {
          return item.system.target.value;
      } else {
          if (actionType === "mwak" || actionType === "rwak") {
              return 1;
          }
      }
      return null;
    }
  }

  set targetCount(count) { 
    this._targetCount = count;
    this.update();
  }

  get targetCount() {
    return this._targetCount;
  }

  set maxTargets(count) {
    this._maxTargets = count;
    this.update();
    this.checkComplete();
  }

  get maxTargets() {
    return this._maxTargets;
  }

  init() { 
    const element = document.createElement("div");
    element.classList.add("ech-target-picker");
    document.body.appendChild(element);
    this.element = element;
    if (!this.maxTargets || this.targetCount == this.maxTargets) return this.end(true);
    canvas.hud.enhancedcombathud.showRangeRings(this.ranges.normal, this.ranges.long);
  }

  update(event) {
    if (event) {
      const clientX = event.clientX;
      const clientY = event.clientY;
      this.element.style.left = clientX + 20 + "px";
      this.element.style.top = clientY + "px";
    }
    this.element.innerText = `${this.targetCount}/${this.maxTargets} Targets`;
  }

  end(res) {
    this.resolve(res);
    canvas.hud.enhancedcombathud.clearRanges(true);
    this.element.remove();
    Hooks.off("targetToken", this.targetHook);
    document.removeEventListener("mousemove", this.movelistener);
    document.removeEventListener("mouseup", this.clicklistener);
    document.removeEventListener("keyup", this.keyuplistener);
  }
}

Hooks.once("init", () => {
  Hooks.on("renderHeadsUpDisplay", async (app, html, data) => {
    //html.append('<template id="enhancedcombathud"></template>');
    canvas.hud.enhancedcombathud = new CombatHudCanvasElement();
  });
});

Hooks.on("updateActor", (actor, updates) => {
  if (
    actor.id == canvas.hud.enhancedcombathud?.hudData?.actor?.id
  ) {
    let ad = actor.system.attributes;
    canvas.hud.enhancedcombathud.updatePortrait(ad.hp, ad.ac.value);
  }
});

Hooks.on("updateItem", (item, updates) => {
  let actor = item.parent;
  if (!actor || actor?.id != canvas.hud.enhancedcombathud?.hudData?.actor?.id)
    return;
  let ad = actor.system.attributes;
    canvas.hud.enhancedcombathud.updatePortrait(ad.hp, ad.ac.value);
});

Hooks.on("controlToken", (token, controlled) => {
  if(token?.document?.actor?.type == "vehicle") return
  if (
    controlled &&
    canvas.hud.enhancedcombathud?.rendered &&
    canvas.hud.enhancedcombathud.hudData.token.id != token.id
  ) {
    canvas.hud.enhancedcombathud.close();
    setTimeout(() => {
      const ctoken = canvas.tokens.get(token.id)
      if(!ctoken?.actor) return
      canvas.hud.enhancedcombathud.bind(ctoken);
    }, 250);
  }
});

Hooks.on("preUpdateToken", (token, updates) => {
  if (
    token.actor &&
    canvas.hud.enhancedcombathud?.hudData?.actor?.id == token.actor.id &&
    game.combat?.started &&
    ("x" in updates || "y" in updates)
  ) {
    let ttoken = canvas.tokens.get(token.id);
    let newX = updates.x || ttoken.x;
    let newY = updates.y || ttoken.y;
    let oldX = ttoken.x;
    let oldY = ttoken.y;
    const ray = new Ray({ x: oldX, y: oldY }, { x: newX, y: newY });
    const segments = [{ ray }];
    let distance = Math.floor(
      canvas.grid.measureDistances(segments, { gridSpaces: true }) /
        canvas.dimensions.distance
    );
    canvas.hud.enhancedcombathud.hudData.other.movement.moved += distance;
    const bars = Math.floor(
      canvas.hud.enhancedcombathud.hudData.other.movement.moved /
        canvas.hud.enhancedcombathud.hudData.other.movement.max
    );
    canvas.hud.enhancedcombathud.hudData.other.movement.current =
      canvas.hud.enhancedcombathud.hudData.other.movement.moved -
      bars * canvas.hud.enhancedcombathud.hudData.other.movement.max;
    canvas.hud.enhancedcombathud.updateMovement(bars);
  }
});

Hooks.on("updateCombat", (combat, updates) => {
  if (
    canvas.hud.enhancedcombathud?.hudData &&
    game.combat?.current?.tokenId ==
      canvas.hud.enhancedcombathud?.hudData?.token?.id
  ) {
    canvas.hud.enhancedcombathud.newRound();
  }
  canvas.hud.enhancedcombathud?.updatePass();
});

Hooks.on("deleteCombat", (combat, updates) => {
  canvas.hud.enhancedcombathud?.newRound();
});

Hooks.on("deleteToken", (token, updates) => {
  if (
    canvas.hud.enhancedcombathud?.rendered &&
    canvas.hud.enhancedcombathud.hudData.token.id === token.id
  ) {
    canvas.hud.enhancedcombathud.close();
  }
});

Hooks.on("preUpdateCombat", (combat, updates) => {
  if (
    game.settings.get("enhancedcombathud", "openCombatStart") &&
    canvas.tokens.controlled[0] &&
    !canvas.hud.enhancedcombathud?.rendered &&
    combat.previous?.round === null &&
    combat.previous?.turn === null
  ) {
    const token = canvas.tokens.get(canvas.tokens.controlled[0]?.id);
    if(!token?.actor) return
    canvas.hud.enhancedcombathud.bind(token);
  }
});

Hooks.on("updateItem", (item) =>{canvas.hud.enhancedcombathud?.checkReRender(item)})
Hooks.on("deleteItem", (item) =>{canvas.hud.enhancedcombathud?.checkReRender(item)})
Hooks.on("createItem", (item) =>{canvas.hud.enhancedcombathud?.checkReRender(item)})

Hooks.on("init", () => { 
  if (!game.modules.get("lib-wrapper")?.active) return;

    libWrapper.register(
        "enhancedcombathud",
        "CONFIG.Token.objectClass.prototype._onClickLeft",
        function (wrapped, ...args) {
            if (canvas?.hud?.enhancedcombathud?.isTargetPicker) {
                this.setTarget(!this.isTargeted, { releaseOthers: false });
            } else {
                return wrapped(...args);
            }
        },
        "MIXED",
    );
})