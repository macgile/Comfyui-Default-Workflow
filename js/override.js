import { app } from "../../scripts/app.js";

const EXTENSION_NAME = "Comfyui-Default-Workflow.override";

const defaultWorkflow = {
  last_node_id: 9,
  last_link_id: 9,
  nodes: [
    {
      id: 7,
      type: "CLIPTextEncode",
      pos: [413, 389],
      size: [425.27801513671875, 180.6060791015625],
      flags: {},
      order: 3,
      mode: 0,
      inputs: [{ name: "clip", type: "CLIP", link: 5 }],
      outputs: [
        {
          name: "CONDITIONING",
          type: "CONDITIONING",
          links: [6],
          slot_index: 0,
        },
      ],
      properties: {},
      widgets_values: ["text, watermark"],
    },
    {
      id: 6,
      type: "CLIPTextEncode",
      pos: [415, 186],
      size: [422.84503173828125, 164.31304931640625],
      flags: {},
      order: 2,
      mode: 0,
      inputs: [{ name: "clip", type: "CLIP", link: 3 }],
      outputs: [
        {
          name: "CONDITIONING",
          type: "CONDITIONING",
          links: [4],
          slot_index: 0,
        },
      ],
      properties: {},
      widgets_values: [
        "beautiful scenery nature glass bottle landscape, , purple galaxy bottle,",
      ],
    },
    {
      id: 5,
      type: "EmptyLatentImage",
      pos: [473, 609],
      size: [315, 106],
      flags: {},
      order: 1,
      mode: 0,
      outputs: [
        { name: "LATENT", type: "LATENT", links: [2], slot_index: 0 },
      ],
      properties: {},
      widgets_values: [1024, 1024, 1],
    },
    {
      id: 3,
      type: "KSampler",
      pos: [863, 186],
      size: [315, 262],
      flags: {},
      order: 4,
      mode: 0,
      inputs: [
        { name: "model", type: "MODEL", link: 1 },
        { name: "positive", type: "CONDITIONING", link: 4 },
        { name: "negative", type: "CONDITIONING", link: 6 },
        { name: "latent_image", type: "LATENT", link: 2 },
      ],
      outputs: [
        { name: "LATENT", type: "LATENT", links: [7], slot_index: 0 },
      ],
      properties: {},
      widgets_values: [
        "randomize",
        true,
        20,
        5,
        "euler",
        "karras",
        1,
      ],
    },
    {
      id: 8,
      type: "VAEDecode",
      pos: [1209, 188],
      size: [210, 46],
      flags: {},
      order: 5,
      mode: 0,
      inputs: [
        { name: "samples", type: "LATENT", link: 7 },
        { name: "vae", type: "VAE", link: 8 },
      ],
      outputs: [
        { name: "IMAGE", type: "IMAGE", links: [9], slot_index: 0 },
      ],
      properties: {},
    },
    {
      id: 9,
      type: "PreviewImage",
      pos: [1451, 189],
      size: [210, 26],
      flags: {},
      order: 6,
      mode: 0,
      inputs: [{ name: "images", type: "IMAGE", link: 9 }],
      properties: {},
    },
    {
      id: 4,
      type: "CheckpointLoaderSimple",
      pos: [26, 474],
      size: [315, 98],
      flags: {},
      order: 0,
      mode: 0,
      outputs: [
        { name: "MODEL", type: "MODEL", links: [1], slot_index: 0 },
        { name: "CLIP", type: "CLIP", links: [3, 5], slot_index: 1 },
        { name: "VAE", type: "VAE", links: [8], slot_index: 2 },
      ],
      properties: {
        models: [
          {
            name: "realvisxlV50_v50Bakedvae.safetensors",
            url: "https://huggingface.co/SG161222/RealVisXL_V5.0/resolve/main/realvisxlV50_v50Bakedvae.safetensors",
            directory: "checkpoints",
          },
        ],
      },
      widgets_values: ["realvisxlV50_v50Bakedvae.safetensors"],
    },
  ],
  links: [
    [1, 4, 0, 3, 0, "MODEL"],
    [2, 5, 0, 3, 3, "LATENT"],
    [3, 4, 1, 6, 0, "CLIP"],
    [4, 6, 0, 3, 1, "CONDITIONING"],
    [5, 4, 1, 7, 0, "CLIP"],
    [6, 7, 0, 3, 2, "CONDITIONING"],
    [7, 3, 0, 8, 0, "LATENT"],
    [8, 4, 2, 8, 1, "VAE"],
    [9, 8, 0, 9, 0, "IMAGE"],
  ],
  groups: [],
  config: {},
  extra: { ds: { offset: [0, 0], scale: 1 } },
  version: 0.4,
};

