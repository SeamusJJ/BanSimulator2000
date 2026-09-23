let audioContext = null;
const audioChains = new WeakMap();

function getAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Web Audio is not supported in this browser.");
  }
  if (!audioContext) {
    audioContext = new AudioContextClass();
  }
  return audioContext;
}

function createLoFiCurve(amount = 0.22, steps = 32) {
  const curve = new Float32Array(4096);

  for (let index = 0; index < curve.length; index += 1) {
    const input = (index / (curve.length - 1)) * 2 - 1;
    const quantized = Math.round(((input + 1) * 0.5) * steps) / steps;
    const stepped = quantized * 2 - 1;
    curve[index] = input + (stepped - input) * amount;
  }

  return curve;
}

function connectLoFi(source, destination, context = getAudioContext()) {
  const lowPass = context.createBiquadFilter();
  lowPass.type = "lowpass";
  lowPass.frequency.value = 5600;
  lowPass.Q.value = 0.65;

  const quantizer = context.createWaveShaper();
  quantizer.curve = createLoFiCurve();
  quantizer.oversample = "2x";

  source.connect(lowPass);
  lowPass.connect(quantizer);
  quantizer.connect(destination);

  return { lowPass, quantizer };
}

function getAudioChain(sound, { lofi = true, gainValue = 1 } = {}) {
  const context = getAudioContext();
  let chain = audioChains.get(sound);

  if (!chain) {
    const source = context.createMediaElementSource(sound);
    const gain = context.createGain();

    if (lofi) {
      connectLoFi(source, gain, context);
    } else {
      source.connect(gain);
    }

    gain.connect(context.destination);
    chain = { source, gain, lofi };
    audioChains.set(sound, chain);
  }

  chain.gain.gain.value = gainValue;
  return { context, chain };
}

function resumeAudioContext(context) {
  if (context.state !== "running") {
    return context.resume();
  }
  return Promise.resolve();
}

export function playAudio(
  sound,
  { gainValue = 1, volume, lofi = true } = {},
) {
  if (!sound) return Promise.resolve();

  const { context } = getAudioChain(sound, { lofi, gainValue });
  if (volume !== undefined) {
    sound.volume = volume;
  }

  return resumeAudioContext(context).then(() => sound.play());
}

export function playMusic(music, { gainValue = 1.6, loop = true } = {}) {
  if (!music) return Promise.resolve();

  music.loop = loop;
  const { context } = getAudioChain(music, {
    lofi: false,
    gainValue,
  });

  return resumeAudioContext(context).then(() => music.play());
}

export { connectLoFi, getAudioContext };
