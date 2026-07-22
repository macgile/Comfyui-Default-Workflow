# Afficher Default Workflow Override dans ComfyUI-Manager

Le custom node fonctionne sans cette étape. Cette étape sert uniquement à le faire apparaître dans la liste locale de ComfyUI-Manager.

## Pourquoi il n'apparaît pas automatiquement

ComfyUI charge le dossier local et l'extension frontend, donc le workflow par défaut est bien remplacé.
ComfyUI-Manager, lui, affiche surtout les entrées présentes dans sa base `custom-node-list.json` ou dans le registre public. Un node installé manuellement par ZIP peut donc être actif dans ComfyUI sans être listé dans l'interface principale de Manager.

## Méthode locale

1. Ferme ComfyUI.
2. Ouvre un terminal dans ce dossier :

```bat
ComfyUI\custom_nodes\Comfyui-Default-Workflow\tools
```

3. Lance :

```bat
..\..\..\python_embeded\python.exe register_in_comfyui_manager_local_db.py
```

Si ton Python portable est ailleurs, adapte le chemin.

4. Redémarre ComfyUI.
5. Ouvre `Manager` > `Install Custom Nodes`.
6. Sélectionne `DB: Local`.
7. Recherche :

```text
Default Workflow Override
```

## Si tu publies ce node sur GitHub

Utilise plutôt :

```bat
..\..\..\python_embeded\python.exe register_in_comfyui_manager_local_db.py --repo-url https://github.com/TON_COMPTE/default-workflow-override
```

Ensuite, pour qu'il apparaisse dans la liste publique distante, il faudra soumettre une PR à ComfyUI-Manager ou publier via le registre ComfyUI.