const defaultGraphJSON = JSON.stringify(defaultWorkflow);

function cloneDefaultWorkflow() {
  return JSON.parse(defaultGraphJSON);
}

function getNodeTypes(data) {
  return (data?.nodes ?? []).map((n) => n?.type).filter(Boolean);
}

function hasType(types, type) {
  return types.includes(type);
}

function countType(types, type) {
  return types.filter((t) => t === type).length;
}

function isReplacementWorkflow(data) {
  const types = getNodeTypes(data);

  return (
    data?.nodes?.length === defaultWorkflow.nodes.length &&
    hasType(types, "PreviewImage") &&
    !hasType(types, "SaveImage") &&
    data.nodes.some(
      (n) =>
        n?.type === "CheckpointLoaderSimple" &&
        n?.widgets_values?.[0] === "realvisxlV50_v50Bakedvae.safetensors",
    )
  );
}

function isComfyBuiltinDefaultWorkflow(data) {
  if (!data || !Array.isArray(data.nodes)) return false;
  if (isReplacementWorkflow(data)) return false;

  const types = getNodeTypes(data);
  const nodeCount = data.nodes.length;

  const hasDefaultTextToImageCore =
    hasType(types, "CheckpointLoaderSimple") &&
    countType(types, "CLIPTextEncode") >= 2 &&
    hasType(types, "EmptyLatentImage") &&
    hasType(types, "KSampler") &&
    hasType(types, "VAEDecode") &&
    hasType(types, "SaveImage");

  // Le workflow par défaut ComfyUI est un petit graph txt2img.
  // On reste volontairement prudent pour ne pas remplacer un vrai workflow utilisateur.
  return hasDefaultTextToImageCore && nodeCount >= 6 && nodeCount <= 10;
}

function isEmptyGraphData(data) {
  return data && Array.isArray(data.nodes) && data.nodes.length === 0;
}

function currentGraphData() {
  try {
    return app.graph?.serialize?.();
  } catch {
    return null;
  }
}

function replaceGraphDataInPlace(graphData) {
  const replacement = cloneDefaultWorkflow();

  for (const key of Object.keys(graphData)) {
    delete graphData[key];
  }

  Object.assign(graphData, replacement);
}

let loadingReplacementWorkflow = false;
let lastReplacementLoadAt = 0;
let armedUntil = 0;
let armedReason = "";

function armEmptyNewWorkflowFallback(reason, durationMs = 2500) {
  const until = Date.now() + durationMs;
  if (until > armedUntil) {
    armedUntil = until;
    armedReason = reason;
  }

  // Plusieurs vérifications courtes couvrent les différences de timing entre
  // versions du frontend, sans surveiller le graph en permanence.
  scheduleEmptyGraphCheck(`${reason} / raf`, 0, true);
  scheduleEmptyGraphCheck(`${reason} / 100ms`, 100, false);
  scheduleEmptyGraphCheck(`${reason} / 350ms`, 350, false);
  scheduleEmptyGraphCheck(`${reason} / 900ms`, 900, false);
}

function emptyNewWorkflowFallbackIsArmed() {
  return Date.now() <= armedUntil;
}

function disarmEmptyNewWorkflowFallback() {
  armedUntil = 0;
  armedReason = "";
}

async function loadReplacementWorkflow(reason, { onlyIfEmpty = false, requireArmed = false } = {}) {
  if (loadingReplacementWorkflow) return;

  if (requireArmed && !emptyNewWorkflowFallbackIsArmed()) return;

  const currentGraph = currentGraphData();

  if (isReplacementWorkflow(currentGraph)) {
    disarmEmptyNewWorkflowFallback();
    return;
  }

  if (onlyIfEmpty && !isEmptyGraphData(currentGraph)) {
    return;
  }

  const now = Date.now();
  if (now - lastReplacementLoadAt < 250) return;

  loadingReplacementWorkflow = true;
  lastReplacementLoadAt = now;

  try {
    console.info(`[${EXTENSION_NAME}] load replacement workflow: ${reason}`);
    await app.loadGraphData(cloneDefaultWorkflow());
    app.graph?.setDirtyCanvas?.(true, true);
    app.canvas?.draw?.(true, true);
    disarmEmptyNewWorkflowFallback();
  } catch (error) {
    console.error(`[${EXTENSION_NAME}] load replacement workflow failed`, error);
  } finally {
    setTimeout(() => {
      loadingReplacementWorkflow = false;
    }, 0);
  }
}

