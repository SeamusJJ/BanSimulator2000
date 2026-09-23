import { Fragment, jsx as jsxDEV } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  initImageHighlight,
  initMenuHighlight
} from "./menu-highlight.js";
import {
  connectLoFi,
  getAudioContext,
  playAudio,
  playMusic
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
const DECISION_TIMEOUT = 1e4;
const ANGRY_SOUND_PRE_DELAY_MS = 500;
const ANGRY_SOUND_POST_DELAY_MS = 1500;
const REGULAR_DECISION_METER_DELAY_MS = 1e3;
const JOHN_DOE_DECISION_METER_DELAY_MS = 800;
const JOHN_DOE_DECISION_SOUND_INTERVAL_MS = 1500;
const REGULAR_DECISION_PLAYER_METER_INCREMENT = 10;
const JOHN_DOE_DECISION_PLAYER_METER_INCREMENT = 30;
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
const NEXT_NPC_HELP_HOLD_DELAY = 2e3;
const NEXT_PERSON_DELAY_AFTER_FIFTH_HELP = 500;
const EIGHTH_HELP_APPEARANCE_DELAY = 1500;
const NEXT_PERSON_DELAY_AFTER_DAVID_FURIOUS_HELP = 1e3;
const DAVID_JUMPSCARE_CHANCE = 0.24;
const DAVID_JUMPSCARE_DURATION = 0.72;
const DAVID_JUMPSCARE_SETTLE_DURATION = 0.4;
const JUMPSCARE_ZOOM_DURATION = 0.65;
const JUMPSCARE_STUTTER_DELAY = 500;
const POST_JUMPSCARE_DELAY = 300;
const MENU_MUSIC_START_TIME = 17;
const BUTTON_PRESS_FEEDBACK_MS = 240;
const PRE_TRIGGER_DELAY_MS = 0;
const EXPLOSION_PHASE1_EXPAND_MS = 100;
const EXPLOSION_PHASE3_COLLAPSE_MS = 250;
const EXPLOSION_TOTAL_VFX_MS = EXPLOSION_PHASE1_EXPAND_MS + EXPLOSION_PHASE3_COLLAPSE_MS + 50;
const EXPLOSION_TOTAL_SEQUENCE_MS = PRE_TRIGGER_DELAY_MS + EXPLOSION_TOTAL_VFX_MS;
const EXPLOSION_FALLBACK_COLOR = [0, 162, 232];
const SETTINGS_HELP_MESSAGE = "Sorry, Roblox Entertainment hasn't implemented this yet cuz they are lazy.";
const SETTINGS_VOLUME_HELP_MESSAGE = "Fine heres the volume settings";
const EXIT_HELP_MESSAGE = `A\u0337\u0358\u035D\u0301\u0352\u0342\u0307\u0307\u0346\u0344\u0311\u030A\u0310\u0344\u0311\u033F\u0357\u0351\u034B\u031A\u0315\u0307\u0342\u0305\u031B\u0307\u0301\u0351\u0306\u031B\u0312\u030E\u0342\u0309\u030A\u0344\u033F\u0344\u0302\u0341\u0352\u0346\u0302\u0313\u0351\u0358\u0358\u0350\u0315\u0311\u034C\u030B\u0302\u0343\u035B\u0346\u0310\u0351\u0313\u030B\u030D\u030F\u033E\u0356\u0317\u0321\u033A\u0324\u0328\u0323\u032D\u0356\u0345\u032B\u0317\u0320\u0323\u0339\u032E\u0322\u0333\u0331\u032F\u0330\u0354\u0324\u0323\u0332\u034E\u0326\u034E\u0325\u032C\u0320\u0318\u0322\u033C\u032E\u0339\u033B\u035C\u0359\u032C\u032D\u0321\u0339\u0355\u0316\u0322\u0349\u0318R\u0336\u0340\u0343\u035D\u0360\u0358\u035D\u031A\u0360\u0306\u0357\u031A\u0346\u033D\u035D\u030F\u0360\u030F\u0303\u0303\u0342\u035D\u0301\u0344\u030B\u0305\u034C\u030F\u0342\u0342\u033E\u0301\u034B\u030E\u0313\u030C\u032F\u0353\u0319\u0356\u0332\u035A\u0354\u0330\u032C\u0332\u035C\u032A\u0347\u032A\u033A\u0326\u0332\u031F\u032B\u031E\u0359\u0320\u0359\u0330\u0316\u0347\u034D\u035C\u0347\u0320\u0354\u0333\u0347\u031E\u0316\u0356\u0323\u0320\u031F\u0319\u0325\u0319\u0323\u0349\u032B\u032B\u035A\u0329\u035A\u035C\u0354\u0348\u0353\u032F\u0331\u0339\u034D\u0349\u0355\u0354\u0317\u0345\u0317\u032C\u0349\u0347\u0320\u0354\u0320\u0359E\u0336\u030D\u0351\u0310\u0300\u030A\u033D\u0358\u0312\u0310\u0310\u035D\u034B\u0304\u0310\u0352\u0351\u030E\u0311\u0302\u032E\u0356\u0328\u0317\u034D\u0324\u0339\u0321\u031F\u0326\u0354\u034D\u0354\u035A\u033C\u0324\u0318\u0325\u0317\u033B\u032A\u0359\u0330\u0321\u033C\u0325\u0327\u0323\u0356\u0319\u0339\u0333\u0355\u035A\u0316\u0324\u032E\u033A\u0347\u0318\u0353\u0353\u0354\u034E\u032E\u0359\u0359\u0347\u031F\u0320\u031E\u0345\u0354\u0354\u0319\u0331\u0331\u031C\u0319\u035A\u032F\u0322\u033B\u031E\u032E \u0334\u030C\u035D\u034C\u0313\u0340\u0360\u033F\u0346\u0342\u0313\u0346\u0305\u0308\u035D\u0341\u0360\u033D\u034C\u0352\u0342\u033E\u0314\u034A\u035D\u0342\u0351\u030A\u030F\u0309\u0325\u0349\u0354\u034E\u0318\u0323\u0353\u032A\u0359\u0320\u031D\u0330\u0349\u0333\u0333\u0345\u0329\u033B\u0347\u0321\u0331\u0355\u032B\u031C\u0348\u033A\u031C\u0322\u0349\u0348\u031E\u0345Y\u0337\u030C\u0351\u030A\u0305\u033D\u035D\u0301\u030D\u035B\u030D\u033F\u0307\u0313\u0311\u031B\u0350\u031A\u030C\u0346\u033F\u030B\u0315\u0342\u030B\u0360\u0314\u035B\u030B\u0350\u0351\u0351\u0342\u030E\u0344\u0315\u0343\u0302\u035D\u0351\u033E\u034B\u030E\u0340\u030C\u0301\u0300\u034A\u034A\u0344\u0309\u032E\u0349\u0323\u033C\u0328\u033B\u0321\u0355\u032F\u0332\u031C\u031FO\u0335\u030A\u031B\u0300\u0341\u0357\u0346\u031B\u0311\u0303\u031D\u0325\u0354\u0333\u0332\u0323\u0348\u032D\u0353\u0354\u031F\u034D\u0348\u031F\u0325\u0332\u0345\u0349\u0321\u032E\u0333\u0323\u032D\u032C\u032F\u0347\u0319\u031F\u0359\u032A\u0330\u032F\u0322\u034E\u0323\u0324\u031D\u035A\u032E\u033C\u031F\u032C\u032E\u0330\u0324\u035A\u0321\u0319\u0348\u0329\u0327\u0318\u0353\u0326\u032F\u032C\u0316\u031F\u0316\u0332\u034D\u035C\u0321\u0331\u0347\u0326U\u0334\u0307\u0311\u034B\u0314\u0346\u0315\u030B\u030B\u034E\u031C\u0325\u032F\u032B\u031C\u0318\u033A\u0319\u0333\u0356\u0321\u034D\u0323\u0330\u031F\u0348\u032B\u032F\u0320\u0327\u032B \u0334\u0314\u0307\u030D\u035B\u0310\u0313\u0360\u0342\u034C\u030E\u0357\u0300\u035B\u0351\u0307\u0312\u0358\u0310\u035B\u035D\u0314\u0300\u030F\u0323\u0356\u032A\u0359\u031D\u0329\u033A\u0349\u0332\u033A\u032B\u0328\u0322\u0329\u0349\u035C\u0332\u0348\u031F\u0327\u0319\u0328\u032F\u0332\u0333\u034E\u0320\u0359\u033C\u0356\u032C\u033A\u031C\u0354\u035C\u0322\u0339\u0333\u031F\u0330\u0323\u0330\u0326\u035C\u0330\u0359\u0332\u0322\u032D\u031F\u0333\u0329\u0356\u0320\u0320\u0349\u0345\u0356\u0325S\u0336\u031B\u0357\u0300\u0315\u0308\u0346\u0302\u0341\u030D\u035B\u0304\u0315\u0315\u033D\u035D\u030C\u0308\u0301\u031A\u0305\u0304\u0341\u030B\u0302\u030B\u031B\u0301\u030A\u0346\u034B\u0357\u0346\u0309\u0341\u0344\u0310\u033F\u030A\u0314\u0301\u0360\u033D\u0312\u0315\u034C\u0358\u0300\u0302\u0306\u0344\u0304\u0303\u030E\u0357\u0312\u0352\u0305\u030F\u0300\u0310\u0303\u030D\u030D\u034C\u0341\u0308\u0341\u0342\u0342\u031D\u031C\u0316\u032E\u034E\u0327\u0356\u031F\u035A\u0325\u034D\u0316\u0324\u031F\u0356\u0348\u034E\u035C\u0323\u031E\u0319\u0327\u0317\u031E\u0318\u031E\u0320\u033C\u0356\u0326\u034E\u031D\u034D\u0354\u0329\u0317\u0316\u032A\u0355\u0321\u0326\u0324\u0321\u0327\u0332\u032C\u0317\u0316\u033B\u0348U\u0336\u030C\u0305\u0360\u0309\u0300\u0310\u034B\u0357\u0311\u0302\u031B\u0360\u0314\u034A\u0305\u0344\u0305\u0351\u0302\u0305\u030E\u0310\u030F\u0341\u035D\u0342\u0310\u035B\u0346\u0312\u0340\u030C\u033E\u035D\u0314\u0313\u0350\u0343\u035B\u0340\u031A\u033E\u035D\u030B\u035A\u032F\u0322\u0355\u035A\u034D\u0345\u0345\u031E\u0325\u034E\u034E\u0339\u0328\u0353\u0348\u033C\u0316\u0332\u035A\u033C\u0331\u0345\u0317\u031C\u0332\u0322\u0325\u0327\u0353\u0353\u0317\u034D\u0325\u0333\u031C\u0329\u034E\u0328\u033C\u0318\u032F\u032C\u0359\u031D\u034D\u0317\u0356\u034E\u031C\u0327\u0316\u0354\u0329\u0319\u0321R\u0336\u0344\u031B\u030D\u0344\u033F\u030C\u0307\u0357\u0346\u033E\u0351\u0346\u0352\u0340\u0308\u0312\u030C\u034B\u0303\u030E\u034C\u0350\u0340\u0344\u0352\u0311\u035D\u0307\u034A\u035D\u035D\u033E\u0350\u0308\u0314\u0302\u0307\u0352\u0304\u0307\u032C\u0319\u032A\u0354\u034D\u032C\u032A\u0329\u034E\u0322\u0348\u032C\u0329\u032A\u0328\u0321\u0329\u031D\u0353\u031E\u0327\u0348\u034D\u0328\u035A\u032E\u0355\u0326\u0345\u0353\u033B\u031D\u034D\u0325\u0324\u0318\u0339\u0353\u0324\u032C\u032E\u032B\u0353\u033A\u0329\u033A\u035C\u0322\u032F\u031FE\u0334\u033F\u0307\u030B\u0315\u0341\u0303\u0346\u033F\u0310\u0344\u0302\u034A\u034C\u0351\u031B\u0358\u0314\u035D\u030F\u0305\u0315\u033D\u030B\u0313\u033F\u030F\u0351\u0352\u034A\u0303\u035B\u034A\u033E\u0358\u0302\u035D\u035D\u030A\u0314\u033F\u0352\u0311\u0302\u0314\u0301\u0342\u035D\u0302\u033F\u033E\u033E\u0357\u034A\u0342\u0303\u0342\u034C\u0352\u032F\u0328\u0355\u0329\u035A\u0330\u0319\u033B\u031F\u032C\u0359\u0330\u0355\u0317\u0317\u0339\u032C\u035A\u032B\u0355\u031D\u0356\u0349\u031D\u0318\u033C\u0329\u0348\u035C\u0330\u031C\u034D\u0333\u032E\u0332\u0327\u0353\u0316\u0359\u0353\u0323\u0331\u031E\u032B\u0325\u0339\u0339\u034D\u031F\u0331\u0359\u035C\u032F\u0322\u0321\u032A\u032D\u034D\u0349\u032A\u0333\u0345\u0325\u0354\u033B\u032C \u0338\u0352\u0344\u0314\u030A\u0344\u035D\u031A\u030E\u0360\u0313\u034A\u031A\u030A\u0304\u0311\u0343\u031A\u035D\u0350\u0313\u0300\u0306\u0308\u0358\u0350\u0303\u030A\u0341\u0313\u0358\u0306\u0303\u0358\u034C\u035B\u033D\u031A\u0301\u0344\u0302\u0351\u035D\u0305\u0315\u0302\u0315\u0340\u0358\u030C\u0319\u0322\u0317\u0355\u032E\u0345\u031F\u0322\u0329\u032C\u0331\u031D\u0325\u0356\u0329\u0320\u032A\u0319\u0325\u0328\u032F\u0333\u033C\u035A\u035C\u034E\u0322\u0320\u0332\u0333\u0324\u032F\u031C\u0345\u032A\u0323\u0356\u033B\u0356\u0331\u0333\u035C\u0316\u0329\u032C\u0353\u033B\u0356\u031D\u0345\u032AY\u0337\u0344\u0314\u0360\u030D\u0358\u035B\u030B\u0308\u0302\u033E\u0313\u0341\u0309\u0342\u0312\u0300\u035D\u0308\u0303\u035B\u0313\u0311\u034C\u0311\u0318\u035A\u0354\u0356\u035C\u031D\u032E\u0353\u0323\u0348\u0348\u033C\u0339\u0321\u0328\u0323\u034EO\u0338\u0314\u0304\u0310\u0340\u0308\u0344\u0303\u0333\u034D\u031F\u031D\u035A\u035C\u031C\u0347\u0316\u0348\u031E\u0320\u033B\u0321\u034E\u031E\u0353U\u0336\u033E\u0343\u035B\u0352\u0312\u0344\u0350\u0309\u0314\u0346\u0301\u0342\u035D\u030E\u030E\u0307\u030F\u035B\u0341\u0343\u030A\u033F\u034B\u0307\u0310\u0357\u033B\u0356\u032A\u0327\u0320\u0321\u032C\u0319\u0332\u0323\u034E\u035A\u033C\u0319\u0345\u0316\u031E\u0324\u0327\u0353\u0332\u0322\u0316\u0319\u031F\u033A\u0355\u031C\u033A\u0316\u031D\u0331\u0317\u034E\u034E\u0356\u031F\u032D\u0330\u0332\u035C\u034E\u0347\u032C\u032D\u0327\u0356\u0328\u0333\u0321\u035C\u0317\u032D\u0324 \u0337\u0350\u033E\u0311\u0304\u0311\u030C\u0305\u031B\u030A\u035B\u0344\u030C\u0310\u030F\u034B\u0344\u031B\u035D\u033D\u030B\u0309\u0312\u030A\u0357\u0306\u030F\u0302\u0350\u0350\u034A\u0304\u031C\u031E\u0331\u0339\u0354\u033A\u0323\u0356\u0330\u0333\u0359\u031D\u0327\u0353\u0320\u0353\u0317\u032F\u0345\u0347\u0329\u0318\u0327\u031F\u031C\u0329\u0345\u0347\u0328\u0347\u0321\u033A\u0356\u0330\u031F\u0320\u0353\u0331\u0349\u0354\u0323\u0356\u0339\u031F\u033B\u0320\u0329\u0349\u033A\u034E\u0326\u0331\u032E\u0319\u0330W\u0334\u0342\u0343\u0351\u030A\u034C\u034A\u0340\u0344\u030F\u0350\u0341\u031A\u0360\u035D\u034B\u0304\u0308\u0312\u030D\u034C\u030E\u0315\u0351\u030F\u0307\u035B\u0313\u033D\u031A\u0340\u030C\u0344\u0343\u0310\u0357\u0351\u0360\u031B\u0340\u0350\u0311\u0306\u0302\u0302\u034B\u0302\u0343\u0358\u0358\u031B\u0357\u0306\u0344\u033F\u0317\u032B\u0319\u0356\u0326\u0319\u0319\u035C\u0328\u033AA\u0335\u0313\u0301\u034C\u033D\u0304\u0309\u030E\u034A\u031B\u0314\u033E\u033F\u030B\u0302\u0358\u034A\u0309\u0308\u034C\u0303\u031B\u0303\u0341\u0350\u034C\u0311\u0301\u0357\u035D\u033F\u0357\u031A\u033F\u0310\u0309\u033D\u0314\u0308\u0313\u0352\u0350\u0301\u0352\u0360\u030B\u0315\u0350\u0344\u034A\u0304\u0328N\u0336\u030B\u0360\u030B\u0309\u0344\u0360\u0357\u030D\u0360\u035D\u030B\u0302\u0343\u0313\u0357\u0309\u0301\u034C\u0311\u0301\u030B\u0306\u035D\u030E\u0306\u035D\u030F\u0357\u0346\u030C\u0313\u034B\u0343\u0344\u034B\u033F\u033E\u0352\u030F\u0315\u0305\u0350\u0315\u0304\u0344\u0314\u0303\u0343\u033F\u034E\u033B\u0327\u032A\u0318\u031E\u0321\u0319\u0349\u0328\u0323\u0321\u035A\u0339\u035C\u031D\u0326\u032B\u0333\u0347\u031D\u0353\u0325\u0318\u031F\u033AT\u0335\u0306\u031B\u0306\u033D\u0342\u030D\u0300\u0352\u035D\u0357\u031B\u030F\u0311\u0309\u0342\u035D\u0307\u0357\u0305\u030B\u0312\u030A\u0344\u030F\u0350\u034C\u0300\u030C\u0310\u0343\u0341\u0312\u030F\u0301\u0343\u0313\u030D\u0353\u034E\u0318\u0318\u0349\u032F\u0347\u0331\u0321\u032A\u031E\u032A\u0330\u032B\u0332\u0319\u0331\u0339\u032D\u0348\u0317\u031D\u0321\u0325\u034D\u0356\u0328\u034D\u0329\u0323\u032A\u0325\u033B\u0317\u0353\u035A\u034E\u0323\u0318\u032F\u0325\u031C\u0328\u0339\u032D\u0354\u032C\u034D\u034D \u0337\u0351\u0339\u031E\u0354\u0339\u0325\u035A\u032A\u031D\u031F\u032A\u032AT\u0338\u0301\u033E\u035D\u033F\u030E\u030C\u034A\u0344\u0304\u0343\u0340\u0360\u0307\u0340\u030D\u0313\u0342\u0357\u0301\u0340\u0357\u0307\u030B\u034A\u0341\u031A\u0307\u0300\u0313\u0343\u0341\u030E\u0307\u030F\u0360\u0340\u030F\u0310\u034A\u035B\u0342\u0304\u0311\u030D\u0301\u0341\u0350\u0344\u030E\u0341\u030F\u033D\u0300\u0314\u033F\u035B\u0357\u0341\u030F\u035D\u0305\u035B\u033D\u0307\u034C\u0357\u0308\u0317\u031E\u031E\u034D\u0359O\u0334\u030F\u031B\u034B\u0303\u0360\u0308\u0352\u0340\u034C\u034E\u035A\u0356\u032F\u0320\u032E\u0348\u031E\u033A\u033A\u032D\u032D\u032C\u0330\u0319\u0325\u0320\u033A\u0327\u031C\u031F\u032C\u032F\u0356\u0321\u0321\u0353\u0353\u0359\u0324\u0333\u0332\u032C\u034D\u0318\u0319\u0323\u032F\u033B\u031D\u0320\u0326\u0323\u033B\u032A\u031C\u0322\u0322\u032C\u033B\u035C\u034E\u032B\u0327\u035A\u0328\u035A \u0337\u030F\u0350\u0312\u0357\u031A\u0342\u0312\u030D\u0302\u030C\u0311\u0309\u0352\u0358\u031B\u031A\u0300\u0312\u0300\u031A\u0351\u0344\u0307\u031C\u033A\u0356\u0323\u0322\u032C\u033B\u0326\u0348\u0331\u032A\u0320\u031C\u0354\u0325\u0353\u034E\u031F\u032B\u035A\u0355\u0326\u0324\u032E\u0327\u035A\u031E\u0329\u0331\u033B\u033C\u0329\u031E\u0347\u035A\u0328\u0333\u031D\u032C\u0325\u0317\u0317\u034D\u0317\u034D\u0329\u034D\u0347\u035A M\u0338\u035D\u035D\u034C\u0302\u0304\u0358\u0309\u0342\u0340\u0341\u035B\u0300\u0342\u030A\u0358\u0343\u0351\u0313\u031B\u033F\u0313\u0311\u034D\u0321\u0324\u0316\u0333\u0322\u0333\u0321\u032D\u0320\u0332\u0349\u033B\u0339\u0356\u033A\u032C\u035C\u0319\u0321\u0318\u0319\u0347\u0353\u031D\u033A\u0316\u031D\u0321\u0328\u0323\u0320\u0353\u0322\u0345\u0332\u0321\u031E\u0356\u0321\u0339\u033A\u0359\u031D\u032B\u0339\u0317\u0333\u034D\u0348\u0332\u0356\u0324\u0326\u0320\u0345\u032D\u0323\u031C\u031C\u0328\u0327\u0326\u0332O\u0335\u030E\u030B\u030D\u0311\u031A\u0344\u0343\u0357\u0311\u0305\u0314\u0341\u0344\u0316\u033C\u032E\u0359\u033C\u031C\u0317\u0331\u0326\u0326\u034E\u0331\u0325\u0331\u032D\u0348\u0348\u031D\u0333\u0345\u034D\u0317\u032A\u0321\u0328\u035A\u033A\u0347\u0319\u0331\u0326\u033B\u0320\u0323\u033C\u0339\u0329\u034D\u0349\u032C\u031F\u0329\u0332\u0333\u0354\u0330\u031D\u0330\u0318\u0329\u0327\u0331D\u0336\u030D\u033E\u0314\u030D\u0305\u0301\u034C\u0308\u0342\u033D\u032D\u035A\u0328\u0325\u0323\u0331\u0317\u0356\u0355\u0318\u031D\u032F\u0345\u032B\u033B\u0322\u034E\u0326\u031E\u031F\u035A\u034D\u0324\u035C\u035C\u0317\u033A\u0323\u031D\u0339\u0329\u031F\u0359\u0320\u031E\u0356\u0354\u0328\u0318\u035C\u032C\u032E\u0328\u0348\u0325\u031C\u0321\u0345\u032D\u0339\u0329\u032A\u0345\u033B\u0345\u0327 \u0338\u030A\u0344\u0358\u030E\u035D\u0313\u034A\u0315\u0313\u0304\u0300\u031B\u034A\u0341\u0357\u0314\u0305\u035D\u0346\u0344\u035B\u0315\u0305\u0344\u0304\u031B\u0313\u030C\u034B\u035D\u0341\u0302\u0350\u0351\u033E\u0308\u0352\u0313\u0302\u0340\u0361\u0325\u032A\u0332\u034D\u031F\u0353\u0323\u032A\u0347\u0347\u031E\u0323\u0354\u0359\u033A\u0331\u031F\u0320\u0332\u0345\u0332\u0330\u0333\u0354\u0316\u0356\u033C\u035C\u033B\u032C\u033C\u0327\u0333\u0331\u0330\u032C\u033C\u0316\u0316\u0356\u0329\u0320\u0325\u0327\u034D\u0355\u0332\u0353\u0317\u031F\u0353\u0317\u034DO\u0334\u0303\u031A\u035D\u0306\u0306\u0310\u030A\u030A\u0310\u031A\u0360\u0315\u030A\u033E\u0310\u031A\u0340\u0307\u0316\u0322U\u0338\u035D\u030A\u033E\u030A\u033D\u0306\u0312\u0358\u031B\u0306\u030D\u0306\u0309\u0308\u035D\u0307\u0303\u0355\u0359\u0324\u035A\u0320\u0347\u035A\u0356\u0317\u0324\u0325\u0317\u0339\u0348\u032C\u035A\u031E\u0318\u0327\u032A\u032E\u0321\u031E\u0353\u0318\u0359\u032D\u0353\u031F\u032F\u033A\u032F\u033B\u0320\u033C\u032B\u0356R\u0335\u0305\u033E\u0304\u0304\u0306\u0350\u0360\u031C\u0332 \u0337\u034B\u0315\u0310\u0344\u034A\u033F\u034B\u0308\u0303\u034A\u0344\u033F\u030F\u030C\u030D\u0344\u0303\u030E\u035D\u0358\u0360\u0306\u0310\u033D\u034C\u0301\u030F\u0344\u035D\u0301\u0343\u0303\u0306\u030C\u0315\u0301\u0309\u030D\u0350\u0312\u035D\u0342\u033F\u0352\u0344\u0357\u0307\u0348\u0349\u0347\u0328\u033B\u0327\u0319\u0354\u0355\u0354\u0353\u031E\u0359\u034D\u0320\u035C\u031F\u031F\u0349\u0348\u0353\u0319\u032A\u0326\u0349\u0327\u033C\u032D\u031F\u031E\u0355\u0327\u032E\u0317\u0327\u032D\u0348\u0349\u0354\u0329\u0332\u0320\u0354\u0353\u0330\u0325\u033A\u032B\u0345\u0349\u0327\u031F\u032A\u0329\u0325\u0323G\u0334\u035B\u0360\u034A\u0343\u0352\u0342\u033F\u0308\u0314\u0350\u0346\u033E\u0312\u0309\u0357\u0307\u0313\u0312\u0304\u0302\u0343\u030B\u0308\u033D\u030D\u033F\u0313\u034C\u0358\u0302\u0340\u0304\u0342\u0344\u033D\u031A\u0309\u033F\u0305\u0307\u0314\u0342\u033E\u0352\u030E\u0344\u0301\u0303\u0312\u0350\u031B\u0300\u0303\u031A\u0304\u0307\u0300\u0340\u0300\u0305\u030B\u0315\u0340\u035B\u0313\u0306\u0322\u0333\u0329\u033A\u034D\u0331\u034D\u0320\u0333\u033C\u0316\u0355\u032C\u0349\u0359\u0319\u032A\u0355\u0332\u0353\u032F\u0324\u034EA\u0338\u0342\u0308\u033E\u0343\u033F\u0307\u033F\u0302\u0313\u035D\u0307\u034B\u0341\u0300\u0340\u035D\u0304\u0304\u0307\u0311\u0313\u0301\u0305\u033D\u0306\u030C\u0305\u0344\u0342\u033D\u0358\u035B\u0303\u030A\u0344\u0309\u0315\u0310\u0352\u0360\u030C\u0315\u0301\u033F\u0306\u0308\u030C\u0346\u035D\u0315\u034C\u0304\u0340\u030D\u0358\u0314\u030F\u0306\u033E\u030E\u0317\u0333\u0317\u0318\u033B\u0316\u0339\u0348\u0348\u0330\u033C\u033B\u0328\u0323\u0333\u0354\u0339\u031E\u034D\u033A\u0347\u0348\u0322\u034E\u0323\u0320\u033C\u0325\u032C\u034E\u032A\u031C\u0318\u031D\u0339\u033A\u0348\u0347\u0349\u0354\u0329\u031D\u0356\u0325\u031C\u034E\u031D\u0329\u033B\u0339\u0332\u0327\u0322\u0356\u0326\u0328\u0347\u0354\u0339\u0324\u032C\u0325\u035A\u0323\u0339\u0332\u035A\u035AM\u0336\u0360\u0343\u0344\u034B\u0360\u0350\u030F\u0305\u034B\u033E\u0344\u0357\u0310\u033F\u0350\u0315\u0344\u0346\u033E\u0314\u0351\u0308\u0300\u033E\u0311\u030B\u0351\u0344\u0352\u030D\u035B\u030B\u0352\u0344\u0350\u0301\u0311\u0301\u033E\u0301\u0311\u0360\u033F\u0300\u030D\u0351\u0310\u0330\u0323\u0323\u0322\u0356\u034E\u0327\u032F\u0355\u0323\u0325\u034E\u0354\u0347\u0332\u0330\u033B\u032A\u0359\u0326E\u0336\u0305\u0310\u0344\u0344\u0301\u0357\u033E\u0346\u030F\u0340\u030D\u034B\u0343\u0304\u0360\u033D\u035D\u0301\u033E\u030B\u0309\u0306\u0342\u035D\u0309\u0314\u0306\u0310\u035D\u0311\u0304\u0341\u030F\u0357\u031D\u0327\u0345\u0322\u034E\u0347\u0326\u0321\u0327\u0349\u0330\u032C\u031F\u0316\u032E\u0353\u032E\u0354?\u0338\u030A\u0308\u0344\u030A\u033D\u0304\u0340\u0305\u0312\u0308\u0305\u0307\u0341\u0311\u0306\u033E\u034A\u030C\u0301\u0341\u033E\u0344\u030A\u0310\u0341\u0312\u034C\u0342\u034B\u0313\u0357\u0311\u0305\u0357\u035B\u035D\u0306\u030B\u0311\u0350\u030E\u0341\u0315\u033F\u0302\u0313\u0342\u030E\u0302\u035B\u0340\u0309\u0323\u0320\u0316\u035A\u0324\u0321\u0317\u0355\u0339\u0356\u032D\u0322\u0321\u031D\u0316\u0326\u0356\u033B\u0354\u0324\u0348\u032E\u0354\u0318\u031C\u0339\u0359\u032D\u032F\u0326\u032C\u031E\u0330\u0332\u0320\u0321\u0354\u031D\u034E\u0325\u0317\u031E\u0317\u0320\u034D\u0356\u0323\u031D\u0324\u031D\u0339\u0316\u034E\u034E\u033A?\u0337\u0303\u0303\u035B\u035D\u0311\u033D\u0341\u035B\u031B\u0344\u034C\u033F\u033D\u035B\u0352\u031B\u0344\u0351\u035D\u0342\u0313\u035D\u031A\u0341\u0357\u0346\u0342\u030B\u0302\u0341\u0304\u033F\u030B\u0352\u033D\u030F\u030E\u0301\u031A\u0344\u0352\u0341\u0306\u0340\u035D\u0311\u0358\u0343\u0344\u0309\u0352\u0350\u0341\u030A\u030A\u0300\u033F\u0340\u030E\u0350\u0352\u0357\u0310\u030E\u0346\u035D\u0306\u030F\u0351\u0358\u0316\u033C\u0323\u0328\u031F`;
function davidScaleForDepth(y) {
  const depth = Math.max(
    0,
    Math.min(1, (y - DAVID_BACK_Y) / (DAVID_FRONT_Y - DAVID_BACK_Y))
  );
  return Math.round((0.42 + depth * 0.76) * 100) / 100;
}
function davidEntryTargetX(entersFromLeft) {
  return entersFromLeft ? 18 + Math.random() * 24 : 58 + Math.random() * 24;
}
function davidPeekRotation(x, y, paperVisible) {
  const paperBlocksDavid = paperVisible && y >= DAVID_NEAR_DESK_Y && x >= DAVID_PAPER_BLOCK_LEFT && x <= DAVID_PAPER_BLOCK_RIGHT;
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
      if (normalizedX < 0.16 || normalizedX > 0.84 || normalizedY < 0.3 || normalizedY > 0.74) {
        continue;
      }
      const offset = (y * width + x) * 4;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const darkestChannel = Math.max(red, green, blue);
      const colorRange = Math.max(red, green, blue) - Math.min(red, green, blue);
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
    const icons2 = {
      mid: "mid.png",
      angry: "angry.png",
      veryAngry: "very angry.png"
    };
    const variant2 = level >= 75 ? "veryAngry" : level >= 50 ? "angry" : "mid";
    return {
      src: icons2[variant2],
      variant: variant2.replace("Angry", "-angry").toLowerCase()
    };
  }
  if (level < 15) return null;
  const icons = {
    mid: "david mid.png",
    angry: "david angry.png",
    veryAngry: "david very angry.png"
  };
  const variant = level >= 99 ? "veryAngry" : level >= 50 ? "angry" : "mid";
  return {
    src: icons[variant],
    variant: variant.replace("Angry", "-angry").toLowerCase()
  };
}
function rgbCss([r, g, b]) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}
function mixRgb(first, second, amount) {
  return first.map(
    (channel, index) => Math.round(channel + (second[index] - channel) * amount)
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
      flame: "rgb(255, 100, 0)"
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
          pixels[offset + 2]
        ];
        const max = Math.max(...color);
        const min = Math.min(...color);
        const saturation = max ? (max - min) / max : 0;
        const isTorso = x / sampleSize >= 0.18 && x / sampleSize <= 0.82 && y / sampleSize >= 0.35 && y / sampleSize <= 0.85;
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
    const average = (totals, weight, fallbackColor) => weight ? totals.map((channel) => channel / weight) : fallbackColor;
    const primary = average(primaryTotals, primaryWeight, fallback);
    const secondary = average(
      secondaryTotals,
      secondaryWeight,
      [255, 230, 40]
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
      flame: "rgb(255, 100, 0)"
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
      flame: "rgb(255, 100, 0)"
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
  playAudio(paperAudio, { volume: 1, lofi: false }).catch(() => {
  });
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
    gain.gain.setValueAtTime(1e-4, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 8e-3);
    gain.gain.exponentialRampToValueAtTime(1e-4, start + 0.12);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.12);
    context.resume().catch(() => {
    });
  } catch (error) {
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
      } catch (err) {
      }
      const playPromise = v.play();
      if (playPromise) {
        playPromise.catch(() => {
        });
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
    }, burstEndTime / speed * 1e3 + 300);
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      if (leftV) {
        leftV.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
  }, [triggerKey, variant]);
  if (!visible) return null;
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `meter-steam-wrap ${meterType}-steam-wrap ${meterType}-steam-${variant}`,
      children: [
        /* @__PURE__ */ jsxDEV(
          "video",
          {
            ref: leftVideoRef,
            className: `meter-steam-video ${meterType}-steam-left`,
            src: "vfx-alpha-matte-1788679900008 (1).webm",
            preload: "auto",
            autoPlay: true,
            muted: true,
            playsInline: true
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 473,
            columnNumber: 7
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "video",
          {
            ref: rightVideoRef,
            className: `meter-steam-video ${meterType}-steam-right`,
            src: "vfx-alpha-matte-1788679900008 (1).webm",
            preload: "auto",
            autoPlay: true,
            muted: true,
            playsInline: true
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 482,
            columnNumber: 7
          },
          this
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "<stdin>",
      lineNumber: 470,
      columnNumber: 5
    },
    this
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
  const [johnDoeCompleteHelp, setJohnDoeCompleteHelp] = useState(false);
  const [angerLevel, setAngerLevel] = useState(0);
  const [bazuckmeterOverflow, setBazuckmeterOverflow] = useState(false);
  const [playerAngerLevel, setPlayerAngerLevel] = useState(0);
  const [bazuckSteamTrigger, setBazuckSteamTrigger] = useState(0);
  const [playerSteamTrigger, setPlayerSteamTrigger] = useState(0);
  const prevAngerLevelRef = useRef(0);
  const prevPlayerAngerLevelRef = useRef(0);
  useEffect(() => {
    if (angerLevel >= 50 && angerLevel < 100 && davidGreenDecisionCountRef.current < 3 && angerLevel !== prevAngerLevelRef.current) {
      setBazuckSteamTrigger((prev) => prev + 1);
    }
    prevAngerLevelRef.current = angerLevel;
  }, [angerLevel]);
  useEffect(() => {
    if (playerAngerLevel >= 50 && playerAngerLevel !== prevPlayerAngerLevelRef.current) {
      setPlayerSteamTrigger((prev) => prev + 1);
    }
    prevPlayerAngerLevelRef.current = playerAngerLevel;
  }, [playerAngerLevel]);
  const [pressedButton, setPressedButton] = useState(null);
  const [decisionWarning, setDecisionWarning] = useState(false);
  const [baconState, setBaconState] = useState("hidden");
  const baconStateRef = useRef("hidden");
  const [candidateType, setCandidateType] = useState("bacon");
  const [offensiveItemState, setOffensiveItemState] = useState("hidden");
  const [offensiveItemRaised, setOffensiveItemRaised] = useState(false);
  const [offensiveViewCount, setOffensiveViewCount] = useState(0);
  const [baszuckiJumpscare, setBaszuckiJumpscare] = useState(null);
  const [postJumpscareScreen, setPostJumpscareScreen] = useState(false);
  const [exitHelpVisible, setExitHelpVisible] = useState(false);
  const [exitJumpscareVisible, setExitJumpscareVisible] = useState(false);
  const [settingsHelpVisible, setSettingsHelpVisible] = useState(false);
  const [settingsVolumeDraft, setSettingsVolumeDraft] = useState(1);
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
    transitionDuration: 0
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
  const playGameRef = useRef(() => {
  });
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
    jumpscare: false
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
    startPromise.then(() => {
      if (requestId !== menuMusicRequestRef.current) {
        music.pause();
      }
    }).catch(() => {
    }).finally(() => {
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
        }
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
      skyFramesRef.current.querySelectorAll(".game-sky-frame-image")
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
    const timer = window.setTimeout(() => openHelp(1), 2e3);
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
      if (cityMusic && !hasTriggeredJumpscareRef.current) startMusic(cityMusic).catch(() => {
      });
      helpWasOpenRef.current = false;
    }
  }, [gameStarted, helpState]);
  useEffect(() => {
    if (helpState === "hidden" || !helpImgRef.current || !helpOkRef.current) {
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
        pixelMode: "ok-text"
      },
      target: helpOkRef.current
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
      window.setTimeout(finish, 3e3);
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
      window.setTimeout(finish, 3e3);
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
      window.setTimeout(finish, 3e3);
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
          waitForVideo(steamVideo)
        ]);
        if (mounted) {
          setRootLoading(false);
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
          video.play().catch(() => {
          });
        }
        const music = document.getElementById("music");
        if (music && started && done && !gameStartedRef.current && !loadingRef.current && !exitHelpVisible && !settingsHelpVisible && music.paused) {
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
          ...Array.from(
            { length: SKY_FRAME_COUNT },
            (_, index) => waitForImage(skyFrameSrc(index))
          )
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
    notifyAudio.play().catch(() => {
    });
  }
  function openHelp(step = 1) {
    if (!gameStartedRef.current || helpStateRef.current !== "hidden") return;
    const hasActiveRespawnTimer = respawnTimerRef.current !== null;
    if (respawnWaitForHelpRef.current && (hasActiveRespawnTimer || respawnRemainingRef.current !== null)) {
      window.clearTimeout(respawnTimerRef.current);
      respawnTimerRef.current = null;
      respawnDueAtRef.current = null;
      if (hasActiveRespawnTimer) {
        respawnRemainingRef.current = 0;
      }
      respawnWaitForHelpRef.current = false;
    }
    playHelpNotification();
    setHelpStep(step);
    setHelpState("entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        hasHelpAppearedRef.current = true;
        setHelpState("visible");
      });
    });
  }
  function scheduleBaconRespawn(delay = 3e3) {
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
      if (isBaszuckiJumpscareArmedRef.current || hasTriggeredJumpscareRef.current) {
        return;
      }
      if (helpStateRef.current !== "hidden") {
        respawnRemainingRef.current = 1e3;
        return;
      }
      const nextType = candidateTypeRef.current === "bacon" ? "acorn" : candidateTypeRef.current === "acorn" ? "oakley" : candidateTypeRef.current === "oakley" ? "noob" : candidateTypeRef.current === "noob" ? "n00b112" : "bacon";
      showBacon(nextType);
    }, delay);
  }
  function stopJumpscareAudio() {
    if (jumpscareSourceRef.current) {
      try {
        jumpscareSourceRef.current.stop();
        jumpscareSourceRef.current.disconnect();
      } catch (e) {
      }
      jumpscareSourceRef.current = null;
    }
    if (jumpscareLoopSourceRef.current) {
      try {
        jumpscareLoopSourceRef.current.stop();
        jumpscareLoopSourceRef.current.disconnect();
      } catch (e) {
      }
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
    if (jumpscareGainRef.current) {
      jumpscareGainRef.current.gain.value = 0;
    }
  }
  function resumeJumpscareSound() {
    if (!jumpscareSoundPausedRef.current || jumpscareSoundEndedRef.current) {
      return;
    }
    jumpscareSoundPausedRef.current = false;
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {
      });
    }
    if (jumpscareGainRef.current) {
      jumpscareGainRef.current.gain.value = 0.5;
    }
    const jumpscareAudio = document.getElementById("jumpscare-sound");
    if (jumpscareAudio && !jumpscareLoopSourceRef.current && !jumpscareSourceRef.current) {
      jumpscareAudio.play().catch(() => {
      });
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
    legoAudio.play().catch(() => {
    });
  }
  function pauseJumpscareSequence() {
    if (!hasTriggeredJumpscareRef.current) return;
    if (jumpscareEndpointTimerRef.current !== null) {
      jumpscareEndpointRemainingRef.current = Math.max(
        0,
        (jumpscareEndpointDueAtRef.current ?? Date.now()) - Date.now()
      );
      window.clearTimeout(jumpscareEndpointTimerRef.current);
      jumpscareEndpointTimerRef.current = null;
      jumpscareEndpointDueAtRef.current = null;
    }
    if (jumpscareEndTimerRef.current !== null) {
      jumpscareEndRemainingRef.current = Math.max(
        0,
        (jumpscareEndDueAtRef.current ?? Date.now()) - Date.now()
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
        remaining
      );
      return;
    }
    if (jumpscareEndRemainingRef.current !== null) {
      const remaining = jumpscareEndRemainingRef.current;
      jumpscareEndRemainingRef.current = null;
      jumpscareEndDueAtRef.current = Date.now() + remaining;
      jumpscareEndTimerRef.current = window.setTimeout(
        () => finishJumpscare(),
        remaining
      );
    }
  }
  function runJumpscareEndpoint() {
    jumpscareEndpointTimerRef.current = null;
    jumpscareEndpointDueAtRef.current = null;
    setBaszuckiJumpscare(
      (prev) => prev ? { ...prev, phase: "endpoint" } : null
    );
    if (jumpscareSourceRef.current) {
      try {
        jumpscareSourceRef.current.stop();
        jumpscareSourceRef.current.disconnect();
      } catch (e) {
      }
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
        jumpscareAudio.play().catch(() => {
        });
      }, 60);
      jumpscareLoopSourceRef.current = {
        stop: () => window.clearInterval(stutterInterval),
        disconnect: () => {
        }
      };
    }
    jumpscareEndDueAtRef.current = Date.now() + JUMPSCARE_STUTTER_DELAY;
    jumpscareEndTimerRef.current = window.setTimeout(
      () => finishJumpscare(),
      JUMPSCARE_STUTTER_DELAY
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
    if (davidRect && viewportRect && viewportRect.width > 0 && viewportRect.height > 0) {
      return {
        x: (davidRect.left + davidRect.width / 2 - viewportRect.left) / viewportRect.width * 100,
        y: (davidRect.top + davidRect.height / 2 - viewportRect.top) / viewportRect.height * 100,
        startW: davidRect.width / viewportRect.width * 100
      };
    }
    const current = davidPosRef.current;
    return {
      x: current.x,
      y: 50,
      startW: 15
    };
  }
  function triggerBaszuckiJumpscare() {
    if (hasTriggeredJumpscareRef.current) return;
    hasTriggeredJumpscareRef.current = true;
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
    davidPosRef.current = {
      ...davidPosRef.current,
      jumpscare: false,
      exiting: true
    };
    setDavidState((current) => ({
      ...current,
      active: false,
      exiting: true,
      jumpscare: false,
      transitionDuration: 0
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
      targetW: 75
    });
    if (!exitJumpscareSequenceRef.current) {
      ninthHelpTimerRef.current = window.setTimeout(() => {
        ninthHelpTimerRef.current = null;
        pauseJumpscareSound();
        openHelp(9);
      }, JUMPSCARE_ZOOM_DURATION * 1e3 / 2);
    }
    if (!audioCtx) {
      audioCtx = getAudioContext();
    }
    audioCtx.resume().catch(() => {
    });
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
        playLoudSound(jumpscareAudio, { gainValue: 0.5 }).catch(() => {
        });
      }
    }
    jumpscareEndpointDueAtRef.current = Date.now() + JUMPSCARE_ZOOM_DURATION * 1e3;
    jumpscareEndpointTimerRef.current = window.setTimeout(
      () => runJumpscareEndpoint(),
      JUMPSCARE_ZOOM_DURATION * 1e3
    );
  }
  function pauseBaconRespawn() {
    if (respawnTimerRef.current === null) return;
    respawnRemainingRef.current = Math.max(
      0,
      (respawnDueAtRef.current ?? Date.now()) - Date.now()
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
      playLoudSound(alarm, { gainValue: 0.25 }).catch(() => {
      });
    }
    startDecisionPenalty();
  }
  function startDecisionPenalty() {
    stopDecisionPenaltyCycle(true);
    const cycle = decisionPenaltyCycleRef.current;
    const isJohnDoeWarning = candidateTypeRef.current === "noob";
    const meterDelay = isJohnDoeWarning ? JOHN_DOE_DECISION_METER_DELAY_MS : REGULAR_DECISION_METER_DELAY_MS;
    const meterIncrement = isJohnDoeWarning ? JOHN_DOE_DECISION_PLAYER_METER_INCREMENT : REGULAR_DECISION_PLAYER_METER_INCREMENT;
    const playNextPenaltySound = () => {
      if (cycle !== decisionPenaltyCycleRef.current || decisionPhaseRef.current !== "warning" || helpStateRef.current !== "hidden") {
        return;
      }
      decisionPenaltyTimerRef.current = window.setTimeout(() => {
        decisionPenaltyTimerRef.current = null;
        if (cycle !== decisionPenaltyCycleRef.current || decisionPhaseRef.current !== "warning" || helpStateRef.current !== "hidden") {
          return;
        }
        const angryAudio = document.getElementById("angry-sound");
        if (!angryAudio) return;
        angryAudio.currentTime = 0;
        angryAudio.playbackRate = 1;
        const meterTimer = window.setTimeout(() => {
          decisionPenaltyMeterTimerRef.current = null;
          if (cycle !== decisionPenaltyCycleRef.current || decisionPhaseRef.current !== "warning" || helpStateRef.current !== "hidden") {
            return;
          }
          setPlayerAngerLevel((prev) => Math.min(100, prev + meterIncrement));
        }, meterDelay);
        decisionPenaltyMeterTimerRef.current = meterTimer;
        const handleEnded2 = () => {
          const shouldContinue = cycle === decisionPenaltyCycleRef.current && decisionPhaseRef.current === "warning" && helpStateRef.current === "hidden";
          if (decisionPenaltyEndedHandlerRef.current === handleEnded2) {
            decisionPenaltyEndedHandlerRef.current = null;
            decisionPenaltyAudioRef.current = null;
            angryAudio.removeEventListener("ended", handleEnded2);
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
          decisionPenaltyTimerRef.current = window.setTimeout(() => {
            decisionPenaltyTimerRef.current = null;
            playNextPenaltySound();
          }, JOHN_DOE_DECISION_SOUND_INTERVAL_MS);
        } else {
          decisionPenaltyEndedHandlerRef.current = handleEnded2;
          angryAudio.addEventListener("ended", handleEnded2);
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
          if (decisionPenaltyEndedHandlerRef.current === handleEnded2) {
            decisionPenaltyEndedHandlerRef.current = null;
            decisionPenaltyAudioRef.current = null;
            angryAudio.removeEventListener("ended", handleEnded2);
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
    const handleEnded2 = decisionPenaltyEndedHandlerRef.current;
    if (angryAudio && handleEnded2) {
      angryAudio.removeEventListener("ended", handleEnded2);
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
          (decisionDueAtRef.current ?? Date.now()) - Date.now()
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
    const fallbackDelay = Number.isFinite(whistle.duration) && whistle.duration > 0 ? Math.ceil(whistle.duration * 1e3) + 200 : 3e3;
    eighthHelpTimerRef.current = window.setTimeout(showHelp, fallbackDelay);
    playAudio(whistle).catch(() => showHelp());
  }
  function pauseDavidMotion() {
    const element = davidElementRef.current;
    const viewport = element?.closest(".game-viewport");
    if (!element || !viewport || !davidState.active) return;
    const elementRect = element.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    const currentX = (elementRect.left + elementRect.width / 2 - viewportRect.left) / viewportRect.width * 100;
    const currentY = 100 - (viewportRect.bottom - elementRect.bottom) / viewportRect.height * 100 - DAVID_SHOE_OFFSET;
    const clampedY = Math.max(
      DAVID_BACK_Y,
      Math.min(DAVID_FRONT_Y, currentY)
    );
    const currentScale = davidScaleForDepth(clampedY);
    const target = { ...davidPosRef.current };
    const isExiting = davidState.exiting;
    const distanceToTarget = Math.abs(target.x - currentX) + Math.abs(target.y - clampedY);
    const pausedDuration = isExiting ? Math.max(
      0.4,
      Math.round(distanceToTarget / DAVID_EXIT_SPEED * 10) / 10
    ) : distanceToTarget > 0.5 ? Math.max(1.2, Math.round(distanceToTarget / 10 * 10) / 10) : 0;
    davidPauseRef.current = {
      target,
      transitionDuration: pausedDuration,
      phase: isExiting ? "exiting" : davidState.jumpscare ? "jumpscare" : "wandering"
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
      scale: currentScale
    };
    setDavidState((current) => ({
      ...current,
      x: currentX,
      y: clampedY,
      scale: currentScale,
      transitionDuration: 0
    }));
  }
  function resumeDavidMotion() {
    const paused = davidPauseRef.current;
    if (!paused || !davidState.active) return;
    davidPauseRef.current = null;
    const currentX = davidPosRef.current.x;
    const target = paused.target;
    if (paused.phase === "wandering" && target.rotation !== 0) {
      davidPosRef.current = target;
      setDavidState((current) => ({
        ...current,
        ...target,
        transitionDuration: 0
      }));
      resetDavidRotationAndResume();
      return;
    }
    const currentY = davidPosRef.current.y;
    const distance = Math.abs(target.x - currentX) + Math.abs(target.y - currentY);
    const duration = distance > 0.5 ? Math.max(1.2, paused.transitionDuration || 2) : 0;
    davidPosRef.current = target;
    if (paused.phase === "jumpscare") {
      const duration2 = DAVID_JUMPSCARE_DURATION;
      setDavidState((current) => ({
        ...current,
        ...target,
        transitionDuration: duration2
      }));
      davidJumpscareTimerRef.current = window.setTimeout(
        () => settleDavidAfterJumpscare(target.x, target.facing),
        duration2 * 1e3
      );
      return;
    }
    setDavidState((current) => ({
      ...current,
      ...target,
      transitionDuration: duration
    }));
    if (paused.phase === "exiting") {
      window.clearTimeout(davidExitTimerRef.current);
      davidExitTimerRef.current = window.setTimeout(
        () => finishDavidExit(),
        duration * 1e3
      );
    } else {
      window.clearTimeout(davidWanderTimerRef.current);
      davidWanderTimerRef.current = window.setTimeout(
        () => scheduleNextWander(),
        (duration + 1.2) * 1e3
      );
    }
  }
  function scheduleDavidAppearance(delay = DAVID_APPEARANCE_DELAY_AFTER_HELP) {
    if (hasDavidSpawnedRef.current) return;
    window.clearTimeout(davidTimerRef.current);
    davidTimerRef.current = window.setTimeout(() => {
      spawnDavidBaszucki();
    }, delay);
  }
  function spawnDavidBaszucki() {
    if (hasDavidSpawnedRef.current || !gameStartedRef.current) return;
    if (!hasHelpAppearedRef.current || helpStateRef.current !== "hidden") {
      scheduleDavidAppearance(250);
      return;
    }
    hasDavidSpawnedRef.current = true;
    davidGreenDecisionCountRef.current = 0;
    const entranceY = DAVID_NEAR_DESK_Y + Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y);
    const initialPos = {
      x: 115,
      y: entranceY,
      scale: davidScaleForDepth(entranceY),
      facing: -1,
      rotation: 0,
      exiting: false
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
      transitionDuration: 0
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
          exiting: false
        };
        setDavidState({
          active: true,
          x: entranceX,
          y: entranceY,
          scale: entranceScale,
          facing: -1,
          rotation: 0,
          exiting: false,
          transitionDuration: entranceDuration
        });
        window.clearTimeout(davidWanderTimerRef.current);
        davidWanderTimerRef.current = window.setTimeout(() => {
          scheduleNextWander();
        }, (entranceDuration + 1.2) * 1e3);
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
      rotation: 0
    };
    davidPosRef.current = reset;
    setDavidState((state) => ({
      ...state,
      ...reset,
      transitionDuration: 0
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
      rotation
    };
    davidPosRef.current = current;
    setDavidState((state) => ({
      ...state,
      ...current,
      transitionDuration: 0
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
        targetY = DAVID_NEAR_DESK_Y + Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y);
        if (paperVisible && (current.x < DAVID_PAPER_BLOCK_LEFT || current.x > DAVID_PAPER_BLOCK_RIGHT) && Math.random() < 0.7) {
          targetX = DAVID_PAPER_BLOCK_LEFT + Math.random() * (DAVID_PAPER_BLOCK_RIGHT - DAVID_PAPER_BLOCK_LEFT);
        }
      } else {
        targetY = DAVID_BACK_Y + Math.random() * (DAVID_MID_Y + 4 - DAVID_BACK_Y);
      }
      if (Math.abs(targetY - current.y) < 4) {
        targetY = goNearWood ? Math.min(
          DAVID_FRONT_Y,
          Math.max(DAVID_NEAR_DESK_Y, current.y + 4)
        ) : Math.max(
          DAVID_BACK_Y,
          Math.min(DAVID_MID_Y + 4, current.y - 4)
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
        targetY = DAVID_NEAR_DESK_Y + Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y);
      } else {
        targetY = current.y + (Math.random() - 0.5) * 4;
      }
    }
    targetY = Math.max(DAVID_BACK_Y, Math.min(DAVID_FRONT_Y, targetY));
    const targetScale = davidScaleForDepth(targetY);
    const facing = targetX < current.x ? -1 : 1;
    const rotation = davidPeekRotation(targetX, targetY, paperVisible);
    if (rotation !== 0) {
      startDavidRotation(rotation);
      return;
    }
    const dx = targetX - current.x;
    const dy = targetY - current.y;
    const dist = Math.hypot(dx, dy);
    const speed = 10;
    const duration = Math.max(2, Math.round(dist / speed * 10) / 10);
    davidPosRef.current = {
      x: targetX,
      y: targetY,
      scale: targetScale,
      facing,
      rotation,
      exiting: false
    };
    setDavidState({
      active: true,
      x: targetX,
      y: targetY,
      scale: targetScale,
      facing,
      rotation,
      exiting: false,
      transitionDuration: duration
    });
    window.clearTimeout(davidWanderTimerRef.current);
    davidWanderTimerRef.current = window.setTimeout(() => {
      scheduleNextWander();
    }, duration * 1e3);
  }
  function startDavidExit() {
    if (!gameStartedRef.current || helpStateRef.current !== "hidden" || !davidState.active || davidState.exiting) {
      return;
    }
    const exitsLeft = Math.random() < 0.5;
    const current = davidPosRef.current;
    const exitX = exitsLeft ? -22 : 122;
    const duration = Math.max(
      2.4,
      Math.round(Math.abs(exitX - current.x) / DAVID_EXIT_SPEED * 10) / 10
    );
    const target = {
      ...current,
      x: exitX,
      facing: exitsLeft ? -1 : 1,
      exiting: true
    };
    window.clearTimeout(davidWanderTimerRef.current);
    davidWanderTimerRef.current = null;
    davidPosRef.current = target;
    setDavidState({
      active: true,
      ...target,
      transitionDuration: duration
    });
    window.clearTimeout(davidExitTimerRef.current);
    davidExitTimerRef.current = window.setTimeout(
      () => finishDavidExit(),
      duration * 1e3
    );
  }
  function finishDavidExit() {
    davidExitTimerRef.current = null;
    if (!gameStartedRef.current) return;
    if (helpStateRef.current !== "hidden") {
      davidExitTimerRef.current = window.setTimeout(
        () => finishDavidExit(),
        500
      );
      return;
    }
    setDavidState((current) => ({
      ...current,
      active: false,
      exiting: true,
      transitionDuration: 0
    }));
    scheduleDavidReturn();
  }
  function scheduleDavidReturn() {
    window.clearTimeout(davidReturnTimerRef.current);
    const delay = DAVID_RETURN_MIN_DELAY + Math.random() * (DAVID_RETURN_MAX_DELAY - DAVID_RETURN_MIN_DELAY);
    davidReturnTimerRef.current = window.setTimeout(
      () => bringDavidBack(),
      delay
    );
  }
  function settleDavidAfterJumpscare(targetX, facing) {
    davidJumpscareTimerRef.current = null;
    if (!gameStartedRef.current) return;
    if (helpStateRef.current !== "hidden") {
      davidJumpscareTimerRef.current = window.setTimeout(
        () => settleDavidAfterJumpscare(targetX, facing),
        500
      );
      return;
    }
    const goNearWood = Math.random() < DAVID_FRONT_CHANCE;
    const targetY = goNearWood ? DAVID_NEAR_DESK_Y + Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y) : DAVID_BACK_Y + Math.random() * (DAVID_FRONT_Y - DAVID_BACK_Y);
    const target = {
      x: targetX,
      y: targetY,
      scale: davidScaleForDepth(targetY),
      facing,
      rotation: 0,
      exiting: false,
      jumpscare: false
    };
    davidPosRef.current = target;
    setDavidState({
      active: true,
      ...target,
      transitionDuration: DAVID_JUMPSCARE_SETTLE_DURATION
    });
    window.clearTimeout(davidWanderTimerRef.current);
    davidWanderTimerRef.current = window.setTimeout(
      () => scheduleNextWander(),
      (DAVID_JUMPSCARE_SETTLE_DURATION + 1.2) * 1e3
    );
  }
  function bringDavidBack() {
    davidReturnTimerRef.current = null;
    if (!gameStartedRef.current) return;
    if (helpStateRef.current !== "hidden") {
      davidReturnTimerRef.current = window.setTimeout(
        () => bringDavidBack(),
        500
      );
      return;
    }
    const entersFromLeft = Math.random() < 0.5;
    const entranceX = entersFromLeft ? -22 : 122;
    const isJumpscare = false;
    const targetX = isJumpscare ? 50 + (Math.random() - 0.5) * 10 : davidEntryTargetX(entersFromLeft);
    const goNearWood = Math.random() < DAVID_FRONT_CHANCE;
    const targetY = isJumpscare ? 100 : goNearWood ? DAVID_NEAR_DESK_Y + Math.random() * (DAVID_FRONT_Y - DAVID_NEAR_DESK_Y) : DAVID_BACK_Y + Math.random() * (DAVID_FRONT_Y - DAVID_BACK_Y);
    const target = {
      x: targetX,
      y: targetY,
      scale: isJumpscare ? 1.2 : davidScaleForDepth(targetY),
      facing: entersFromLeft ? 1 : -1,
      rotation: 0,
      exiting: false,
      jumpscare: isJumpscare
    };
    const entrance = {
      x: entranceX,
      y: targetY,
      scale: target.scale,
      facing: target.facing,
      rotation: 0,
      exiting: false,
      jumpscare: isJumpscare
    };
    const duration = isJumpscare ? DAVID_JUMPSCARE_DURATION : Math.max(
      2.4,
      Math.round(
        Math.abs(targetX - entranceX) / DAVID_EXIT_SPEED * 10
      ) / 10
    );
    davidPosRef.current = entrance;
    setDavidState({
      active: true,
      ...entrance,
      transitionDuration: 0
    });
    requestAnimationFrame(() => {
      if (!gameStartedRef.current || helpStateRef.current !== "hidden") {
        return;
      }
      davidPosRef.current = target;
      setDavidState({
        active: true,
        ...target,
        transitionDuration: duration
      });
      window.clearTimeout(davidWanderTimerRef.current);
      if (isJumpscare) {
        window.clearTimeout(davidJumpscareTimerRef.current);
        davidJumpscareTimerRef.current = window.setTimeout(
          () => settleDavidAfterJumpscare(targetX, target.facing),
          duration * 1e3
        );
      } else {
        davidWanderTimerRef.current = window.setTimeout(
          () => scheduleNextWander(),
          (duration + 1.2) * 1e3
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
    const closesSettingsHelp = (closingStep === 10 || closingStep === 12) && settingsHelpPendingRef.current;
    const closesJumpscareHelp = closingStep === 9 && hasTriggeredJumpscareRef.current;
    const closesDavidFuriousHelp = closingStep === 8 || closingStep === 6 && johnDoeCompleteHelp;
    const hasPendingRespawn = respawnRemainingRef.current !== null;
    const queuesAnotherHelp = closingStep < 3 || closingStep === 5;
    if (hasPendingRespawn && queuesAnotherHelp) {
      respawnHelpChainHoldRef.current = true;
      respawnWaitForHelpRef.current = true;
    } else if (!queuesAnotherHelp) {
      respawnHelpChainHoldRef.current = false;
    }
    if (closingStep === 5 && hasPendingRespawn) {
      respawnRemainingRef.current += NEXT_PERSON_DELAY_AFTER_FIFTH_HELP;
    }
    if (closesDavidFuriousHelp && hasPendingRespawn) {
      respawnRemainingRef.current += NEXT_PERSON_DELAY_AFTER_DAVID_FURIOUS_HELP;
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
      if (closesJumpscareHelp) {
        resumeJumpscareSound();
      }
      if (closingStep === 6 && johnDoeCompleteHelp) {
        setJohnDoeCompleteHelp(false);
        if (!hasPendingRespawn && !isBaszuckiJumpscareArmedRef.current && angerLevelRef.current < 100) {
          scheduleBaconRespawn(NEXT_PERSON_DELAY_AFTER_DAVID_FURIOUS_HELP);
        }
      }
      if (closingStep < 3) {
        const nextDelay = closingStep === 1 ? 500 : 1e3;
        window.setTimeout(() => openHelp(closingStep + 1), nextDelay);
      } else if (closingStep === 3) {
        window.setTimeout(() => showBacon("bacon"), 1e3);
      } else if (closingStep === 4) {
        scheduleDavidAppearance(DAVID_APPEARANCE_DELAY_AFTER_HELP);
      } else if (closingStep === 5) {
        window.setTimeout(() => openHelp(7), 1e3);
      } else {
        if (baconStateRef.current === "hidden" && !isBaszuckiJumpscareArmedRef.current && !hasTriggeredJumpscareRef.current && angerLevelRef.current < 100 && respawnTimerRef.current === null && respawnRemainingRef.current === null) {
          scheduleBaconRespawn(800);
        }
      }
    }, 220);
  }
  function showBacon(type = candidateTypeRef.current) {
    if (!hasHelpAppearedRef.current || helpStateRef.current !== "hidden") {
      respawnRemainingRef.current = 1e3;
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
      playLoudSound(hiAudio).catch(() => {
      });
    }
    candidateTypeRef.current = type;
    setCandidateType(type);
    setOffensiveViewCount(0);
    setOffensiveItemRaised(false);
    setOffensiveItemState("hidden");
    setBaconState("entering");
  }
  playGameRef.current = beginGame;
  function startExperience() {
    if (startedRef.current) return;
    loadJumpscareAudioBuffer().catch(() => {
    });
    startedRef.current = true;
    setStarted(true);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {
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
    if (!doneRef.current || gameStartedRef.current || exitCrashPendingRef.current || postJumpscareScreen) {
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
  function handleMainMenuSettings() {
    if (!doneRef.current || gameStartedRef.current || exitCrashPendingRef.current || settingsHelpPendingRef.current || postJumpscareScreen) {
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
    playAudio(clickAudio, { volume: clickAudio.volume }).catch(() => {
    });
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
      setPressedButton((current) => current === button ? null : current);
      pressedButtonTimerRef.current = null;
    }, BUTTON_PRESS_FEEDBACK_MS);
  }
  function flashGameButton(button) {
    clearPressedButtonTimer();
    setPressedButton(button);
    pressedButtonTimerRef.current = window.setTimeout(() => {
      setPressedButton((current) => current === button ? null : current);
      pressedButtonTimerRef.current = null;
    }, BUTTON_PRESS_FEEDBACK_MS);
  }
  function handleOffensiveItemClick(e) {
    e.stopPropagation();
    if (offensiveItemState === "hidden" || offensiveItemState.startsWith("exiting")) {
      return;
    }
    const closingOffensiveItem = offensiveItemRaised;
    playPaperSound();
    if (closingOffensiveItem && candidateType === "noob") {
      if (!writingPlayedRef.current) {
        writingPlayedRef.current = true;
        stopWritingSequence();
        const writingAudio = document.getElementById("writing-sound");
        if (writingAudio) {
          writingAudio.currentTime = 0;
          playLoudSound(writingAudio, { gainValue: 1.6 }).catch(() => {
          });
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
        }, 1e3);
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
    smoke.style.left = `${targetRect.left - viewportRect.left + targetRect.width / 2}px`;
    smoke.style.top = `${targetRect.top - viewportRect.top + targetRect.height * 0.56}px`;
    smoke.style.width = `${targetRect.width * 1.5}px`;
    smoke.style.height = `${targetRect.height * 1.65}px`;
    const puffs = [
      [-30, 0.42, 0.35, -14, 0],
      [4, 0.5, 0.42, 9, 0.08],
      [30, 0.38, 0.38, 15, 0.16],
      [-12, 0.62, 0.52, -18, 0.28],
      [18, 0.56, 0.48, 12, 0.4],
      [-2, 0.7, 0.58, -7, 0.52]
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
    canvas.style.left = `${targetRect.left - viewportRect.left - paddingX}px`;
    canvas.style.top = `${targetRect.top - viewportRect.top - paddingY}px`;
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
        0
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
      targetRect.height
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
        targetRect.height
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
    target.style.visibility = "hidden";
    setBaconState("hidden");
    playExplosionSynthBurst();
    const explodeAudio = document.getElementById("explode-sound");
    if (explodeAudio) {
      explodeAudio.currentTime = 0;
      playAudio(explodeAudio, { volume: 1 }).catch(() => {
      });
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
        height
      );
      context.restore();
    };
    const renderFrame = (now) => {
      const elapsed = now - startedAt;
      if (elapsed >= EXPLOSION_TOTAL_VFX_MS) {
        cleanupExplosionOverlay({ restoreTarget: false });
        setBaconState("hidden");
        if (isBaszuckiJumpscareArmedRef.current || angerLevelRef.current >= 100) {
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
          (elapsed - EXPLOSION_PHASE1_EXPAND_MS) / EXPLOSION_PHASE3_COLLAPSE_MS
        );
        const eased = 1 - Math.pow(1 - progress, 3);
        scale = 1.3 * (1 - eased * 0.35);
        alpha = 1 - progress;
      }
      context.clearRect(0, 0, canvasWidth, canvasHeight);
      context.save();
      context.globalCompositeOperation = "source-over";
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
      const finishedJohnDoeOffensiveItem = candidateType === "noob" && offensiveViewCount >= 2;
      if (finishedJohnDoeOffensiveItem) {
        setJohnDoeCompleteHelp(true);
      }
      stopDecisionSequence();
      const angryAudio = document.getElementById("angry-sound");
      if (angryAudio) {
        angryAudio.currentTime = 0;
        playLoudSound(angryAudio, { gainValue: 2.2 }).catch(() => {
        });
      }
      if (!finishedJohnDoeOffensiveItem) {
        setPlayerAngerLevel((prev) => Math.min(100, prev + 25));
      }
      dismissOffensiveItem();
      if (helpStateRef.current !== "hidden") {
        if (helpStepRef.current === 4) {
          scheduleDavidAppearance(DAVID_APPEARANCE_DELAY_AFTER_HELP);
        }
        setHelpState("hidden");
      }
      const nextHelpDelay = finishedJohnDoeOffensiveItem ? 1e3 : 2e3;
      if (!sixthHelpTimerRef.current && !isBaszuckiJumpscareArmedRef.current && angerLevelRef.current < 100) {
        sixthHelpTimerRef.current = window.setTimeout(() => {
          sixthHelpTimerRef.current = null;
          openHelp(6);
        }, nextHelpDelay);
      }
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
      const handleEnded2 = () => {
        if (fallbackTriggerTimer) window.clearTimeout(fallbackTriggerTimer);
        if (ohNoEndedHandlerRef.current !== handleEnded2) return;
        clearOhNoEndedHandler();
        triggerBaszuckiJumpscare();
      };
      ohNoEndedHandlerRef.current = handleEnded2;
      ohNoAudio.addEventListener("ended", handleEnded2);
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
    const personInCenter = baconState === "visible" || baconState === "entering";
    if (!personInCenter) {
      return;
    }
    let thirdGreenWithDavid = false;
    if (davidState.active && !davidState.exiting) {
      davidGreenDecisionCountRef.current += 1;
      const davidDecisionCount = davidGreenDecisionCountRef.current;
      const currentAnger = angerLevelRef.current;
      const newAnger = Math.min(
        100,
        Math.max(
          currentAnger + 34,
          davidDecisionCount === 1 ? 35 : davidDecisionCount === 2 ? 70 : 100
        )
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
          }, 2e3);
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
    } else if (!thirdGreenWithDavid && (isBaszuckiJumpscareArmedRef.current || angerLevelRef.current >= 100)) {
      triggerBaszuckiJumpscare();
    }
  }
  function handleHelpHover() {
    const hoverAudio = document.getElementById("menu-hover");
    if (!hoverAudio) return;
    hoverAudio.currentTime = 0;
    playAudio(hoverAudio, { volume: hoverAudio.volume }).catch(() => {
    });
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
        `rgb(${d[0]}, ${d[1]}, ${d[2]})`
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
  const isJumpscareEndpointOrEnded = baszuckiJumpscare?.phase === "endpoint" || hasTriggeredJumpscareRef.current && !baszuckiJumpscare;
  const menuHelpOpen = exitHelpVisible || settingsHelpVisible;
  const playerMeterIcon = meterIconForLevel(playerAngerLevel, "player");
  const bazuckMeterIcon = meterIconForLevel(angerLevel, "bazuck");
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `stage ${done ? "interactive" : ""} ${rootLoading || loading ? "loading" : ""} ${isJumpscareEndpointOrEnded || postJumpscareScreen ? "cursor-hidden" : ""} ${menuHelpOpen ? "menu-help-open" : ""}`,
      onClick: handleClick,
      children: [
        /* @__PURE__ */ jsxDEV("div", { className: "intro-frame", children: /* @__PURE__ */ jsxDEV("div", { ref: wrapRef, className: "video-wrap", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "video-top", children: /* @__PURE__ */ jsxDEV(
            "video",
            {
              ref: videoRef,
              src: "intro.mp4",
              playsInline: true,
              autoPlay: true,
              loop: false,
              onEnded: handleEnded,
              onLoadedData: sampleEdge,
              preload: "auto"
            },
            void 0,
            false,
            {
              fileName: "<stdin>",
              lineNumber: 3304,
              columnNumber: 13
            },
            this
          ) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 3303,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "menu", children: [
            /* @__PURE__ */ jsxDEV("img", { ref: menuImgRef, src: "menu.png", alt: "" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 3316,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV(
              "div",
              {
                className: "menu-mod-badge-wrap",
                onClick: handleMainMenuExit,
                role: "button",
                tabIndex: 0,
                "aria-label": "Open Helpy's tips",
                children: [
                  /* @__PURE__ */ jsxDEV(
                    "img",
                    {
                      className: "menu-mod-badge",
                      src: "uploads/ChatGPT_Image_Sep_20__2026__04_12_34_PM.png",
                      alt: "MOD",
                      onLoad: (event) => {
                        if (!modBadgeHoverSrc) {
                          setModBadgeHoverSrc(createModBadgeHoverImage(event.currentTarget));
                        }
                      }
                    },
                    void 0,
                    false,
                    {
                      fileName: "<stdin>",
                      lineNumber: 3324,
                      columnNumber: 15
                    },
                    this
                  ),
                  modBadgeHoverSrc && /* @__PURE__ */ jsxDEV(
                    "img",
                    {
                      className: "menu-mod-badge-hover",
                      src: modBadgeHoverSrc,
                      alt: "",
                      "aria-hidden": "true"
                    },
                    void 0,
                    false,
                    {
                      fileName: "<stdin>",
                      lineNumber: 3335,
                      columnNumber: 17
                    },
                    this
                  )
                ]
              },
              void 0,
              true,
              {
                fileName: "<stdin>",
                lineNumber: 3317,
                columnNumber: 13
              },
              this
            )
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 3315,
            columnNumber: 11
          }, this)
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 3302,
          columnNumber: 9
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 3301,
          columnNumber: 7
        }, this),
        (gameStarted || menuHelpOpen || exitJumpscareVisible) && /* @__PURE__ */ jsxDEV("div", { className: "game-placeholder", children: /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: `game-viewport ${helpState !== "hidden" ? "gameplay-paused" : ""} ${baszuckiJumpscare || hasTriggeredJumpscareRef.current ? "jumpscare-blackout" : ""} ${baszuckiJumpscare?.phase === "endpoint" ? "jumpscare-endpoint" : ""} ${hasTriggeredJumpscareRef.current && !baszuckiJumpscare ? "jumpscare-ended" : ""}`,
            children: [
              /* @__PURE__ */ jsxDEV("div", { ref: skyFramesRef, className: "game-sky-frame", children: Array.from({ length: SKY_FRAME_COUNT }, (_, index) => /* @__PURE__ */ jsxDEV(
                "img",
                {
                  className: "game-sky-frame-image",
                  src: skyFrameSrc(index),
                  alt: "",
                  style: { visibility: index === 0 ? "visible" : "hidden" }
                },
                skyFrameSrc(index),
                false,
                {
                  fileName: "<stdin>",
                  lineNumber: 3365,
                  columnNumber: 17
                },
                this
              )) }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 3363,
                columnNumber: 13
              }, this),
              baszuckiJumpscare ? /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: `david-character-wrap david-jumpscare-target ${baszuckiJumpscare.phase === "endpoint" ? "david-jumpscare-endpoint" : ""}`,
                  style: {
                    "--start-x": `${baszuckiJumpscare.x}%`,
                    "--start-y": `${baszuckiJumpscare.y}%`,
                    "--start-w": `${baszuckiJumpscare.startW}%`,
                    "--end-x": `${baszuckiJumpscare.endX}%`,
                    "--end-y": `${baszuckiJumpscare.endY}%`,
                    "--target-w": `${baszuckiJumpscare.targetW}%`
                  },
                  children: /* @__PURE__ */ jsxDEV(
                    "img",
                    {
                      className: "david-character-img",
                      src: "Screenshot 2026-08-31 190438.png",
                      alt: "David Baszucki"
                    },
                    void 0,
                    false,
                    {
                      fileName: "<stdin>",
                      lineNumber: 3390,
                      columnNumber: 17
                    },
                    this
                  )
                },
                void 0,
                false,
                {
                  fileName: "<stdin>",
                  lineNumber: 3375,
                  columnNumber: 15
                },
                this
              ) : davidState.active && !hasTriggeredJumpscareRef.current ? /* @__PURE__ */ jsxDEV(
                "div",
                {
                  ref: davidElementRef,
                  className: `david-character-wrap ${davidState.jumpscare ? "david-jumpscare-character" : ""}`,
                  style: {
                    left: `${davidState.x}%`,
                    bottom: `${100 - davidState.y - DAVID_SHOE_OFFSET}%`,
                    transform: `translateX(-50%) scale(${davidState.scale})`,
                    transition: davidState.transitionDuration > 0 ? `left ${davidState.transitionDuration}s linear, bottom ${davidState.transitionDuration}s linear, transform ${davidState.transitionDuration}s linear` : "none"
                  },
                  children: /* @__PURE__ */ jsxDEV(
                    "img",
                    {
                      className: "david-character-img",
                      src: "spr_buzucki.png",
                      alt: "David Baszucki",
                      style: {
                        transform: `scaleX(${davidState.facing}) rotate(${davidState.rotation}deg)`,
                        transition: `transform ${DAVID_ROTATION_TRANSITION_MS}ms ease-out`
                      }
                    },
                    void 0,
                    false,
                    {
                      fileName: "<stdin>",
                      lineNumber: 3412,
                      columnNumber: 17
                    },
                    this
                  )
                },
                void 0,
                false,
                {
                  fileName: "<stdin>",
                  lineNumber: 3397,
                  columnNumber: 15
                },
                this
              ) : null,
              baconState !== "hidden" ? /* @__PURE__ */ jsxDEV(
                "img",
                {
                  ref: baconImageRef,
                  className: `bacon-character bacon-${baconState} ${candidateClassName(
                    candidateType
                  )}`,
                  src: candidateImageSrc(candidateType),
                  alt: candidateAlt(candidateType),
                  onAnimationEnd: (event) => {
                    if (event.animationName === "bacon-slide-in") {
                      setBaconState("visible");
                      startDecisionTimer();
                      setOffensiveItemRaised(false);
                      setOffensiveItemState("entering");
                      if (!hasShownHelp4Ref.current) {
                        hasShownHelp4Ref.current = true;
                        window.setTimeout(() => openHelp(4), 1e3);
                      }
                    } else if (event.animationName === "bacon-slide-out-right") {
                      setBaconState("hidden");
                      if (isBaszuckiJumpscareArmedRef.current || angerLevelRef.current >= 100) {
                        triggerBaszuckiJumpscare();
                      }
                    }
                  }
                },
                void 0,
                false,
                {
                  fileName: "<stdin>",
                  lineNumber: 3424,
                  columnNumber: 15
                },
                this
              ) : null,
              !isJumpscareEndpointOrEnded && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                /* @__PURE__ */ jsxDEV(
                  "img",
                  {
                    className: "game-wood",
                    src: "spr_maingame_bg wood.png",
                    alt: ""
                  },
                  void 0,
                  false,
                  {
                    fileName: "<stdin>",
                    lineNumber: 3455,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  "div",
                  {
                    className: `playersmeter-wrap ${playerMeterIcon ? "playersmeter-has-icon" : ""}`,
                    "aria-label": "Playersmeter",
                    children: [
                      /* @__PURE__ */ jsxDEV(
                        "img",
                        {
                          className: "playersmeter-bg",
                          src: "playersmeter.png",
                          alt: "Playersmeter"
                        },
                        void 0,
                        false,
                        {
                          fileName: "<stdin>",
                          lineNumber: 3466,
                          columnNumber: 19
                        },
                        this
                      ),
                      playerMeterIcon && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                        (playerMeterIcon.variant === "angry" || playerMeterIcon.variant === "very-angry") && /* @__PURE__ */ jsxDEV(
                          AngrySteamEffect,
                          {
                            meterType: "playersmeter",
                            variant: playerMeterIcon.variant,
                            triggerKey: playerSteamTrigger
                          },
                          void 0,
                          false,
                          {
                            fileName: "<stdin>",
                            lineNumber: 3475,
                            columnNumber: 25
                          },
                          this
                        ),
                        /* @__PURE__ */ jsxDEV(
                          "img",
                          {
                            className: `meter-icon playersmeter-icon meter-icon-${playerMeterIcon.variant}`,
                            src: playerMeterIcon.src,
                            alt: "",
                            draggable: false
                          },
                          void 0,
                          false,
                          {
                            fileName: "<stdin>",
                            lineNumber: 3481,
                            columnNumber: 23
                          },
                          this
                        )
                      ] }, void 0, true, {
                        fileName: "<stdin>",
                        lineNumber: 3472,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "playersmeter-tube", children: /* @__PURE__ */ jsxDEV(
                        "img",
                        {
                          className: "playersmeter-beam",
                          src: "spr_red_pixel.png",
                          alt: "",
                          draggable: false,
                          style: {
                            height: `${playerAngerLevel}%`,
                            opacity: playerAngerLevel > 0 ? 1 : 0
                          }
                        },
                        void 0,
                        false,
                        {
                          fileName: "<stdin>",
                          lineNumber: 3490,
                          columnNumber: 21
                        },
                        this
                      ) }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3489,
                        columnNumber: 19
                      }, this)
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "<stdin>",
                    lineNumber: 3460,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  "div",
                  {
                    className: `bazuckmeter-wrap ${bazuckMeterIcon ? "bazuckmeter-has-icon" : ""}`,
                    "aria-label": "Bazuckmeter",
                    children: [
                      /* @__PURE__ */ jsxDEV(
                        "img",
                        {
                          className: "bazuckmeter-bg",
                          src: "bazuckmeter.png",
                          alt: "Bazuckmeter"
                        },
                        void 0,
                        false,
                        {
                          fileName: "<stdin>",
                          lineNumber: 3508,
                          columnNumber: 19
                        },
                        this
                      ),
                      bazuckMeterIcon && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                        (bazuckMeterIcon.variant === "angry" || bazuckMeterIcon.variant === "very-angry") && angerLevel < 100 && !bazuckmeterOverflow && davidGreenDecisionCountRef.current < 3 && /* @__PURE__ */ jsxDEV(
                          AngrySteamEffect,
                          {
                            meterType: "bazuckmeter",
                            variant: bazuckMeterIcon.variant,
                            triggerKey: bazuckSteamTrigger
                          },
                          void 0,
                          false,
                          {
                            fileName: "<stdin>",
                            lineNumber: 3520,
                            columnNumber: 25
                          },
                          this
                        ),
                        /* @__PURE__ */ jsxDEV(
                          "img",
                          {
                            className: `meter-icon bazuckmeter-icon meter-icon-${bazuckMeterIcon.variant}`,
                            src: bazuckMeterIcon.src,
                            alt: "",
                            draggable: false
                          },
                          void 0,
                          false,
                          {
                            fileName: "<stdin>",
                            lineNumber: 3526,
                            columnNumber: 23
                          },
                          this
                        )
                      ] }, void 0, true, {
                        fileName: "<stdin>",
                        lineNumber: 3514,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV(
                        "div",
                        {
                          className: `bazuckmeter-tube ${bazuckmeterOverflow ? "bazuckmeter-tube-overflow" : ""}`,
                          children: /* @__PURE__ */ jsxDEV(
                            "img",
                            {
                              className: `bazuckmeter-beam ${bazuckmeterOverflow ? "bazuckmeter-beam-overflow" : ""}`,
                              src: "spr_red_pixel.png",
                              alt: "",
                              draggable: false,
                              style: {
                                height: bazuckmeterOverflow ? "300%" : `${angerLevel}%`,
                                opacity: angerLevel > 0 ? 1 : 0
                              }
                            },
                            void 0,
                            false,
                            {
                              fileName: "<stdin>",
                              lineNumber: 3539,
                              columnNumber: 21
                            },
                            this
                          )
                        },
                        void 0,
                        false,
                        {
                          fileName: "<stdin>",
                          lineNumber: 3534,
                          columnNumber: 19
                        },
                        this
                      )
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "<stdin>",
                    lineNumber: 3502,
                    columnNumber: 17
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 3454,
                columnNumber: 15
              }, this),
              offensiveItemState !== "hidden" && !isJumpscareEndpointOrEnded && /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: `offensive-item offensive-item-${offensiveItemState} ${offensiveItemRaised ? "offensive-item-raised" : "offensive-item-lowered"}`,
                  onClick: handleOffensiveItemClick,
                  onAnimationEnd: (event) => {
                    if (event.animationName === "offensive-item-rise") {
                      setOffensiveItemState("visible");
                    } else if (event.animationName === "offensive-item-fall-raised" || event.animationName === "offensive-item-fall-lowered") {
                      setOffensiveItemState("hidden");
                      setOffensiveItemRaised(false);
                    }
                  },
                  children: [
                    /* @__PURE__ */ jsxDEV(
                      "img",
                      {
                        className: "offensive-item-img",
                        src: "offensive_item.png",
                        alt: "Offensive item",
                        draggable: false
                      },
                      void 0,
                      false,
                      {
                        fileName: "<stdin>",
                        lineNumber: 3575,
                        columnNumber: 17
                      },
                      this
                    ),
                    candidateType === "acorn" ? /* @__PURE__ */ jsxDEV(
                      "img",
                      {
                        className: "offensive-item-content",
                        src: "ilovemyfamily.png",
                        alt: "I love my family",
                        draggable: false
                      },
                      void 0,
                      false,
                      {
                        fileName: "<stdin>",
                        lineNumber: 3582,
                        columnNumber: 19
                      },
                      this
                    ) : candidateType === "noob" ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "offensive-item-text offensive-item-noob-main", children: "He'll do it again" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3590,
                        columnNumber: 21
                      }, this),
                      offensiveViewCount >= 2 && /* @__PURE__ */ jsxDEV("div", { className: "offensive-item-noob-extra", children: "I won't :)" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3594,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3589,
                      columnNumber: 19
                    }, this) : candidateType === "n00b112" ? null : /* @__PURE__ */ jsxDEV("div", { className: "offensive-item-text", children: candidateType === "oakley" ? "yes" : "Hi" }, void 0, false, {
                      fileName: "<stdin>",
                      lineNumber: 3600,
                      columnNumber: 19
                    }, this)
                  ]
                },
                void 0,
                true,
                {
                  fileName: "<stdin>",
                  lineNumber: 3556,
                  columnNumber: 15
                },
                this
              ),
              !isJumpscareEndpointOrEnded && /* @__PURE__ */ jsxDEV("div", { className: "game-buttons", children: [
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    type: "button",
                    className: "game-button game-button-red",
                    "aria-label": "Red button",
                    onPointerDown: (event) => pressGameButton("red", event),
                    onPointerUp: () => releaseGameButton("red"),
                    onPointerCancel: () => releaseGameButton("red"),
                    onPointerLeave: () => releaseGameButton("red"),
                    onClick: handleRedButtonClick,
                    children: /* @__PURE__ */ jsxDEV(
                      "img",
                      {
                        src: pressedButton === "red" ? "buttonredpressed.png" : "buttonred.png",
                        alt: ""
                      },
                      void 0,
                      false,
                      {
                        fileName: "<stdin>",
                        lineNumber: 3618,
                        columnNumber: 19
                      },
                      this
                    )
                  },
                  void 0,
                  false,
                  {
                    fileName: "<stdin>",
                    lineNumber: 3608,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    className: "game-button game-button-green",
                    type: "button",
                    "aria-label": "Green button",
                    onPointerDown: (event) => pressGameButton("green", event),
                    onPointerUp: () => releaseGameButton("green"),
                    onPointerCancel: () => releaseGameButton("green"),
                    onPointerLeave: () => releaseGameButton("green"),
                    onClick: handleGreenButtonClick,
                    children: /* @__PURE__ */ jsxDEV(
                      "img",
                      {
                        src: pressedButton === "green" ? "buttongreenpressed.png" : "buttongreen.png",
                        alt: ""
                      },
                      void 0,
                      false,
                      {
                        fileName: "<stdin>",
                        lineNumber: 3637,
                        columnNumber: 19
                      },
                      this
                    )
                  },
                  void 0,
                  false,
                  {
                    fileName: "<stdin>",
                    lineNumber: 3627,
                    columnNumber: 17
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 3607,
                columnNumber: 15
              }, this),
              decisionWarning && /* @__PURE__ */ jsxDEV("div", { className: "decision-warning", role: "alert", children: "You're taking too long!" }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 3649,
                columnNumber: 15
              }, this),
              helpState !== "hidden" && /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: `helpy-overlay helpy-${helpState} ${helpStep === 9 ? "helpy-ninth" : ""} ${helpStep === 11 ? "helpy-eleventh" : ""} ${johnDoeCompleteHelp && helpStep === 6 ? "helpy-john-doe-complete" : ""}`,
                  role: "dialog",
                  "aria-label": "Helpy's tips",
                  onClick: (event) => event.stopPropagation(),
                  children: [
                    /* @__PURE__ */ jsxDEV(
                      "div",
                      {
                        className: `helpy-face-frame ${helpStep === 9 ? "helpy-face-black" : ""}`,
                        children: /* @__PURE__ */ jsxDEV(
                          "img",
                          {
                            className: "helpy-face",
                            src: "free-crop (1).png",
                            alt: ""
                          },
                          void 0,
                          false,
                          {
                            fileName: "<stdin>",
                            lineNumber: 3673,
                            columnNumber: 19
                          },
                          this
                        )
                      },
                      void 0,
                      false,
                      {
                        fileName: "<stdin>",
                        lineNumber: 3668,
                        columnNumber: 17
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV(
                      "img",
                      {
                        ref: helpImgRef,
                        className: "helpy-ui-frame",
                        src: "helpy_ui.png",
                        alt: "Helpy's tips"
                      },
                      void 0,
                      false,
                      {
                        fileName: "<stdin>",
                        lineNumber: 3679,
                        columnNumber: 17
                      },
                      this
                    ),
                    helpStep === 11 && /* @__PURE__ */ jsxDEV(
                      "img",
                      {
                        className: "helpy-cluttered",
                        src: "ecluttered.png",
                        alt: "Cluttered Helpy message",
                        draggable: false
                      },
                      void 0,
                      false,
                      {
                        fileName: "<stdin>",
                        lineNumber: 3686,
                        columnNumber: 19
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV("div", { className: "helpy-copy", children: johnDoeCompleteHelp && helpStep === 6 ? /* @__PURE__ */ jsxDEV("div", { className: "helpy-john-doe-copy", "aria-label": "Helpy's tips", children: [
                      /* @__PURE__ */ jsxDEV("p", { className: "helpy-john-doe-line helpy-john-doe-line-one", children: "Roblox Players did not like that!" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3696,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("p", { className: "helpy-john-doe-line helpy-john-doe-line-two", children: "Remember: Wrongful terminations will anger the Playerbase" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3699,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("p", { className: "helpy-john-doe-line helpy-john-doe-line-three", children: "Avoid them! Wait for David to leave" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3702,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("p", { className: "helpy-john-doe-line helpy-john-doe-line-four", children: "then unban Robloxians" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3705,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("p", { className: "helpy-john-doe-line helpy-john-doe-line-five", children: "David is furious now!" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3708,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("p", { className: "helpy-john-doe-line helpy-john-doe-line-six", children: "If he sees one more ban reversal, it's game over!" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3711,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3695,
                      columnNumber: 21
                    }, this) : helpStep === 1 ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
                      /* @__PURE__ */ jsxDEV("p", { className: "helpy-greeting", children: "Hello! I'm Helpy!" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3717,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("p", { className: "helpy-message", children: [
                        "I will guide you",
                        /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                          fileName: "<stdin>",
                          lineNumber: 3720,
                          columnNumber: 25
                        }, this),
                        "through the game"
                      ] }, void 0, true, {
                        fileName: "<stdin>",
                        lineNumber: 3718,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3716,
                      columnNumber: 21
                    }, this) : helpStep === 2 ? /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-message-long", children: [
                      "Robloxians who are banned",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3727,
                        columnNumber: 23
                      }, this),
                      "will come to you.",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3729,
                        columnNumber: 23
                      }, this),
                      "Your Job is to decide",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3731,
                        columnNumber: 23
                      }, this),
                      "whether to remove the ban",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3733,
                        columnNumber: 23
                      }, this),
                      "or terminate them"
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3725,
                      columnNumber: 21
                    }, this) : helpStep === 3 ? /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-message-third", children: [
                      "Red button terminates",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3739,
                        columnNumber: 23
                      }, this),
                      "the Robloxian",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3741,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3742,
                        columnNumber: 23
                      }, this),
                      "Green button unbans",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3744,
                        columnNumber: 23
                      }, this),
                      "them"
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3737,
                      columnNumber: 21
                    }, this) : helpStep === 4 ? /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-message-fourth", children: [
                      "Click on the paper",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3750,
                        columnNumber: 23
                      }, this),
                      "bellow to see the",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3752,
                        columnNumber: 23
                      }, this),
                      "ban reason, also",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3754,
                        columnNumber: 23
                      }, this),
                      "known as",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3756,
                        columnNumber: 23
                      }, this),
                      '"Offensive Item"'
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3748,
                      columnNumber: 21
                    }, this) : helpStep === 5 ? /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-message-fifth", children: [
                      /* @__PURE__ */ jsxDEV("span", { className: "helpy-fifth-opening", children: "David saw that!" }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3761,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3764,
                        columnNumber: 23
                      }, this),
                      "Remember:",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3766,
                        columnNumber: 23
                      }, this),
                      "David likes his AI",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3768,
                        columnNumber: 23
                      }, this),
                      "Reverting a decision",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3770,
                        columnNumber: 23
                      }, this),
                      "made by AI angers him",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3772,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("span", { className: "helpy-fifth-warning", children: [
                        "DO NOT MAKE HIM",
                        /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                          fileName: "<stdin>",
                          lineNumber: 3775,
                          columnNumber: 25
                        }, this),
                        "ANGRY"
                      ] }, void 0, true, {
                        fileName: "<stdin>",
                        lineNumber: 3773,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3760,
                      columnNumber: 21
                    }, this) : helpStep === 6 ? /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-message-sixth", children: [
                      "Roblox Players",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3782,
                        columnNumber: 23
                      }, this),
                      "did not like that!",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3784,
                        columnNumber: 23
                      }, this),
                      "Remember:",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3786,
                        columnNumber: 23
                      }, this),
                      "Wrongfull terminations",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3788,
                        columnNumber: 23
                      }, this),
                      "will anger the",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3790,
                        columnNumber: 23
                      }, this),
                      "Playerbase",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3792,
                        columnNumber: 23
                      }, this),
                      "Avoid Them!"
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3780,
                      columnNumber: 21
                    }, this) : helpStep === 7 ? /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-message-seventh", children: [
                      "Wait for David to leave",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3798,
                        columnNumber: 23
                      }, this),
                      "then unban Robloxians"
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3796,
                      columnNumber: 21
                    }, this) : helpStep === 8 ? /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-message-eighth", children: [
                      "David is furious now!",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3804,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3805,
                        columnNumber: 23
                      }, this),
                      "If he sees one more",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3807,
                        columnNumber: 23
                      }, this),
                      "ban reversal,",
                      /* @__PURE__ */ jsxDEV("br", {}, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3809,
                        columnNumber: 23
                      }, this),
                      "it's game over!"
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3802,
                      columnNumber: 21
                    }, this) : helpStep === 9 && (exitCrashPendingRef.current || exitJumpscareSequenceRef.current) ? /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-message-ninth helpy-exit-message", children: EXIT_HELP_MESSAGE }, void 0, false, {
                      fileName: "<stdin>",
                      lineNumber: 3816,
                      columnNumber: 21
                    }, this) : helpStep === 10 ? /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-settings-message", children: SETTINGS_HELP_MESSAGE }, void 0, false, {
                      fileName: "<stdin>",
                      lineNumber: 3820,
                      columnNumber: 21
                    }, this) : helpStep === 12 ? /* @__PURE__ */ jsxDEV("div", { className: "helpy-volume-settings", children: [
                      /* @__PURE__ */ jsxDEV("p", { className: "helpy-message helpy-settings-message", children: SETTINGS_VOLUME_HELP_MESSAGE }, void 0, false, {
                        fileName: "<stdin>",
                        lineNumber: 3825,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV(
                        "input",
                        {
                          className: "helpy-volume-slider",
                          type: "range",
                          min: "0",
                          max: "1",
                          step: "0.01",
                          value: settingsVolumeDraft,
                          "aria-label": "Background music volume",
                          onChange: (event) => setSettingsVolumeDraft(Number(event.target.value))
                        },
                        void 0,
                        false,
                        {
                          fileName: "<stdin>",
                          lineNumber: 3828,
                          columnNumber: 23
                        },
                        this
                      )
                    ] }, void 0, true, {
                      fileName: "<stdin>",
                      lineNumber: 3824,
                      columnNumber: 21
                    }, this) : null }, void 0, false, {
                      fileName: "<stdin>",
                      lineNumber: 3693,
                      columnNumber: 17
                    }, this),
                    /* @__PURE__ */ jsxDEV(
                      "button",
                      {
                        ref: helpOkRef,
                        className: "helpy-ok",
                        type: "button",
                        "aria-label": "OK!",
                        onMouseEnter: handleHelpHover,
                        onClick: handleHelpOkClick
                      },
                      void 0,
                      false,
                      {
                        fileName: "<stdin>",
                        lineNumber: 3843,
                        columnNumber: 17
                      },
                      this
                    )
                  ]
                },
                void 0,
                true,
                {
                  fileName: "<stdin>",
                  lineNumber: 3654,
                  columnNumber: 15
                },
                this
              )
            ]
          },
          void 0,
          true,
          {
            fileName: "<stdin>",
            lineNumber: 3348,
            columnNumber: 11
          },
          this
        ) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 3347,
          columnNumber: 9
        }, this),
        postJumpscareScreen && /* @__PURE__ */ jsxDEV("div", { className: "post-jumpscare-screen", "aria-hidden": "true", children: /* @__PURE__ */ jsxDEV("div", { className: "post-jumpscare-frame", children: /* @__PURE__ */ jsxDEV(
          "img",
          {
            src: "Screenshot 2026-09-01 172237.png",
            alt: "",
            draggable: false
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 3859,
            columnNumber: 13
          },
          this
        ) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 3858,
          columnNumber: 11
        }, this) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 3857,
          columnNumber: 9
        }, this),
        (rootLoading || loading) && /* @__PURE__ */ jsxDEV("div", { className: "loading-screen", "aria-label": "Loading" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 3868,
          columnNumber: 9
        }, this)
      ]
    },
    void 0,
    true,
    {
      fileName: "<stdin>",
      lineNumber: 3293,
      columnNumber: 5
    },
    this
  );
}
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 3874,
  columnNumber: 51
}));
