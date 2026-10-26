import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  initImageHighlight,
  initMenuHighlight,
} from "./menu-highlight.js";
import {
  connectLoFi,
  getAudioContext,
  playAudio,
  playMusic,
} from "./audio-effects.js";

let audioCtx = null;
let jumpscareAudioBuffer = null;
let errorHandled = false;

async function handleLoadingError(error) {
  if (errorHandled) return;
  console.warn("Loading error handled gracefully:", error);
}

async function loadJumpscareAudioBuffer() {
  if (jumpscareAudioBuffer) return jumpscareAudioBuffer;
  try {
    if (!audioCtx) {
      audioCtx = getAudioContext();
    }
    const response = await fetch("wega-jumpscare.mp3");
    if (!response.ok) {
      throw new Error(`Failed to load wega-jumpscare.mp3: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    jumpscareAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return jumpscareAudioBuffer;
  } catch (err) {
    console.warn("Could not decode jumpscare audio buffer", err);
    return null;
  }
}
const SKY_FRAME_COUNT = 50;
const SKY_FRAME_INTERVAL = 100;
const DECISION_TIMEOUT = 10000;
const ANGRY_SOUND_PRE_DELAY_MS = 500;
const ANGRY_SOUND_POST_DELAY_MS = 1500;
const REGULAR_DECISION_METER_DELAY_MS = 1000;
const JOHN_DOE_DECISION_METER_DELAY_MS = 800;
const JOHN_DOE_DECISION_SOUND_INTERVAL_MS = 1500;
const REGULAR_DECISION_PLAYER_METER_INCREMENT = 10;
const JOHN_DOE_DECISION_PLAYER_METER_INCREMENT = 30;
// The gray floor runs from the far edge to the foreground wood. Keep David's
// visible shoes on that surface while changing his depth and size.
const DAVID_BACK_Y = 65;
const DAVID_MID_Y = 76;
const DAVID_FRONT_Y = 101;
const DAVID_NEAR_DESK_Y = 90;
const DAVID_SHOE_OFFSET = 1;
const DAVID_PAPER_BLOCK_LEFT = 28;
const DAVID_PAPER_BLOCK_RIGHT = 72;
const DAVID_PEEK_CHANCE = 0.72;
const DAVID_PEEK_ROTATION = 12;
const DAVID_EXIT_CHANCE = 0.16;
const DAVID_EXIT_SPEED = 18;
const DAVID_FRONT_CHANCE = 0.78;
const DAVID_ROTATION_TRANSITION_MS = 120;
const DAVID_RETURN_MIN_DELAY = 2800;
const DAVID_RETURN_MAX_DELAY = 6200;
const DAVID_APPEARANCE_DELAY_AFTER_HELP = 3200;
const NEXT_NPC_HELP_HOLD_DELAY = 2000;
const NEXT_PERSON_DELAY_AFTER_FIFTH_HELP = 500;
const EIGHTH_HELP_APPEARANCE_DELAY = 1500;
const NEXT_PERSON_DELAY_AFTER_DAVID_FURIOUS_HELP = 1000;
const DAVID_JUMPSCARE_CHANCE = 0.24;
const DAVID_JUMPSCARE_DURATION = 0.72;
const DAVID_JUMPSCARE_SETTLE_DURATION = 0.4;
const JUMPSCARE_ZOOM_DURATION = 0.65;
const JUMPSCARE_STUTTER_DELAY = 500;
const POST_JUMPSCARE_DELAY = 300;
const MENU_MUSIC_START_TIME = 18;
const MAIN_VERSION = "1.008";
const DAVID_CRASHOUT_STORAGE_KEY = "david-crashout-achievement";
const BUTTON_PRESS_FEEDBACK_MS = 240;
const PRE_TRIGGER_DELAY_MS = 0;
const EXPLOSION_PHASE1_EXPAND_MS = 100;
const EXPLOSION_PHASE3_COLLAPSE_MS = 250;
const EXPLOSION_TOTAL_VFX_MS =
  EXPLOSION_PHASE1_EXPAND_MS + EXPLOSION_PHASE3_COLLAPSE_MS + 50;
const EXPLOSION_TOTAL_SEQUENCE_MS =
  PRE_TRIGGER_DELAY_MS + EXPLOSION_TOTAL_VFX_MS;
const EXPLOSION_FALLBACK_COLOR = [0, 162, 232];
const SETTINGS_HELP_MESSAGE =
  "Sorry, Roblox Entertainment hasn't implemented this yet cuz they are lazy.";
const SETTINGS_VOLUME_HELP_MESSAGE = "Fine heres the volume settings";
const EXIT_HELP_MESSAGE = `Á̷̡̨̢̢̡̢̛̛͖̗̺̤̣̭͖̫̗̠̣̹̮̳̱̯̰͔̤̣̲͎̦͎̥̬̠̘̼̮̹̻͙̬̭̹͕̖͉̘͒͂̇̇͆̈́̑̊̐̈́̑̿͗͑͋̇͂̅̇́͑̆̒̎͂̉̊̈́̿̈́̂́͒͆̂̓͑͐̑͌̋̂̓͛͆̐͑̓̋̍̏̾͘̚̕͘͘̕͜͝ͅR̶̯͓̙͖̲͚͔̰̬̲̪͇̪̺̦̲̟̫̞͙̠͙̰̖͇͍͇̠͔̳͇̞̖͖̣̠̟̙̥̙̣͉̫̫͚̩͚͔͈͓̯̱̹͍͉͕͔̗̗̬͉͇̠͔̠͙̀̓̆͗͆̽̏̏̃̃͂́̈́̋̅͌̏͂͂̾́͋̎̓̌͘̚̚͜͜͜͝͠͝͠͝͠͝ͅĘ̶̡̡̧̢̮͖̗͍̤̹̟̦͔͍͔͚̼̤̘̥̗̻̪͙̰̼̥̣͖̙̹̳͕͚̖̤̮̺͇̘͓͓͔͎̮͙͙͇̟̠̞͔͔̙̱̱̜̙͚̯̻̞̮̍͑̐̀̊̽̒̐̐͋̄̐͒͑̎̑̂͘͝ͅ ̴̡̢̥͉͔͎̘̣͓̪͙̠̝̰͉̳̳̩̻͇̱͕̫̜͈̺̜͉͈̞̌͌̓̀̿͆͂̓͆̅̈́̽͌͒͂̾̔͊͂͑̊̏̉͝͠͝͠͝ͅͅY̷̨̡̛̮͉̣̼̻͕̯̲̜̟̌͑̊̅̽́̍͛̍̿̇̓̑͐̌͆̿̋͂̋̔͛̋͐͑͑͂̎̈́̓̂͑̾͋̎̀̌́̀͊͊̈́̉̚̕̕͝͠͝Ơ̵̡̢̡̧̡̛̝̥͔̳̲̣͈̭͓͔̟͍͈̟̥̲͉̮̳̣̭̬̯͇̙̟͙̪̰̯͎̣̤̝͚̮̼̟̬̮̰̤͚̙͈̩̘͓̦̯̬̖̟̖̲͍̱͇̦̊̀́͗͆̑̃͜ͅU̴̡̧͎̜̥̯̫̜̘̺̙̳͖͍̣̰̟͈̫̯̠̫̇̑͋̔͆̋̋̕ ̴̨̢̧̨̢̢̣͖̪͙̝̩̺͉̲̺̫̩͉̲͈̟̙̯̲̳͎̠͙̼͖̬̺̜͔̹̳̟̰̣̰̦̰͙̲̭̟̳̩͖̠̠͉͖̥̔̇̍͛̐̓͂͌̎͗̀͛͑̇̒̐͛̔̀̏͘͜͜͜͠͝ͅŞ̶̧̡̡̧̛̛̝̜̖̮͎͖̟͚̥͍̖̤̟͖͈͎̣̞̙̗̞̘̞̠̼͖̦͎̝͍͔̩̗̖̪͕̦̤̲̬̗̖̻͈͗̀̈͆̂́̍͛̄̽̌̈́̅̄́̋̂̋́̊͆͋͗͆̉́̈́̐̿̊̔́̽̒͌̀̂̆̈́̄̃̎͗̒͒̅̏̀̐̃̍̍͌́̈́͂͂̕̕̕̚̕͘͜͝͠Ư̶̢̨̢̧̨̧̡͚̯͕͚͍̞̥͎͎̹͓͈̼̖̲͚̼̱̗̜̲̥͓͓̗͍̥̳̜̩͎̼̘̯̬͙̝͍̗͖͎̜̖͔̩̙̌̅̉̀̐͋͗̑̂̔͊̅̈́̅͑̂̅̎̐̏́͂̐͛͆̒̀̌̾̔̓͐̓͛̀̾̋̚͠͠͝͝͝ͅͅͅR̶̢̨̡̧̨̢̛̬̙̪͔͍̬̪̩͎͈̬̩̪̩̝͓̞͈͍͚̮͕̦͓̻̝͍̥̤̘̹͓̤̬̮̫͓̺̩̺̯̟̈́̍̈́̿̌̇͗͆̾͑͆͒̀̈̒̌͋̃̎͌͐̀̈́͒̑̇͊̾͐̈̔̂̇͒̄̇͜͝͝͝ͅĘ̴̧̢̡̛̯͕̩͚̰̙̻̟̬͙̰͕̗̗̹̬͚̫͕̝͖͉̝̘̼̩͈̰̜͍̳̮̲͓̖͙͓̣̱̞̫̥̹̹͍̟̱͙̯̪̭͍͉̪̳̥͔̻̬̿̇̋́̃͆̿̐̈́̂͊͌͑̔̏̅̽̋̓̿̏͑͒͊̃͛͊̾̂̊̔̿͒̑̂̔́͂̂̿̾̾͗͊͂̃͂͌͒̕͘̕͘͜͜͝͝͝͝ͅ ̸̢̢̨̢̙̗͕̮̟̩̬̱̝̥͖̩̠̪̙̥̯̳̼͚͎̠̲̳̤̯̜̪̣͖̻͖̱̳̖̩̬͓̻͖̝̪͒̈́̔̊̈́̎̓͊̊̄̑̓͐̓̀̆̈͐̃̊́̓̆̃͌͛̽́̈́̂͑̅̂̀̌̚̚̚͘͘͘̚̕̕͘͜͜͝͠͝͝ͅͅͅŸ̷̡̨̘͚͔͖̝̮͓̣͈͈̼̹̣͎́̔̍͛̋̈̂̾̓́̉͂̒̀̈̃͛̓̑͌̑͘͜͠͝O̸̡̳͍̟̝͚̜͇̖͈̞̠̻͎̞͓̔̄̐̀̈̈́̃͜U̶̧̡̧̢̧̨̡̻͖̪̠̬̙̲̣͎͚̼̙̖̞̤͓̲̖̙̟̺͕̜̺̖̝̱̗͎͎͖̟̭̰̲͎͇̬̭͖̳̗̭̤̾̓͛͒̒̈́͐̉̔͆́͂̎̎̇̏͛́̓̊̿͋̇̐͗͜͜͝ͅ ̷̧̧̨̡̛̛̜̞̱̹͔̺̣͖̰̳͙̝͓̠͓̗̯͇̩̘̟̜̩͇͇̺͖̰̟̠͓̱͉͔̣͖̹̟̻̠̩͉̺͎̦̱̮̙̰͐̾̑̄̑̌̅̊͛̈́̌̐̏͋̈́̽̋̉̒̊͗̆̏̂͐͐͊̄͝ͅͅW̴̨̛̛̗̫̙͖̦̙̙̺͂̓͑̊͌͊̀̈́̏͐́͋̄̈̒̍͌̎͑̏̇͛̓̽̀̌̈́̓̐͗͑̀͐̑̆̂̂͋̂̓͗̆̈́̿̚̕̚͘͘͜͠͝͠Ą̵̛̛̓́͌̽̄̉̎͊̔̾̿̋̂͊̉̈͌̃̃́͐͌̑́͗̿͗̿̐̉̽̔̈̓͒͐́͒̋͐̈́͊̄͘̚̕͝͠Ņ̶̡̨̡͎̻̪̘̞̙͉̣͚̹̝̦̫̳͇̝͓̥̘̟̺̋̋̉̈́͗̍̋̂̓̓͗̉́͌̑́̋̆̎̆̏͗͆̌̓͋̓̈́͋̿̾͒̏̅͐̄̈́̔̃̓̿̕̕͜͠͠͠͝͝͝T̵̡̡̨̨̛̛͓͎̘̘͉̯͇̱̪̞̪̰̫̲̙̱̹̭͈̗̝̥͍͖͍̩̣̪̥̻̗͓͚͎̣̘̯̥̜̹̭͔̬͍͍̆̆̽͂̍̀͒͗̏̑̉͂̇͗̅̋̒̊̈́̏͐͌̀̌̐̓́̒̏́̓̓̍͝͝ ̷̹̞͔̹̥͚̪̝̟̪̪͑T̸̗̞̞͍͙́̾̿̎̌͊̈́̄̓̀̇̀̍̓͂͗́̀͗̇̋͊́̇̀̓̓́̎̇̏̀̏̐͊͛͂̄̑̍́́͐̈́̎́̏̽̀̔̿͛͗́̏̅͛̽̇͌͗̈̚͝͠͠͝Ơ̴̧̡̡̢̢̧̨͎͚͖̯̠̮͈̞̺̺̭̭̬̰̙̥̠̺̜̟̬̯͖͓͓͙̤̳̲̬͍̘̙̣̯̻̝̠̦̣̻̪̜̬̻͎̫͚͚̏͋̃̈͒̀͌͜͠ ̷̢̧̨̛̜̺͖̣̬̻̦͈̱̪̠̜͔̥͓͎̟̫͚͕̦̤̮͚̞̩̱̻̼̩̞͇͚̳̝̬̥̗̗͍̗͍̩͍͇͚̏͐̒͗͂̒̍̂̌̑̉͒̀̒̀͑̈́̇̚͘̚̚ M̸̡̢̡̡̡̨̢̡̡̨̧̛͍̤̖̳̳̭̠̲͉̻̹͖̺̬̙̘̙͇͓̝̺̖̝̣̠͓̲̞͖̹̺͙̝̫̹̗̳͍͈̲͖̤̦̠̭̣̜̜̦̲͌̂̄̉͂̀́͛̀͂̊̓͑̓̿̓̑͘͘͜͝͝ͅͅO̵̡̨̧̖̼̮͙̼̜̗̱̦̦͎̱̥̱̭͈͈̝̳͍̗̪͚̺͇̙̱̦̻̠̣̼̹̩͍͉̬̟̩̲̳͔̰̝̰̘̩̱̎̋̍̑̈́̓͗̑̅̔́̈́̚ͅḒ̶̨̢̨̨̡̧͚̥̣̱̗͖͕̘̝̯̫̻͎̦̞̟͚͍̤̗̺̣̝̹̩̟͙̠̞͖͔̘̬̮͈̥̜̭̹̩̪̻̍̾̔̍̅́͌̈͂̽͜͜͜ͅͅͅͅ ̸̧̧̛̛̥̪̲͍̟͓̣̪͇͇̞̣͔͙̺̱̟̠̲̲̰̳͔̖͖̼̻̬̼̳̱̰̬̼̖̖͖̩̠̥͍͕̲͓̗̟͓̗͍̊̈́̎̓͊̓̄̀͊́͗̔̅͆̈́͛̅̈́̄̓̌͋́̂͐͑̾̈͒̓̂̀͘̕̕͜͝͝͝͡ͅÕ̴̢̖̆̆̐̊̊̐̊̾̐̀̇̚̚̕̚͝͠Ư̸̧̡͕͙̤͚̠͇͚͖̗̤̥̗̹͈̬͚̞̘̪̮̞͓̘͙̭͓̟̯̺̯̻̠̼̫͖̊̾̊̽̆̒̆̍̆̉̈̇̃͘͝͝R̵̜̲̅̾̄̄̆͐͠ ̷̨̧̧̧̧̧͈͉͇̻̙͔͕͔͓̞͙͍̠̟̟͉͈͓̙̪̦͉̼̭̟̞͕̮̗̭͈͉͔̩̲̠͔͓̰̥̺̫͉̟̪̩̥̣͋̐̈́͊̿͋̈̃͊̈́̿̏̌̍̈́̃̎̆̐̽͌́̏̈́́̓̃̆̌́̉̍͐̒͂̿͒̈́͗̇̕͘̕͜͝͠͝͝ͅG̴̢̛̳̩̺͍̱͍̠̳̼̖͕̬͉͙̙̪͕̲͓̯̤͎͛͊̓͒͂̿̈̔͐͆̾̒̉͗̇̓̒̄̂̓̋̈̽̍̿̓͌̂̀̄͂̈́̽̉̿̅̇̔͂̾͒̎̈́́̃̒͐̀̃̄̇̀̀̀̅̋̀͛̓̆͘̚̚̕͠Ą̸̢̧̢̨̗̳̗̘̻̖̹͈͈̰̼̻̣̳͔̹̞͍̺͇͈͎̣̠̼̥̬͎̪̜̘̝̹̺͈͇͉͔̩̝͖̥̜͎̝̩̻̹̲͖̦͇͔̹̤̬̥͚̣̹̲͚͚͂̈̾̓̿̇̿̂̓̇͋́̀̀̄̄̇̑̓́̅̽̆̌̅̈́͂̽͛̃̊̈́̉̐͒̌́̿̆̈̌͆͌̄̀̍̔̏̆̾̎͘̕̕̕͘͝͝͠͝M̶̢̧̰̣̣͖͎̯͕̣̥͎͔͇̲̰̻̪͙̦̓̈́͋͐̏̅͋̾̈́͗̐̿͐̈́͆̾̔͑̈̀̾̑̋͑̈́͒̍͛̋͒̈́͐́̑́̾́̑̿̀̍͑̐̕͠͠͠Ȩ̶̢̡̧̝͎͇̦͉̰̬̟̖̮͓̮͔̅̐̈́̈́́͗̾͆̏̀̍͋̓̄̽́̾̋̉̆͂̉̔̆̐̑̄́̏͗͠͝͝͝ͅ?̸̡̢̡̡̣̠̖͚̤̗͕̹͖̭̝̖̦͖̻͔̤͈̮͔̘̜̹͙̭̯̦̬̞̰̲̠͔̝͎̥̗̞̗̠͍͖̣̝̤̝̹̖͎͎̺̊̈̈́̊̽̄̀̅̒̈̅̇́̑̆̾͊̌́́̾̈́̊̐́̒͌͂͋̓͗̑̅͗͛̆̋̑͐̎́̿̂̓͂̎̂͛̀̉̕͝?̷̨̛̛̖̼̣̟̃̃͛̑̽́͛̈́͌̿̽͛͒̈́͑͂̓́͗͆͂̋̂́̄̿̋͒̽̏̎́̈́͒́̆̀̑̓̈́̉͒͐́̊̊̀̿̀̎͐͒͗̐̎͆̆̏͑̚̚͘͘͝͝͝͝͝`;

function davidScaleForDepth(y) {
  const depth = Math.max(
    0,
    Math.min(1, (y - DAVID_BACK_Y) / (DAVID_FRONT_Y - DAVID_BACK_Y)),
  );
  return Math.round((0.42 + depth * 0.76) * 100) / 100;
}

function davidEntryTargetX(entersFromLeft) {
  // Keep the re-entry destination on the side he came from so he never
  // appears to pop into the middle of the room.
  return entersFromLeft
    ? 18 + Math.random() * 24
    : 58 + Math.random() * 24;
}

function davidPeekRotation(x, y, paperVisible) {
  const paperBlocksDavid =
    paperVisible &&
    y >= DAVID_NEAR_DESK_Y &&
    x >= DAVID_PAPER_BLOCK_LEFT &&
    x <= DAVID_PAPER_BLOCK_RIGHT;

  if (!paperBlocksDavid || Math.random() >= DAVID_PEEK_CHANCE) {
    return 0;
  }

  return Math.random() < 0.5 ? -DAVID_PEEK_ROTATION : DAVID_PEEK_ROTATION;
}

function skyFrameSrc(index) {
  return `spr_maingame_sky_bg_${index}.png`;
}

function candidateImageSrc(type) {
  if (type === "acorn") return "acorn.png";
  if (type === "oakley") return "Oakley_2021.webp";
  if (type === "noob") return "John_Doe_and_Jane_Doe_29.webp";
  if (type === "n00b112") return "N00b112.webp";
  return "116d2ff59959832c66f8f425204dc858.png";
}

function candidateClassName(type) {
  if (type === "acorn") return "acorn-character";
  if (type === "oakley") return "oakley-candidate";
  if (type === "noob") return "noob-candidate";
  if (type === "n00b112") return "n00b112-candidate";
  return "";
}

function candidateAlt(type) {
  if (type === "acorn") return "Acorn character";
  if (type === "oakley") return "Oakley character";
  if (type === "noob") return "Noob character";
  if (type === "n00b112") return "N00b112 character";
  return "Bacon character";
}

const BAN_REASON_IDS = [
  "hi",
  "family",
  "yes",
  "repeat",
  "blank",
  "fuckyou",
  "lovegame",
  "idiot",
];
const BAN_REASON_IDS_WITHOUT_FAMILY = BAN_REASON_IDS.filter(
  (reason) => reason !== "family",
);

function banReasonForCandidate(type) {
  // Reasons are independent from characters, except the family message,
  // which belongs exclusively to the Bacon girl.
  if (type === "bacon") return "family";
  const reasons = BAN_REASON_IDS_WITHOUT_FAMILY;
  const index = Math.floor(
    Math.random() * reasons.length,
  );
  return reasons[index];
}

function banReasonText(reason) {
  if (reason === "hi") return "Hi";
  if (reason === "yes") return "yes";
  if (reason === "lovegame") return "I love this game";
  if (reason === "idiot") return "Your an idiot";
  return "";
}

function isPlayerSafeTerminationReason(reason) {
  return reason === "fuckyou" || reason === "idiot";
}

function isPlayerAngeringAcceptanceReason(reason) {
  return isPlayerSafeTerminationReason(reason);
}

function createModBadgeHoverImage(image) {
  if (!image?.naturalWidth || !image?.naturalHeight) return null;

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const normalizedX = x / width;
      const normalizedY = y / height;
      if (
        normalizedX < 0.16 ||
        normalizedX > 0.84 ||
        normalizedY < 0.3 ||
        normalizedY > 0.74
      ) {
        continue;
      }

      const offset = (y * width + x) * 4;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const darkestChannel = Math.max(red, green, blue);
      const colorRange = Math.max(red, green, blue) - Math.min(red, green, blue);

      // Only recolor the dark, near-neutral pixels that make up “MOD”.
      if (darkestChannel < 115 && colorRange < 45) {
        data[offset] = 255;
        data[offset + 1] = 255;
        data[offset + 2] = 255;
      }
    }
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
}

function meterIconForLevel(level, meter) {
  if (meter === "player") {
    if (level < 25) return null;
    const icons = {
      mid: "mid.png",
      angry: "angry.png",
      veryAngry: "very angry.png",
    };
    const variant =
      level >= 75
        ? "veryAngry"
        : level >= 50
          ? "angry"
          : "mid";
    return {
      src: icons[variant],
      variant: variant.replace("Angry", "-angry").toLowerCase(),
    };
  }

  // Bazuckmeter:
  // Phase 1 (level < 15): null (default face in artwork)
  // Phase 2 (level 15..50): david mid.png
  // Phase 3 (level 51..95): david angry.png
  // Phase 4 (level >= 99): david very angry.png
  if (level < 15) return null;
  const icons = {
    mid: "david mid.png",
    angry: "david angry.png",
    veryAngry: "david very angry.png",
  };
  const variant =
    level >= 99
      ? "veryAngry"
      : level >= 50
        ? "angry"
        : "mid";
  return {
    src: icons[variant],
    variant: variant.replace("Angry", "-angry").toLowerCase(),
  };
}

function rgbCss([r, g, b]) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function mixRgb(first, second, amount) {
  return first.map((channel, index) =>
    Math.round(channel + (second[index] - channel) * amount),
  );
}

function sampleEntityPalette(image) {
  const fallback = EXPLOSION_FALLBACK_COLOR;
  if (!image?.naturalWidth || !image?.naturalHeight) {
    return {
      entity: rgbCss(fallback),
      secondary: rgbCss([255, 230, 40]),
      head: "rgb(255, 70, 130)",
      shoulders: "rgb(0, 220, 255)",
      blue: "rgb(70, 100, 255)",
      yellow: "rgb(255, 230, 40)",
      core: "#ffffff",
      flame: "rgb(255, 100, 0)",
    };
  }

  try {
    const canvas = document.createElement("canvas");
    const sampleSize = 64;
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, sampleSize, sampleSize);
    const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;
    const primaryTotals = [0, 0, 0];
    const secondaryTotals = [0, 0, 0];
    const headTotals = [0, 0, 0];
    const torsoTotals = [0, 0, 0];
    let primaryWeight = 0;
    let secondaryWeight = 0;
    let headWeight = 0;
    let torsoWeight = 0;

    for (let y = 0; y < sampleSize; y += 2) {
      for (let x = 0; x < sampleSize; x += 2) {
        const offset = (y * sampleSize + x) * 4;
        const alpha = pixels[offset + 3] / 255;
        if (alpha < 0.25) continue;

        const color = [
          pixels[offset],
          pixels[offset + 1],
          pixels[offset + 2],
        ];
        const max = Math.max(...color);
        const min = Math.min(...color);
        const saturation = max ? (max - min) / max : 0;
        const isTorso =
          x / sampleSize >= 0.18 &&
          x / sampleSize <= 0.82 &&
          y / sampleSize >= 0.35 &&
          y / sampleSize <= 0.85;

        // Give high priority to the torso / main mesh colors
        const torsoRegionWeight = isTorso ? 3.5 : 0.8;
        const satWeight = 0.4 + saturation * 2.2;
        const weight = alpha * torsoRegionWeight * satWeight;
        const isHead = y / sampleSize < 0.38;

        for (let channel = 0; channel < 3; channel += 1) {
          primaryTotals[channel] += color[channel] * weight;
        }
        primaryWeight += weight;

        if (!isHead) {
          for (let channel = 0; channel < 3; channel += 1) {
            secondaryTotals[channel] += color[channel] * weight;
          }
          secondaryWeight += weight;
        }
        if (isHead) {
          for (let channel = 0; channel < 3; channel += 1) {
            headTotals[channel] += color[channel] * weight;
          }
          headWeight += weight;
        } else if (isTorso) {
          for (let channel = 0; channel < 3; channel += 1) {
            torsoTotals[channel] += color[channel] * weight;
          }
          torsoWeight += weight;
        }
      }
    }

    const average = (totals, weight, fallbackColor) =>
      weight
        ? totals.map((channel) => channel / weight)
        : fallbackColor;
    const primary = average(primaryTotals, primaryWeight, fallback);
    const secondary = average(
      secondaryTotals,
      secondaryWeight,
      [255, 230, 40],
    );
    const head = average(headTotals, headWeight, primary);
    const torso = average(torsoTotals, torsoWeight, secondary);
    return {
      entity: rgbCss(primary),
      secondary: rgbCss(secondary),
      head: rgbCss(mixRgb(head, [255, 64, 128], 0.55)),
      shoulders: rgbCss(mixRgb(torso, [0, 220, 255], 0.58)),
      blue: rgbCss(mixRgb(secondary, [70, 100, 255], 0.55)),
      yellow: "rgb(255, 230, 40)",
      core: "#ffffff",
      flame: "rgb(255, 100, 0)",
    };
  } catch (error) {
    console.warn("Could not sample explosion color", error);
    return {
      entity: rgbCss(fallback),
      secondary: rgbCss([255, 230, 40]),
      head: "rgb(255, 70, 130)",
      shoulders: "rgb(0, 220, 255)",
      blue: "rgb(70, 100, 255)",
      yellow: "rgb(255, 230, 40)",
      core: "#ffffff",
      flame: "rgb(255, 100, 0)",
    };
  }
}

function startMusic(music, { loop = true } = {}) {
  return playMusic(music, { gainValue: 1.6, loop });
}

function playLoudSound(sound, { gainValue = 3 } = {}) {
  return playAudio(sound, { gainValue, volume: 1 });
}

function playPaperSound() {
  const paperAudio = document.getElementById("paper-sound");
  if (!paperAudio) return;
  paperAudio.currentTime = 0;
  // Paper is intentionally played cleanly; do not route it through the
  // shared lo-fi processing used by the other game sounds.
  playAudio(paperAudio, { volume: 1, lofi: false }).catch(() => {});
}

function playExplosionSynthBurst() {
  try {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime;

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(1800, start);
    oscillator.frequency.exponentialRampToValueAtTime(420, start + 0.12);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.12);
    context.resume().catch(() => {});
  } catch (error) {
    // The existing explosion audio remains the fallback when Web Audio is
    // unavailable or blocked by the browser.
    console.warn("Explosion synth unavailable", error);
  }
}

function AngrySteamEffect({ meterType, variant, triggerKey }) {
  const [visible, setVisible] = useState(true);
  const leftVideoRef = useRef(null);
  const rightVideoRef = useRef(null);

  useEffect(() => {
    setVisible(true);
    const speed = 1.8;
    const burstEndTime = 8.8;
    let isMounted = true;
    let timer = null;

    const setupVideo = (v) => {
      if (!v) return;
      v.playbackRate = speed;
      try {
        v.currentTime = 0;
      } catch (err) {}
      const playPromise = v.play();
      if (playPromise) {
        playPromise.catch(() => {});
      }
    };

    setupVideo(leftVideoRef.current);
    setupVideo(rightVideoRef.current);

    const handleTimeUpdate = (e) => {
      if (e.target && e.target.currentTime >= burstEndTime) {
        if (isMounted) {
          setVisible(false);
        }
      }
    };

    const leftV = leftVideoRef.current;
    if (leftV) {
      leftV.addEventListener("timeupdate", handleTimeUpdate);
      leftV.addEventListener("ended", () => {
        if (isMounted) setVisible(false);
      });
    }

    timer = setTimeout(() => {
      if (isMounted) setVisible(false);
    }, (burstEndTime / speed) * 1000 + 300);

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (leftV) {
        leftV.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [triggerKey, variant]);

  if (!visible) return null;

  return (
    <div
      className={`meter-steam-wrap ${meterType}-steam-wrap ${meterType}-steam-${variant}`}
    >
      <video
        ref={leftVideoRef}
        className={`meter-steam-video ${meterType}-steam-left`}
        src="vfx-alpha-matte-1788679900008 (1).webm"
        preload="auto"
        autoPlay
        muted
        playsInline
      />
      <video
        ref={rightVideoRef}
        className={`meter-steam-video ${meterType}-steam-right`}
        src="vfx-alpha-matte-1788679900008 (1).webm"
        preload="auto"
        autoPlay
        muted
        playsInline
      />
    </div>
  );
}

function App() {
  const [rootLoading, setRootLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [helpState, setHelpState] = useState("hidden");
  const [helpStep, setHelpStep] = useState(1);
  const [helpyFaceBlank, setHelpyFaceBlank] = useState(false);
  const helpyFaceClickCountRef = useRef(0);
  const [johnDoeCompleteHelp, setJohnDoeCompleteHelp] = useState(false);
  const [angerLevel, setAngerLevel] = useState(0);
  const [bazuckmeterOverflow, setBazuckmeterOverflow] = useState(false);
  const [playerAngerLevel, setPlayerAngerLevel] = useState(0);
  const [bazuckSteamTrigger, setBazuckSteamTrigger] = useState(0);
  const [playerSteamTrigger, setPlayerSteamTrigger] = useState(0);
  const prevAngerLevelRef = useRef(0);
  const prevPlayerAngerLevelRef = useRef(0);

  useEffect(() => {
    if (
      angerLevel >= 50 &&
      angerLevel < 100 &&
      davidGreenDecisionCountRef.current < 3 &&
      angerLevel !== prevAngerLevelRef.current
    ) {
      setBazuckSteamTrigger((prev) => prev + 1);
    }
    prevAngerLevelRef.current = angerLevel;
  }, [angerLevel]);

  useEffect(() => {
    if (
      playerAngerLevel >= 50 &&
      playerAngerLevel !== prevPlayerAngerLevelRef.current
    ) {
      setPlayerSteamTrigger((prev) => prev + 1);
    }
    prevPlayerAngerLevelRef.current = playerAngerLevel;
  }, [playerAngerLevel]);

  const [pressedButton, setPressedButton] = useState(null);
  const [decisionWarning, setDecisionWarning] = useState(false);
  const [baconState, setBaconState] = useState("hidden");
  const baconStateRef = useRef("hidden");
  const [candidateType, setCandidateType] = useState("bacon");
  const [banReason, setBanReason] = useState("hi");
  const [offensiveItemState, setOffensiveItemState] = useState("hidden");
  const [offensiveItemRaised, setOffensiveItemRaised] = useState(false);
  const [offensiveViewCount, setOffensiveViewCount] = useState(0);
  const [baszuckiJumpscare, setBaszuckiJumpscare] = useState(null);
  const [postJumpscareScreen, setPostJumpscareScreen] = useState(false);
  const [exitHelpVisible, setExitHelpVisible] = useState(false);
  const [exitJumpscareVisible, setExitJumpscareVisible] = useState(false);
  const [settingsHelpVisible, setSettingsHelpVisible] = useState(false);
  const [settingsVolumeDraft, setSettingsVolumeDraft] = useState(1);
  const [endingsVisible, setEndingsVisible] = useState(false);
  const [davidCrashoutUnlocked, setDavidCrashoutUnlocked] = useState(() => {
    try {
      return window.localStorage.getItem(DAVID_CRASHOUT_STORAGE_KEY) === "unlocked";
    } catch (error) {
      return false;
    }
  });
  const [modBadgeHoverSrc, setModBadgeHoverSrc] = useState(null);
  const [davidState, setDavidState] = useState({
    active: false,
    x: 115,
    y: DAVID_MID_Y,
    scale: davidScaleForDepth(DAVID_MID_Y),
    facing: -1,
    rotation: 0,
    exiting: false,
    jumpscare: false,
    transitionDuration: 0,
  });
  const wrapRef = useRef(null);
  const videoRef = useRef(null);
  const menuImgRef = useRef(null);
  const baconImageRef = useRef(null);
  const skyFramesRef = useRef(null);
  const helpImgRef = useRef(null);
  const helpOkRef = useRef(null);
  const helpStateRef = useRef("hidden");
  const helpStepRef = useRef(1);
  const helpWasOpenRef = useRef(false);
  const gameplayWasPausedRef = useRef(false);
  const davidElementRef = useRef(null);
  const davidPauseRef = useRef(null);
  const doneRef = useRef(false);
  const rootLoadingRef = useRef(true);
  const loadingRef = useRef(false);
  const gameStartedRef = useRef(false);
  const startedRef = useRef(false);
  const playGameRef = useRef(() => {});
  const removeMenuHotspotsRef = useRef(null);
  const hasShownHelp4Ref = useRef(false);
  const hasShownHelp8Ref = useRef(false);
  const hasHelpAppearedRef = useRef(false);
  const respawnTimerRef = useRef(null);
  const pressedButtonTimerRef = useRef(null);
  const preTriggerTimerRef = useRef(null);
  const explosionFrameRef = useRef(null);
  const explosionCanvasRef = useRef(null);
  const explosionSmokeRef = useRef(null);
  const explosionSmokeTimerRef = useRef(null);
  const explosionTargetRef = useRef(null);
  const explosionTargetVisibilityRef = useRef("");
  const davidTimerRef = useRef(null);
  const davidWanderTimerRef = useRef(null);
  const davidExitTimerRef = useRef(null);
  const davidReturnTimerRef = useRef(null);
  const davidJumpscareTimerRef = useRef(null);
  const fifthHelpTimerRef = useRef(null);
  const sixthHelpTimerRef = useRef(null);
  const eighthHelpTimerRef = useRef(null);
  const writingAutoOpenTimerRef = useRef(null);
  const ninthHelpTimerRef = useRef(null);
  const jumpscareSourceRef = useRef(null);
  const jumpscareLoopSourceRef = useRef(null);
  const jumpscareGainRef = useRef(null);
  const jumpscareSoundPausedRef = useRef(false);
  const jumpscareSoundEndedRef = useRef(false);
  const jumpscareEndpointTimerRef = useRef(null);
  const jumpscareEndpointDueAtRef = useRef(null);
  const jumpscareEndpointRemainingRef = useRef(null);
  const jumpscareEndTimerRef = useRef(null);
  const jumpscareEndDueAtRef = useRef(null);
  const jumpscareEndRemainingRef = useRef(null);
  const postJumpscareTimerRef = useRef(null);
  const menuMusicRequestRef = useRef(0);
  const menuMusicStartPromiseRef = useRef(null);
  const menuMusicFinishedRef = useRef(false);
  const exitCrashPendingRef = useRef(false);
  const exitJumpscareSequenceRef = useRef(false);
  const settingsHelpPendingRef = useRef(false);
  const settingsClickCountRef = useRef(0);
  const backgroundMusicVolumeRef = useRef(1);
  const decisionTimerRef = useRef(null);
  const decisionDueAtRef = useRef(null);
  const decisionRemainingRef = useRef(null);
  const decisionPenaltyTimerRef = useRef(null);
  const decisionPenaltyMeterTimerRef = useRef(null);
  const decisionPenaltyAudioRef = useRef(null);
  const decisionPenaltyEndedHandlerRef = useRef(null);
  const decisionPenaltyCycleRef = useRef(0);
  const whistleEndedHandlerRef = useRef(null);
  const ohNoEndedHandlerRef = useRef(null);
  const offensiveItemRaisedRef = useRef(false);
  const offensiveItemStateRef = useRef("hidden");
  const writingPlayedRef = useRef(false);
  const davidGreenDecisionCountRef = useRef(0);
  const decisionPhaseRef = useRef("inactive");
  const respawnDueAtRef = useRef(null);
  const respawnRemainingRef = useRef(null);
  const respawnWaitForHelpRef = useRef(false);
  const respawnHelpChainHoldRef = useRef(false);
  const candidateTypeRef = useRef("bacon");
  const angerLevelRef = useRef(0);
  const isBaszuckiJumpscareArmedRef = useRef(false);
  const hasTriggeredJumpscareRef = useRef(false);
  const hasDavidSpawnedRef = useRef(false);
  const davidPosRef = useRef({
    x: 115,
    y: DAVID_MID_Y,
    scale: davidScaleForDepth(DAVID_MID_Y),
    facing: -1,
    rotation: 0,
    jumpscare: false,
  });

  rootLoadingRef.current = rootLoading;
  doneRef.current = done;
  loadingRef.current = loading;
  gameStartedRef.current = gameStarted;
  startedRef.current = started;
  helpStateRef.current = helpState;
  helpStepRef.current = helpStep;
  angerLevelRef.current = angerLevel;
  baconStateRef.current = baconState;
  offensiveItemRaisedRef.current = offensiveItemRaised;
  offensiveItemStateRef.current = offensiveItemState;

  function setBazuckmeterLevel(level) {
    const nextLevel = Math.max(0, Math.min(100, level));
    setAngerLevel(nextLevel);
    angerLevelRef.current = nextLevel;
  }

  function startMenuMusic({ restart = false } = {}) {
    const music = document.getElementById("music");
    if (!music) return;
    if (gameStartedRef.current || loadingRef.current) return;
    if (menuMusicFinishedRef.current && !restart) return;
    if (menuMusicStartPromiseRef.current && !restart) return;

    const requestId = ++menuMusicRequestRef.current;
    if (restart) {
      menuMusicFinishedRef.current = false;
      music.currentTime = MENU_MUSIC_START_TIME;
    }
    const startPromise = startMusic(music, { loop: false });
    menuMusicStartPromiseRef.current = startPromise;
    startPromise
      .then(() => {
        if (requestId !== menuMusicRequestRef.current) {
          music.pause();
        }
      })
      .catch(() => {})
      .finally(() => {
        if (menuMusicStartPromiseRef.current === startPromise) {
          menuMusicStartPromiseRef.current = null;
        }
      });
  }

  function stopMenuMusic() {
    menuMusicRequestRef.current += 1;
    menuMusicStartPromiseRef.current = null;
    const music = document.getElementById("music");
    if (music) music.pause();
  }

  useEffect(() => {
    const music = document.getElementById("music");
    if (!music) return;
    const handleMenuMusicEnded = () => {
      menuMusicFinishedRef.current = true;
    };
    music.addEventListener("ended", handleMenuMusicEnded);
    return () => music.removeEventListener("ended", handleMenuMusicEnded);
  }, []);

  useEffect(() => {
    const isPaused = helpState !== "hidden";
    if (isPaused && !gameplayWasPausedRef.current) {
      gameplayWasPausedRef.current = true;
      pauseBaconRespawn();
      pauseDavidMotion();
      pauseDecisionSequence();
      pauseJumpscareSequence();
    } else if (!isPaused && gameplayWasPausedRef.current) {
      gameplayWasPausedRef.current = false;
      // A scripted Helpy sequence can briefly hide one panel before opening
      // the next one. Keep the pending NPC held across that gap.
      if (!respawnHelpChainHoldRef.current) {
        resumeBaconRespawn();
      }
      resumeDavidMotion();
      resumeDecisionSequence();
      resumeJumpscareSequence();
    }
  }, [helpState, baszuckiJumpscare]);

  useEffect(() => {
    const img = menuImgRef.current;
    if (!img) return;

    let cleanup;
    let initialized = false;
    const doInit = () => {
      if (initialized || !img.naturalWidth) return;
      initialized = true;
      cleanup = initMenuHighlight(img, {
        onPlay: () => playGameRef.current(),
        onSettings: handleMainMenuSettings,
        onExit: handleMainMenuExit,
        onRemoveHotspots: (removeHotspots) => {
          removeMenuHotspotsRef.current = removeHotspots;
        },
      });
    };

    if (img.complete && img.naturalWidth) {
      doInit();
    }
    img.addEventListener("load", doInit);

    return () => {
      if (cleanup) cleanup();
      img.removeEventListener("load", doInit);
    };
  }, []);

  useEffect(() => {
    if (!gameStarted || !skyFramesRef.current) return;

    const frames = Array.from(
      skyFramesRef.current.querySelectorAll(".game-sky-frame-image"),
    );
    if (!frames.length) return;

    let frame = 0;
    let lastTick = performance.now();
    let timer;
    const showNextFrame = () => {
      const now = performance.now();
      const elapsed = now - lastTick;
      const steps = Math.max(1, Math.floor(elapsed / SKY_FRAME_INTERVAL));
      const nextFrame = (frame + steps) % frames.length;
      if (!helpWasOpenRef.current && nextFrame !== frame) {
        frames[frame].style.visibility = "hidden";
        frames[nextFrame].style.visibility = "visible";
        frame = nextFrame;
      }
      lastTick = now;
    };

    showNextFrame();
    timer = window.setInterval(showNextFrame, SKY_FRAME_INTERVAL);
    const resumeSky = () => {
      lastTick = performance.now() - SKY_FRAME_INTERVAL;
      showNextFrame();
    };
    document.addEventListener("visibilitychange", resumeSky);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", resumeSky);
    };
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;
    const timer = window.setTimeout(() => openHelp(1), 2000);
    return () => window.clearTimeout(timer);
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted) return;
    const cityMusic = document.getElementById("city-music");
    const isOpen = helpState !== "hidden";

    if (isOpen) {
      cityMusic?.pause();
      helpWasOpenRef.current = true;
    } else if (helpWasOpenRef.current) {
      if (cityMusic && !hasTriggeredJumpscareRef.current) startMusic(cityMusic).catch(() => {});
      helpWasOpenRef.current = false;
    }
  }, [gameStarted, helpState]);

  useEffect(() => {
    if (
      helpState === "hidden" ||
      !helpImgRef.current ||
      !helpOkRef.current
    ) {
      return;
    }

    return initImageHighlight(helpImgRef.current, {
      // The OK control is round in the source artwork. Keep the mask aligned
      // to that shape so the surrounding panel never lights up.
      region: {
        // Tight to the black OK! lettering inside the button.
        x: 390,
        y: 330,
        w: 54,
        h: 27,
        pixelMode: "ok-text",
      },
      target: helpOkRef.current,
    });
  }, [helpState]);

  useEffect(() => {
    return () => {
      window.clearTimeout(respawnTimerRef.current);
      window.clearTimeout(pressedButtonTimerRef.current);
      window.clearTimeout(preTriggerTimerRef.current);
      cleanupExplosionOverlay();
      window.clearTimeout(davidTimerRef.current);
      window.clearTimeout(davidWanderTimerRef.current);
      window.clearTimeout(davidExitTimerRef.current);
      window.clearTimeout(davidReturnTimerRef.current);
      window.clearTimeout(davidJumpscareTimerRef.current);
      window.clearTimeout(fifthHelpTimerRef.current);
      window.clearTimeout(sixthHelpTimerRef.current);
      window.clearTimeout(eighthHelpTimerRef.current);
      window.clearTimeout(writingAutoOpenTimerRef.current);
      window.clearTimeout(ninthHelpTimerRef.current);
      window.clearTimeout(jumpscareEndpointTimerRef.current);
      window.clearTimeout(jumpscareEndTimerRef.current);
      window.clearTimeout(postJumpscareTimerRef.current);
      stopWorkWhistle();
      stopWritingSequence();
      const ohNoAudio = document.getElementById("oh-no-sound");
      if (ohNoAudio && ohNoEndedHandlerRef.current) {
        ohNoAudio.removeEventListener("ended", ohNoEndedHandlerRef.current);
      }
      ohNoEndedHandlerRef.current = null;
      jumpscareEndpointDueAtRef.current = null;
      jumpscareEndpointRemainingRef.current = null;
      jumpscareEndDueAtRef.current = null;
      jumpscareEndRemainingRef.current = null;
      stopJumpscareAudio();
      stopDecisionSequence();
    };
  }, []);

  function waitForAudio(audio) {
    if (!audio) return Promise.resolve();
    if (audio.readyState >= 2) return Promise.resolve();

    return new Promise((resolve) => {
      let finished = false;
      const cleanup = () => {
        audio.removeEventListener("loadeddata", finish);
        audio.removeEventListener("canplay", finish);
        audio.removeEventListener("canplaythrough", finish);
        audio.removeEventListener("error", onNonFatal);
      };
      const finish = () => {
        if (finished) return;
        finished = true;
        cleanup();
        resolve();
      };
      const onNonFatal = () => {
        if (finished) return;
        finished = true;
        cleanup();
        const src = audio.currentSrc || audio.src || audio.id || "audio";
        console.warn(`Non-fatal audio load: ${src}`);
        resolve();
      };
      audio.addEventListener("loadeddata", finish);
      audio.addEventListener("canplay", finish);
      audio.addEventListener("canplaythrough", finish);
      audio.addEventListener("error", onNonFatal);
      if (audio.readyState >= 2) {
        finish();
      }
      window.setTimeout(finish, 3000);
    });
  }

  function waitForVideo(video) {
    if (!video) return Promise.resolve();
    if (video.readyState >= 2) return Promise.resolve();

    return new Promise((resolve) => {
      let finished = false;
      const cleanup = () => {
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("canplay", finish);
        video.removeEventListener("canplaythrough", finish);
        video.removeEventListener("error", onNonFatal);
      };
      const finish = () => {
        if (finished) return;
        finished = true;
        cleanup();
        resolve();
      };
      const onNonFatal = () => {
        if (finished) return;
        finished = true;
        cleanup();
        const src = video.currentSrc || video.src || video.id || "video";
        console.warn(`Non-fatal video load: ${src}`);
        resolve();
      };
      video.addEventListener("loadeddata", finish);
      video.addEventListener("canplay", finish);
      video.addEventListener("canplaythrough", finish);
      video.addEventListener("error", onNonFatal);
      if (video.readyState >= 2) {
        finish();
      }
      window.setTimeout(finish, 3000);
    });
  }

  function waitForImage(src) {
    return new Promise((resolve) => {
      const image = new Image();
      let finished = false;
      const cleanup = () => {
        image.onload = null;
        image.onerror = null;
      };
      const finish = () => {
        if (finished) return;
        finished = true;
        cleanup();
        resolve();
      };
      const onNonFatal = () => {
        if (finished) return;
        finished = true;
        cleanup();
        console.warn(`Non-fatal image load: ${src}`);
        resolve();
      };
      image.onload = finish;
      image.onerror = onNonFatal;
      image.src = src;
      if (image.complete && image.naturalWidth > 0) {
        finish();
      }
      window.setTimeout(finish, 3000);
    });
  }

  useEffect(() => {
    let mounted = true;
    const preloadRootAssets = async () => {
      try {
        const introMusic = document.getElementById("music");
        const menuClick = document.getElementById("menu-click");
        const menuHover = document.getElementById("menu-hover");
        const steamVideo = document.getElementById("steam-video");

        await new Promise((resolve) => requestAnimationFrame(resolve));
        await Promise.all([
          waitForImage("hand_cursor.png"),
          waitForImage("hand_cursor_click.png"),
          waitForImage("menu.png"),
          waitForAudio(introMusic),
          waitForAudio(menuClick),
          waitForAudio(menuHover),
          waitForVideo(videoRef.current),
          waitForVideo(steamVideo),
        ]);

        if (mounted) {
          setRootLoading(false);
          // Automatically start the intro without requiring "tap to start"
          startExperience();
        }
      } catch (err) {
        if (mounted) {
          handleLoadingError(err);
        }
      }
    };
    preloadRootAssets();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleGlobalInteraction = () => {
      if (!started && !rootLoading) {
        startExperience();
      } else {
        const video = videoRef.current;
        if (video && started && !done && video.paused) {
          video.play().catch(() => {});
        }
        const music = document.getElementById("music");
        if (
          music &&
          started &&
          done &&
          !gameStartedRef.current &&
          !loadingRef.current &&
          !exitHelpVisible &&
          !settingsHelpVisible &&
          music.paused
        ) {
          startMenuMusic();
        }
      }
    };
    window.addEventListener("pointerdown", handleGlobalInteraction);
    window.addEventListener("keydown", handleGlobalInteraction);
    return () => {
      window.removeEventListener("pointerdown", handleGlobalInteraction);
      window.removeEventListener("keydown", handleGlobalInteraction);
    };
  }, [started, rootLoading, done, exitHelpVisible, settingsHelpVisible]);

  function beginGame() {
    if (!doneRef.current || loadingRef.current || gameStartedRef.current) return;
    loadingRef.current = true;
    stopMenuMusic();

    window.setTimeout(async () => {
      try {
        const introMusic = document.getElementById("music");
        const cityMusic = document.getElementById("city-music");
        const helpNotify = document.getElementById("helpy-notify");
        const hiAudio = document.getElementById("hi-sound");
        const paperAudio = document.getElementById("paper-sound");
        const writingAudio = document.getElementById("writing-sound");
        const explodeAudio = document.getElementById("explode-sound");
        const angryAudio = document.getElementById("angry-sound");
        const ohNoAudio = document.getElementById("oh-no-sound");
        const workWhistleAudio = document.getElementById("work-whistle-sound");
        const decisionAlarm = document.getElementById("decision-alarm");
        const jumpscareAudio = document.getElementById("jumpscare-sound");
        const legoAudio = document.getElementById("lego-breaking-sound");
        const steamVideo = document.getElementById("steam-video");
        introMusic?.pause();
        if (introMusic) introMusic.currentTime = 0;
        setLoading(true);

        // Let the black loading layer paint before a cached asset can resolve.
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await Promise.all([
          loadJumpscareAudioBuffer(),
          waitForAudio(cityMusic),
          waitForAudio(helpNotify),
          waitForAudio(hiAudio),
          waitForAudio(paperAudio),
          waitForAudio(writingAudio),
          waitForAudio(explodeAudio),
          waitForAudio(angryAudio),
          waitForAudio(ohNoAudio),
          waitForAudio(workWhistleAudio),
          waitForAudio(decisionAlarm),
          waitForAudio(jumpscareAudio),
          waitForAudio(legoAudio),
          waitForVideo(steamVideo),
          waitForImage("spr_maingame_bg.png"),
          waitForImage("spr_maingame_bg wood.png"),
          waitForImage("buttonred.png"),
          waitForImage("buttonredpressed.png"),
          waitForImage("buttongreen.png"),
          waitForImage("buttongreenpressed.png"),
          waitForImage("helpy_ui.png"),
          waitForImage("ecluttered.png"),
          waitForImage("free-crop (1).png"),
          waitForImage("116d2ff59959832c66f8f425204dc858.png"),
          waitForImage("acorn.png"),
          waitForImage("N00b112.webp"),
          waitForImage("spr_buzucki.png"),
          waitForImage("bazuckmeter.png"),
          waitForImage("playersmeter.png"),
          waitForImage("spr_red_pixel.png"),
          waitForImage("offensive_item.png"),
          waitForImage("ilovemyfamily.png"),
          waitForImage("Oakley_2021.webp"),
          waitForImage("Screenshot 2026-08-31 190438.png"),
          waitForImage("Screenshot 2026-09-01 172237.png"),
          ...Array.from({ length: SKY_FRAME_COUNT }, (_, index) =>
            waitForImage(skyFrameSrc(index)),
          ),
        ]);
        if (!cityMusic) {
          removeMenuHotspotsRef.current?.();
          removeMenuHotspotsRef.current = null;
          setGameStarted(true);
          setLoading(false);
          loadingRef.current = false;
          gameStartedRef.current = true;
          return;
        }

        cityMusic.currentTime = 0;
        cityMusic.volume = backgroundMusicVolumeRef.current;
        startMusic(cityMusic).catch((error) => {
          console.warn("city music could not start", error);
        });
        removeMenuHotspotsRef.current?.();
        removeMenuHotspotsRef.current = null;
        setGameStarted(true);
        setLoading(false);
        loadingRef.current = false;
        gameStartedRef.current = true;
      } catch (err) {
        handleLoadingError(err);
      }
    }, 500);
  }

  function playHelpNotification() {
    const notifyAudio = document.getElementById("helpy-notify");
    if (!notifyAudio) return;
    notifyAudio.currentTime = 0;
    notifyAudio.volume = 0.72;
    notifyAudio.play().catch(() => {});
  }

  function openHelp(step = 1) {
    if (!gameStartedRef.current || helpStateRef.current !== "hidden") return;
    // A visible Helpy panel satisfies the pending next-NPC gate. Claim the
    // pending respawn immediately so it can resume as soon as Helpy closes,
    // even when its holding timer has not fired yet.
    const hasActiveRespawnTimer = respawnTimerRef.current !== null;
    if (
      respawnWaitForHelpRef.current &&
      (hasActiveRespawnTimer || respawnRemainingRef.current !== null)
    ) {
      window.clearTimeout(respawnTimerRef.current);
      respawnTimerRef.current = null;
      respawnDueAtRef.current = null;
      // Preserve any deliberate buffer added for the next panel in a Helpy
      // chain; only an active holding timer needs to be converted to an
      // immediate post-Helpy respawn.
      if (hasActiveRespawnTimer) {
        respawnRemainingRef.current = 0;
      }
      respawnWaitForHelpRef.current = false;
    }
    playHelpNotification();
    setHelpStep(step);
    setHelpState("entering");
    // Keep the off-screen state on screen for a frame so the browser can
    // animate the panel's linear movement instead of showing it at center.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hasHelpAppearedRef.current = true;
        setHelpState("visible");
      });
    });
  }

  function scheduleBaconRespawn(delay = 3000) {
    if (isBaszuckiJumpscareArmedRef.current || hasTriggeredJumpscareRef.current) {
      return;
    }
    window.clearTimeout(respawnTimerRef.current);
    respawnRemainingRef.current = null;
    respawnWaitForHelpRef.current = false;
    respawnHelpChainHoldRef.current = false;
    respawnDueAtRef.current = Date.now() + delay;
    respawnTimerRef.current = window.setTimeout(() => {
      respawnTimerRef.current = null;
      respawnDueAtRef.current = null;
      if (
        isBaszuckiJumpscareArmedRef.current ||
        hasTriggeredJumpscareRef.current
      ) {
        return;
      }
      if (helpStateRef.current !== "hidden") {
        respawnRemainingRef.current = 1000;
        return;
      }
      const nextType =
        candidateTypeRef.current === "bacon"
          ? "acorn"
          : candidateTypeRef.current === "acorn"
            ? "oakley"
            : candidateTypeRef.current === "oakley"
              ? "noob"
                : candidateTypeRef.current === "noob"
                  ? "n00b112"
                  : "bacon";
      showBacon(nextType);
    }, delay);
  }

  function stopJumpscareAudio() {
    if (jumpscareSourceRef.current) {
      try {
        jumpscareSourceRef.current.stop();
        jumpscareSourceRef.current.disconnect();
      } catch (e) {}
      jumpscareSourceRef.current = null;
    }
    if (jumpscareLoopSourceRef.current) {
      try {
        jumpscareLoopSourceRef.current.stop();
        jumpscareLoopSourceRef.current.disconnect();
      } catch (e) {}
      jumpscareLoopSourceRef.current = null;
    }
    const jumpscareAudio = document.getElementById("jumpscare-sound");
    if (jumpscareAudio) {
      jumpscareAudio.pause();
      jumpscareAudio.currentTime = 0;
    }
  }

  function pauseJumpscareSound() {
    if (jumpscareSoundPausedRef.current || jumpscareSoundEndedRef.current) {
      return;
    }
    jumpscareSoundPausedRef.current = true;

    const jumpscareAudio = document.getElementById("jumpscare-sound");
    if (jumpscareAudio) {
      jumpscareAudio.pause();
    }
    // The shared AudioContext also carries menu and button sounds. Suspending
    // it here lets an unrelated click wake the jumpscare back up, so mute the
    // jumpscare's own gain node instead.
    if (jumpscareGainRef.current) {
      jumpscareGainRef.current.gain.value = 0;
    }
  }

  function resumeJumpscareSound() {
    if (
      !jumpscareSoundPausedRef.current ||
      jumpscareSoundEndedRef.current
    ) {
      return;
    }
    jumpscareSoundPausedRef.current = false;

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    if (jumpscareGainRef.current) {
      jumpscareGainRef.current.gain.value = 0.5;
    }
    const jumpscareAudio = document.getElementById("jumpscare-sound");
    if (
      jumpscareAudio &&
      !jumpscareLoopSourceRef.current &&
      !jumpscareSourceRef.current
    ) {
      jumpscareAudio.play().catch(() => {});
    }
  }

  function playLegoBreakingSound() {
    const legoAudio = document.getElementById("lego-breaking-sound");
    if (!legoAudio) return;

    legoAudio.pause();
    legoAudio.currentTime = 0;
    legoAudio.playbackRate = 1;
    legoAudio.preservesPitch = true;
    legoAudio.webkitPreservesPitch = true;
    legoAudio.mozPreservesPitch = true;
    legoAudio.play().catch(() => {});
  }

  function pauseJumpscareSequence() {
    if (!hasTriggeredJumpscareRef.current) return;

    if (jumpscareEndpointTimerRef.current !== null) {
      jumpscareEndpointRemainingRef.current = Math.max(
        0,
        (jumpscareEndpointDueAtRef.current ?? Date.now()) - Date.now(),
      );
      window.clearTimeout(jumpscareEndpointTimerRef.current);
      jumpscareEndpointTimerRef.current = null;
      jumpscareEndpointDueAtRef.current = null;
    }

    if (jumpscareEndTimerRef.current !== null) {
      jumpscareEndRemainingRef.current = Math.max(
        0,
        (jumpscareEndDueAtRef.current ?? Date.now()) - Date.now(),
      );
      window.clearTimeout(jumpscareEndTimerRef.current);
      jumpscareEndTimerRef.current = null;
      jumpscareEndDueAtRef.current = null;
    }
  }

  function resumeJumpscareSequence() {
    if (!hasTriggeredJumpscareRef.current) return;

    if (jumpscareEndpointRemainingRef.current !== null) {
      const remaining = jumpscareEndpointRemainingRef.current;
      jumpscareEndpointRemainingRef.current = null;
      jumpscareEndpointDueAtRef.current = Date.now() + remaining;
      jumpscareEndpointTimerRef.current = window.setTimeout(
        () => runJumpscareEndpoint(),
        remaining,
      );
      return;
    }

    if (jumpscareEndRemainingRef.current !== null) {
      const remaining = jumpscareEndRemainingRef.current;
      jumpscareEndRemainingRef.current = null;
      jumpscareEndDueAtRef.current = Date.now() + remaining;
      jumpscareEndTimerRef.current = window.setTimeout(
        () => finishJumpscare(),
        remaining,
      );
    }
  }

  function runJumpscareEndpoint() {
    jumpscareEndpointTimerRef.current = null;
    jumpscareEndpointDueAtRef.current = null;

    // 1. The meter, wood and button disappear first
    setBaszuckiJumpscare((prev) =>
      prev ? { ...prev, phase: "endpoint" } : null,
    );

    // 2. The jumpscare sound playback pauses and loops the same sound so many
    // times without progressing or going back to start
    if (jumpscareSourceRef.current) {
      try {
        jumpscareSourceRef.current.stop();
        jumpscareSourceRef.current.disconnect();
      } catch (e) {}
      jumpscareSourceRef.current = null;
    }
    const jumpscareAudio = document.getElementById("jumpscare-sound");
    if (jumpscareAudio) {
      jumpscareAudio.pause();
    }

    if (audioCtx && jumpscareAudioBuffer) {
      const loopSrc = audioCtx.createBufferSource();
      loopSrc.buffer = jumpscareAudioBuffer;
      loopSrc.loop = true;
      const freezePos = JUMPSCARE_ZOOM_DURATION;
      loopSrc.loopStart = Math.max(0, freezePos - 0.03);
      loopSrc.loopEnd = Math.min(jumpscareAudioBuffer.duration, freezePos + 0.03);
      let gainNode = jumpscareGainRef.current;
      if (!gainNode) {
        gainNode = audioCtx.createGain();
        gainNode.connect(audioCtx.destination);
        jumpscareGainRef.current = gainNode;
      }
      gainNode.gain.value = jumpscareSoundPausedRef.current ? 0 : 0.5;
      connectLoFi(loopSrc, gainNode, audioCtx);
      loopSrc.start(0, loopSrc.loopStart);
      jumpscareLoopSourceRef.current = loopSrc;
    } else if (jumpscareAudio) {
      const freezePos = JUMPSCARE_ZOOM_DURATION;
      const stutterInterval = window.setInterval(() => {
        if (!hasTriggeredJumpscareRef.current) {
          window.clearInterval(stutterInterval);
          return;
        }
        if (jumpscareSoundPausedRef.current) {
          return;
        }
        jumpscareAudio.currentTime = Math.max(0, freezePos - 0.03);
        jumpscareAudio.play().catch(() => {});
      }, 60);
      jumpscareLoopSourceRef.current = {
        stop: () => window.clearInterval(stutterInterval),
        disconnect: () => {},
      };
    }

    // 3. Then delay, then David's jumpscare disappears and the sound stops
    jumpscareEndDueAtRef.current = Date.now() + JUMPSCARE_STUTTER_DELAY;
    jumpscareEndTimerRef.current = window.setTimeout(
      () => finishJumpscare(),
      JUMPSCARE_STUTTER_DELAY,
    );
  }

  function finishJumpscare() {
    jumpscareEndTimerRef.current = null;
    jumpscareEndDueAtRef.current = null;
    jumpscareSoundEndedRef.current = true;
    stopJumpscareAudio();
    setBaszuckiJumpscare(null);
    window.clearTimeout(postJumpscareTimerRef.current);
    postJumpscareTimerRef.current = window.setTimeout(() => {
      setPostJumpscareScreen(true);
      setExitJumpscareVisible(false);
      playLegoBreakingSound();
    }, POST_JUMPSCARE_DELAY);
  }

  function getDavidJumpscareStart() {
    const davidElement = davidElementRef.current;
    const viewport = davidElement?.closest(".game-viewport");
    const davidRect = davidElement?.getBoundingClientRect();
    const viewportRect = viewport?.getBoundingClientRect();

    if (
      davidRect &&
      viewportRect &&
      viewportRect.width > 0 &&
      viewportRect.height > 0
    ) {
      return {
        x:
          ((davidRect.left + davidRect.width / 2 - viewportRect.left) /
            viewportRect.width) *
          100,
        y:
          ((davidRect.top + davidRect.height / 2 - viewportRect.top) /
            viewportRect.height) *
          100,
        startW: (davidRect.width / viewportRect.width) * 100,
      };
    }

    // The DOM position is normally available because the jumpscare is
    // triggered while David is visible. Keep a safe fallback for the first
    // frame of an entrance transition.
    const current = davidPosRef.current;
    return {
      x: current.x,
      y: 50,
      startW: 15,
    };
  }

  function triggerBaszuckiJumpscare() {
    if (hasTriggeredJumpscareRef.current) return;
    hasTriggeredJumpscareRef.current = true;
    if (gameStartedRef.current && !exitJumpscareSequenceRef.current) {
      setDavidCrashoutUnlocked(true);
      try {
        window.localStorage.setItem(DAVID_CRASHOUT_STORAGE_KEY, "unlocked");
      } catch (error) {
        // The achievement still works for this session if storage is blocked.
      }
    }
    clearOhNoEndedHandler();
    jumpscareSoundPausedRef.current = false;
    jumpscareSoundEndedRef.current = false;
    setPostJumpscareScreen(false);
    window.clearTimeout(postJumpscareTimerRef.current);
    jumpscareEndpointRemainingRef.current = null;
    jumpscareEndRemainingRef.current = null;

    window.clearTimeout(respawnTimerRef.current);
    window.clearTimeout(davidTimerRef.current);
    window.clearTimeout(davidWanderTimerRef.current);
    window.clearTimeout(davidExitTimerRef.current);
    window.clearTimeout(davidReturnTimerRef.current);
    window.clearTimeout(davidJumpscareTimerRef.current);
    window.clearTimeout(fifthHelpTimerRef.current);
    window.clearTimeout(sixthHelpTimerRef.current);
    window.clearTimeout(eighthHelpTimerRef.current);
    window.clearTimeout(ninthHelpTimerRef.current);
    window.clearTimeout(jumpscareEndpointTimerRef.current);
    window.clearTimeout(jumpscareEndTimerRef.current);
    jumpscareEndpointDueAtRef.current = null;
    jumpscareEndpointRemainingRef.current = null;
    jumpscareEndDueAtRef.current = null;
    jumpscareEndRemainingRef.current = null;
    const davidJumpscareStart = getDavidJumpscareStart();
    stopDecisionSequence();
    stopWorkWhistle();
    stopWritingSequence();
    stopJumpscareAudio();

    // Do not let the regular David sprite return after the jumpscare overlay
    // is removed.
    davidPosRef.current = {
      ...davidPosRef.current,
      jumpscare: false,
      exiting: true,
    };
    setDavidState((current) => ({
      ...current,
      active: false,
      exiting: true,
      jumpscare: false,
      transitionDuration: 0,
    }));
    setHelpState("hidden");

    const cityMusic = document.getElementById("city-music");
    if (cityMusic) {
      cityMusic.pause();
      cityMusic.currentTime = 0;
    }
    const introMusic = document.getElementById("music");
    if (introMusic) {
      introMusic.pause();
      introMusic.currentTime = 0;
    }
    const angryAudio = document.getElementById("angry-sound");
    if (angryAudio) {
      angryAudio.pause();
      angryAudio.currentTime = 0;
    }
    const ohNoAudio = document.getElementById("oh-no-sound");
    if (ohNoAudio) {
      ohNoAudio.pause();
      ohNoAudio.currentTime = 0;
    }
    const alarm = document.getElementById("decision-alarm");
    if (alarm) {
      alarm.pause();
      alarm.currentTime = 0;
    }
    const hiAudio = document.getElementById("hi-sound");
    if (hiAudio) {
      hiAudio.pause();
      hiAudio.currentTime = 0;
    }
    const paperAudio = document.getElementById("paper-sound");
    if (paperAudio) {
      paperAudio.pause();
      paperAudio.currentTime = 0;
    }
    const writingAudio = document.getElementById("writing-sound");
    if (writingAudio) {
      writingAudio.pause();
      writingAudio.currentTime = 0;
    }
    const explodeAudio = document.getElementById("explode-sound");
    if (explodeAudio) {
      explodeAudio.pause();
      explodeAudio.currentTime = 0;
    }

    setBaszuckiJumpscare({
      active: true,
      phase: "zooming",
      x: davidJumpscareStart.x,
      y: davidJumpscareStart.y,
      startW: davidJumpscareStart.startW,
      endX: 50.2,
      endY: 53.5,
      targetW: 75,
    });

    if (!exitJumpscareSequenceRef.current) {
      // Bring back the ninth Helpy panel halfway through David's jumpscare,
      // rather than showing it as a warning before the jumpscare starts.
      ninthHelpTimerRef.current = window.setTimeout(() => {
        ninthHelpTimerRef.current = null;
        pauseJumpscareSound();
        openHelp(9);
      }, (JUMPSCARE_ZOOM_DURATION * 1000) / 2);
    }

    if (!audioCtx) {
      audioCtx = getAudioContext();
    }
    audioCtx.resume().catch(() => {});

    if (jumpscareAudioBuffer) {
      const src = audioCtx.createBufferSource();
      src.buffer = jumpscareAudioBuffer;
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.5;
      connectLoFi(src, gainNode, audioCtx);
      gainNode.connect(audioCtx.destination);
      src.start(audioCtx.currentTime);
      jumpscareSourceRef.current = src;
      jumpscareGainRef.current = gainNode;
    } else {
      const jumpscareAudio = document.getElementById("jumpscare-sound");
      if (jumpscareAudio) {
        jumpscareAudio.currentTime = 0;
        playLoudSound(jumpscareAudio, { gainValue: 0.5 }).catch(() => {});
      }
    }

    // At end point (JUMPSCARE_ZOOM_DURATION = 650ms):
    jumpscareEndpointDueAtRef.current =
      Date.now() + JUMPSCARE_ZOOM_DURATION * 1000;
    jumpscareEndpointTimerRef.current = window.setTimeout(
      () => runJumpscareEndpoint(),
      JUMPSCARE_ZOOM_DURATION * 1000,
    );
  }

  function pauseBaconRespawn() {
    if (respawnTimerRef.current === null) return;
    respawnRemainingRef.current = Math.max(
      0,
      (respawnDueAtRef.current ?? Date.now()) - Date.now(),
    );
    window.clearTimeout(respawnTimerRef.current);
    respawnTimerRef.current = null;
    respawnDueAtRef.current = null;
  }

  function resumeBaconRespawn() {
    if (respawnRemainingRef.current === null) return;
    const remaining = Math.max(800, respawnRemainingRef.current);
    respawnRemainingRef.current = null;
    scheduleBaconRespawn(remaining);
  }

  function scheduleDecisionTimeout(delay) {
    window.clearTimeout(decisionTimerRef.current);
    decisionRemainingRef.current = delay;
    decisionDueAtRef.current = Date.now() + delay;
    decisionTimerRef.current = window.setTimeout(() => {
      decisionTimerRef.current = null;
      decisionDueAtRef.current = null;
      decisionRemainingRef.current = null;
      triggerDecisionWarning();
    }, delay);
  }

  function startDecisionTimer() {
    stopDecisionSequence();
    if (candidateTypeRef.current === "noob") {
      return;
    }
    decisionPhaseRef.current = "countdown";
    scheduleDecisionTimeout(DECISION_TIMEOUT);
  }

  function startDecisionWarningImmediately() {
    if (!gameStartedRef.current || hasTriggeredJumpscareRef.current) {
      return;
    }
    stopDecisionSequence();
    decisionPhaseRef.current = "countdown";
    triggerDecisionWarning();
  }

  function triggerDecisionWarning() {
    if (!gameStartedRef.current || decisionPhaseRef.current !== "countdown") {
      return;
    }
    // A help dialog can open on the same frame as the deadline. Leave the
    // warning queued so it appears as soon as the dialog is dismissed.
    if (helpStateRef.current !== "hidden") {
      decisionRemainingRef.current = 0;
      return;
    }

    decisionPhaseRef.current = "warning";
    setDecisionWarning(true);

    const alarm = document.getElementById("decision-alarm");
    if (alarm) {
      alarm.loop = true;
      alarm.currentTime = 0;
      alarm.playbackRate = 1;
      playLoudSound(alarm, { gainValue: 0.25 }).catch(() => {});
    }
    startDecisionPenalty();
  }

  function startDecisionPenalty() {
    stopDecisionPenaltyCycle(true);
    const cycle = decisionPenaltyCycleRef.current;
    const isJohnDoeWarning = candidateTypeRef.current === "noob";
    const meterDelay = isJohnDoeWarning
      ? JOHN_DOE_DECISION_METER_DELAY_MS
      : REGULAR_DECISION_METER_DELAY_MS;
    const meterIncrement = isJohnDoeWarning
      ? JOHN_DOE_DECISION_PLAYER_METER_INCREMENT
      : REGULAR_DECISION_PLAYER_METER_INCREMENT;

    const playNextPenaltySound = () => {
      if (
        cycle !== decisionPenaltyCycleRef.current ||
        decisionPhaseRef.current !== "warning" ||
        helpStateRef.current !== "hidden"
      ) {
        return;
      }

      decisionPenaltyTimerRef.current = window.setTimeout(() => {
        decisionPenaltyTimerRef.current = null;
        if (
          cycle !== decisionPenaltyCycleRef.current ||
          decisionPhaseRef.current !== "warning" ||
          helpStateRef.current !== "hidden"
        ) {
          return;
        }

        const angryAudio = document.getElementById("angry-sound");
        if (!angryAudio) return;

        angryAudio.currentTime = 0;
        angryAudio.playbackRate = 1;

        // Move the Playersmeter on a fixed timer from the moment the angry
        // sound starts, instead of waiting for the sound to end. John Doe's
        // warning is intentionally faster and harsher than the regular one.
        const meterTimer = window.setTimeout(() => {
          decisionPenaltyMeterTimerRef.current = null;
          if (
            cycle !== decisionPenaltyCycleRef.current ||
            decisionPhaseRef.current !== "warning" ||
            helpStateRef.current !== "hidden"
          ) {
            return;
          }
          setPlayerAngerLevel((prev) => Math.min(100, prev + meterIncrement));
        }, meterDelay);
        decisionPenaltyMeterTimerRef.current = meterTimer;

        const handleEnded = () => {
          const shouldContinue =
            cycle === decisionPenaltyCycleRef.current &&
            decisionPhaseRef.current === "warning" &&
            helpStateRef.current === "hidden";

          if (decisionPenaltyEndedHandlerRef.current === handleEnded) {
            decisionPenaltyEndedHandlerRef.current = null;
            decisionPenaltyAudioRef.current = null;
            angryAudio.removeEventListener("ended", handleEnded);
          }

          if (!shouldContinue) {
            return;
          }

          decisionPenaltyTimerRef.current = window.setTimeout(() => {
            decisionPenaltyTimerRef.current = null;
            playNextPenaltySound();
          }, ANGRY_SOUND_POST_DELAY_MS);
        };

        decisionPenaltyAudioRef.current = angryAudio;
        if (isJohnDoeWarning) {
          // John Doe's warning retriggers the sound on a fixed 1.5-second
          // cadence, even if the previous sound has not ended yet.
          decisionPenaltyTimerRef.current = window.setTimeout(() => {
            decisionPenaltyTimerRef.current = null;
            playNextPenaltySound();
          }, JOHN_DOE_DECISION_SOUND_INTERVAL_MS);
        } else {
          decisionPenaltyEndedHandlerRef.current = handleEnded;
          angryAudio.addEventListener("ended", handleEnded);
        }
        playLoudSound(angryAudio, { gainValue: 3.2 }).catch(() => {
          if (decisionPenaltyMeterTimerRef.current === meterTimer) {
            window.clearTimeout(meterTimer);
            decisionPenaltyMeterTimerRef.current = null;
          }
          if (isJohnDoeWarning && decisionPenaltyTimerRef.current !== null) {
            window.clearTimeout(decisionPenaltyTimerRef.current);
            decisionPenaltyTimerRef.current = null;
          }
          if (decisionPenaltyEndedHandlerRef.current === handleEnded) {
            decisionPenaltyEndedHandlerRef.current = null;
            decisionPenaltyAudioRef.current = null;
            angryAudio.removeEventListener("ended", handleEnded);
          }
        });
      }, ANGRY_SOUND_PRE_DELAY_MS);
    };

    playNextPenaltySound();
  }

  function stopDecisionPenaltyCycle(pauseAudio = false) {
    window.clearTimeout(decisionPenaltyTimerRef.current);
    decisionPenaltyTimerRef.current = null;
    window.clearTimeout(decisionPenaltyMeterTimerRef.current);
    decisionPenaltyMeterTimerRef.current = null;
    decisionPenaltyCycleRef.current += 1;

    const angryAudio = decisionPenaltyAudioRef.current;
    const handleEnded = decisionPenaltyEndedHandlerRef.current;
    if (angryAudio && handleEnded) {
      angryAudio.removeEventListener("ended", handleEnded);
    }
    decisionPenaltyAudioRef.current = null;
    decisionPenaltyEndedHandlerRef.current = null;

    if (pauseAudio && angryAudio) {
      angryAudio.pause();
      angryAudio.currentTime = 0;
    }
  }

  function pauseDecisionSequence() {
    if (decisionPhaseRef.current === "countdown") {
      if (decisionTimerRef.current !== null) {
        decisionRemainingRef.current = Math.max(
          0,
          (decisionDueAtRef.current ?? Date.now()) - Date.now(),
        );
        window.clearTimeout(decisionTimerRef.current);
        decisionTimerRef.current = null;
        decisionDueAtRef.current = null;
      }
    } else if (decisionPhaseRef.current === "warning") {
      stopDecisionPenaltyCycle(true);
    }
  }

  function resumeDecisionSequence() {
    if (decisionPhaseRef.current === "countdown") {
      const remaining = decisionRemainingRef.current;
      if (remaining !== null) {
        scheduleDecisionTimeout(remaining);
      }
    } else if (decisionPhaseRef.current === "warning") {
      startDecisionPenalty();
    }
  }

  function stopDecisionSequence() {
    window.clearTimeout(decisionTimerRef.current);
    decisionTimerRef.current = null;
    decisionPenaltyTimerRef.current = null;
    decisionDueAtRef.current = null;
    decisionRemainingRef.current = null;
    decisionPhaseRef.current = "inactive";
    setDecisionWarning(false);
    stopDecisionPenaltyCycle(true);
    const alarm = document.getElementById("decision-alarm");
    if (alarm) {
      alarm.pause();
      alarm.currentTime = 0;
    }
  }

  function stopWorkWhistle() {
    window.clearTimeout(eighthHelpTimerRef.current);
    eighthHelpTimerRef.current = null;

    const whistle = document.getElementById("work-whistle-sound");
    const endedHandler = whistleEndedHandlerRef.current;
    if (whistle && endedHandler) {
      whistle.removeEventListener("ended", endedHandler);
    }
    whistleEndedHandlerRef.current = null;

    if (whistle) {
      whistle.pause();
      whistle.currentTime = 0;
    }
  }

  function stopWritingSequence() {
    window.clearTimeout(writingAutoOpenTimerRef.current);
    writingAutoOpenTimerRef.current = null;

    const writingAudio = document.getElementById("writing-sound");
    if (writingAudio) {
      writingAudio.pause();
      writingAudio.currentTime = 0;
    }
  }

  function scheduleHelpAfterWorkWhistle() {
    stopWorkWhistle();

    const whistle = document.getElementById("work-whistle-sound");
    if (!whistle) {
      eighthHelpTimerRef.current = window.setTimeout(() => {
        eighthHelpTimerRef.current = null;
        if (gameStartedRef.current && !hasTriggeredJumpscareRef.current) {
          openHelp(8);
        }
      }, EIGHTH_HELP_APPEARANCE_DELAY);
      return;
    }

    const showHelp = () => {
      if (whistleEndedHandlerRef.current !== showHelp) return;
      whistleEndedHandlerRef.current = null;
      whistle.removeEventListener("ended", showHelp);
      window.clearTimeout(eighthHelpTimerRef.current);
      eighthHelpTimerRef.current = window.setTimeout(() => {
        eighthHelpTimerRef.current = null;
        if (gameStartedRef.current && !hasTriggeredJumpscareRef.current) {
          openHelp(8);
        }
      }, EIGHTH_HELP_APPEARANCE_DELAY);
    };

    whistleEndedHandlerRef.current = showHelp;
    whistle.addEventListener("ended", showHelp);
    whistle.currentTime = 0;
    whistle.playbackRate = 1;
    whistle.volume = 1;

    // The ended event is the normal handoff. Keep a small duration-based
    // fallback for browsers that do not report it after a failed decode.
    const fallbackDelay =
      Number.isFinite(whistle.duration) && whistle.duration > 0
        ? Math.ceil(whistle.duration * 1000) + 200
        : 3000;
    eighthHelpTimerRef.current = window.setTimeout(showHelp, fallbackDelay);
    playAudio(whistle).catch(() => showHelp());
  }

  function pauseDavidMotion() {
    const element = davidElementRef.current;
    const viewport = element?.closest(".game-viewport");
    if (!element || !viewport || !davidState.active) return;

    const elementRect = element.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const currentX =
      ((elementRect.left + elementRect.width / 2 - viewportRect.left) /
        viewportRect.width) *
      100;
    const currentY =
      100 -
      ((viewportRect.bottom - elementRect.bottom) / viewportRect.height) * 100 -
      DAVID_SHOE_OFFSET;
    const clampedY = Math.max(
      DAVID_BACK_Y,
      Math.min(DAVID_FRONT_Y, currentY),
    );
    const currentScale = davidScaleForDepth(clampedY);
    const target = { ...davidPosRef.current };
    const isExiting = davidState.exiting;
    const distanceToTarget =
      Math.abs(target.x - currentX) + Math.abs(target.y - clampedY);
    const pausedDuration = isExiting
      ? Math.max(
          0.4,
          Math.round((distanceToTarget / DAVID_EXIT_SPEED) * 10) / 10,
        )
      : distanceToTarget > 0.5
        ? Math.max(1.2, Math.round((distanceToTarget / 10) * 10) / 10)
        : 0;

    davidPauseRef.current = {
      target,
      transitionDuration: pausedDuration,
      phase: isExiting
        ? "exiting"
        : davidState.jumpscare
          ? "jumpscare"
          : "wandering",
    };
    window.clearTimeout(davidWanderTimerRef.current);
    davidWanderTimerRef.current = null;
    window.clearTimeout(davidExitTimerRef.current);
    davidExitTimerRef.current = null;
    window.clearTimeout(davidJumpscareTimerRef.current);
    davidJumpscareTimerRef.current = null;
    davidPosRef.current = {
      ...davidPosRef.current,
      x: currentX,
      y: clampedY,
      scale: currentScale,
    };
    setDavidState((current) => ({
      ...current,
      x: currentX,
      y: clampedY,
      scale: currentScale,
      transitionDuration: 0,
    }));
  }

  function resumeDavidMotion() {
    const paused = davidPauseRef.current;
    if (!paused || !davidState.active) return;
    davidPauseRef.current = null;

    const currentX = davidPosRef.current.x;
    const target = paused.target;
    if (paused.phase === "wandering" && target.rotation !== 0) {
      // Helpy may have interrupted David during the lean. Restore his
      // stationary pose, then rotate him back before allowing a new move.
      davidPosRef.current = target;
      setDavidState((current) => ({
        ...current,
        ...target,
        transitionDuration: 0,
      }));
      resetDavidRotationAndResume();
      return;
    }
    const currentY = davidPosRef.current.y;
    const distance = Math.abs(target.x - currentX) + Math.abs(target.y - currentY);
    const duration =
      distance > 0.5
        ? Math.max(1.2, paused.transitionDuration || 2)
        : 0;

    davidPosRef.current = target;
    if (paused.phase === "jumpscare") {
      const duration = DAVID_JUMPSCARE_DURATION;
      setDavidState((current) => ({
        ...current,
        ...target,
        transitionDuration: duration,
      }));
      davidJumpscareTimerRef.current = window.setTimeout(
        () => settleDavidAfterJumpscare(target.x, target.facing),
        duration * 1000,
      );
      return;
    }

    setDavidState((current) => ({
      ...current,
      ...target,
      transitionDuration: duration,
    }));

    if (paused.phase === "exiting") {
      window.clearTimeout(davidExitTimerRef.current);
      davidExitTimerRef.current = window.setTimeout(
        () => finishDavidExit(),
        duration * 1000,
      );
    } else {
      window.clearTimeout(davidWanderTimerRef.current);
      davidWanderTimerRef.current = window.setTimeout(
        () => scheduleNextWander(),
        (duration + 1.2) * 1000,
      );
    }
  }

  function scheduleDavidAppearance(
    delay = DAVID_APPEARANCE_DELAY_AFTER_HELP,
  ) {
    if (hasDavidSpawnedRef.current) return;
    window.clearTimeout(davidTimerRef.current);
    davidTimerRef.current = window.setTimeout(() => {
      spawnDavidBaszucki();
    }, delay);
  }

  function spawnDavidBaszucki() {
    if (hasDavidSpawnedRef.current || !gameStartedRef.current) return;
    if (
      !hasHelpAppearedRef.current ||
      helpStateRef.current !== "hidden"
    ) {
      // Keep David queued as well; no NPC is allowed to enter before Helpy
      // has shown the player the opening guidance or while it is open.
      scheduleDavidAppearance(250);
      return;
    }
    hasDavidSpawnedRef.current = true;
    davidGreenDecisionCountRef.current = 0;

    const entranceY =
      DAVID_NEAR_DESK_Y +
      Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y);
    const initialPos = {
      x: 115,
      y: entranceY,
      scale: davidScaleForDepth(entranceY),
      facing: -1,
      rotation: 0,
      exiting: false,
    };
    davidPosRef.current = initialPos;
    setDavidState({
      active: true,
      x: initialPos.x,
      y: initialPos.y,
      scale: initialPos.scale,
      facing: -1,
      rotation: 0,
      exiting: false,
      transitionDuration: 0,
    });

      requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const entranceX = davidEntryTargetX(false);
        const entranceScale = davidScaleForDepth(entranceY);
        const entranceDuration = 4.2;
        davidPosRef.current = {
          x: entranceX,
          y: entranceY,
          scale: entranceScale,
          facing: -1,
          rotation: 0,
          exiting: false,
        };
        setDavidState({
          active: true,
          x: entranceX,
          y: entranceY,
          scale: entranceScale,
          facing: -1,
          rotation: 0,
          exiting: false,
          transitionDuration: entranceDuration,
        });

        window.clearTimeout(davidWanderTimerRef.current);
        davidWanderTimerRef.current = window.setTimeout(() => {
          scheduleNextWander();
        }, (entranceDuration + 1.2) * 1000);
      });
    });
  }

  function scheduleNextWander() {
    if (!gameStartedRef.current || helpStateRef.current !== "hidden") return;
    if (davidPosRef.current.rotation !== 0) {
      resetDavidRotationAndResume();
      return;
    }
    const idlePause = 1800 + Math.random() * 2200;
    davidWanderTimerRef.current = window.setTimeout(() => {
      performWanderStep();
    }, idlePause);
  }

  function resetDavidRotationAndResume() {
    const current = { ...davidPosRef.current };
    if (current.rotation === 0) {
      scheduleNextWander();
      return;
    }

    const reset = {
      ...current,
      rotation: 0,
    };
    davidPosRef.current = reset;
    setDavidState((state) => ({
      ...state,
      ...reset,
      transitionDuration: 0,
    }));

    window.clearTimeout(davidWanderTimerRef.current);
    davidWanderTimerRef.current = window.setTimeout(() => {
      if (!gameStartedRef.current || helpStateRef.current !== "hidden") return;
      scheduleNextWander();
    }, DAVID_ROTATION_TRANSITION_MS + 1200);
  }

  function startDavidRotation(rotation) {
    const current = {
      ...davidPosRef.current,
      rotation,
    };
    davidPosRef.current = current;
    setDavidState((state) => ({
      ...state,
      ...current,
      transitionDuration: 0,
    }));

    window.clearTimeout(davidWanderTimerRef.current);
    davidWanderTimerRef.current = window.setTimeout(() => {
      davidWanderTimerRef.current = null;
      if (!gameStartedRef.current || helpStateRef.current !== "hidden") return;
      resetDavidRotationAndResume();
    }, DAVID_ROTATION_TRANSITION_MS);
  }

  function performWanderStep() {
    if (!gameStartedRef.current || helpStateRef.current !== "hidden") return;
    if (davidPosRef.current.rotation !== 0) {
      resetDavidRotationAndResume();
      return;
    }
    if (Math.random() < DAVID_EXIT_CHANCE) {
      startDavidExit();
      return;
    }

    const current = davidPosRef.current;

    const isDepthMove = Math.random() < 0.72;
    let targetX = current.x;
    let targetY;
    const paperVisible = offensiveItemStateRef.current !== "hidden";

    if (isDepthMove) {
      const goNearWood = Math.random() < DAVID_FRONT_CHANCE;
      if (goNearWood) {
        targetY =
          DAVID_NEAR_DESK_Y +
          Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y);
        if (
          paperVisible &&
          (current.x < DAVID_PAPER_BLOCK_LEFT ||
            current.x > DAVID_PAPER_BLOCK_RIGHT) &&
          Math.random() < 0.7
        ) {
          targetX =
            DAVID_PAPER_BLOCK_LEFT +
            Math.random() *
              (DAVID_PAPER_BLOCK_RIGHT - DAVID_PAPER_BLOCK_LEFT);
        }
      } else {
        targetY =
          DAVID_BACK_Y + Math.random() * (DAVID_MID_Y + 4 - DAVID_BACK_Y);
      }
      if (Math.abs(targetY - current.y) < 4) {
        targetY =
          goNearWood
            ? Math.min(
                DAVID_FRONT_Y,
                Math.max(DAVID_NEAR_DESK_Y, current.y + 4),
              )
            : Math.max(
                DAVID_BACK_Y,
                Math.min(DAVID_MID_Y + 4, current.y - 4),
              );
      }
    } else {
      targetX = 18 + Math.random() * 64;
      if (Math.abs(targetX - current.x) < 12) {
        targetX = targetX > 50 ? targetX - 22 : targetX + 22;
      }
      targetX = Math.max(12, Math.min(88, targetX));
      const goNearWood = Math.random() < DAVID_FRONT_CHANCE;
      if (goNearWood) {
        targetY =
          DAVID_NEAR_DESK_Y +
          Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y);
      } else {
        targetY = current.y + (Math.random() - 0.5) * 4;
      }
    }
    targetY = Math.max(DAVID_BACK_Y, Math.min(DAVID_FRONT_Y, targetY));
    const targetScale = davidScaleForDepth(targetY);
    const facing = targetX < current.x ? -1 : 1;
    const rotation = davidPeekRotation(targetX, targetY, paperVisible);

    // Lean in place first. David must finish rotating back before any
    // horizontal/depth movement is allowed to start.
    if (rotation !== 0) {
      startDavidRotation(rotation);
      return;
    }

    const dx = targetX - current.x;
    const dy = targetY - current.y;
    const dist = Math.hypot(dx, dy);
    const speed = 10;
    const duration = Math.max(2.0, Math.round((dist / speed) * 10) / 10);

    davidPosRef.current = {
      x: targetX,
      y: targetY,
      scale: targetScale,
      facing,
      rotation,
      exiting: false,
    };

    setDavidState({
      active: true,
      x: targetX,
      y: targetY,
      scale: targetScale,
      facing,
      rotation,
      exiting: false,
      transitionDuration: duration,
    });

    window.clearTimeout(davidWanderTimerRef.current);
    davidWanderTimerRef.current = window.setTimeout(() => {
      scheduleNextWander();
    }, duration * 1000);
  }

  function startDavidExit() {
    if (
      !gameStartedRef.current ||
      helpStateRef.current !== "hidden" ||
      !davidState.active ||
      davidState.exiting
    ) {
      return;
    }

    const exitsLeft = Math.random() < 0.5;
    const current = davidPosRef.current;
    const exitX = exitsLeft ? -22 : 122;
    const duration = Math.max(
      2.4,
      Math.round((Math.abs(exitX - current.x) / DAVID_EXIT_SPEED) * 10) / 10,
    );
    const target = {
      ...current,
      x: exitX,
      facing: exitsLeft ? -1 : 1,
      exiting: true,
    };

    window.clearTimeout(davidWanderTimerRef.current);
    davidWanderTimerRef.current = null;
    davidPosRef.current = target;
    setDavidState({
      active: true,
      ...target,
      transitionDuration: duration,
    });

    window.clearTimeout(davidExitTimerRef.current);
    davidExitTimerRef.current = window.setTimeout(
      () => finishDavidExit(),
      duration * 1000,
    );
  }

  function finishDavidExit() {
    davidExitTimerRef.current = null;
    if (!gameStartedRef.current) return;
    if (helpStateRef.current !== "hidden") {
      davidExitTimerRef.current = window.setTimeout(
        () => finishDavidExit(),
        500,
      );
      return;
    }

    setDavidState((current) => ({
      ...current,
      active: false,
      exiting: true,
      transitionDuration: 0,
    }));
    scheduleDavidReturn();
  }

  function scheduleDavidReturn() {
    window.clearTimeout(davidReturnTimerRef.current);
    const delay =
      DAVID_RETURN_MIN_DELAY +
      Math.random() * (DAVID_RETURN_MAX_DELAY - DAVID_RETURN_MIN_DELAY);
    davidReturnTimerRef.current = window.setTimeout(
      () => bringDavidBack(),
      delay,
    );
  }

  function settleDavidAfterJumpscare(targetX, facing) {
    davidJumpscareTimerRef.current = null;
    if (!gameStartedRef.current) return;
    if (helpStateRef.current !== "hidden") {
      davidJumpscareTimerRef.current = window.setTimeout(
        () => settleDavidAfterJumpscare(targetX, facing),
        500,
      );
      return;
    }

    const goNearWood = Math.random() < DAVID_FRONT_CHANCE;
      const targetY = goNearWood
      ? DAVID_NEAR_DESK_Y +
        Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y)
      : DAVID_BACK_Y + Math.random() * (DAVID_FRONT_Y - DAVID_BACK_Y);
    const target = {
      x: targetX,
      y: targetY,
      scale: davidScaleForDepth(targetY),
      facing,
      rotation: 0,
      exiting: false,
      jumpscare: false,
    };

    davidPosRef.current = target;
    setDavidState({
      active: true,
      ...target,
      transitionDuration: DAVID_JUMPSCARE_SETTLE_DURATION,
    });
    window.clearTimeout(davidWanderTimerRef.current);
    davidWanderTimerRef.current = window.setTimeout(
      () => scheduleNextWander(),
      (DAVID_JUMPSCARE_SETTLE_DURATION + 1.2) * 1000,
    );
  }

  function bringDavidBack() {
    davidReturnTimerRef.current = null;
    if (!gameStartedRef.current) return;
    if (helpStateRef.current !== "hidden") {
      davidReturnTimerRef.current = window.setTimeout(
        () => bringDavidBack(),
        500,
      );
      return;
    }

    const entersFromLeft = Math.random() < 0.5;
    const entranceX = entersFromLeft ? -22 : 122;
    // David's entrance should stay a normal appearance. The separate
    // Bazucki-meter overflow jumpscare is still triggered independently.
    const isJumpscare = false;
    const targetX = isJumpscare
      ? 50 + (Math.random() - 0.5) * 10
      : davidEntryTargetX(entersFromLeft);
    const goNearWood = Math.random() < DAVID_FRONT_CHANCE;
    const targetY = isJumpscare
      ? 100
      : goNearWood
      ? DAVID_NEAR_DESK_Y +
        Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y)
      : DAVID_BACK_Y + Math.random() * (DAVID_FRONT_Y - DAVID_BACK_Y);
    const target = {
      x: targetX,
      y: targetY,
      scale: isJumpscare ? 1.2 : davidScaleForDepth(targetY),
      facing: entersFromLeft ? 1 : -1,
      rotation: 0,
      exiting: false,
      jumpscare: isJumpscare,
    };
    const entrance = {
      x: entranceX,
      y: targetY,
      scale: target.scale,
      facing: target.facing,
      rotation: 0,
      exiting: false,
      jumpscare: isJumpscare,
    };
    const duration = isJumpscare
      ? DAVID_JUMPSCARE_DURATION
      : Math.max(
          2.4,
          Math.round(
            (Math.abs(targetX - entranceX) / DAVID_EXIT_SPEED) * 10,
          ) / 10,
        );

    davidPosRef.current = entrance;
    setDavidState({
      active: true,
      ...entrance,
      transitionDuration: 0,
    });

    requestAnimationFrame(() => {
      if (
        !gameStartedRef.current ||
        helpStateRef.current !== "hidden"
      ) {
        return;
      }
      davidPosRef.current = target;
      setDavidState({
        active: true,
        ...target,
        transitionDuration: duration,
      });
      window.clearTimeout(davidWanderTimerRef.current);
      if (isJumpscare) {
        window.clearTimeout(davidJumpscareTimerRef.current);
        davidJumpscareTimerRef.current = window.setTimeout(
          () => settleDavidAfterJumpscare(targetX, target.facing),
          duration * 1000,
        );
      } else {
        davidWanderTimerRef.current = window.setTimeout(
          () => scheduleNextWander(),
          (duration + 1.2) * 1000,
        );
      }
    });
  }

  function closeHelp() {
    if (helpStateRef.current === "hidden" || helpStateRef.current === "exiting") {
      return;
    }
    const closingStep = helpStepRef.current;
    const closesExitHelp = closingStep === 9 && exitCrashPendingRef.current;
    const closesSettingsHelp =
      (closingStep === 10 || closingStep === 12) &&
      settingsHelpPendingRef.current;
    const closesJumpscareHelp =
      closingStep === 9 && hasTriggeredJumpscareRef.current;
    const closesDavidFuriousHelp =
      closingStep === 8 || (closingStep === 6 && johnDoeCompleteHelp);
    const hasPendingRespawn = respawnRemainingRef.current !== null;
    const queuesAnotherHelp = closingStep < 3 || closingStep === 5;
    if (hasPendingRespawn && queuesAnotherHelp) {
      // Keep the NPC gate alive while this panel transitions out and the
      // next Helpy panel in the scripted sequence transitions in.
      respawnHelpChainHoldRef.current = true;
      respawnWaitForHelpRef.current = true;
    } else if (!queuesAnotherHelp) {
      respawnHelpChainHoldRef.current = false;
    }
    if (
      closingStep === 5 &&
      hasPendingRespawn
    ) {
      respawnRemainingRef.current += NEXT_PERSON_DELAY_AFTER_FIFTH_HELP;
    }
    if (
      closesDavidFuriousHelp &&
      hasPendingRespawn
    ) {
      // Let "David is furious now!" finish disappearing before the next
      // pending NPC is allowed to arrive, then add a short buffer.
      respawnRemainingRef.current +=
        NEXT_PERSON_DELAY_AFTER_DAVID_FURIOUS_HELP;
    }
    setHelpState("exiting");
    window.setTimeout(() => {
      setHelpState("hidden");
      if (closesExitHelp) {
        exitCrashPendingRef.current = false;
        setExitHelpVisible(false);
        exitJumpscareSequenceRef.current = true;
        setExitJumpscareVisible(true);
        triggerBaszuckiJumpscare();
        return;
      }
      if (closesSettingsHelp) {
        settingsHelpPendingRef.current = false;
        setSettingsHelpVisible(false);
        const introMusic = document.getElementById("music");
        if (introMusic && doneRef.current) {
          startMenuMusic();
        }
        return;
      }
      // Keep the jumpscare sound paused until the blank Helpy panel has
      // completed its exit animation. Clicking the panel or the game behind
      // it must never resume the sound.
      if (closesJumpscareHelp) {
        resumeJumpscareSound();
      }
      if (closingStep === 6 && johnDoeCompleteHelp) {
        setJohnDoeCompleteHelp(false);
        if (
          !hasPendingRespawn &&
          !isBaszuckiJumpscareArmedRef.current &&
          angerLevelRef.current < 100
        ) {
          // This warning normally suppresses the respawn scheduled by the
          // decision, so start the next NPC's delay after the panel exits.
          scheduleBaconRespawn(NEXT_PERSON_DELAY_AFTER_DAVID_FURIOUS_HELP);
        }
      }
      if (closingStep < 3) {
        const nextDelay = closingStep === 1 ? 500 : 1000;
        window.setTimeout(() => openHelp(closingStep + 1), nextDelay);
      } else if (closingStep === 3) {
        window.setTimeout(() => showBacon("bacon"), 1000);
      } else if (closingStep === 4) {
        scheduleDavidAppearance(DAVID_APPEARANCE_DELAY_AFTER_HELP);
      } else if (closingStep === 5) {
        window.setTimeout(() => openHelp(7), 1000);
      } else {
        if (
          baconStateRef.current === "hidden" &&
          !isBaszuckiJumpscareArmedRef.current &&
          !hasTriggeredJumpscareRef.current &&
          angerLevelRef.current < 100 &&
          respawnTimerRef.current === null &&
          respawnRemainingRef.current === null
        ) {
          scheduleBaconRespawn(800);
        }
      }
    }, 220);
  }

  function showBacon(type = candidateTypeRef.current) {
    if (
      !hasHelpAppearedRef.current ||
      helpStateRef.current !== "hidden"
    ) {
      respawnRemainingRef.current = 1000;
      return;
    }
    stopDecisionSequence();
    if (baconImageRef.current) {
      baconImageRef.current.style.visibility = "";
    }
    const hiAudio = document.getElementById("hi-sound");
    if (hiAudio) {
      hiAudio.currentTime = 0;
      hiAudio.playbackRate = 0.92;
      playLoudSound(hiAudio).catch(() => {});
    }
    candidateTypeRef.current = type;
    setCandidateType(type);
    const nextBanReason = banReasonForCandidate(type);
    setBanReason(nextBanReason);
    setOffensiveViewCount(0);
    setOffensiveItemRaised(false);
    setOffensiveItemState("hidden");
    setBaconState("entering");
  }

  playGameRef.current = beginGame;

  function startExperience() {
    if (startedRef.current) return;
    loadJumpscareAudioBuffer().catch(() => {});
    startedRef.current = true;
    setStarted(true);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {
        // Autoplay policy fallback: the next user interaction retries it.
      });
    }
  }

  function handleClick() {
    if (rootLoading) return;
    if (!started) {
      startExperience();
    }
  }

  function handleMainMenuExit() {
    if (
      !doneRef.current ||
      gameStartedRef.current ||
      exitCrashPendingRef.current ||
      postJumpscareScreen
    ) {
      return;
    }

    stopMenuMusic();
    document.getElementById("city-music")?.pause();
    playHelpNotification();
    exitCrashPendingRef.current = true;
    setExitHelpVisible(true);
    setHelpStep(9);
    setHelpState("entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setHelpState("visible"));
    });
  }

  function handleMainMenuMod() {
    if (
      !doneRef.current ||
      gameStartedRef.current ||
      endingsVisible ||
      postJumpscareScreen
    ) {
      return;
    }

    handleGameButtonClick();
    setEndingsVisible(true);
  }

  function handleEndingsOk() {
    handleGameButtonClick();
    setEndingsVisible(false);
  }

  function handleMainMenuSettings() {
    if (
      !doneRef.current ||
      gameStartedRef.current ||
      exitCrashPendingRef.current ||
      settingsHelpPendingRef.current ||
      postJumpscareScreen
    ) {
      return;
    }

    stopMenuMusic();
    playHelpNotification();
    settingsClickCountRef.current += 1;
    const showVolumeSettings = settingsClickCountRef.current >= 5;
    if (showVolumeSettings) {
      setSettingsVolumeDraft(backgroundMusicVolumeRef.current);
    }
    settingsHelpPendingRef.current = true;
    setSettingsHelpVisible(true);
    setHelpStep(showVolumeSettings ? 12 : 10);
    setHelpState("entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setHelpState("visible"));
    });
  }

  function handleGameButtonClick() {
    const clickAudio = document.getElementById("menu-click");
    if (!clickAudio) return;
    clickAudio.currentTime = 0;
    playAudio(clickAudio, { volume: clickAudio.volume }).catch(() => {});
  }

  function applyBackgroundMusicVolume(volume) {
    const nextVolume = Math.max(0, Math.min(1, Number(volume)));
    backgroundMusicVolumeRef.current = nextVolume;
    const menuMusic = document.getElementById("music");
    const cityMusic = document.getElementById("city-music");
    if (menuMusic) menuMusic.volume = nextVolume;
    if (cityMusic) cityMusic.volume = nextVolume;
  }

  function clearPressedButtonTimer() {
    window.clearTimeout(pressedButtonTimerRef.current);
    pressedButtonTimerRef.current = null;
  }

  function pressGameButton(button, event) {
    clearPressedButtonTimer();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setPressedButton(button);
  }

  function releaseGameButton(button) {
    clearPressedButtonTimer();
    pressedButtonTimerRef.current = window.setTimeout(() => {
      setPressedButton((current) => (current === button ? null : current));
      pressedButtonTimerRef.current = null;
    }, BUTTON_PRESS_FEEDBACK_MS);
  }

  function flashGameButton(button) {
    clearPressedButtonTimer();
    setPressedButton(button);
    pressedButtonTimerRef.current = window.setTimeout(() => {
      setPressedButton((current) => (current === button ? null : current));
      pressedButtonTimerRef.current = null;
    }, BUTTON_PRESS_FEEDBACK_MS);
  }

  function handleOffensiveItemClick(e) {
    e.stopPropagation();
    if (
      offensiveItemState === "hidden" ||
      offensiveItemState.startsWith("exiting")
    ) {
      return;
    }
    const closingOffensiveItem = offensiveItemRaised;
    playPaperSound();
    if (closingOffensiveItem && banReason === "repeat") {
      if (!writingPlayedRef.current) {
        writingPlayedRef.current = true;
        stopWritingSequence();
        const writingAudio = document.getElementById("writing-sound");
        if (writingAudio) {
          writingAudio.currentTime = 0;
          playLoudSound(writingAudio, { gainValue: 1.6 }).catch(() => {});
        }
        writingAutoOpenTimerRef.current = window.setTimeout(() => {
          writingAutoOpenTimerRef.current = null;
          const currentWritingAudio = document.getElementById("writing-sound");
          if (currentWritingAudio) {
            currentWritingAudio.pause();
            currentWritingAudio.currentTime = 0;
          }

          playPaperSound();
          if (!offensiveItemRaisedRef.current) {
            offensiveItemRaisedRef.current = true;
            setOffensiveViewCount((count) => count + 1);
          }
          setOffensiveItemState("visible");
          setOffensiveItemRaised(true);
        }, 1000);
      } else if (offensiveViewCount >= 2) {
        startDecisionWarningImmediately();
      }
    }
    if (offensiveItemState === "entering") {
      setOffensiveItemState("visible");
    }
    setOffensiveItemRaised((prev) => {
      const next = !prev;
      if (next) {
        setOffensiveViewCount((count) => count + 1);
      }
      return next;
    });
  }

  function cleanupExplosionOverlay({ restoreTarget = true } = {}) {
    if (explosionFrameRef.current !== null) {
      window.cancelAnimationFrame(explosionFrameRef.current);
      explosionFrameRef.current = null;
    }
    window.clearTimeout(explosionSmokeTimerRef.current);
    explosionSmokeTimerRef.current = null;
    explosionSmokeRef.current?.remove();
    explosionSmokeRef.current = null;

    const target = explosionTargetRef.current;
    if (target) {
      target.style.visibility = "";
    }
    if (baconImageRef.current) {
      baconImageRef.current.style.visibility = "";
    }
    explosionCanvasRef.current?.remove();
    explosionCanvasRef.current = null;
    explosionTargetRef.current = null;
    explosionTargetVisibilityRef.current = "";
  }

  function showExplosionSmoke(viewport, targetRect, viewportRect) {
    const smoke = document.createElement("div");
    smoke.className = "explosion-smoke";
    smoke.style.left = `${
      targetRect.left - viewportRect.left + targetRect.width / 2
    }px`;
    smoke.style.top = `${
      targetRect.top - viewportRect.top + targetRect.height * 0.56
    }px`;
    smoke.style.width = `${targetRect.width * 1.5}px`;
    smoke.style.height = `${targetRect.height * 1.65}px`;

    // Keep the plume varied without relying on another image asset.
    const puffs = [
      [-30, 0.42, 0.35, -14, 0],
      [4, 0.5, 0.42, 9, 0.08],
      [30, 0.38, 0.38, 15, 0.16],
      [-12, 0.62, 0.52, -18, 0.28],
      [18, 0.56, 0.48, 12, 0.4],
      [-2, 0.7, 0.58, -7, 0.52],
    ];

    for (const [x, size, rise, drift, delay] of puffs) {
      const puff = document.createElement("span");
      puff.className = "explosion-smoke-puff";
      puff.style.setProperty("--smoke-x", `${x}%`);
      puff.style.setProperty("--smoke-size", `${size * 100}%`);
      puff.style.setProperty("--smoke-rise-half", `${rise * -52}%`);
      puff.style.setProperty("--smoke-rise-full", `${rise * -100}%`);
      puff.style.setProperty("--smoke-drift", `${drift}%`);
      puff.style.setProperty("--smoke-delay", `${delay}s`);
      smoke.appendChild(puff);
    }

    viewport.appendChild(smoke);
    explosionSmokeRef.current = smoke;
    explosionSmokeTimerRef.current = window.setTimeout(() => {
      if (explosionSmokeRef.current === smoke) {
        smoke.remove();
        explosionSmokeRef.current = null;
        explosionSmokeTimerRef.current = null;
      }
    }, 2900);
  }

  function clearExplosionTimers() {
    window.clearTimeout(preTriggerTimerRef.current);
    preTriggerTimerRef.current = null;
    cleanupExplosionOverlay();
  }

  function startExplosionVfx() {
    clearExplosionTimers();

    const target = baconImageRef.current;
    const viewport = target?.closest(".game-viewport");
    if (!target || !viewport) {
      setBaconState("hidden");
      return;
    }

    const targetRect = target.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    if (!targetRect.width || !targetRect.height) {
      setBaconState("hidden");
      return;
    }

    // Sample the live character image before hiding it. The canvas mask below
    // uses the same image alpha, so the overlay is independent of the DOM
    // sprite instead of replacing the sprite with a white rectangle.
    const palette = sampleEntityPalette(target);
    const devicePixelRatio = Math.min(2, window.devicePixelRatio || 1);
    const paddingX = targetRect.width * 0.3;
    const paddingY = targetRect.height * 0.3;
    const canvasWidth = targetRect.width + paddingX * 2;
    const canvasHeight = targetRect.height + paddingY * 2;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const maskCanvas = document.createElement("canvas");
    const maskContext = maskCanvas.getContext("2d");

    if (!context || !maskContext) {
      setBaconState("hidden");
      return;
    }

    canvas.className = "character-explosion-canvas";
    canvas.width = Math.ceil(canvasWidth * devicePixelRatio);
    canvas.height = Math.ceil(canvasHeight * devicePixelRatio);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    canvas.style.left = `${
      targetRect.left - viewportRect.left - paddingX
    }px`;
    canvas.style.top = `${
      targetRect.top - viewportRect.top - paddingY
    }px`;
    viewport.appendChild(canvas);

    maskCanvas.width = Math.ceil(targetRect.width * devicePixelRatio);
    maskCanvas.height = Math.ceil(targetRect.height * devicePixelRatio);
    const scaleContext = (canvasContext) => {
      canvasContext.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0,
      );
    };
    scaleContext(context);
    scaleContext(maskContext);
    maskContext.globalCompositeOperation = "source-over";
    maskContext.drawImage(
      target,
      0,
      0,
      targetRect.width,
      targetRect.height,
    );

    const createMaskedLayer = (fillStyle) => {
      const layer = document.createElement("canvas");
      layer.width = maskCanvas.width;
      layer.height = maskCanvas.height;
      const layerContext = layer.getContext("2d");
      if (!layerContext) return null;
      scaleContext(layerContext);
      layerContext.globalCompositeOperation = "source-over";
      layerContext.drawImage(
        maskCanvas,
        0,
        0,
        targetRect.width,
        targetRect.height,
      );
      layerContext.globalCompositeOperation = "source-in";
      layerContext.fillStyle = fillStyle;
      layerContext.fillRect(0, 0, targetRect.width, targetRect.height);
      return layer;
    };

    const coreLayerCanvas = createMaskedLayer("#FFFFFF");
    if (!coreLayerCanvas) {
      canvas.remove();
      setBaconState("hidden");
      return;
    }

    explosionCanvasRef.current = canvas;
    explosionTargetRef.current = target;
    explosionTargetVisibilityRef.current = target.style.visibility;

    // Instant Eradication: avatar model vanishes completely behind the counter as the white flash detonates
    target.style.visibility = "hidden";
    setBaconState("hidden");

    playExplosionSynthBurst();

    const explodeAudio = document.getElementById("explode-sound");
    if (explodeAudio) {
      explodeAudio.currentTime = 0;
      playAudio(explodeAudio, { volume: 1 }).catch(() => {});
    }

    const startedAt = performance.now();
    const targetCenterX = paddingX + targetRect.width / 2;
    const targetCenterY = paddingY + targetRect.height / 2;
    const drawScaled = (layer, scale, alpha = 1) => {
      const width = targetRect.width * scale;
      const height = targetRect.height * scale;
      context.save();
      context.globalAlpha = alpha;
      context.drawImage(
        layer,
        targetCenterX - width / 2,
        targetCenterY - height / 2,
        width,
        height,
      );
      context.restore();
    };

    // Use a timestamp-driven animation loop for high-contrast pure white detonation
    const renderFrame = (now) => {
      const elapsed = now - startedAt;
      if (elapsed >= EXPLOSION_TOTAL_VFX_MS) {
        cleanupExplosionOverlay({ restoreTarget: false });
        setBaconState("hidden");
        if (
          isBaszuckiJumpscareArmedRef.current ||
          angerLevelRef.current >= 100
        ) {
          triggerBaszuckiJumpscare();
        }
        return;
      }

      let scale;
      let alpha;
      if (elapsed < EXPLOSION_PHASE1_EXPAND_MS) {
        const progress = elapsed / EXPLOSION_PHASE1_EXPAND_MS;
        const eased = 1 - Math.pow(1 - progress, 3);
        scale = 1 + 0.3 * eased;
        alpha = 1;
      } else {
        const progress = Math.min(
          1,
          (elapsed - EXPLOSION_PHASE1_EXPAND_MS) /
            EXPLOSION_PHASE3_COLLAPSE_MS,
        );
        const eased = 1 - Math.pow(1 - progress, 3);
        scale = 1.3 * (1 - eased * 0.35);
        alpha = 1 - progress;
      }

      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.save();
      context.globalCompositeOperation = "source-over";
      // Pure white flat high-contrast explosion shape over the character's body
      drawScaled(coreLayerCanvas, scale * 1.06, alpha);
      drawScaled(coreLayerCanvas, scale, alpha);
      context.restore();

      explosionFrameRef.current = window.requestAnimationFrame(renderFrame);
    };

    explosionFrameRef.current = window.requestAnimationFrame(renderFrame);
  }

  function dismissOffensiveItem() {
    stopWritingSequence();
    if (offensiveItemState !== "hidden") {
      setOffensiveItemState(
        offensiveItemRaised ? "exiting-from-raised" : "exiting-from-lowered"
      );
    }
  }

  function handleRedButtonClick() {
    flashGameButton("red");
    handleGameButtonClick();
    if (baconState === "visible" || baconState === "entering") {
      const finishedJohnDoeOffensiveItem =
        banReason === "repeat" && offensiveViewCount >= 2;
      const playerSafeTermination =
        isPlayerSafeTerminationReason(banReason);
      if (finishedJohnDoeOffensiveItem) {
        setJohnDoeCompleteHelp(true);
      }
      stopDecisionSequence();
      const angryAudio = document.getElementById("angry-sound");
      if (angryAudio && !playerSafeTermination) {
        angryAudio.currentTime = 0;
        playLoudSound(angryAudio, { gainValue: 2.2 }).catch(() => {});
      }
      if (!finishedJohnDoeOffensiveItem && !playerSafeTermination) {
        setPlayerAngerLevel((prev) => Math.min(100, prev + 25));
      }
      dismissOffensiveItem();
      if (helpStateRef.current !== "hidden") {
        if (helpStepRef.current === 4) {
          scheduleDavidAppearance(DAVID_APPEARANCE_DELAY_AFTER_HELP);
        }
        setHelpState("hidden");
      }
      const nextHelpDelay = finishedJohnDoeOffensiveItem ? 1000 : 2000;
      if (!sixthHelpTimerRef.current && !isBaszuckiJumpscareArmedRef.current && angerLevelRef.current < 100) {
        sixthHelpTimerRef.current = window.setTimeout(() => {
          sixthHelpTimerRef.current = null;
          openHelp(6);
        }, nextHelpDelay);
      }

      // Detonation trigger (0.00s): lock the target and mount the VFX without
      // blocking the main thread.
      setBaconState("terminating");
      window.clearTimeout(preTriggerTimerRef.current);
      preTriggerTimerRef.current = window.setTimeout(() => {
        preTriggerTimerRef.current = null;
        startExplosionVfx();
      }, PRE_TRIGGER_DELAY_MS);

      if (!isBaszuckiJumpscareArmedRef.current && angerLevelRef.current < 100) {
        scheduleBaconRespawn(EXPLOSION_TOTAL_SEQUENCE_MS);
      }
    }
  }

  function clearOhNoEndedHandler() {
    const ohNoAudio = document.getElementById("oh-no-sound");
    const handler = ohNoEndedHandlerRef.current;
    if (ohNoAudio && handler) {
      ohNoAudio.removeEventListener("ended", handler);
    }
    ohNoEndedHandlerRef.current = null;
  }

  function playOhNoSound({ triggerJumpscareOnEnd = false } = {}) {
    const ohNoAudio = document.getElementById("oh-no-sound");
    if (!ohNoAudio) {
      if (triggerJumpscareOnEnd) triggerBaszuckiJumpscare();
      return;
    }

    clearOhNoEndedHandler();
    ohNoAudio.currentTime = 0;
    ohNoAudio.volume = 1;

    let fallbackTriggerTimer = null;
    if (triggerJumpscareOnEnd) {
      const handleEnded = () => {
        if (fallbackTriggerTimer) window.clearTimeout(fallbackTriggerTimer);
        if (ohNoEndedHandlerRef.current !== handleEnded) return;
        clearOhNoEndedHandler();
        triggerBaszuckiJumpscare();
      };
      ohNoEndedHandlerRef.current = handleEnded;
      ohNoAudio.addEventListener("ended", handleEnded);

      fallbackTriggerTimer = window.setTimeout(() => {
        if (triggerJumpscareOnEnd && !hasTriggeredJumpscareRef.current) {
          clearOhNoEndedHandler();
          triggerBaszuckiJumpscare();
        }
      }, 1600);
    }

    playAudio(ohNoAudio).catch(() => {
      if (triggerJumpscareOnEnd) {
        clearOhNoEndedHandler();
        triggerBaszuckiJumpscare();
      }
    });
  }

  function handleGreenButtonClick() {
    flashGameButton("green");
    handleGameButtonClick();
    const personInCenter =
      baconState === "visible" || baconState === "entering";
    if (!personInCenter) {
      return;
    }

    let thirdGreenWithDavid = false;
    const playerAngeringAcceptance =
      isPlayerAngeringAcceptanceReason(banReason);
    if (playerAngeringAcceptance) {
      const angryAudio = document.getElementById("angry-sound");
      if (angryAudio) {
        angryAudio.currentTime = 0;
        playLoudSound(angryAudio, { gainValue: 2.2 }).catch(() => {});
      }
      setPlayerAngerLevel((prev) => Math.min(100, prev + 25));
    } else if (davidState.active && !davidState.exiting) {
      davidGreenDecisionCountRef.current += 1;
      const davidDecisionCount = davidGreenDecisionCountRef.current;
      const currentAnger = angerLevelRef.current;
      const newAnger = Math.min(
        100,
        Math.max(
          currentAnger + 34,
          davidDecisionCount === 1 ? 35 : davidDecisionCount === 2 ? 70 : 100,
        ),
      );

      if (newAnger >= 100 || davidDecisionCount >= 3) {
        thirdGreenWithDavid = true;
        setBazuckmeterLevel(100);
        setBazuckmeterOverflow(true);
        isBaszuckiJumpscareArmedRef.current = true;
        window.clearTimeout(fifthHelpTimerRef.current);
        fifthHelpTimerRef.current = null;
        window.clearTimeout(eighthHelpTimerRef.current);
        eighthHelpTimerRef.current = null;
        playOhNoSound({ triggerJumpscareOnEnd: true });
      } else if (newAnger >= 60 || davidDecisionCount === 2) {
        playOhNoSound();
        setBazuckmeterLevel(newAnger);
        window.clearTimeout(fifthHelpTimerRef.current);
        fifthHelpTimerRef.current = null;
        if (!hasShownHelp8Ref.current && !eighthHelpTimerRef.current) {
          hasShownHelp8Ref.current = true;
          scheduleHelpAfterWorkWhistle();
        }
      } else {
        playOhNoSound();
        setBazuckmeterLevel(newAnger);
        if (!fifthHelpTimerRef.current) {
          fifthHelpTimerRef.current = window.setTimeout(() => {
            fifthHelpTimerRef.current = null;
            openHelp(5);
          }, 2000);
        }
      }
    }

    if (baconState === "visible" || baconState === "entering") {
      stopDecisionSequence();
      setBaconState("exiting-right");
      dismissOffensiveItem();
      if (helpStateRef.current !== "hidden") {
        if (helpStepRef.current === 4) {
          scheduleDavidAppearance(DAVID_APPEARANCE_DELAY_AFTER_HELP);
        }
        setHelpState("hidden");
      }
      if (!isBaszuckiJumpscareArmedRef.current && angerLevelRef.current < 100) {
        scheduleBaconRespawn(2400);
      }
    } else if (
      !thirdGreenWithDavid &&
      (isBaszuckiJumpscareArmedRef.current || angerLevelRef.current >= 100)
    ) {
      triggerBaszuckiJumpscare();
    }
  }

  function handleHelpHover() {
    const hoverAudio = document.getElementById("menu-hover");
    if (!hoverAudio) return;
    hoverAudio.currentTime = 0;
    playAudio(hoverAudio, { volume: hoverAudio.volume }).catch(() => {});
  }

  function handleHelpOkClick() {
    if (helpStepRef.current === 12) {
      applyBackgroundMusicVolume(settingsVolumeDraft);
    }
    handleGameButtonClick();
    closeHelp();
  }

  function sampleEdge(e) {
    const v = e.target;
    if (v.readyState < 2) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 2;
      canvas.height = 2;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(v, 0, 0, v.videoWidth, v.videoHeight, 0, 0, 2, 2);
      const d = ctx.getImageData(0, 1, 1, 1).data;
      document.documentElement.style.setProperty(
        "--edge",
        `rgb(${d[0]}, ${d[1]}, ${d[2]})`,
      );
    } catch (err) {
      console.warn("edge sample failed", err);
    }
  }

  function handleEnded() {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    const introVideo = videoRef.current;
    if (introVideo) {
      introVideo.pause();
      introVideo.muted = true;
      introVideo.volume = 0;
    }
    startMenuMusic({ restart: true });
    requestAnimationFrame(() => {
      wrapRef.current.classList.add("slide-up");
    });
  }

  const isJumpscareEndpointOrEnded =
    baszuckiJumpscare?.phase === "endpoint" ||
    (hasTriggeredJumpscareRef.current && !baszuckiJumpscare);
  const menuHelpOpen = exitHelpVisible || settingsHelpVisible;
  const playerMeterIcon = meterIconForLevel(playerAngerLevel, "player");
  const bazuckMeterIcon = meterIconForLevel(angerLevel, "bazuck");

  return (
    <div
      className={`stage ${done ? "interactive" : ""} ${
        rootLoading || loading ? "loading" : ""
      } ${isJumpscareEndpointOrEnded || postJumpscareScreen ? "cursor-hidden" : ""} ${
        menuHelpOpen ? "menu-help-open" : ""
      }`}
      onClick={handleClick}
    >
      <div className="intro-frame">
        <div ref={wrapRef} className="video-wrap">
          <div className="video-top">
            <video
              ref={videoRef}
              src="intro.mp4"
              playsInline
              autoPlay
              loop={false}
              onEnded={handleEnded}
              onLoadedData={sampleEdge}
              preload="auto"
            />
          </div>
        <div className="menu">
          <img ref={menuImgRef} src="menu.png" alt="" />
          <span className="menu-version">v{MAIN_VERSION}</span>
          <div
            className="menu-mod-badge-wrap"
            onClick={handleMainMenuMod}
            role="button"
            tabIndex={0}
            aria-label="Open Endings"
            >
              <img
                className="menu-mod-badge"
                src="uploads/ChatGPT_Image_Sep_20__2026__04_12_34_PM.png"
                alt="MOD"
                onLoad={(event) => {
                  if (!modBadgeHoverSrc) {
                    setModBadgeHoverSrc(createModBadgeHoverImage(event.currentTarget));
                  }
                }}
              />
              {modBadgeHoverSrc && (
                <img
                  className="menu-mod-badge-hover"
                  src={modBadgeHoverSrc}
                  alt=""
                  aria-hidden="true"
                />
              )}
            </div>
            {endingsVisible && (
              <div
                className="endings-overlay"
                role="dialog"
                aria-label="Endings"
                onClick={(event) => event.stopPropagation()}
              >
                <img
                  className="endings-ui-frame"
                  src="uploads/endings_ui.png"
                  alt="Endings"
                />
                {davidCrashoutUnlocked && (
                  <div className="endings-achievement" aria-label="David Crashout">
                    David Crashout
                  </div>
                )}
                <button
                  className="endings-ok"
                  type="button"
                  aria-label="OK"
                  onClick={handleEndingsOk}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {(gameStarted || menuHelpOpen || exitJumpscareVisible) && (
        <div className="game-placeholder">
          <div
            className={`game-viewport ${
              helpState !== "hidden" ? "gameplay-paused" : ""
            } ${
              baszuckiJumpscare || hasTriggeredJumpscareRef.current
                ? "jumpscare-blackout"
                : ""
            } ${
              baszuckiJumpscare?.phase === "endpoint" ? "jumpscare-endpoint" : ""
            } ${
              hasTriggeredJumpscareRef.current && !baszuckiJumpscare
                ? "jumpscare-ended"
                : ""
            }`}
          >
            <div ref={skyFramesRef} className="game-sky-frame">
              {Array.from({ length: SKY_FRAME_COUNT }, (_, index) => (
                <img
                  key={skyFrameSrc(index)}
                  className="game-sky-frame-image"
                  src={skyFrameSrc(index)}
                  alt=""
                  style={{ visibility: index === 0 ? "visible" : "hidden" }}
                />
              ))}
            </div>
            {baszuckiJumpscare ? (
              <div
                className={`david-character-wrap david-jumpscare-target ${
                  baszuckiJumpscare.phase === "endpoint"
                    ? "david-jumpscare-endpoint"
                    : ""
                }`}
                style={{
                  "--start-x": `${baszuckiJumpscare.x}%`,
                  "--start-y": `${baszuckiJumpscare.y}%`,
                  "--start-w": `${baszuckiJumpscare.startW}%`,
                  "--end-x": `${baszuckiJumpscare.endX}%`,
                  "--end-y": `${baszuckiJumpscare.endY}%`,
                  "--target-w": `${baszuckiJumpscare.targetW}%`,
                }}
              >
                <img
                  className="david-character-img"
                  src="Screenshot 2026-08-31 190438.png"
                  alt="David Baszucki"
                />
              </div>
            ) : davidState.active && !hasTriggeredJumpscareRef.current ? (
              <div
                ref={davidElementRef}
                className={`david-character-wrap ${
                  davidState.jumpscare ? "david-jumpscare-character" : ""
                }`}
                style={{
                  left: `${davidState.x}%`,
                  bottom: `${100 - davidState.y - DAVID_SHOE_OFFSET}%`,
                  transform: `translateX(-50%) scale(${davidState.scale})`,
                  transition:
                    davidState.transitionDuration > 0
                      ? `left ${davidState.transitionDuration}s linear, bottom ${davidState.transitionDuration}s linear, transform ${davidState.transitionDuration}s linear`
                      : "none",
                }}
              >
                <img
                  className="david-character-img"
                  src="spr_buzucki.png"
                  alt="David Baszucki"
                  style={{
                    transform: `scaleX(${davidState.facing}) rotate(${davidState.rotation}deg)`,
                    transition: `transform ${DAVID_ROTATION_TRANSITION_MS}ms ease-out`,
                  }}
                />
              </div>
            ) : null}
            {baconState !== "hidden" ? (
              <img
                ref={baconImageRef}
                className={`bacon-character bacon-${baconState} ${candidateClassName(
                  candidateType,
                )}`}
                src={candidateImageSrc(candidateType)}
                alt={candidateAlt(candidateType)}
                onAnimationEnd={(event) => {
                  if (event.animationName === "bacon-slide-in") {
                    setBaconState("visible");
                    startDecisionTimer();
                    setOffensiveItemRaised(false);
                    setOffensiveItemState("entering");
                    if (!hasShownHelp4Ref.current) {
                      hasShownHelp4Ref.current = true;
                      window.setTimeout(() => openHelp(4), 1000);
                    }
                  } else if (event.animationName === "bacon-slide-out-right") {
                    setBaconState("hidden");
                    if (
                      isBaszuckiJumpscareArmedRef.current ||
                      angerLevelRef.current >= 100
                    ) {
                      triggerBaszuckiJumpscare();
                    }
                  }
                }}
              />
            ) : null}
            {!isJumpscareEndpointOrEnded && (
              <>
                <img
                  className="game-wood"
                  src="spr_maingame_bg wood.png"
                  alt=""
                />
                <div
                  className={`playersmeter-wrap ${
                    playerMeterIcon ? "playersmeter-has-icon" : ""
                  }`}
                  aria-label="Playersmeter"
                >
                  <img
                    className="playersmeter-bg"
                    src="playersmeter.png"
                    alt="Playersmeter"
                  />
                  {playerMeterIcon && (
                    <>
                      {(playerMeterIcon.variant === "angry" ||
                        playerMeterIcon.variant === "very-angry") && (
                        <AngrySteamEffect
                          meterType="playersmeter"
                          variant={playerMeterIcon.variant}
                          triggerKey={playerSteamTrigger}
                        />
                      )}
                      <img
                        className={`meter-icon playersmeter-icon meter-icon-${playerMeterIcon.variant}`}
                        src={playerMeterIcon.src}
                        alt=""
                        draggable={false}
                      />
                    </>
                  )}
                  <div className="playersmeter-tube">
                    <img
                      className="playersmeter-beam"
                      src="spr_red_pixel.png"
                      alt=""
                      draggable={false}
                      style={{
                        height: `${playerAngerLevel}%`,
                        opacity: playerAngerLevel > 0 ? 1 : 0,
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`bazuckmeter-wrap ${
                    bazuckMeterIcon ? "bazuckmeter-has-icon" : ""
                  }`}
                  aria-label="Bazuckmeter"
                >
                  <img
                    className="bazuckmeter-bg"
                    src="bazuckmeter.png"
                    alt="Bazuckmeter"
                  />
                  {bazuckMeterIcon && (
                    <>
                      {(bazuckMeterIcon.variant === "angry" ||
                        bazuckMeterIcon.variant === "very-angry") &&
                        angerLevel < 100 &&
                        !bazuckmeterOverflow &&
                        davidGreenDecisionCountRef.current < 3 && (
                        <AngrySteamEffect
                          meterType="bazuckmeter"
                          variant={bazuckMeterIcon.variant}
                          triggerKey={bazuckSteamTrigger}
                        />
                      )}
                      <img
                        className={`meter-icon bazuckmeter-icon meter-icon-${bazuckMeterIcon.variant}`}
                        src={bazuckMeterIcon.src}
                        alt=""
                        draggable={false}
                      />
                    </>
                  )}
                  <div
                    className={`bazuckmeter-tube ${
                      bazuckmeterOverflow ? "bazuckmeter-tube-overflow" : ""
                    }`}
                  >
                    <img
                      className={`bazuckmeter-beam ${
                        bazuckmeterOverflow ? "bazuckmeter-beam-overflow" : ""
                      }`}
                      src="spr_red_pixel.png"
                      alt=""
                      draggable={false}
                      style={{
                        height: bazuckmeterOverflow ? "300%" : `${angerLevel}%`,
                        opacity: angerLevel > 0 ? 1 : 0,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
            {offensiveItemState !== "hidden" && !isJumpscareEndpointOrEnded && (
              <div
                className={`offensive-item offensive-item-${offensiveItemState} ${
                  offensiveItemRaised
                    ? "offensive-item-raised"
                    : "offensive-item-lowered"
                }`}
                onClick={handleOffensiveItemClick}
                onAnimationEnd={(event) => {
                  if (event.animationName === "offensive-item-rise") {
                    setOffensiveItemState("visible");
                  } else if (
                    event.animationName === "offensive-item-fall-raised" ||
                    event.animationName === "offensive-item-fall-lowered"
                  ) {
                    setOffensiveItemState("hidden");
                    setOffensiveItemRaised(false);
                  }
                }}
              >
                <img
                  className="offensive-item-img"
                  src="offensive_item.png"
                  alt="Offensive item"
                  draggable={false}
                />
                {banReason === "family" ? (
                  <img
                    className="offensive-item-content"
                    src="ilovemyfamily.png"
                    alt="I love my family"
                    draggable={false}
                  />
                ) : banReason === "fuckyou" ? (
                  <img
                    className="offensive-item-content"
                    src="uploads/Slur-You.png"
                    alt="Fuck you"
                    draggable={false}
                  />
                ) : banReason === "repeat" ? (
                  <>
                    <div className="offensive-item-text offensive-item-noob-main">
                      He'll do it again
                    </div>
                    {offensiveViewCount >= 2 && (
                      <div className="offensive-item-noob-extra">
                        I won't :)
                      </div>
                    )}
                  </>
                ) : banReason === "blank" ? null : (
                  <div className="offensive-item-text">
                    {banReasonText(banReason)}
                  </div>
                )}
              </div>
            )}
            {!isJumpscareEndpointOrEnded && (
              <div className="game-buttons">
                <button
                  type="button"
                  className="game-button game-button-red"
                  aria-label="Red button"
                  onPointerDown={(event) => pressGameButton("red", event)}
                  onPointerUp={() => releaseGameButton("red")}
                  onPointerCancel={() => releaseGameButton("red")}
                  onPointerLeave={() => releaseGameButton("red")}
                  onClick={handleRedButtonClick}
                >
                  <img
                    src={
                      pressedButton === "red"
                        ? "buttonredpressed.png"
                        : "buttonred.png"
                    }
                    alt=""
                  />
                </button>
                <button
                  className="game-button game-button-green"
                  type="button"
                  aria-label="Green button"
                  onPointerDown={(event) => pressGameButton("green", event)}
                  onPointerUp={() => releaseGameButton("green")}
                  onPointerCancel={() => releaseGameButton("green")}
                  onPointerLeave={() => releaseGameButton("green")}
                  onClick={handleGreenButtonClick}
                >
                  <img
                    src={
                      pressedButton === "green"
                        ? "buttongreenpressed.png"
                        : "buttongreen.png"
                    }
                    alt=""
                  />
                </button>
              </div>
            )}
            {decisionWarning && (
              <div className="decision-warning" role="alert">
                You&apos;re taking too long!
              </div>
            )}
            {helpState !== "hidden" && (
              <div
                className={`helpy-overlay helpy-${helpState} ${
                  helpStep === 9 ? "helpy-ninth" : ""
                } ${
                  helpStep === 11 ? "helpy-eleventh" : ""
                } ${
                  johnDoeCompleteHelp && helpStep === 6
                    ? "helpy-john-doe-complete"
                    : ""
                }`}
                role="dialog"
                aria-label="Helpy's tips"
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  className={`helpy-face-frame ${
                    helpStep === 9 ? "helpy-face-black" : ""
                  } ${helpyFaceBlank ? "helpy-face-blank" : ""}`}
                  onClick={() => {
                    if (helpyFaceBlank) return;
                    helpyFaceClickCountRef.current += 1;
                    if (helpyFaceClickCountRef.current >= 25) {
                      setHelpyFaceBlank(true);
                    }
                  }}
                >
                  {!helpyFaceBlank && (
                    <img
                      className="helpy-face"
                      src="free-crop (1).png"
                      alt=""
                    />
                  )}
                </div>
                <img
                  ref={helpImgRef}
                  className="helpy-ui-frame"
                  src="helpy_ui.png"
                  alt="Helpy's tips"
                />
                {helpStep === 11 && (
                  <img
                    className="helpy-cluttered"
                    src="ecluttered.png"
                    alt="Cluttered Helpy message"
                    draggable={false}
                  />
                )}
                <div className="helpy-copy">
                  {johnDoeCompleteHelp && helpStep === 6 ? (
                    <div className="helpy-john-doe-copy" aria-label="Helpy's tips">
                      <p className="helpy-john-doe-line helpy-john-doe-line-one">
                        Roblox Players did not like that!
                      </p>
                      <p className="helpy-john-doe-line helpy-john-doe-line-two">
                        Remember: Wrongful terminations will anger the Playerbase
                      </p>
                      <p className="helpy-john-doe-line helpy-john-doe-line-three">
                        Avoid them! Wait for David to leave
                      </p>
                      <p className="helpy-john-doe-line helpy-john-doe-line-four">
                        then unban Robloxians
                      </p>
                      <p className="helpy-john-doe-line helpy-john-doe-line-five">
                        David is furious now!
                      </p>
                      <p className="helpy-john-doe-line helpy-john-doe-line-six">
                        If he sees one more ban reversal, it&apos;s game over!
                      </p>
                    </div>
                  ) : helpStep === 1 ? (
                    <>
                      <p className="helpy-greeting">Hello! I'm Helpy!</p>
                      <p className="helpy-message">
                        I will guide you
                        <br />
                        through the game
                      </p>
                    </>
                  ) : helpStep === 2 ? (
                    <p className="helpy-message helpy-message-long">
                      Robloxians who are banned
                      <br />
                      will come to you.
                      <br />
                      Your Job is to decide
                      <br />
                      whether to remove the ban
                      <br />
                      or terminate them
                    </p>
                  ) : helpStep === 3 ? (
                    <p className="helpy-message helpy-message-third">
                      Red button terminates
                      <br />
                      the Robloxian
                      <br />
                      <br />
                      Green button unbans
                      <br />
                      them
                    </p>
                  ) : helpStep === 4 ? (
                    <p className="helpy-message helpy-message-fourth">
                      Click on the paper
                      <br />
                      bellow to see the
                      <br />
                      ban reason, also
                      <br />
                      known as
                      <br />
                      &quot;Offensive Item&quot;
                    </p>
                  ) : helpStep === 5 ? (
                    <p className="helpy-message helpy-message-fifth">
                      <span className="helpy-fifth-opening">
                        David saw that!
                      </span>
                      <br />
                      Remember:
                      <br />
                      David likes his AI
                      <br />
                      Reverting a decision
                      <br />
                      made by AI angers him
                      <br />
                      <span className="helpy-fifth-warning">
                        DO NOT MAKE HIM
                        <br />
                        ANGRY
                      </span>
                    </p>
                  ) : helpStep === 6 ? (
                    <p className="helpy-message helpy-message-sixth">
                      Roblox Players
                      <br />
                      did not like that!
                      <br />
                      Remember:
                      <br />
                      Wrongfull terminations
                      <br />
                      will anger the
                      <br />
                      Playerbase
                      <br />
                      Avoid Them!
                    </p>
                  ) : helpStep === 7 ? (
                    <p className="helpy-message helpy-message-seventh">
                      Wait for David to leave
                      <br />
                      then unban Robloxians
                    </p>
                  ) : helpStep === 8 ? (
                    <p className="helpy-message helpy-message-eighth">
                      David is furious now!
                      <br />
                      <br />
                      If he sees one more
                      <br />
                      ban reversal,
                      <br />
                      it&apos;s game over!
                    </p>
                  ) :
                    helpStep === 9 &&
                    (exitCrashPendingRef.current ||
                      exitJumpscareSequenceRef.current) ? (
                    <p className="helpy-message helpy-message-ninth helpy-exit-message">
                      {EXIT_HELP_MESSAGE}
                    </p>
                  ) : helpStep === 10 ? (
                    <p className="helpy-message helpy-settings-message">
                      {SETTINGS_HELP_MESSAGE}
                    </p>
                  ) : helpStep === 12 ? (
                    <div className="helpy-volume-settings">
                      <p className="helpy-message helpy-settings-message">
                        {SETTINGS_VOLUME_HELP_MESSAGE}
                      </p>
                      <input
                        className="helpy-volume-slider"
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={settingsVolumeDraft}
                        aria-label="Background music volume"
                        onChange={(event) =>
                          setSettingsVolumeDraft(Number(event.target.value))
                        }
                      />
                    </div>
                  ) : null}
                </div>
                <button
                  ref={helpOkRef}
                  className="helpy-ok"
                  type="button"
                  aria-label="OK!"
                  onMouseEnter={handleHelpHover}
                  onClick={handleHelpOkClick}
                />
              </div>
            )}
          </div>
        </div>
      )}
      {postJumpscareScreen && (
        <div className="post-jumpscare-screen" aria-hidden="true">
          <div className="post-jumpscare-frame">
            <img
              src="Screenshot 2026-09-01 172237.png"
              alt=""
              draggable={false}
            />
          </div>
        </div>
      )}
      {(rootLoading || loading) && (
        <div className="loading-screen" aria-label="Loading" />
      )}
    </div>
  );
}

createRoot(document.getElementById("app")).render(<App />);