function scheduleEmptyGraphCheck(reason, delayMs, useAnimationFrame) {
  const run = () => {
    void loadReplacementWorkflow(reason, {
      onlyIfEmpty: true,
      requireArmed: true,
    });
  };

  if (useAnimationFrame && typeof requestAnimationFrame === "function") {
    requestAnimationFrame(run);
  } else {
    setTimeout(run, delayMs);
  }
}

function textPartsFromElement(element, { includeText = true } = {}) {
  if (!element || !element.getAttribute) return "";

  const parts = [
    element.getAttribute("aria-label") ?? "",
    element.getAttribute("title") ?? "",
    element.getAttribute("data-testid") ?? "",
    element.getAttribute("data-test-id") ?? "",
    element.getAttribute("data-cy") ?? "",
    element.getAttribute("id") ?? "",
    element.getAttribute("class") ?? "",
  ];

  if (includeText) {
    parts.push(element.textContent ?? "");
  }

  return parts.join(" ").toLowerCase();
}

function closestActionElement(element) {
  if (!(element instanceof Element)) return null;

  return (
    element.closest?.(
      'button, a, [role="menuitem"], [role="button"], .p-menuitem, .p-menuitem-link, .p-button, [aria-label], [title], [data-testid], [data-test-id], [data-cy]',
    ) ?? element
  );
}

function actionTextForDetection(element) {
  const actionElement = closestActionElement(element);
  const parts = [];

  // Texte local de l'action réelle cliquée : menu item, bouton, lien, etc.
  // On évite volontairement le textContent des parents, car un menu complet peut
  // contenir à la fois "Nouveau workflow" et "Effacer le flux de travail".
  if (actionElement) {
    parts.push(textPartsFromElement(actionElement, { includeText: true }));
  }

  if (element && element !== actionElement) {
    parts.push(textPartsFromElement(element, { includeText: true }));
  }

  return parts.join(" ").toLowerCase();
}

function contextTextForDetection(element) {
  const parts = [];
  let current = element;
  let depth = 0;

  // Contexte limité aux attributs/classes/id des parents, jamais au textContent.
  // Cela permet de détecter un bouton icône "+" dans une tabbar workflow sans
  // absorber tous les libellés du menu Editer.
  while (current && depth < 6) {
    parts.push(textPartsFromElement(current, { includeText: false }));
    current = current.parentElement;
    depth += 1;
  }

  return parts.join(" ").toLowerCase();
}

function hasAny(text, words) {
  return words.some((word) => text.includes(word));
}

function looksLikeClearWorkflowAction(event) {
  const target = event.target;
  if (!(target instanceof Element)) return false;

  const actionText = actionTextForDetection(target);

  const clearWords = [
    "clear",
    "erase",
    "delete",
    "remove",
    "empty",
    "reset",
    "effacer",
    "vider",
    "supprimer",
    "réinitialiser",
    "reinitialiser",
  ];

  const workflowWords = ["workflow", "graph", "flux", "travail"];

  return hasAny(actionText, clearWords) && hasAny(actionText, workflowWords);
}

function looksLikeNewWorkflowTabAction(event) {
  const target = event.target;
  if (!(target instanceof Element)) return false;

  const actionText = actionTextForDetection(target);
  const contextText = contextTextForDetection(target);
  const combinedText = `${actionText} ${contextText}`;

  // Exclusion prioritaire : Editer -> Effacer le flux de travail doit vraiment
  // laisser le graph vide, pas recharger le workflow personnalisé.
  if (looksLikeClearWorkflowAction(event)) return false;

  const workflowWords = ["workflow", "graph", "tab", "onglet", "flux", "travail"];
  const newWords = [
    "new",
    "nouveau",
    "nouvel",
    "create",
    "add",
    "ajouter",
    "plus",
  ];

  const hasWorkflowWord = hasAny(combinedText, workflowWords);
  const hasNewWord = hasAny(actionText, newWords);

  // Bouton icône "+" sans texte : accepté seulement si le contexte proche
  // parle de workflow/onglet. Le "+" doit venir de l'action locale, pas d'un
  // parent large.
  const hasPlusGlyph =
    actionText.includes("+") ||
    actionText.includes("pi-plus") ||
    actionText.includes("lucide-plus") ||
    actionText.includes("icon-plus");

  return hasWorkflowWord && (hasNewWord || hasPlusGlyph);
}

