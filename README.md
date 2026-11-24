# 10,000 Swords Against Heaven for Foundry VTT

A Foundry VTT v14 game system for *10,000 Swords Against Heaven*. New worlds use the **2.1 rulebook**; the earlier **2.0.3** ruleset stays selectable and unchanged (Configure Settings → System → Rules version).

- System by: Geek IO Dev Team

![This Is 1 Sword Against Heaven](assets/character-logo.png)  


[Official 10K Swords Discord Link](https://discord.gg/k8fHKrNP)  
[Official Geek IO Discord Link](https://www.geek-io.net/discord)  

All my work is always free, but a little bit of help is always appreciated!  
<a href="https://patreon.com/geekioshow"><img src="assets/Patreon-Logo.png" alt="All my work is always free, but a little bit of help is always appreciated" width="240"></a>

# v 0.2.50

**Rules 2.1 is the default, and the Core pictures are the 2.1 rulebook's.**

- **Default ruleset.** A new world starts on **Rules 2.1**, sheet included. 2.0.3 stays in the Rules version list and is unchanged. A world that already has characters and never chose a version was running 2.0.3: it is kept on 2.0.3 the next time its GM logs in, with a notice saying so. Worlds where a version was chosen are not touched.
- **Core pictures.** The 2.1 sheet now shows the six pictures printed on pp.28–29 of the 2.1 rulebook: Physique red, Motorics peach, Mind purple, Wits orange, Face green, Heart pink. Before, it borrowed the 2.0.3 Cultivation pictures, which put the wrong art on Wits, Face and Heart. The 2.0.3 sheet keeps its own pictures.

# v 0.2.49

**Cultivator Discovery: market and checkbox fixes.**

- **Only gear printed in the 2.1 rulebook is for sale** in the creation tool (119 items), each with its page in the final 423-page book. Catalog entries kept from the Red Kalpa one-shot (M8 Rifle, Adamant Longjian, Baopu suit and others) and the Fangshi concoctions from the playtest Sects stay in the compendiums for the GM but are not offered. Ammunition is sold as quivers and magazines of the printed rounds at the printed price per round (p.207). A saved Discovery holding an item that is no longer offered shows it as "not in the 2.1 rulebook" and leaves it out on creation.
- **Checkboxes** keep their normal size, with a light ring around the box only. The step 1 agreement no longer has a frame, and the "Free" box in the Supply list is no longer stretched across its column.

# v 0.2.48

**Cultivator Discovery: table notes on the starting-XP update.**

- **Roll buttons.** The side panel has **Roll all (spend XP)** and **Roll all (spend no XP)**. Every step from Class to Sidhi also has its own **Roll this step** button; Cores, Cultivations and Sect add **Roll this step (spend XP)**, which spends what XP is left on that step at random.
- **Another Sect for XP.** With XP to spend, the Sect step can add a second (and third) Sect. The book lets a Cultivator ingest a different Barang and keep what was Cultivated (p.236) but prints no price, so the tool charges what p.100 does print: the new Sect's Cultivation from nothing at 3 × each new rating, and 10 XP for every one of its Licenses. Its Barang comes with the character, carried; the Sutra 7 Barang stays ingested.
- **Sect Gear is a License.** Gear such as the Nezha San Tou Liu Bi ("License: Red Gun ✦✦✦✦ — Gain the … Armor") is listed with the Sect's Technicks and Magicks (Kind: Gear) and is added to the character when learned. Gear printed inside a Technick (Metomian Chakra Rod, Adamantine Noose) comes with that Technick.
- **Market.** Weapons can be narrowed to one type (Dagger, Saber, Longgun…), the way armor is narrowed by Part, and the Kind column names the type. The "(profile)" templates (Handgun (profile) and the like) are no longer offered for sale.
- **Cultivations step.** The XP list sits in a third column beside each Cultivation's Class Stars.
- **The agreement box** on step 1 is now a framed, light box that turns green when ticked.

# v 0.2.47

**Cultivator Discovery can start above Sidhi 0.**

- **New step 1, Starting Sidhi.** Pick a Sidhi Stage (0–6), or type a custom amount of XP. A tick box confirms that you and your Intercessor agreed on it. The other steps move down one: Class is now step 2, and step 10 is Review and creation.
- **The Stages follow pp.101 and 108.** Spent XP becomes Foundation, and each Stage needs a total: Sidhi 1 at 50, 2 at 150, 3 at 300, 4 at 500, 5 at 750, 6 at 1050. Choosing a Stage gives exactly that much XP. A custom amount starts at the highest Stage it reaches, and the rest is still there to spend. For example, 75 XP starts at Sidhi 1 (Lightning Gatherer) with 25 XP more than Sidhi 1 needed; Sidhi 2 would need 150.
- **Spending the XP (p.100), inside the steps it belongs to:**
  - Cores: an XP list on each Core, 5 × the new rating per Star.
  - Cultivations: an XP list on each Cultivation, 3 × the new rating per Star, up to ✦✦✦✦✦.
  - Assets: Stars past the Class's go on XP, 4 × the rating.
  - Sect: raise the Sect Cultivation past ✦✦ (3 × the new rating), which opens higher Licenses; Licenses past the first two cost 10 XP each, and each needs an open Meridian (2 + Sidhi).
  - A bar at the top of every step shows XP spent and left.
- **The created character** gets the Sidhi Stage, 3 + Sidhi max Flame, every raised rating, the leftover XP in XP and the spent XP as Foundation.
- Drafts saved before 0.2.47 open at Sidhi 0 and only need the agreement box ticked.

# v 0.2.46

**Every Sect entry of the final 2.1 rulebook re-checked against the compendiums.** All 243 Technicks and Magicks, all Sect Gear, and every item card printed on the Sect, market and armor pages were matched one by one.

- **Two Metomian weapons added to 2.1 Sect Gear** (Metomian / Weapons folder). The Chakra Rod and Adamantine Noose Technicks each summon a weapon and print its card inside the Technick, so they had never become items:
  - **Metomian Chakra Rod**: Prestige Bludgeon, 1 kg, Haft, FOCUS; thrown up to 30 m, drains Flame on unsoaked damage.
  - **Metomian Adamantine Noose**: Prestige Whip, 0.5 kg, REACH 4 (7 m); +2 to Control. The book prints this card under the title "Metomian Chakra Rod"; it is the Noose.
- Everything else was already in: all 12 Metomian Technicks with Personal Vajra and Adamantite Shell, and every other Sect's Technicks, Magicks and Gear.

# v 0.2.45

**The 2.1 Bestiary is in the compendiums.** All 71 World Beings of the final 2.1 rulebook (pp.346–373) are ready to drag onto a scene.

- New compendium **2.1 World Beings · Bestiary**, listed right after 2.1 World Beings, with everything in one **Bestiary** folder. It is a separate compendium because a Foundry compendium holds one kind of document: the 2.1 World Beings compendium holds Traits and Gambits (Items), and the Bestiary holds World Beings (Actors).
- A block printed for several Sidhi levels (0/3/5) is one World Being per level, named "Aristocrat (Sidhi 3)" and so on.
- Each World Being is exactly what the 2.1 importer makes from that page: Cores, Cultivations, Part HP and Soak, Flame, Morale, Move, readied weapons, armor carried unequipped, Licenses, Assets, Traits, and the printed block, lore and drops in its Notes.
- Weapons, armor, Technicks and Magicks named in a block are the full items from the 2.1 compendiums where the names match (157 of them), so their rules come along.
- The short Dagger and Saber Goblins on p.372 share names with the longer entries on pp.362–363; they are listed as "Dagger Goblin (p.372)" and "Saber Goblin (p.372)".

# v 0.2.44

**Checked against the final 423-page 2.1 rulebook.** Every page was compared with the 357-page edition: the text word by word, and every page as an image. The final book adds lore pages (37–50 and 374–423), a filled-in Esoteric Anomaly table and four new World Beings; 114 other pages have small edits, nearly all spelling and wording. Everything that touches the rules or the compendiums is applied here.

- **Sheet header.** The 2.1 sheet now reads **Version 2.1** in green (was "Rules 2.1 · testing"). The 2.0.3 sheet shows **Version 2.0.3** in blue in the same place. Nothing else on the 2.0.3 sheet changes.
- **Short World Being blocks** (final pp.372–373). The four new Goblins are printed in a shorter form with no "✦ genus" line. The 2.1 importer now reads that form too: name, Sidhi, Flame, Morale, Parts HP, Cores, Cultivations, the weapon with its printed pool and damage, and each License with its ✹ / ❂ cost. Block and Dodge pools and CASTING stay in the notes.
- **Aflame** (final p.153). The Burning condition is now Aflame: −1 to all Checks (was −2), 1 blast damage to a random Part every Tick.
- **Bleeding** (final p.132) is −1 to physical Checks (the sheet applied −2). It loses [10 − PHYS] HP, at least 1.
- **Knocked Down and Drunk** read "−2 to Checks".
- **Semiproletariat** starts with 40 × d6 ♄ (was 100 × d6).
- **Shields** are a Haft profile (final p.206).
- **Compendium changes** (prices in ♄):
  - SSA Red Eye Ring 100 (was 500). Exdead Soul Integrity Earring 1,000 (was 200).
  - Tsushing Pressplay Player is Uncommon, 300 (was Enhanced, 100). HaeCo Fine Focus Binoculars is Uncommon.
  - Rend 1,999,000 and Mosesian Spring 1,000,000 (were 100,000).
  - VATAC Collapsing Lance 90, HaeCo Folding Spear 1,000, AWW Sky Feather Naginata 170,990, AWW Jadesteel Sleeves 400,999.
  - TMNI Sikarom 100,000, EXK Vampire Hunter 696,969, TMNI Blowgun 200.
  - HDF Dragon Fire Cannon 5,000,000 and its Meteor 1,000,000.
  - MORTAR Parabellum 9mm and MORTAR TD-7 Ruyi are Uncommon.
  - Ka Parashurma, TMNI Sikarom, HDF Miniature Arblast and EXK Vampire Hunter are now printed with their real kind (Cleaver, Bow, Crossbow), so the "printed as…" notes are gone.
  - Five Thunder Talisman has its new lore line.
- Page numbers in item sources still follow the earlier printing. In the final book add 14 from page 37 on, and 2 for pages 3–36.

# v 0.2.43

**Checked against the 357-page 2.1 rulebook.** Pages 1–303 of the new edition were compared with the 303-page book the catalogs were built from. Thirteen pages differ; everything that touches the rules or the compendiums is applied here. 2.0.3 is untouched.

- **GREAT and COLOSSAL** (p.194). GREAT is +1 damage and a +2 Speed modifier. COLOSSAL is +2 damage, 2 m Knockback on damage and a +3 Speed modifier. Neither takes 1 off violence Checks any more. The Speed modifier is added to the weapon's own, so the Ticks tracker and the sheet's Speed show it.
- **UNDODGEABLE** (p.194) is a new weapon Mod: a KILL THE BUDDHA made with it cannot be Dodged, and the Dodge button says so.
- **Stun Check** (p.121) is now Demand 3 by default, and a failure stuns for 6 Ticks.
- **Empty Hand** (p.192) deals Physique damage with no innate damage type.
- **Compendium changes:**
  - Kongo Helm is **+2** Speed (was −2).
  - Blademaster Wraps give Daggers, Sabers and Swords +1d to Block (was LACERATING).
  - Atardar's Fang loses LACERATING.
  - Hermetic Robes: Violent Sorcery also lets the wearer Step while Casting.
  - Demon Diamond Head: cannot be Stunned from Head damage.
  - Vajra Guard Blocks even an unblockable attack.
  - Wording fixes on Black Red Demon Thews, Flickering Shade Technique and Red Ajna.
- **World Being importer:** reads the two BEYOND HEAVEN entries (genus printed as "angel?", Parts printed as "[12] HALO 15 HP"), and places ordinary arms and legs before wings when a creature has both.

Items already on characters keep their old text and effects; re-add them from the compendium to pick up the changes.

Not automated: the 2 m Knockback, "ignore the SPD Modifier of GREAT or COLOSSAL weapons" (Six Demon Cutting Sword, Python Grip), and the armor Repair Check on p.202.

# v 0.2.42

**2.1 maximum Flame is 3 + Sidhi Stage** (2.1 rulebook p.90). It was 2 + Sidhi, from the older manuscript. 2.0.3 is untouched.

- The 2.1 sheet now shows 3 + Sidhi Stage as the Flame a Cultivator should have. **Existing characters keep the maximum they have stored**: the sheet marks it as different, and its button sets it to the new figure. Nothing is changed for you.
- New characters from Cultivator Discovery start with 3 Flame.
- World Beings: the importer already stores the printed Flame; when a block prints none, or the manual form's Flame is left at 0, it uses 3 + Sidhi.
- Open Meridians are unchanged at 2 + Sidhi Stage.

# v 0.2.41

**The importer reads Rules 2.1.** Under the 2.1 ruleset the Create & Import window (Items tab and Actors tab) now works from the 2.1 rulebook's own layouts. A world on 2.0.3 gets the importer exactly as before.

- **Rulebook text, 2.1.** Paste or read from the PDF, preview, then import. The Mass Importer recognises:
  - **Sect entries** — a title ending in Technick, Magick or Gear, with its LICENSE and NEEDS lines. Technicks and Magicks get their Sect, Esoteric Cultivation and Stars, and Flame to burn or install. Magicks also read MANTRA, MUDRA, CHECK and CHARGE TIME. Sect Gear becomes the weapon or armor on its card, with the License in the description.
  - **Item cards** — the line with weight, rarity, kind and price (for example *2 KG UNCOMMON BASE CLEAVER 500♄*), then the name, Mods and text. Weapons get their Profile, Grip, Material Grade, Affinity, Mods, FEROCIOUS and REACH. Armor gets Soak on the Parts it covers from its shield glyphs. Accessories, talismans, tools, consumables and salvage come in with weight, rarity and price.
  - **Assets** — the d66 code, Star range and name; the 36 printed Assets are recognised and keep their automation.
  - **Labelled entries** — one *Name:* line per item with any of Type, Rarity, Weight, Price, Profile, Mods, Soak, Covers, License, Needs, Mantra, Mudra, Check, Charge Time.
- **World Beings, 2.1.** The World Being · Text tab reads the Bestiary layout: *NAME ✦ genus*, *SIDHI*, the Move / Speed / Parts lines and the ARMOR, WEAPONS, CORES, CULTIVATIONS, LICENSES, ASSETS, TRAITS and DROPS sections.
  - A block printed as **SIDHI 0/3/5** makes three World Beings, or the one version you pick.
  - Part HP, Soak, Move, Morale and Flame are stored as printed. Weapons arrive readied, with the printed pool and damage noted on each.
  - Licenses, Assets and armor are matched by name against your world and visible compendiums; anything not found is made from the stat-block text.
  - Beasts with their own Parts (wings, tails) are fitted onto the sheet's six Parts, and the notes say which is which.
- **World Being · Manual, 2.1.** The form asks for Sidhi, Flame, HP per Part, Soak, Morale, Macca and the six Cores, and takes Cultivations as typed text ("Beast Shrine 3, Red Gun 4").
- **Item Importer form, 2.1.** Shows the 2.1 fields under the book's names (Profile, Grip, Mods, Soak by Part, Weight, Price, Flame) and leaves the 2.0.3-only ones out. Asset and Barang are new item types in the list.
- **PDF reading.** New **Read columns separately** option (on by default under 2.1): two-column pages are read left column first, then right, instead of interleaved. The file size limit is now 250 MB so the full rulebook can be opened.

The importer always shows a preview and review notes before anything is created. Rules text beyond Soak, Mods, costs and Morale is kept in each description and is not automated.

# v 0.2.40

**2.1 mode: Core pictures, and 2.0.3 material out of sight.** A world on 2.0.3 looks exactly as before. Nothing is deleted; switching the Rules version back shows everything again.

- **Core pictures.** Each Core on the 2.1 sheet shows the picture of the Cultivation it replaced (Physique uses Violence's, Motorics Grace's, Mind Dialectics', Wits Savvy's, Face Word's, Heart Spirit's). Click it to roll, as before.
- **Compendium tab.** The eight "Rules 2.0.3" compendiums are hidden while the world runs 2.1, and the Compendium Browser no longer lists their items.
- **Item sheets.** These 2.0.3-only parts are hidden under 2.1: Upgrade, Affinity (optional), Attack profile, Mods, Special Abilities, Optional enhancement, and the fields Carry slots, Bonus / Base attack bonus, AP cost, Armor increase, a Magick's damage type and attack and defense pools, and a consumable's AP cost. Their values are kept.
- **Character sheet.** The 2.0.3 Job line is gone, and the Licenses list appears only if the character still carries 2.0.3 License items.

# v 0.2.39

**2.1 character sheet and combat fixes from the table.** 2.0.3 is untouched.

- **Cultivations fit on one line.** The name boxes on the sheet are wider and no longer wrap. The gold Stars sit in the top corner of each box.
- **Spend Strikes.** After a KILL THE BUDDHA is won, the result card has a **Spend Strikes** button next to Apply damage. It lists what the Strikes can buy (HIT 1, KNOCKBACK 1, BODY HIT 2, CALLED HIT 3, HEAD HIT 4, p.117), counts what is left as you choose, rolls the random Part for a HIT, and applies the weapon's damage for each effect in one go. A ranged weapon without AUTO gets one effect and +1 damage per Strike left over. One chat card reports every hit.
- **Stun Check and Morale Check after Head damage.** Any card that reports lost Head HP now has both buttons, for a GM or the character's owner. On the sheet, **Stun Check** and **Morale Check (1 Morale)** are always shown in the Body section. The Morale Check is the Heart + Adamance roll against 2 + Disabled Parts that costs 1 Morale; its button used to appear only once a Part was Disabled and was called Incapacitation Check.
- **Combat and Inventory are one tab,** named **Combat & Gear**. Gear Slots, Licenses, armor, weapons and the rest follow the combat sections.

# v 0.2.38

**Cultivator Discovery: Roll everything.** A **Roll everything** button sits above Save to chat. It asks first, then rolls the whole Cultivator at random and jumps to the Review step. 2.0.3 is untouched.

- **Rolled with the book's dice:** Class (3d6) and its d6 sub-table, starting Macca, Name (one to four syllables), Culture (d66), Alignment (2d6) and Assets (d66 until the Stars run out).
- **Drawn at random:** which Core gets which Star value, which Cultivations get the Class's ratings, the Sect and two of its Licenses at ✦✦ or less, a Sidhi color and an Ajna.
- **Supply:** up to eight random things the Macca can pay for. A Lumpenproletariat also gets the free random item. If the haul is over the Carry Limit, the warning shows and the penalties stand.
- **Left to the player:** Attachments, the Sect story and notes are kept as they were.
- One chat message lists everything that was rolled. Nothing is saved until Save to chat.

# v 0.2.37

**Cultivator Discovery: changes from the first table test.** 2.0.3 is untouched.

- **Rolls post to chat.** Every roll made in the window (Class, its d6 sub-table, starting Macca, Name syllables, Culture, Alignment, Asset, the random Supply item) now posts as a normal dice roll, so two identical results in a row show as two rolls.
- **Cores and Cultivations:** each dropdown lists only the Star values you still have left, plus the one already chosen there.
- **Assets show what they do.** Each chosen Asset has its full text under it, and the Asset picked in the "Add an Asset" list is shown before you add it.
- **Supply:** the market can be filtered by the Part an armor piece covers. Armor lists its Parts and the Soak on each. Every item shows its weight, and hovering its name shows its description.
- **Carry.** The Supply step shows carried weight against the Carry Limit (10 kg + Physique × 10 kg). Going over it, or up another tier, raises a warning and a red notice with the penalties (p.182). The item is still added.
- **Culture and Alignment** show their description under the choice.
- **Sect:** hovering a Technick or Magick shows its full text. Clicking still opens the entry.

**2.1 character sheet change:** carrying more than the Carry Limit now takes dice off every Check automatically (-2 up to twice the limit, -3 up to three times, and so on). Movement and Speed already changed with weight; the Check penalty was only a note before. If the Encumbered condition is ticked by hand, its -4 is used instead, not both.

**Created characters:** each magazine or quiver bought becomes its own Item, so its weight counts once per magazine.

# v 0.2.36

**Cultivator Discovery: an in-app 2.1 character creation tool (book p.42).** 2.1 worlds get a **Cultivator Discovery** button at the top of the Actors tab. Any player can use it. 2.0.3 is untouched.

- **The eight Sutras, one step each:** Class, Cores, Cultivations, Assets, Supply, Identity, Sect, and Sidhi. A Review step lists what is still missing. Each step shows the rule from the book and checks it: the Core Stars your Class gives, how many Cultivations at each rating, Asset Stars to buy, starting Macca, three Attachments with one Held, one Firm and one Heart, one Sect and two Licenses you qualify for at ✦✦.
- **Roll or choose.** Class (3d6), its d6 sub-table, starting Macca, Name syllables, Culture (d66), Alignment (2d6) and Assets (d66) can be rolled in the window. Rolls are not posted to chat; they are listed on the Review step for the GM.
- **Supply is a shop.** It lists the 2.1 Weapons, Armor, Consumables, Accessories, Ammunition and Market Goods with their prices and keeps a running total against your Macca. A line can be marked free for gear that comes from Debt, a Patron or the Class.
- **Nothing saves on its own.** Closing the window with unsaved changes asks first. **Save to chat** puts the Discovery on a chat card whispered to the GM and the player. Saving again updates the same card.
- **Reopening.** The card has an **Open Discovery** button. It works for the player who saved it and for any GM. Other players do not see the button.
- **GM review.** The GM opens the card, reads the Review step, can change anything, and can leave a note that shows on the card.
- **Create character.** On the Review step the GM presses **Create character in the Actors tab** and picks the owning player. The character gets its Stars, Attachments, Culture, Alignment, the Sect Cultivation at ✦✦, Sidhi 0, the Macca left over, full Morale, and these Items: Class, Culture, Alignment, Assets, the ingested Barang, the two Licenses and the Supply. The card then shows **Created** and the Discovery is locked.
- A GM can create a character that is not finished; the missing things are listed first.

**Compendium change** (2.1 Cultivator Discovery, ids unchanged): the nine Classes now follow the 303-page rulebook (pp.44–48). Petit Bourgeoisie starts with 160 × d6 ♄ (was 150). Only the Lumpenproletariat has a Supply line; the Gear lines of the other Classes are gone.

# v 0.2.35

**2.1 weapon Affinities, Material Grades, REACH, MORPH and VISCERAL (book pp.194–195).** These were text on the items; the system now applies them. 2.0.3 is untouched.

- **Affinity.** A weapon can carry one Affinity: MIGHTY (PHYS), RAZOR (MOT), ESOTERIC (MND), ARCANE (WIT), LYRICAL (FAC) or PSIONIC (HRT). Choose that Core in the KILL THE BUDDHA dialog and the weapon deals that Core's damage plus its Profile bonus. Roll any other Core and it behaves as normal.
- **Material Grade.** Base, Refined, Divine or Immortal. Divine adds +1 damage and Immortal +2. Extra Mod slots and Durability are shown as a note.
- **REACH X** adds X metres to the weapon's range.
- **VISCERAL** adds +1 damage when the Part hit has no Soak left. The Apply damage dialog has a tick box for it, pre-ticked from the attack card.
- **MORPH.** A weapon that lists MORPH Profiles gets a **Morph** button beside it on the sheet. It switches the Profile (and Grip, and ranged or melee) and posts a line to chat.
- **SHOCK is now called ELECTRIC**, as the book prints it. Same effect.
- All five are set on the weapon's item sheet.

**Compendium changes** (2.1 Weapons and 2.1 Sect Gear, ids unchanged):

- Affinities set where printed: AWW Longclaws and MA Reaping Teppōkatana (RAZOR), HDF Cutting Logic Jian (ESOTERIC), MA Stardust Wrap and EXK Vampire Hunter (PSIONIC), Benzaiten's Drum (LYRICAL).
- **Damage goes up on Divine and Immortal weapons:** Ritual Keris, HDF Heavenly Slingstaff and HDF Dragon Fire Cannon +1; TMNI Buddhocommunist Ginunting +2.
- VISCERAL is switched on for the Teppōkatana, HaeCo Folding Spear and Atardar's Fang.
- **Personal Vajra** (REACH 3) now reaches 4 m: Bludgeon 1 m + 3 m. It was 3 m.
- Houyi Tonggong and Nezha Huojianqiang have their MORPH Profiles.

# v 0.2.34

**2.1 Assets re-imported from the 2.1 rulebook.** The **2.1 Assets** compendium follows the 303-page book (pp.211–218): the same 36 d36 Assets, with updated text on ten of them. 2.0.3 is untouched. Every Asset keeps its id.

- **Hummingbird Pulse is now always ✦✦✦ and works differently.** It no longer adds to Speed. Instead, when you roll your first READY on the Ticks tracker, the d6 is rolled twice and the lower result kept. Missing meals now costs -3 dice.
- **Python Grip:** +Stars to all Control and Throw Checks, and it ignores the SPD penalties of GREAT and COLOSSAL weapons.
- **Beastly Claws:** Empty Hand deals cut damage; the +1 damage now comes at ✦✦✦.
- **Money amounts follow the new prices:** Debt lends an item by rarity, Capital yields Stars × 2,000 ♄ a month, Patron gives items up to 5,000–1,000,000 ♄, Armory draws 100 / 300 / 800 ♄ of gear.
- **Wrought Limb** keeps working while Disabled and stops only when Cleaved. **Anvil Head** headbutts are also CRUSHING.
- Assets added from the older Asset list now cite the rulebook page.

# v 0.2.33

**2.1 item compendiums re-imported from the 2.1 rulebook.** Weapons, Armor, Accessories, Consumables, Ammunition and Market Goods now follow the 303-page 2.1 book (pp.186–207). 2.0.3 compendiums are untouched. Every item keeps its id, so re-importing updates it in place.

- **Armor Soak is lower.** One Soak per printed shield glyph: Kongo pieces 2 (were 5–6), Genji 1–2, Mingwang 3, Heavenly Silk Vest 1. **No Soak any more:** YEI Three Head Crown, Working Class Headwrap.
- **Prices changed**, many by orders of magnitude: Genji and Mingwang pieces 300,000–899,999 ♄, Angel Arm Prosthetic 4,000,000 ♄, talismans 100,000 ♄, Soma 3,000,000 ♄, Heart and Soul Containers 7,777,777 ♄.
- **Weapons:** ARTIFACT is gone. New mods where printed: Venom Balaraw TOXIC; Ritual Keris RITUAL and FOCUS; Teppōkatana FEROCIOUS 2. Magicite Onslaught Rifle holds 36. A **Shield (profile)** template joins the Weapon Profiles folder.
- **Affinities** (RAZOR, ESOTERIC, PSIONIC, p.195) and **VISCERAL** are printed on some weapons. They are shown on the item and applied at the table for now.
- **Ammunition (p.193):** quivers and magazines now weigh and cost their full count. New: Fireshot, Freezeshot, Blunt Bolt, Impact Arrow, Slingshot, Dart.
- **Consumables:** Thunderbolt Latte and Asura Stim deal true damage; Asura Stim gives +1 damage (was +2).
- **Renamed:** ELIXIR Potion (was ELIXIR Healing Pill), ELIXIR Asura Stim, ELIXIR Soma, ELIXIR Occult Wraps, TMNI Buddhocommunist Ginunting, TMNI Stingray Tail, TMNI Blowgun, Demon God Black Sorcery Beads, Clean Necktie, Wairini Locket, Info Talisman Ribbon: Lover Rockers, KC Devil Battery.
- The Heed Us one-shot gear, the tower shield and the Fangshi concoctions are carried over unchanged. Assets are not re-imported yet.

# v 0.2.32

**2.1 Sect Gear re-imported from the 2.1 rulebook.** The **2.1 Sect Gear** compendium now follows the 303-page 2.1 book (pp.224–303): **44 items** (16 weapons, 20 armor and Fashion pieces, 8 accessories and talismans) across all the Sects that print gear. 2.0.3 compendiums are untouched.

- **Soak is lower across the board.** The book now prints Soak as shield glyphs; one glyph is 1 Soak on each Part the piece covers. Examples: Interlocking Dragonsteel pieces 2 (were 3–4), Phoenix Feather Cap 2, Cloud Walking Boots 2 per leg, Revolt Suit 1 on every Part, San Tou Liu Bi 1, Dharma Robe 1, White Robes 1.
- **No Soak any more:** Hermetic Robes, Star-Stitched Robes, Shrine Raiments. **Golden Chainmail Shirt** has Torso Soak equal to the wearer's Sage Body; set it on the item by hand.
- **Weapons:** the ARTIFACT mod is gone from every Sect weapon. FEROCIOUS now has a number: Kalikhadga 3; Mahadirga Knife, Areindama, Tonggong and Atardar's Fang 2. Trismegistus and Rod of Bekanze gain RITUAL; San Miguel is GREAT, HOLY, FOCUS; Lance of Revolutionary Will and Demon Subjugating Sword are HOLY.
- **Bonuses:** Shrine Raiments +2 max Flame and +2 max Morale (were +1 each); Revolt Suit +2 Morale.
- **New:** Metomian **Personal Vajra** (ALMIGHTY, FOCUS, Reach 3) and **Adamantite Shell** (an automaton, listed as an accessory with its rules text).
- **No longer printed, removed:** Sword Runner Jacket and Sword Runner Trousers. Copies already on characters stay as they are.
- **Techgnostic COMP (666 PTM)** is now named **Techgnostic COMP**. Every item that carries over keeps its id, so re-importing updates it in place.
- The item catalogs (weapons, armor, ammunition, accessories, consumables, market goods) are not re-imported yet; they still follow the earlier book.

# v 0.2.31

**2.1 Sects re-imported from the 2.1 rulebook.** The **2.1 Sects** compendium now holds every Technick and Magick printed in the 303-page 2.1 book (pp.224–303): **242 entries across 20 Sects** (175 Technicks, 67 Magicks). 2.0.3 compendiums are untouched.

- **Two new Sects:** **Luciferian** (Consummate Lie; 14 entries; Barang: Liar's Devil Cricket) and **Metomian** (Black Mace; 12 entries; Barang: Black Orb Beetle). Both Sect Cultivations count for Licenses.
- **New entries:** Shell Shedding Technique (Fangshi), Slow the Heavenly Wheel (Jyotisha), Emptiness Sealing Acupoint Strike (Mendicant), Empu Sword Possibility (Sword Dialectician), Akasha Palimpsest (Techgnostic).
- **No longer printed, removed:** Lightness Technique (Fangshi), Hold the Heavenly Wheel (Jyotisha), Emptiness Sealing Palm (Mendicant), Adamantite Body (Techgnostic). Copies already on characters stay as they are.
- **Text updated** on 133 of the 211 entries that carry over, including Six Demon Cutting Sword and Hell Ripped Through with Exit Wounds. **Costs or requirements changed** on 26 (for example Asuri's Wrath ✹, Pluck of Many ❂❂❂❂, Samadhi Fire ❂, Live Hand Method ❂❂❂) and **Stars** on 3 (Celestial Heaven Shooter ✦✦, Hell Ripped Through with Exit Wounds ✦✦✦✦, Pluck of Many ✦✦✦✦✦). See [the Sect catalog notes](docs/sect-catalog-2.1.md).
- Costs printed as a choice ("✹ or ✹✹", "✹✹/✹✹✹/✹✹✹✹") charge the cheapest option and are treated as variable, like "✹..." costs.
- Existing compendium entries keep their ids, so re-importing updates them in place. **Sect Gear and the item catalogs are not re-imported yet**; they still follow the earlier book.

# v 0.2.30

**2.1 Armor Mods and weapon damage.** 2.0.3 untouched.

- **Armor Mods (2.1 p.202).** Every armor or clothing piece can carry one Mod, chosen on its item sheet: Breakaway, Sheathe, Reinforced, Silent, Mourning Lacquer, Retributive Script, Magnetic, Featherweight.
  - **Reinforced, Mourning Lacquer, Retributive Script, Magnetic** add +1 Soak to each Part the piece covers.
  - When a Part with **Mourning Lacquer, Retributive Script or Magnetic** soaks damage, the damage card says what happens to the attacker.
  - **Featherweight** halves the piece's weight. **Sheathe** and **Retributive Script** fit Arm, Torso and Leg pieces only, so they do nothing on the Head.
  - **Breakaway** can be recorded but has no effect: its text is cut off in the book.
- **Weapon damage follows the book (p.192).** Sword, Bludgeon and Polearm now deal Core + 1 (were Core + 0). **Empty Hand deals PHYS** (was a flat 1). This applies to both KILL THE BUDDHA engines in 2.1 worlds.

# v 0.2.29

**2.1 Firefight.** Ranged combat in the Strikes engine now follows the 2.1 book (pp.119–124). The Openings engine and 2.0.3 are untouched.

- **Aim.** The KILL THE BUDDHA dialog has *Ticks spent Aiming*: +1 die per Tick, up to Motorics. You do not fire on the Tick you start and cannot move while aiming.
- **Cover.** Choose the target's cover: **Light** (each instance of ranged damage has a 2-in-6 chance of hitting cover), **Heavy** (4-in-6) or **Full** (no attack until it is removed). The roll is made on the defender's resolution card. Melee ignores cover. This replaces the old −2 / −4 dice.
- **Out of range.** A shot beyond the weapon's range has a 4-in-6 chance of going wide; if it does, no Strikes land. This replaces the old range bands.
- **Height.** At least 1 m above your target: +1 die.
- **Ambush and Casting.** An Ambushed target, or anyone attacked while holding Magick Charges, rolls a halved pool (rounded down) when they Block or Dodge.
- **Shield profile** (Physique + Beast Shrine, 1 m, PHYS damage, SPD +0) with innate COVER, and three new weapon mods: **COVER** (Light Cover), **WALL** (Heavy Cover), **UNBLOCKABLE**. A lone target carrying one starts with that cover selected.

# v 0.2.28

**2.1 Ticks tracker.** In 2.1 worlds the Combat tracker now runs on **Ticks** (2.1 book pp.22–23) and the old Round / Cut panel is gone. 2.0.3 combat is untouched.

- **One engine round is one Tick (1 second).** A combatant's initiative is the Tick they are next **READY** on; the earliest READY is listed first. Rolling initiative gives the first READY: **d6 + Speed** (counted from the live Tick for late arrivals). The turn arrows move a whole Tick.
- **Ticks panel.** Shows the Tick, who is READY and when the next READY falls. The GM has **Next Tick** and **Skip to Tick N** (the next Tick on which someone is READY). A chat line announces each Tick on which someone is READY.
- **Your combatants get buttons.** When READY: **Act** (next READY = Tick + Recovery), **Dash** (+1 Recovery), **Hold** and **Anticipate** (you name the trigger). In Recovery: **Flash ✹2** — burn 2 Flame to Act now; **Release** resolves a Held or Anticipated Act. Unused Held Acts lapse when you are READY again.
- **Flurry is counted.** Pressing Flurry on a KILL THE BUDDHA card during an encounter skips Recovery and readies you for the next Tick; **End Flurry** then adds Recovery + 2 per continuation. A Flurry begun before your own READY adds to that READY.
- **Gambits.** GM: right-click a combatant → **Gambit READY Ticks (2.1)** to plot a WB's READY Ticks (for example 6, 15, 24). It then uses the list instead of Recovery and cannot Flurry.
- The sheet's old "Speed bonus" is now the **Speed modifier**: it is added to Recovery (positive is slower), as the book's gear entries read. The old Sword-order Speed line is removed.

# v 0.2.27

**2.1 rulebook corrections — Speed, Recovery and movement.** 2.0.3 untouched.

- Every weapon profile now has its **SPD modifier** from the book (Dagger +0, Sword +1, Handgun +1, Launcher +1, the rest +2). With two weapons readied the heavier one counts.
- The sheet shows **Ticks: Speed and Recovery** — Recovery = Speed + weapon SPD + encumbrance, the Ticks until your next READY after an Act. The Flurry card now uses Recovery.
- **Basic Move = Motorics**, **Dash = Motorics + Physique**, **Step = half Basic Move** (was Physique + Motorics).
- **Encumbrance** follows the book: over the Carry Limit up to ×2 is −2 Movement and Checks and +2 Speed; up to ×3 is −3 / +3. The Check penalty is shown as a warning, not applied automatically.

# v 0.2.26

**2.1 rulebook corrections — combat, part 1.** The full 2.1 book (Nov 16) revises the combat rules; this brings what is already live into line. 2.0.3 untouched.

- **KILL THE BUDDHA is a two-way exchange.** Whoever wins the Conflict Check deals weapon damage — the Defender too. The resolution card names the winner, gives the Apply-damage button for the loser, and offers **Flurry to the Winner** (the Attacker on a Tie).
- **Block is now your own Weapon Check** (the equipped melee weapon, or Empty Hand) instead of Physique + Beast Shrine. Dodge is unchanged. UNBLOCKABLE / ALMIGHTY attacks cannot be Blocked.
- Hits are named as in the book (Hit, Body Hit, Called Hit, Head Hit). Ranged weapons without AUTO buy one effect; the remaining Strikes become damage.
- **Strikes is now the default** KILL THE BUDDHA engine; Openings stays available in the system settings.
- **Speed = 7 − the higher of Wits / Mind** (was 10 − Wits). **Maximum Morale = 1 + Heart + Stillness.** A failed Stun Check stuns for 6 seconds.

# v 0.2.25

**Combat overhaul — patch 4 of 6: Flurry.** Press the advantage after a KILL THE BUDDHA in the Strikes engine. Additive; 2.0.3 and the Openings engine untouched.

- Every Strikes-engine resolution (Block / Dodge) now shows a **Flurry — KILL THE BUDDHA again** button, up to **Motorics** times, and the card tracks how many times you have pressed.
- Each Flurry is an Anticipated Action: it immediately re-rolls KILL THE BUDDHA against the same defender (same weapon pre-selected). The resolution states the cost — the next READY lands **Speed + 2 × flurries** Ticks after the Tick you acted on (Speed = 10 − Wits, min 2). The Tick itself comes from the Ticks tracker in patch 5.

# v 0.2.24

**Combat overhaul — patch 3 of 6: Finding an Opening.** The seven example maneuvers, as contested Checks. Additive; 2.0.3 untouched. Available on every 2.1 actor sheet (independent of the KILL THE BUDDHA engine setting).

- New sheet button **Find an Opening** (beside KILL THE BUDDHA). Pick one of **Onslaught, Volley, Analyze, Feint, Control, Throw, Disarm**; the initiator rolls and the card gives each target a **Resist** button with the maneuver's opposed pool.
- Each maneuver's pools follow the manuscript: Onslaught (WEAPON vs Wits + Beast Shrine), Volley (ranged WEAPON, spend Ammo, vs Wits + Thews And Sinews; [AUTO] adds up to 3 Ammo dice), Analyze (Mind + Concrete Analysis vs Face + Beast Shrine), Feint (Wits + Beast Shrine, mirror), Control (Empty Hand vs Motorics + Beast Shrine), Throw and Disarm (Empty Hand vs Physique + Thews And Sinews).
- Resolution auto-applies what it can: **Off-Balanced** (Onslaught loser, Volley target), **Control** on the target (with the Part tier by margin — a Limb, win by 2 the Torso, by 3 the Head). Throw distance ([Physique + leftover Strikes] m), the +2-next-KTB from Analyze/Feint, Disarm, and throw direction (Juggled / Knockdown) are stated on the card for the table to apply.

# v 0.2.23

**Combat overhaul — patch 2 of 6: the new KILL THE BUDDHA.** A second combat engine, selectable per world. The old Openings/exchange engine is the default and is unchanged. 2.0.3 untouched.

- New world setting **KILL THE BUDDHA engine (2.1)** — *Openings* (the current Quick/Solid/Perfect exchange, default) or *Strikes* (the 2.1 rewrite). Switch it in the system settings; nothing changes until you do.
- **Strikes engine:** a KILL THE BUDDHA posts the attacker's **Strikes** and each targeted defender gets **Block** (Physique + Beast Shrine) or **Dodge** (Motorics + Thews And Sinews) buttons. The defender's Strikes cancel the attacker's; any that remain land, and the card shows what they buy — **1** a Random/Controlled Part or Knockback 2 m, **2** the Torso, **3** a Limb, **4** the Head — with an Apply-damage button on the defender (where you pick the damage type from patch 1).
- Weapon mods still apply to the attack roll (Ferocious, Precise, damage, range, firing modes), and a called/Ambush Part and random hit locations carry through.

# v 0.2.22

**Combat overhaul — patch 1 of 6: foundations.** The first slice of the 2.1 KILL THE BUDDHA rewrite (user docs, 2026-11-15). Additive; the current combat engine is unchanged. 2.0.3 untouched.

- **Five damage types** — **Cut** (inflicts Bleeding), **Crush** (-1 Part Soak after), **Pierce** (ignores up to 2 Soak), **Blast** (ignores all Soak, -1 Soak after), **True** (ignores all Soak). Pick one from the new dropdown in the Apply-damage dialog; it sets the Soak handling, reduces the Part's Soak and sets Bleeding as the type requires.
- **Two new conditions** — **Off-Balanced** (-2 on the next KILL THE BUDDHA Check) and **Control** (a Part is grappled/pinned and cannot move).
- **Bleeding** now reads as the 2.1 rule: a Bleeding Part loses [10 - Physique] HP after a minute and gives -1 to physical Checks (does not stack on one Part; each Bleeding Part adds its penalty).
- The **Incapacitation Check** (1 Morale — Heart + Adamance vs 2 + Disabled Parts) and **Healing** (1 per X days, X = current damage; doubled without rest) already matched the new docs, so no change was needed there.

# v 0.2.21

**Force player dice (2.1) — character-sheet rolls use the assigned player's Dice So Nice dice.** Code only; 2.0.3 play is unchanged.

- Every 2.1 roll is spoken by a character, so on other clients Dice So Nice could resolve the 3D dice from whoever drove the roll (often the GM) instead of the character's player. In a 2.1 world, rolls made from a character sheet now animate with the Dice So Nice appearance of the **player assigned to that character** — the same dice a `/r` command shows them. A `/r` command (no character speaker) is never touched.
- New world setting **Force player dice (2.1)** (default on) toggles it. Turn it off to let Dice So Nice resolve appearance on its own.
- The system still writes no Dice So Nice data and uses no `eval`; this only points Dice So Nice at the right player when it animates. If dice still fall back to a generic set, that points to a Content-Security-Policy blocking `eval` (a reverse-proxy/CDN or browser-extension setting, not the system).

# v 0.2.20

**Combat and sheet pass: tougher Parts, Ferocious actually rolls, temporary Core boosts, an Esoteric XP button, ammo counts and Dice So Nice bonus dice.** Code only — no compendium changes. 2.0.3 play is unchanged.

- **Part HP is now 7 + Physique + Sidhi Stage** (was 3 + Physique). Every Body Part is tougher; an HP bonus, Mountain Frame and Anvil Head still add on top, and a Part is still Disabled at 0 and Cleaved at negative half its maximum.
- **Ferocious rolls its extra dice.** A weapon's FEROCIOUS rating adds an exploding d6 for each 6 rolled, up to the rating. The **GREAT** modifier now grants FEROCIOUS 1 (as its rules text says) — previously a GREAT weapon added no dice.
- **Dice So Nice animates the bonus dice.** Ferocious and Precise bonus dice now roll in 3D through Dice So Nice; the main pool already did.
- **Temporary Core boosts from Technicks and Traits.** A Technick / special ability can now apply a temporary change to any of the six Cores (Physique…Heart), the same way a Trait's Active Effect already can.
- **Experience-spend button for Esoteric Cultivations.** Each Esoteric Cultivation row now has a “+ XP” button (3 × the new rating, capped at 5 Stars), matching the basic Cultivations.
- **Ammo counts by the weapon.** Equipped ranged weapons show their remaining ammo — a loaded magazine, a linked stack, or the family you carry — in the weapon panel and in the KILL THE BUDDHA weapon picker.

# v 0.2.19

**Swords are now Rounds, and the Movement / Lightness / Projects rules are in.** Code and docs only — no compendium changes. 2.0.3 play is unchanged.

- **Swords → Rounds.** The 2.1 structured scene (a temporal anchor divided into Cuts) is renamed from a *Sword* to a *Round*, matching the player-facing book. The Combat-tracker panel, its chat announcements and the "Set Round" button all say Round now; the sub-unit is still a *Cut* (one engine round = one Cut) and *Cut-In* is unchanged. A scene set in a combat before this update must be re-set once (the flag moved `sword21` → `round21`).
- **On Movement, Lightness Technique and Projects** (player-facing book p.24) are documented in the 2.1 rules notes: within a Round you move up to Basic Move per second and standing actions cancel if you move away; Lightness (install ❂) lets a Cultivator run walls, tread on falling leaves and tech out of knockback; Projects are Extended Checks with a Demand, Duration and Goal. These are rules references for the table — no runtime behaviour changed.

# v 0.2.18

**Two new 2.1 Sects from the player-facing book: the Bidadari and the Sapphire Star.** Both join the 2.1 compendiums with their Technicks, Magicks, Gear and Barang. 2.0.3 play is unchanged.

- **Bidadari** (Sound Law) — bard-diplomats who weaponize music: 12 Technicks (Steel Song Meditation's KILL THE BUDDHA Maneuvers, battle anthems, crowd-swaying songs, the capstone Mountain Breaking Thunder), the Apsara's Flowing Hagoromo arm-ribbons and the Benzaiten's Drum, plus the Golden Dawn Cricket Barang.
- **Sapphire Star** (Dual Cultivation) — the Heavenly Ascendance Bureau's mediator-spies: 12 Technicks and 2 Magicks (Sapphire Silk Lattice; On Earth We're Briefly Gorgeous), the Plenipotentiary's Sapphire Vestments, and the Sapphire Silkworm Barang. This replaces the flavor-only Sapphire Star preview added in 0.2.16 — it is now a full Sect.
- The 2.1 Sects compendium is now **215 entries across 18 Sects**; Sect Gear is **44**; Barang is **18**. The runtime Sect-cultivation list adds Sound Law and Dual Cultivation.

# v 0.2.17

**2.1 combat: Maneuver generation lowered a step.** The KILL THE BUDDHA dice now rank one tier lower, matching the current engine. 2.0.3 play is unchanged.

- A die of **1–3 is a Whiff** (no Maneuver), **4–5 is a Quick**, and **6 is a Solid**. No die rolls a Perfect anymore — a **Perfect comes only from fusing two Solids**.
- Everything downstream is unchanged: Strikes still count dice of 4+, fusion still turns two equal Openings into the next rank (one extra Perfect at most), Sidhi upgrades work the same, and Gambit World Beings keep the Quick → Quick → Solid → Perfect sequence.
- The dice colours, the roll card's "Resolving Openings" help, and the 2.1 rules notes were updated to match.

# v 0.2.16

**The 2.1 player-facing book, in the compendiums.** The 2.1 ruleset's compendiums are now built from the full 187-page player-facing book, and three new compendiums join them. The 2.0.3 rules are unchanged.

- **New: 2.1 Cultivator Discovery.** Character creation from the book, drag-and-drop: the **Classes** (3d6 — Lumpenproletariat through Heavenly Bourgeoisie), **Alignments** (2d6 — Fascism through Communism), **Cultures** (d66, 36 of them), **Truths** (d66) and **Perversions** (d66), plus a **Names** syllable table (roll 2d6 twice). Each entry carries its roll and its full book text.
- **New: 2.1 Market Goods.** The market's **Salvage, Tools, Esotery and Talismans** (book pp.166–169), each a rollable d6 set.
- **New: 2.1 World Beings.** For the Intercessor: the **Traits** (3d6, 16 of them), **Gambits** (2d6), nine **Templates** (Brigand, Soldier, Elite Guard, Diplomat, Sorcerer, Alchemist, Beast, Goblin, Earthly Dragon or Devil) with their full stat blocks, and the **Inhabitants** (d66) and **Material** (2d6) discovery tables.
- **Every 2.1 item and Sect compendium refreshed to the book.** 2.1 Weapons, Armor, Accessories, Ammunition, Consumables, Assets, Barang, Sects and Sect Gear now cite the player-facing book's pages, with the book's final names, stats and text.
- **Sapphire Star preview.** The seventeenth Sect is in the roster as a flavor-only entry (Dual Cultivation, Sorcerous Diplomacy). The book introduces it but does not yet print its Technicks, Magicks, License or Barang; it will be filled in when the book does.

# v 0.2.14

**Fixes from table testing (both rulesets).** No rules changed.

- **Free special attacks work.** A Special Ability, Technick or Magick that costs 0 AP and no Ardor/Flame no longer fails with "Ability costs could not be saved."
- **Arrow keys move the selected token** one grid space (diagonals by holding two arrows; Shift rotates, as with WASD). With nothing selected the arrow keys still pan the map. Players can change or clear these keys under Configure Controls, in the system section.
- **Job descriptions are tidy.** The Jobs compendium kept the whole book block (Cultivations, loadout and traits) in the Description, and every starting weapon copied that whole block too. A Job's Description now holds its tagline; its Cultivations and starting items are on the Details tab, and each starting item gets its own note (for example "Keen Gun, 10 Bullets"). Jobs and starting items already in the world and on characters are tidied once when the GM loads the world; a Job with no starting items dropped on it keeps its loadout as a short list.
- **Job text import:** pasting a Job straight from the book (with ✦ ratings) now fills the six Cultivations and keeps the Description to the tagline and a starting-loadout list.

# v 0.2.13

**2.1 rules: the 2.1 Alpha and the playtest Sects.** The 2.0.3 rules are unchanged.

- **Three new Sects** in the 2.1 compendiums: **Imma** (healing White Sorcery), **Jyotisha** (Astral star magick) and **Zhongkui** (Spirit Binding exorcists), each with its Magicks, Technicks, gear and Barang. 2.1 Sects now holds 211 Technicks and Magicks across 16 Sects; 2.1 Sect Gear has 41 items; 2.1 Barang has 16.
- **Sect Cultivations renamed:** Devil Tiger Blade → Demon Body, Liver Eating → Devil Beast, Heaven Raving Dragon → Sky Dragon, Eskaton Magick → Black Sorcery, Sun Piercing Killing Wind → Solar Bow, Dog Laughs At God → Vajra Fist, Fire Lancing → Red Gun, Techgnosticism → Techgnosis, The Immortal Science → Immortal Science, Great Sage Style → Sage Body. Characters that already have the old names keep working: Licenses, formulas and casting accept both.
- **Updated Sect entries:** new Technicks and Magicks for Asuri, Aswang, Eskatonian, Fangshi and Wukong; several renamed or no longer printed; new costs and text where the playtest Sects changed them; gear changes such as the Huojianqiang (Rate 15), Hermetic Robes and Revolt Suit. Details are in `docs/sect-catalog-2.1.md`.
- **Fangshi pills and elixirs** in 2.1 Consumables: Healing Pill (heals 2), Antidote, Fulfilness and Fireball Pills, Chakra Elixir (2 burnt Flame), Disguise, Thunderbolt and Inferno Elixirs, and the Five Dragons Pill.
- **Basic Move** = Physique + Motorics m/s, replacing Walk/Run/Sprint. The sheet shows how far that is in a 3-second Cut and swimming at half.
- **Cleaved** at the negative of half a Part's maximum HP (rounded down), so a 5 HP Part is Cleaved at -2. The damage track is shorter to match.
- **Scorch:** a Technick or Magick can now go past 0 Flame after a confirmation. Each point of Scorch is -1 to all Checks and triggers a Deviation Check (Physique + Adamance + Sidhi Stage vs 3 + Scorch); a failure rolls the d6 Deviation table on the chat card. Recovering or releasing Flame clears Scorch first. The Flame box shows Scorch.
- **Samadhi:** a new condition giving +2 to all Checks and ignoring dice penalties. Rolling Strikes equal to the Demand + 3 on a Check (Flow) switches it on.
- **Suppression Fire:** a firing mode for ranged weapons of Rate 15 or more. It posts the Heart + Stillness vs Demand 3 test for everyone in the 3 m area instead of rolling Openings.
- **New conditions:** Burning (-2 to all Checks, 2 damage to a random Part every 3 seconds), Suppressed, Samadhi. Juggled characters also cannot Counter.
- **Smaller changes:** "Moving while Casting (-2)" in the Cast dialog; the Combat tracker's Interject is now **Cut-In**; Technick cards describe the Self-Flame for the Flame spent; adding a Sect Technick or Magick without that Sect's Barang ingested shows a reminder (a new Sect License needs it); page references point to the Alpha.

# v 0.2.12

- **Renames:** Voice is now **Face**, Spirit is now **Heart**, and Ardor is now **Flame** on the 2.1 sheet, rolls, chat cards and 2.1 compendiums. Sect formulas written with the old names (such as [VOICE x 5]) still work. The 2.0.3 sheet still says Ardor.
- **Assets are items.** Drag them from the new **2.1 Assets** compendium (all 35 d36 Assets with their full text) onto the Identity tab. Each Asset shows its Stars and a "+ ✦" button that spends 4 × the new Star in XP. Mountain Frame, Anvil Head, Spring-Tendon Legs, Hummingbird Pulse and Sleepless Soul still apply automatically. Rows from the old Asset list are turned into Asset items when the GM next loads the world.
- **Barang are items.** The new **2.1 Barang** compendium has each Sect's Barang. The Overview tab lists your Barang with **Ingest** and **Eject**. Ingesting one ejects any other and can add its Sect's Esoteric Cultivation at ✦✦; ejecting keeps everything you have Cultivated.
- **Body Part HP = 3 + Physique**, calculated automatically. HP bonuses and Assets still add on top.
- **KILL THE BUDDHA Openings:** 1 = Whiff, 2–3 = Quick, 4–5 = Solid, 6 = Perfect. Dice of 4+ still count as Strikes for the Shoot Demand and random hit locations.
- **From the spoiler manuscript:**
  - Flame is generally 2 + Sidhi Stage. The Flame box shows that number and offers a button to set it.
  - Meridians are 2 + Sidhi Stage. The Technicks list warns when you hold more Magicks and Technicks than open Meridians.
  - ARTIFACT weapons now deal +1 damage.
  - World Being Gambits give one predetermined Opening per die (Quick, Quick, Solid, Perfect, repeating).
  - The 2.1 Weapons, Armor and Accessories compendiums follow the new Panoply. The TD-7 Ruyi is now Rate 30 and the Parabellum 9mm Rate 10. The Kongo Breastplate is -2 Motorics. The YEI Crown has 2 Soak. The Official's Coat covers all limbs. New items: MORTAR AT-CR Cudgel, Kongo Helm and Gauntlets, YEI Worker Bottoms, Puterijasa Adept Cowl and Robes, and Featherstep Clogs.
- **2.1 Sects** now come from the second Sect spoilers: 171 Technicks and Magicks across 13 Sects (new: **Houyi** and **Techgnostic**), with the printed cost and text changes. Some entries were dropped (Aegis) or renamed (Self-Sacrificing Sage). **2.1 Sect Gear** adds the Houyi Tonggong, the Vipassanadhanu Garb and the Techgnostic COMP.

# v 0.2.11

**Area templates stay on the scene** (both 2.0.3 and 2.1).

- After you place the area of a Magick, Technick or Special Ability, it now stays on the map as a shaded Region with its measurements, so everyone can see who it covers. Before, it vanished as soon as it was placed.
- The area is visible to everyone. Its owner and the GM can move or delete it on the Regions layer.
- Areas placed during a combat encounter are removed automatically when that encounter ends. Areas placed outside combat stay until you delete them.
- Players who aren't allowed to create Regions have their area created by the connected GM.

# v 0.2.10

**Easier-to-see 6s** in both rulesets.

- **2.0.3:** in the dice tooltip of every Check and attack, each 6 (Perfect Strike) is now a bold white number on a bright magenta chip with a glow, instead of green text. Strikes of 4 and 5 keep their blue.
- **2.1:** 6s (Perfect Openings) on KILL THE BUDDHA, Check and casting cards, and the Perfect count, use the same bold magenta chip instead of dark green.

# v 0.2.9

**2.1 sheet layout.** The Cultivations column heading now reads "XP to" over "Advance" on two lines, right-aligned above the XP buttons.

# v 0.2.8

**2.1 sheet layout.**

- The **Cultivations** heading is centered in its box.
- Each Cultivation column has an **XP to Advance** heading above the buttons that raise a Cultivation and show its XP cost.

# v 0.2.7

**2.1 Change God's Mind**: social influence, Social Defense, Disposition and Persistence (pp.39–52; 2.1 rules only).

- **Change God's Mind.** Target a token and click **Change God's Mind** in the Attachments section. Say what you want, what you ask for (Favor, Risk, Ruin, implanting, strengthening or weakening an Attachment, or Inflaming an emotion) and your approach: Cult of Personality, Bleeding Heart, Weapon of Critique, Spit In The Face Of God, Aesthetic Glossolalia, Thews and Sinews (all Voice), Threatening (Physique + Beast Shrine), the written word or gestures alone (pp.42–43, 47, 49–50).
- **Modifiers.** −3 when you can't leverage an Attachment as strong as the request needs (Held for a Favor, Firm for a Risk, Heart for a Ruin), the target's **Disposition** (−6 to +4), **mob** size (−1 to −5), a **material shift** (+4) or a **shaky** Attachment (+3) (pp.42–52).
- **Defend.** The target's owner or the GM clicks **Defend** on the card, marks which of the target's own Attachments oppose or align with the request, and rolls Spirit + Stillness with **Social Defense** (+2/+4/+6 opposing, −1/−2/−3 aligned, equal ones cancel). Gestures alone give the defender +3; a mob can defend with half its pool as static Strikes. Ties go to the defender (pp.43, 48, 50).
- **Persistence.** A convinced target can spend 1/2/3 Morale (Favor/Risk/Ruin) to reject it; refusing an action also needs a different Attachment at least as strong as the one leveraged (pp.48–49). Morale is deducted from the sheet.
- **Disposition.** Every 2.1 sheet has a Disposition toward the Wanderers, with **Roll 2d6** for strangers; it fills in the Change God's Mind dialog automatically (pp.46–47).
- The card reminds you that threats always leave a negative Held Attachment, that strengthening Attachments is a weekly or monthly Social Project, and gives written pieces their reading Demand.

# v 0.2.6

**2.1 KILL THE BUDDHA exchange**: everyone's Openings resolved together on one chat card (2.1 rules only; 2.0.3 attacks are unchanged).

- **Start an exchange.** Every 2.1 KILL THE BUDDHA card has **Start KILL THE BUDDHA exchange** and, when one is open, **Join open exchange**. A defender who clicks **Respond: KILL THE BUDDHA** on the attacker's card joins its exchange automatically.
- **Speed Tiers.** The card shows each combatant's Quick, Solid, Perfect and Whiff Openings. Quick Openings act first, then Solid, then Perfect; the GM clicks **Next tier**, and unused Openings of the finished tier are lost (p.23). Someone who joins late loses the Openings of tiers that have already passed (Interruption, p.27).
- **Act.** Commit an Opening to a maneuver, optionally aimed at another combatant. The dialog lists what each rank allows (pp.24–25).
- **Counter.** Counter any maneuver of the current tier with an Opening of equal or higher rank (p.26). A **Greater Counter** (Solid vs Quick, Perfect vs Solid) grants a Quick Opening and an **Overwhelming Counter** (Perfect vs Quick) a Minor or Solid one, usable at once and open to Counter-against-Counter (p.27).
- **Fuse and Sidhi.** Fuse two equal Openings into the next rank, at most one extra Perfect (p.25); Cultivators can note burning 1 Sidhi to raise an Opening or turn a Whiff into a Quick (p.26).
- **Apply damage** on any maneuver that still lands opens the target's damage dialog with the attacker's weapon damage and CRUSHING; Quick strikes default to the Torso.
- Players' actions are applied by the connected GM, so a GM needs to be online.

# v 0.2.5

**2.1 Swords, Cuts and Speed** in Foundry's Combat tracker (2.1 rules only; 2.0.3 combat is unchanged).

- **The Sword.** In 2.1 worlds the Combat tracker shows a Sword panel. The GM clicks **Set Sword** to name the temporal anchor ("The skyship crashes into the spire"), the number of Cuts (4 by default; 6 or 8 for longer scenes) and how long each Cut lasts (3, 6 or 12 seconds for violence; minutes for debates) (pp.6–7).
- **Cuts.** Each Round is one Cut. The panel shows the Cuts from the flat start to the sharp tip, and each new Cut posts a chat note. When the last Cut passes, chat announces that the Sword has ended and the anchor comes to pass, so the GM can decide whether a new Sword is needed.
- **Speed order.** Initiative is the character's Speed (Physique + Wits + Peripheral Oracle + Stillness) with no roll, and the **lowest Speed declares and acts first** (p.10). Speeds reset at the start of every Cut.
- **Interject.** Right-click a faster combatant who hasn't acted yet and choose **Interject now (2.1)** to give up their place and act right away, before the slower actor whose turn it is (p.10). The GM or the combatant's owner can do this.

# v 0.2.4

**2.1 Technick activation** on the 2.1 sheet's Combat tab (2.1 rules only; 2.0.3 Technicks are unchanged).

- **Technicks list.** Every Technick shows its Needs (✹ burn, ❂ install), weapon requirement and License, and why it can't be used yet if something is missing.
- **License check.** A Technick needs its Esoteric Cultivation at the printed Stars (e.g. Devil Tiger Blade ✦✦). Add the Cultivation under Esoteric Cultivations; the Activate button unlocks once the Stars are high enough.
- **Weapon check.** Requirements like SWORDS or SABERS, POLEARM OR DAGGER, EMPTY HAND, [AUTO] weapon, GREAT/COLOSSAL or "needs ammo" are checked against your equipped weapons and free hands.
- **Activate and Install.** ✹ Technicks burn their Ardor when activated. ❂ Technicks install their Ardor and stay installed until you click **Release**, which returns it. Activation checks your available Ardor first; "✹ [X]" Technicks ask how much extra to burn.
- **Formulas worked out.** Sect formulas such as [3 x DEVIL TIGER BLADE] or [VOICE x 5] are calculated for your character in the dialog and on the chat card.
- **Areas, targets and attacks.** You can place an area to target everyone inside, the card lists targets with Apply damage buttons, and **Then roll KILL THE BUDDHA** (ticked for weapon Technicks) follows straight into the attack.
- **Sidhi Deviation** (p.18) is a new 2.1 condition: every Cultivation counts as 1 and Magicks and Technicks can't be used.
- **Sidhi Realm** (Identity tab): Desire, Form or Formless. The Technicks list counts your Magicks and Technicks against the Realm's limit of 8, 16 or 32 (pp.100–101).

# v 0.2.3

**2.1 targeting and damage from the chat card** (2.1 rules only; 2.0.3 attacks are unchanged).

- **KILL THE BUDDHA reads your targets.** Target tokens (T) before attacking. The dialog lists them and fills in the distance from your token, so Firefight range penalties apply automatically (pp.29–30). You can still change the distance by hand.
- **Reach and range warnings.** The chat card shows each target's distance and flags melee targets beyond the weapon's Reach and ranged targets beyond the weapon's range (pp.22, 64–67).
- **Respond: KILL THE BUDDHA.** The defender's owner (or the GM) clicks this on the attacker's card to roll their own KILL THE BUDDHA, already aimed back at the attacker (p.22).
- **Apply damage.** The GM or the target's owner clicks this to damage the target's Part. The dialog starts with the weapon's damage, the called or Ambush Part (or the first random hit location from Burst/Full Auto) and CRUSHING, then removes Soak before HP and reports Disabled/Cleaved consequences as before (pp.31–38).
- **Area Magicks.** When a 2.1 Magick unleashes and has an area (Shape and Size, or "3 m burst"-style text in its description), you place the area on the scene and the tokens inside become targets. The cast card lists them with Apply damage buttons (p.98).

# v 0.2.2

- **2.1 Weapons:** the listed Panoply, one blank weapon per profile, and the one-shot's weapons and tower shield.
- **2.1 Armor:** head, torso, arm, and leg armor with per-Part Soak. Kongo, Official's Coat, Silkspeaker Legs, and Red Eye Ring changes apply as Active Effects.
- **2.1 Consumables, Accessories, and Ammunition:** healing pills and elixirs, the Clean Black Necktie, and quivers and magazines.
- Under 2.1, several armor pieces can be worn at once, and DOUBLEHAND, GREAT, and COLOSSAL weapons take both hands.
- The 2.1 sheet adds up item weights for Carry (p.63), and **Use** on a consumable heals the chosen Part and restores burnt Ardor and Morale.
- Equipping a License under 2.1 now uses the Core prerequisites consistently.
- Build the compendiums with `node tools/build-packs.mjs` before packaging or opening Foundry.

# v 0.2.1

**Rules 2.1 switch.** The GM chooses the ruleset in **Game Settings → Configure Settings → System → Rules version**. **2.0.3** stays the default and is unchanged. **2.1 (Red Kalpa Manuscript)** is for testing. Switching keeps both sets of character data; nothing is converted or deleted. See [Rules basis 2.1](docs/rules-basis-2.1.md) for page references and open questions.

Rules changed for 2.1:

- **Cores replace Cultivations (p.5):** Violence → Physique, Grace → Motorics, Dialectics → Mind, Savvy → Wits, Word → Voice; Spirit stays.
- **Checks are Core + Cultivation (p.5)** against Demand 1–6+. Excess Strikes are reported, and an established Fact adds +4 (p.61).
- **30 Cultivations (pp.77–85)** rated 0–5 Stars, plus Esoteric (Job and Sect) Cultivations.
- **Sidhi Progression (p.9):** Advance buttons spend XP: a Core costs 5 × the new rating, a Cultivation 3 × the new rating (maximum 5).
- **Speed (p.10)** = Physique + Wits + Peripheral Oracle + Stillness. **Movement (p.12):** Walk 2, Run Motorics + 2, Sprint Motorics + 4, Swim Physique + Thews and Sinews (all m/s). **Carry Limit (p.63)** = 10 kg + Physique × 10.
- **KILL THE BUDDHA (pp.22–38)** replaces the attack and Defense rolls. Each 4 is a Quick Opening, 5 a Solid Opening, 6 a Perfect Opening, and 1–3 a Whiff. Chat shows Openings, damage, and reminders for timing, Counters and fusing Openings.
- **Firefight (pp.29–30):** range penalties from 0 to -5 and beyond, -4 past weapon range; Shoot, Burst (+Rate dice), and Full Auto (+Rate × 3 dice) with random hit locations and ammo.
- **Situational modifiers (pp.13, 33–36):** cover, height, unstable terrain, impaired senses, low light, water/mud, Juggled targets, Ambush, and static Openings for simple World Beings.
- **Body Parts replace the Health Sutra (pp.31–32):** Head, Torso, arms and legs, each with 3 HP. A Part is Disabled at 0 and Cleaved at negative its maximum. Torso Disabled is -4 to all Checks.
- **Soak (pp.38, 66–69):** equipped armor covers Parts; damage removes Soak first; CRUSHING costs 2 Soak per point. **Repair armor** restores lost Soak.
- **Stun and Incapacitation Checks (pp.31–32)**, and per-Part **healing time (pp.14, 31)**.
- **Morale (pp.39–40)** = Spirit + Stillness plus gear, with a Shattered warning at 0.
- **Attachments (pp.40–41)** with Held, Firm, and Heart strengths, and **Assets (pp.86–96)** from the d36 table. Mountain Frame, Anvil Head, Spring-Tendon Legs, Hummingbird Pulse, and Sleepless Soul apply automatically.
- **Conditions (pp.13–14, 34–35, 63):** Bleeding, Stunned, Knocked Down, Juggled, Encumbered, Drunk, and a Fatigue penalty.
- **Weapons (pp.64–68)** gain Grip, Profile, base damage 2 (Empty Hand 1), Rate, Capacity, and the 2.1 modifiers (AUTO, CRUSHING, FEROCIOUS X, GREAT, COLOSSAL, DOUBLEHAND, FOCUS, BLAZE, ARTIFACT, SMASHING, SHIELD X).
- **Magick casting (pp.98–99):** every Strike becomes a Charge; at the Magick's Potency it unleashes and burns its Ardor. Changing Magick abandons Charges.
- **Funds (pp.55–56):** Carried Mag and Savings.
- License prerequisites use the matching Cores in 2.1.

**New 2.1 compendiums** from the 2.1 Sect spoilers (book pp.128–187). See [2.1 sect catalog](docs/sect-catalog-2.1.md).

- **2.1 Sects:** 123 Technicks and Magicks from 11 Sects, organized by Sect and License Stars. Each lists its Esoteric Cultivation License, NEEDS, and full text. Ardor costs come from NEEDS, and Magicks are ready for 2.1 casting with Potency, Cast Time, Core, and Cultivation.
- **2.1 Sect Gear:** 27 Sect weapons and armor pieces with 2.1 Grip, Profile, mods, Rate, weight, per-Part Soak, Morale, and Ardor. Movement bonuses apply as Active Effects.

The 2.0.3 compendiums are unchanged. Social, investigation, project, poison, and ailment rules are not automated yet.

# v 0.1.51

- Kept the Force OCR checkbox beside its label and moved the explanation below it.
- Matched the Mass Importer step bubbles to World Being · Text, with detailed formatting guidance tucked into an expandable section.

# v 0.1.50

- Added local PDF text extraction and English OCR to **Mass Importer** and **World Being · Text**, with page ranges, progress, cancellation, and editable extracted text before preview.
- **World Being · Manual** now accepts items dragged from the compendium browser or Items directory. Review and remove starting items before creation; their embedded effects are preserved.
- PDF reading supports up to 20 pages per operation and files up to 100 MB. OCR output should be reviewed for names, columns, symbols, and numbers.

# v 0.1.49

- Added **World Being · Manual** to the importer: enter a name, Actor folder, resources, movement, Siddhi, Magnetite, and all six Cultivations. Creation opens the sheet and keeps the importer available.
- Cleaned up text importing with grouped steps, a dedicated upload area, expandable instructions, and an advanced preview editor.

# v 0.1.48

- Fixed World Being imports rejecting names containing commas, including multiple stat blocks in one batch.

# v 0.1.47

- Fixed destination folders in the Item and Mass Importer. Existing Item folders are available even before the sidebar displays them, with hierarchy and alphabetical sorting preserved.

# v 0.1.46

- Added **World Being Traits**: all 16 entries from page 213, with supported numeric Active Effects and conditional bonuses disabled until needed.
- Added **Sect Fashion & Gear**, organized by Sect and item type: 34 equipment cards represented by 37 entries, including all four Houyi Tonggong weapon forms.
- Added all **12 Jobs**, organized into Body and Mind, with printed Cultivations and independent starting loadouts. Wretched preserves its player-selected choices.
- Release ZIPs now include all **eight compendiums**. See [catalog details and manual mechanics](docs/expansion-catalogs.md).

# v 0.1.45

- Equipped **Hermetic Robes** automatically add **1 m to Magick area sizes**, following page 135. Scathe becomes a 2 m burst within its normal 6 m casting range.
- The bonus appears as a transferable Active Effect in the robes’ Effects tab and is suppressed while unequipped. Existing world and character copies receive the missing effect on GM world load.
- Added **Magick area size bonus (m)** to the Active Effect variable dropdown. The casting prompt shows automatic area bonuses.

# v 0.1.44

- Magicks, Technicks, and Special Abilities can place an area selector on the canvas and automatically target characters inside it.
- Bursts use their radius, blasts use triangular cones, and lines are 1 m wide. Scathe defaults to a 1 m burst within 6 m.
- Adjust shape, size, and placement range before casting. Cancelling placement spends no AP, Ardor, or ammunition.
- Existing imports can infer explicit area dimensions from their descriptions; no re-import is required.
- See [Area targeting](docs/area-targeting.md) for placement controls and targeting details.

# v 0.1.43

- Configured **69 Special Abilities on 64 Sect Technicks**, including weapon attacks, activation actions, rites, and triggered abilities. Use them under **Combat → Special Abilities**.
- **Six Demon Cutting Sword** requires a wielded Great/Colossal weapon, spends 2 AP and 1 Burn Ardor, and applies its +2 attack dice, Crushing, Blaze, and extra Wounds on 5s and 6s.
- Weapon-based abilities include the chosen weapon’s bonuses, modifiers, and ammunition. Installed activation abilities retain a Release control; variable Burn costs prompt for an amount.
- On GM world load, matching existing imports with empty Special Ability lists receive the configured actions. Existing custom lists and customized activation costs are preserved.
- Multi-attack sequences, movement, summons, conditional bonuses, and unusual effects retain explicit manual instructions. See [Technick action notes](docs/technick-actions.md).

# v 0.1.42

- Added optional **Automated Animations** support for weapon attacks, Magicks, Technicks, and Special Abilities.
- Configure animations using the module’s item controls or automatic name recognition. Special Abilities use their parent item’s animation configuration.
- Added a world setting to enable or disable this integration. Private rolls do not trigger scene animations.
- See [Automated Animations setup](docs/automated-animations.md).

# v 0.1.41

- Added **Sect Licenses**, **Sect Technicks**, and **Sect Magicks** compendiums covering the 15 sects on pages 127–185.
- Includes **156 Licenses**, **74 Technicks**, and **52 Magicks**, organized into **Sect → Novice / Expert / Master** folders. Each ability links to its matching License.
- Includes source pages, prerequisites, descriptions, and explicit AP/Ardor costs. Magicks include printed Mantras and Mudras, with explicit attack fields where available.
- Variable costs, conditional mechanics, and requirements for other Licenses remain in the descriptions for manual handling. See [Sect catalog notes](docs/sect-catalog.md).


# v 0.1.40

- Moved all 12 generic weapons into the **Weapons** compendium folder and removed the separate **Weapon Patterns** folder.
- Removed “(Pattern)” from their names. All entries use the **Weapon** item type; their stats and IDs are preserved.
- First public release on Github.

# v 0.1.39

- Body text and controls now use bundled **Inter**.
- Section headings use **Times New Roman**. Major headings prefer **ITC Benguiat**, falling back to Times New Roman when Benguiat is not installed on the viewing computer.
- The supplied logo and Foundry’s icon fonts remain unchanged.

# v 0.1.38

- Gear has configurable **Consumable recovery** fields and a **Use** button in character Inventory. Use confirms, restores Health/burnt Ardor, and consumes one item in the same saved update.
- Configured Elixir Chakra Pill (+1 burnt Ardor recovered), Elixir Magnesium Pill (+2), Elixir Healing Vial (+1 Health), and Inter-Elix Soma (all Health and burnt Ardor) from p.94.
- Recovery respects maximum Health and available burnt Ardor, leaves installed Ardor intact, and adjusts Carry when a stack is spent. Empty stacks and uses with no recovery benefit spend nothing.
- These consumables cost 1 AP in active combat (p.64), configurable on the item. Outside combat they spend no AP.

Import fresh copies of the four configured items, or edit existing Gear → Consumable recovery to configure them. Other consumables’ timed bonuses, injuries, and immunities remain descriptive in this pass.

# v 0.1.37

- Fixed the compendium database format for embedded Active Effects. Trait items now contain effect references and separate effect records that Foundry can load, so their own **Effects** tab contains the actual changes.
- Adamance contains a transferring **Maximum Health → Add → Trait Level** effect. The other configured Traits retain their individual changes and activation controls.
- On the first GM world load, recognizable Grimoire Trait copies with empty Effects tabs receive their missing effects. This includes world items, owned items, and unlinked token copies. Existing effects and customizations are preserved.
- The repair runs once; intentionally removing an effect afterward will not cause it to be recreated every session.

# v 0.1.36

- The character’s **Effects** tab now includes transferred effects from Traits and other owned items alongside effects attached directly to the character.
- Each entry shows its source, Active/Disabled/Suppressed/Inactive status, and exact stat changes. Suppressed effects explain that their source item must be activated or equipped.
- Edit, Enable/Disable, and Remove target the correct owned effect, even when multiple copies share an effect ID. Compendium and world originals remain independent.
- Existing character items appear automatically; no re-import is needed.

# v 0.1.35

- Moved the sheet logo to the upper right, with the portrait and name sharing the upper-left space.
- Fixed Trait activation: **Activate** enables the primary effect if all effects were disabled. Enabling an individual situational effect also activates its parent Trait. **Deactivate** suppresses the Trait’s effects.
- Updated compendium defaults: Adamance is automatic; conditional Traits start inactive with their primary effect configured and ready for Activate. Separate bonuses/penalties remain individually selectable.
- Existing 0.1.34 Trait copies work with the corrected controls; no re-import is required for this fix.

# v 0.1.34

- Character sheets use the supplied **1 Sword Against Heaven** logo in a compact, responsive header.
- Grimoire Traits include 44 Active Effects across 33 Traits. Bonuses and penalties scale with Trait Level; Adamance increases maximum Health automatically.
- **Identity → Traits → Situational effects** offers individual Enable/Disable controls. Enable only the effects relevant to the current situation, then disable them when the benefit or duration ends. The Trait’s main Activate/Deactivate button controls all its effects.
- Oracle Soul, Chills, and Tenth Sense retain their descriptions without invented stat modifiers. See the [Trait effects guide](docs/trait-effects.md) for manual secondary benefits and usage limits.

Updated effects apply to newly imported compendium Traits. Existing world/character copies are independent; replace those copies from the updated compendium to receive these definitions, preserving any custom Level or edits you need.

# v 0.1.33

- Right-click an item on a Wanderer or World Being sheet and choose **Remove**. Removal also refunds that item's tracked resource reservations.
- Magicks and Technicks with Install costs show **Internalize**. Confirming use spends the configured AP, Burn, and Install costs. An internalized ability shows **Release**, which frees its tracked installed Ardor without refunding AP or burnt Ardor.
- Abilities without Install costs show **Activate** and can be used directly. Insufficient AP or Ardor prevents use; cancellation spends nothing.
- Inventory and Combat display **AP, Burn, and Install** costs together. Full Rest releases internalized abilities as it clears Ardor. Changing Jobs also releases installations belonging to removed Job grants.

# v 0.1.32

- **World Being matching:** searches world Items and visible Item compendiums, preferring world copies. Normalizes punctuation, possessives, capitalization, and PDF spacing. Matching duplicates no longer force a placeholder; preview names the selected source. Full descriptions, fields, and effects are copied. Microcosmic Orbit remains restricted to Technicks/Magicks.
- **Active Effect variables:** values such as `System.Level`, `@system.level`, and `2 * System.Level` read the owning Item's numeric fields. `@actor.system.movement` explicitly reads the Actor's base Movement. Changing Trait Level updates its effect without changing the saved base Cultivation.
- One **Importer** button in Items, Actors, and Compendiums opens the shared importer tabs.
- Traits and their Activate/Deactivate controls are now in **Identity**.
- Jobs have separate Weapons, Gear, Fashion, and Traits drop areas, with independent loadouts. Changing Jobs replaces only the previous Job's granted items and reverses their resource costs/bonuses; manually added items stay. Grant identity is scoped to its Job, including duplicated templates.
- Added **Grimoire Traits · Rules 2.0.3**, containing all 36 Traits from pp.114–120 with full text, Level, and source references. Animal Magnetism includes a switchable Level-to-Word effect; Adamance includes Level-to-Maximum-Health. Animal Magnetism starts inactive so its conditional bonus is applied only when appropriate. Other narrative/conditional mechanics remain described for the table to adjudicate.

# v 0.1.31

- **One importer window, three tabs:** Item Importer, Mass Importer, and World Beings. Item and Mass Importer buttons appear in both the Items and Compendium directories. Drafts and previews stay open after successful or failed imports.
- **Multi-Trait imports:** numbered book headings split into separate items. The Mass Importer explains separators and shows detected names/counts plus editable JSON before creation. Choose an Item folder for both single and bulk imports.
- **World Being importer:** parses the core-book stat-block layout, including numeric/star Cultivations, Health boxes, Movement, Ardor, Armor, money, and bracketed item sections. Matches visible world items by name; Microcosmic Orbit matches only Technicks/Magicks. Missing or ambiguous names become embedded placeholders, with supplied details retained and review notes.
- **Cultivation buttons:** book artwork from pp.26–27, names underneath, and book-description tooltips. Character items show their descriptions on hover.
- **Inventory:** separate type sections, drag sorting, alphabetical Auto-sort, and **Add New** to create a blank owned item and open its editor. New equipment starts unequipped; Carry overage is recorded rather than blocking blank-item creation.
- **Traits:** their own Combat section with Activate/Deactivate controls for configured transferred Active Effects. Movement has a prominent field and remains available to Active Effects.
- **New item types:** World Being Gambit (restricted to World Beings) and Salvage, with distinct bundled icons.
- **Jobs:** drop starting Items/Traits into the Job editor. Applying the Job copies those grants to the character once while retaining manual Cultivation adjustments and existing items. Removing a grant from the template does not delete an already-granted character item.
- **Compendium search:** names/descriptions plus tags, Sect, Sidhi, rank, and rarity; supports queries such as `tag:fire sect:asuri sidhi:2`.
- **Dice:** retained 4s/5s are cyan in expanded results; Perfect Strikes remain green.

World Being imports preserve printed resource totals and start equipment/Trait effects inactive to avoid automatically adding bonuses already included in those totals. Review the preview and activate/equip as appropriate. Arbitrary prose is retained, not converted into invented mechanics.

# v 0.1.30

- Worldbeings use the Wanderer Samadhi triggers: three Sixes or the first drop into Bloodied between rests. Existing Samadhi is not refreshed and burnt Ardor is recovered only on entry.
- New Round is directly below AP and above the Health Sutra.
- Armor is a clickable track inside the Health Sutra; numeric Armor inputs are removed. Capacity comes from Fashion and Active Effects.
- Renamed Special Attacks to **Special Abilities**, now supported by Weapons, Fashions, and Technicks. Existing attacks remain intact. Choose Attack, Check, or Automatic mode; zero-AP, non-rolling activations are supported.
- Automatic abilities can publish a configurable target modifier. A GM or target owner can apply/remove it on selected targets from chat. Reapplying the same ability updates its effect instead of stacking it. Range, duration, and conditional eligibility remain explicit table decisions.

# v 0.1.29

- Bulk text imports recognize repeated Name labels, book item headers, and multi-line Technick/Magick titles. Preview each detected entry before importing; use `---` for ambiguous layouts.
- Dice totals count Strikes (4, 5, and 6), including kept-low fallback rolls. Weapon attacks clearly label the miscellaneous bonus/penalty field for Fashion, Traits, and other adjustments.
- Technicks and Fashions gain a **Special Attacks** editor: names, notes, pools, damage type, bonuses, AP, burnt Ardor, and installed Ardor. Equipped items expose their attacks in the character's Combat tab.
- Added Blaze, Lacerating, and Toxic conditions. Blaze burns at combat round advances; Toxic has a 10-minute SPI check button; Lacerating adds one Wound to subsequent attacks with surviving Strikes. Linked Defense offers an explicit button to apply weapon-mod conditions, including Stun and Hobbled.
- Defense chat separates ordinary/Perfect Defenses, uncancelled Strikes, Wounds, Armor loss, and Health loss. Damage remains a calculation to confirm and apply.
- Eleven distinct default item icons by Lorc from [Game-icons.net](https://game-icons.net/), under CC BY 3.0. Custom art stays unchanged. See [icon attribution](assets/icons/ATTRIBUTION.md).

# v 0.1.28

- Imported names use Title Case; descriptions join wrapped lines into paragraphs. Bundled compendium entries receive the same cleanup.
- Gear now shows Magnetite (Mag) cost.
- Only Licenses have Meridian cost; Fashion, Technicks, and Magicks do not. Licenses no longer have Rarity.
- Existing characters refund recorded ability Meridian costs and account for equipped Licenses once. Excess costs display a warning until Licenses are unequipped.

# v 0.1.27

## Book imports and non-sect compendiums

- AP and Ardor now sit directly above the Health Sutra.
- Import destinations follow folder hierarchy, alphabetized within each parent.
- Removed Rarity from Jobs, Technicks, Magicks, and Traits. Jobs and Traits also lose quantity, Carry cost, and base bonus. Traits gain an editable, uncapped Level.
- Rulebook-text import recognizes complete item headers, symbols, prices, weapon patterns, Fashion bonuses, and ability costs/pools. Full text and an editable review remain available; uncertain and bespoke rules are not silently automated.
- Magicks can define an optional enhancement. Casting prompts Yes/No, applies configured extra AP/Ardor, dice, area size, and Wounds, and reports the choice. Simple optional burn clauses in pasted text are proposed for review.
- Added **Non-Sect Items · Rules 2.0.3**: 110 entries organized into 11 compendium folders, with source-page references covering item listings on pp.94–111, weapon patterns, ammo, and upgrade materials. Pages 92–93 describe brands rather than item records.
- See [Compendium coverage](docs/compendiums.md) for ambiguities and manual effects. Pack contents load with the system; they do not automatically populate the world Items directory.

# v 0.1.26

## Ability workflows and batch importing

- Choose an Item folder for single creation, the new batch queue, or file/text imports. Add different item types to the queue and import them together without closing the creator. Multiple files of the selected format can be imported together (200 items / 2 MB per file-import batch).
- License Sect is free text; Rank is Novice, Expert, or Master. Dracotine, Leonine, Mammon, and homebrew sects are accepted. Existing combined Sect/rank values migrate on load.
- Technicks and Magicks have their own Inventory sections and appear when internalized in Combat. They do not occupy equipment slots, including legacy slot assignments.
- Configurable AP, burnt Ardor, and installed Ardor costs; Use/Cast spends the configured resources. Automatic abilities can skip rolling. Cancellation spends nothing; failed chat creation restores costs.
- Magicks have damage type, Mantra, Mudra, required hands, attacking/defending pools, and area shape/size. Attack rolls link to Defense; the recorded defending pool is selected automatically. Area targeting and specific narrative effects remain manual.
- Removed the Maximum Health input. Continue adjusting maximum Health through Active Effects. Ardor uses ✹, installed Ardor uses ❂, and AP uses ✦; spent resources are dimmed.

# v 0.1.25

## Item details and native effects

- Weapon Affinity now has a dropdown in Universal Item Importer.
- Maximum Health effects add Hale levels to the Sutra; extra levels can be selected without changing base maximum Health. Raising maximum alone does not heal current Health.
- Active Effects opens Foundry’s standard editor directly, with variable dropdowns in its Changes tab. Duration, operations, priority, and other native controls remain together.
- Fashion has a Magnetite (Mag) cost field on its sheet and in the importer.
- Every item type has Rarity: Common, Uncommon, Enhanced, Rare, Deluxe, Prestige (PDF p.94). Inventory entries and item headers carry subtle color accents and rarity text.
- Existing items default to Common; rarity does not automatically set prices or upgrade tiers.

# v 0.1.24

## Universal item importer

- Open Universal Item Importer from the right-hand Items sidebar. Choose any supported item type and create successive items without closing the window.
- Type-specific fields, rich descriptions, remembered drafts when switching types, and an Edit last created shortcut.
- Successful creation resets fields for the next item while keeping the type. Invalid entries stay available to correct.
- Import files / rulebook text opens the existing reviewed JSON, CSV, and text import workflow.

# v 0.1.23

## Combat workflow and item importing

- Fixed window-control icons by keeping the custom font off Foundry icon buttons.
- Removed Archive from character sheets. Compendium Browser now opens from the Compendium sidebar; Import Items is available in the Items and Compendium sidebars.
- Renamed State to Combat and moved Health, conditions, Actions, Defense, and readied weapons/Magicks/Technicks there.
- Removed Armor from item creation. Legacy Armor loads as Fashion, retaining its original data in a recovery flag. Review Fashion bonuses and slot assignments on converted items.
- Interrupt now opens an opposed-response dialog: Clash cancels matching attack dice; Sabotage compares successes and reports a weakened-attack/disarm outcome. Actions, ammo, conditions, injury and Samadhi are accounted for.
- Added JSON, CSV, and pasted rulebook-text importing for all supported types, including Jobs, Licenses, Technicks and Magicks. Editable preview, model validation, duplicate skipping, and a downloadable JSON template precede creation.

# v 0.1.22

## The Archive and first UI pass

- Replaced Open with Edit on character and item sheets.
- Introduced a charcoal, ivory, and crimson visual style with locally bundled Barlow and Rajdhani Google Fonts. No runtime Google Fonts requests are required.
- Character sections: Overview, State, Inventory, Identity, Notes, and Effects. Item sections separate details, weapon configuration, description, and effects.
- Added The Archive, opened from the character sheet's Archive button. Search world items and accessible Item compendiums; filter by type or source; View entries or drag them onto character sheets.
- Archive indexes are cached, results load in batches, unavailable packs are reported, and Refresh reloads the library. No compendium content is bundled in this update.
- Tightened field spacing, inventory rows, headings, portrait sizing, condition cards, primary actions, and keyboard focus states.

# v 0.1.21

## Health states, linked Defense, and effect variables

- Health buttons now select the displayed Health level. The third starting Hale selects 4 Health and applies no penalty; Bloody begins at 3. Saved Health values are unchanged.
- Selected Hale is green, Bloody blood red, Critical bright red, and Knocked Out black with bold white text.
- Attack and Defense chat show total successes including sixes, with sixes still highlighted in green.
- Defense can select a recent visible attack created in this version. Rolls cancel Strikes and calculate Armor/Health loss using stored weapon properties; damage is reported, not applied automatically.
- Active Effects opened from the system sheet offer named variable dropdowns and Add/subtract, Multiply, or Set value. Existing custom modifiers are preserved; Advanced opens Foundry's full editor.

# v 0.1.20

## Rest, Bloodied Samadhi, and active conditions

- Wanderers enter Samadhi on their first damaging transition from Hale to Bloody or Critical between rests, including Health edits through token bars. Already-active Samadhi is not refreshed; that injury trigger is still used.
- Added Rest with “Would you like to perform a Full Rest?” confirmation. Yes heals 1 Health up to maximum, clears burnt and installed Ardor, ends Samadhi, restores three Actions, and resets the injury trigger. Full Rest requires one day and two meals (p.2); food and time are confirmed by the player.
- Added all eight p.78 conditions with descriptions and removable sheet checkboxes. Daze, Encumbered, Hobbled, Knockdown and Stagger modify effective statistics; attack, casting and Interrupt restrictions apply where relevant.
- Stun removes one Action when applied. Added remaining Actions, Spend Action, Interrupt, and New Round controls. Weapon attacks spend their action cost (two for Colossal); Cast spends one Action. New Round manually restores three Actions.
- Conditions are not automatically cured by Rest. Token dragging, speech, and actions outside system controls remain table-managed.

# v 0.1.19

## Defense, Magick, and Samadhi

- Added Cast beside equipped Magick. Casting is blocked without a free hand, even with Focus; the guard checks again after the dialog. Select the Magick's required Cultivation; SPI is the default. Listed costs/effects remain manual.
- Added Defense under Checks & Cultivations: VIO deflection, GRC/SAV avoidance, and wielded weapon Affinities. Includes injury, Active Effect, Shield, Samadhi, and selected Full Defense/Feint adjustments. Reports ordinary and Perfect Defenses separately.
- Sixes totals appear in bold green in system roll chat.
- Three or more retained sixes enter Samadhi unless already active, restoring one burnt Ardor if available. Subsequent checks gain +3. Duration follows the end of the next combat round or six seconds of Foundry world time; End Samadhi is available on the sheet.
- Automated Shield bonuses while wielded, Ritual bonuses for selected prayer/ritual checks, and Disarming bonuses for selected disarm checks.
- Hit-triggered target conditions and damage application remain manual.

# v 0.1.18

## Grouped attack options

- Organized attack options into bordered Targeting, Position & range, Attack tactics, and Weapon effects & adjustments sections.
- Aligned related fields and checkboxes with consistent spacing and shorter labels. Dual Attack guidance sits beneath its controls.
- Retained scrollable content and the fixed Roll footer.

# v 0.1.17

## Attack dialog layout

- Attack options use two columns and a scrollable content area, with the Roll button kept outside the scrolling region.
- The dialog is resizable and capped to the viewport height. Narrow screens use one column.
- Combat calculations and field values are unchanged.

# v 0.1.16

## Weapon attacks and combat modifiers

- Attack buttons now sit beside equipped weapons on the character sheet. Ordinary Cultivation checks no longer contain weapon attack controls.
- Weapons have Melee (VIO) and Ranged (GRC) types. Affinity still overrides the default Cultivation. Existing weapons default to Melee: change bows, guns, and other ranged weapons to Ranged.
- Melee reach uses whole metres (minimum 1 m), including range modifiers. Ranged attacks use the listed weapon range. Optional distance/elevation entries check reach using the larger distance (p.71); no automatic map measurement is claimed.
- Attack options calculate Flanking, Cleave, Cover, Concealment, Called Shot, Surprise, High Ground, Ultragravity, Sabotage, Dual Attack, and ranged-distance modifiers (pp.66, 70–71, 73).
- Multi-target attacks roll once and spend one tracked ammo per target. Area patterns waive Cleave, not ammunition use. Chat separates ordinary and Critical Strikes and lists situational modifiers.
- Dual Attack applies -3: roll each weapon separately and keep the better result. Defense, Clashes, wounds, environmental hazards, and forced movement remain table-resolved.

# v 0.1.15

## Sheet editing and Health Sutra

- Weapon range, damage type, modifiers, and total attack bonus update their previews while typing. Saved weapon edits refresh the sheet.
- Affinity uses the same dropdown style as other choices. Existing custom entries remain selectable.
- Renamed Record to Weapon stats / Item stats: quantity, Carry cost, and base attack bonus remain functional. Base attack bonus changes the total; it does not select an upgrade tier.
- Rich-text fields open ready to type, have room for the toolbar, and reference their owning document. Use the editor Save control (or Ctrl+S) to save text.
- Click Health Sutra boxes to mark or heal wounds. Starting characters have three Hale, two Bloody, one Critical, and a terminal Knocked Out indicator. Token health uses the same stored value.
- Bloody (3–2 Health) applies -1 to checks, Critical (1 Health) applies -3, and Knocked Out (0) blocks checks. Additional maximum Health adds Hale boxes, per p.67.
- No damage is assigned automatically; Armor and target damage resolution remain manual.

# v 0.1.14

## QA corrections, Active Effects, and weapon behavior

- Corrected the three Gear Slots to Right Hand, Left Hand, and Fashion. Fashion and physical Gear no longer spend Meridians; only internalized Magick and Technicks do.
- Added Accessory items. Accessories always occupy Carry, including while equipped. Readied gear uses its Gear Slot; stowed items and spare copies occupy Carry.
- Existing inventories receive a one-time correction with recorded Meridian refunds, a recovery snapshot, and visible Carry overages instead of deleted items.
- Replaced Notes and Description textareas with Foundry rich-text editors.
- Added Active Effect creation, configuration, enable/disable, and removal on actor and item sheets. Equipment effects transfer only while equipped; temporary bonuses stay separate from saved base ratings.
- Added shared Ammo stacks, weapon ammo selection, and per-attack switching. Selected ammo is spent automatically, with one Carry slot per nonempty type.
- Added rule-linked modifiers and inherent properties: attack dice, Precise rerolls, two-hand requirements, movement/range changes, Affinity-based Cultivations, and pre-Defense Wound summaries. Context-dependent conditions remain reminders.

# v 0.1.13

## Weapon MAG cost

- Added a Cost section to Weapon items with an editable Magnetite (Mag) value, defaulting to 0. The field records the price; it does not spend character currency.

# v 0.1.12

## Weapon mods, ammo, upgrades, and Affinity

- Added simple Weapon Mod items with Name and Description. Drop them into a weapon's Mods slots; hover or focus the mod name to read its description.
- Added optional Ammo type and quantity. Weapon attacks spend one round; empty ammo blocks the roll with “Out of ammo, please reload or use another weapon”.
- Added Refined (+1), Divine (+2), and Immortal (+3) upgrade paths with automatic descriptions, attack dice, DR, and 2/3/4 mod slots. Base weapons have one slot.
- Added optional Affinity text with book-listed suggestions. An Affinity occupies one mod slot. Occupied slots cannot be lost through a downgrade.

# v 0.1.11

## Roll message text fix

- Replaced a corrupted separator before Success/Failure with a plain hyphen. New roll messages display cleanly; existing chat messages retain their original text.

# v 0.1.10

## Equipment costs and weapon attacks

- Fashion, Technick, Gear, and Magick have editable Meridian costs (default 1) and Equip/Unequip/Remove controls. Equipping spends Open Meridians; unequipping restores the amount deducted.
- Weapons have an Attack bonus and use quantity × carry slots when equipped, without spending Meridians. Carry is now labeled Carry remaining.
- Checks have an optional Attack checkbox and equipped-weapon selector. Only the selected weapon adds its bonus to the dice pool.
- Equipped edits apply cost differences; insufficient capacity blocks the change. Existing equipped Fashion must be unequipped/re-equipped to begin paying its Meridian cost.
- Added Magick as an item type; existing Technique items are now labeled Technick, retaining their data. See [Equipment](docs/equipment.md).

# v 0.1.9

## Fashion

- Added a Fashion item type with Armor increase, Ardor increase (both default 0), and Abilities notes.
- The character sheet has Fashion Equip, Unequip, Open, and Remove controls. Equipping increases maximum and remaining Armor, plus maximum and available Ardor. Changes to equipped bonuses apply only the difference.
- Removing Ardor capacity that is already burnt or installed is blocked with a friendly message.
- Existing Armor items remain available under the Armor type. See [Fashion](docs/fashion.md).

# v 0.1.8

## Job drop area and Licenses

- Replaced the Job text field with a dedicated drop area. Jobs appear separately from Gear & Abilities.
- Ordered Cultivations VIO, DIA, GRC, SAV, WRD, SPI across sheets and prerequisites.
- Added License items with 15 sects, each offering Novice, Expert, and Master, editable Cultivation/Sidhi prerequisites, and Notes.
- Qualified License drops equip automatically. Unqualified drops or equip attempts show “You do not meet the qualifications of this license”. Owned Licenses have their own section and dim when requirements are unmet.

# v 0.1.7

## Jobs and Cultivations

- Added draggable Job items with Body/Mind selection and six Cultivation values.
- Applying or replacing a Job sets its base ratings while retaining manual adjustments. Editing an owned Job recalculates the character too; repeated drops do not stack.
- Renamed the currency label to **Magnetite (Mag)**.
- Removed the creation-wizard plan; character creation remains manual apart from applying Jobs.

# v 0.1.6

## A face for your Wanderer

- Character sheets have a clickable portrait in the upper left, with the red heading **THIS IS 1 SWORD AGAINST HEAVEN** above it. Click the portrait to choose an image.

# v 0.1.5

## Cleaner sheets and shared Wanderer data

- Removed sheet version labels and instructional filler.
- Negative roll adjustments show a non-blocking caution and still roll. Pools of zero or less use two d6 and keep the lower die. Cultivation ratings remain nonnegative.

# v 0.1.4

## Linked Wanderers

- New Wanderers default to linked tokens; NPC copies retain independent data.
- Added an initial recovery workflow for existing map Wanderers. The duplicate-entry approach was replaced by in-place sync in 0.1.5.

# v 0.1.3

## Cultivation abbreviations

- Added Violence (Vio), Grace (Grc), Dialectics (Dia), Savvy (Sav), Word (Wrd), and Spirit (Spi) to sheets, check dialogs, and roll messages.

# v 0.1.2

## Reliable update loading

- Added versioned script loading to prevent older cached code from surviving an update.
- Added temporary sheet version labels for troubleshooting; removed in 0.1.5.
- Health/Ardor limits and correct dice behavior were confirmed by user testing on Foundry 14.367.

# v 0.1.1

## Resource limits and clearer rolls

- Added input limits for Health, Armor, and Ardor allocations.
- Made the two-dice, keep-lowest fallback explicit for nonpositive pools.
- Updated chat visibility handling to Foundry v14's message-mode API.

# v 0.1.0

## The foundation

- Added Wanderer and NPC sheets, Item records, Cultivation checks, and manual resource tracking.
- Established rules 2.0.3 as the source for implementation.