function installNewWorkflowActionDetector() {
  if (window.__defaultWorkflowOverrideNewTabDetectorInstalled) return;

  window.__defaultWorkflowOverrideNewTabDetectorInstalled = true;

  document.addEventListener(
    "click",
    (event) => {
      // Important : Editer -> Effacer le flux de travail doit pouvoir laisser
      // le graph vide. On désarme même un éventuel fallback encore actif.
      if (looksLikeClearWorkflowAction(event)) {
        disarmEmptyNewWorkflowFallback();
        return;
      }

      if (looksLikeNewWorkflowTabAction(event)) {
        armEmptyNewWorkflowFallback("new workflow tab click");
      }
    },
    true,
  );

  document.addEventListener(
    "keydown",
    (event) => {
      // Certaines configurations utilisent Ctrl+N / Cmd+N pour créer un nouveau
      // workflow ou onglet de workflow. On arme seulement un court instant ; si le
      // graph actif ne devient pas vide, aucune action n'est effectuée.
      if ((event.ctrlKey || event.metaKey) && event.key?.toLowerCase?.() === "n") {
        armEmptyNewWorkflowFallback("new workflow keyboard shortcut");
      }
    },
    true,
  );
}

function patchLoadGraphDataForArmedEmptyWorkflow() {
  if (app.__defaultWorkflowOverrideLoadGraphDataPatched) return;
  if (typeof app.loadGraphData !== "function") return;

  const originalLoadGraphData = app.loadGraphData.bind(app);

  app.loadGraphData = async function (graphData, ...args) {
    if (
      emptyNewWorkflowFallbackIsArmed() &&
      isEmptyGraphData(graphData)
    ) {
      console.info(`[${EXTENSION_NAME}] replacing armed empty workflow load`);
      disarmEmptyNewWorkflowFallback();
      return originalLoadGraphData(cloneDefaultWorkflow(), ...args);
    }

    return originalLoadGraphData(graphData, ...args);
  };

  Object.defineProperty(app, "__defaultWorkflowOverrideLoadGraphDataPatched", {
    value: true,
    enumerable: false,
    configurable: false,
  });
}

app.registerExtension({
  name: EXTENSION_NAME,

  async beforeConfigureGraph(graphData) {
    if (isReplacementWorkflow(graphData)) return;

    if (isComfyBuiltinDefaultWorkflow(graphData)) {
      console.info(`[${EXTENSION_NAME}] replacing ComfyUI builtin default workflow`);
      replaceGraphDataInPlace(graphData);
      return;
    }

    // On ne remplace un graph vide que si l'utilisateur vient probablement de
    // créer un nouveau workflow/onglet. Cela évite de casser un vrai clear manuel.
    if (emptyNewWorkflowFallbackIsArmed() && isEmptyGraphData(graphData)) {
      console.info(`[${EXTENSION_NAME}] replacing armed empty graph workflow (${armedReason})`);
      replaceGraphDataInPlace(graphData);
      disarmEmptyNewWorkflowFallback();
    }
  },

  async afterConfigureGraph(graphData) {
    if (emptyNewWorkflowFallbackIsArmed() && isEmptyGraphData(graphData)) {
      await loadReplacementWorkflow(`afterConfigureGraph armed empty fallback (${armedReason})`, {
        onlyIfEmpty: true,
        requireArmed: true,
      });
    }
  },

  async setup() {
    try {
      installNewWorkflowActionDetector();
      patchLoadGraphDataForArmedEmptyWorkflow();

      const currentGraph = currentGraphData();

      if (isComfyBuiltinDefaultWorkflow(currentGraph)) {
        await loadReplacementWorkflow("setup builtin fallback");
      } else {
        console.info(`[${EXTENSION_NAME}] extension loaded`);
      }
    } catch (error) {
      console.error(`[${EXTENSION_NAME}] setup fallback failed`, error);
    }
  },
});
