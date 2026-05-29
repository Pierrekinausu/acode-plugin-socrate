class SocratePlugin {
    constructor() {
        // On garde le même identifiant unique pour ton plugin
        this.id = "com.socrate.deepseek.assistant"; 
    }

    async init() {
        // 1. Ajoute l'option "Demander à Socrate" dans le menu contextuel d'Acode
        if (window.acode) {
            window.acode.addContextMenuItem("Demander à Socrate", () => {
                this.analyserCodeAvecGroq();
            });
        }
    }

    async analyserCodeAvecGroq() {
        // 2. Configuration d'accès à l'API gratuite de Groq
        // (Colle ta clé gsk_ ici entre les guillemets)
        const GROQ_API_KEY = "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"; 
        const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

        // Récupérer l'éditeur de texte actif et récupérer ce que tu as surligné
        const { editor } = window.editorManager.activeFile;
        const codeSelectionne = editor.getSelectedText();

        if (!codeSelectionne) {
            window.acode.alert("Socrate AI", "Erreur : Tu dois d'abord sélectionner une partie de ton code !");
            return;
        }

        // Affiche la petite notification de chargement en bas de l'écran
        window.plugins.toast.showShortBottom("Socrate (Groq) réfléchit à toute vitesse...");

        try {
            // 3. Envoi du code surligné aux serveurs de Groq
            const response = await fetch(GROQ_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile", // Modèle super fort pour le code et totalement gratuit
                    messages: [
                        { 
                            role: "system", 
                            content: "Tu es Socrate, un ingénieur logiciel senior. Analyse le code de l'utilisateur, trouve les bugs et propose des optimisations claires et courtes en français." 
                        },
                        { 
                            role: "user", 
                            content: `Voici mon code :\n\n${codeSelectionne}` 
                        }
                    ],
                    temperature: 0.3
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `Erreur HTTP ${response.status}`);
            }

            const data = await response.json();
            const reponseIA = data.choices[0].message.content;

            // 4. Affiche la réponse de l'IA dans la pop-up blanche au milieu de l'écran
            window.acode.alert("Socrate AI - Analyse", reponseIA);

        } catch (error) {
            // Si la clé est mauvaise ou s'il y a un problème réseau
            window.acode.alert("Socrate Error", "Erreur Groq : " + error.message);
        }
    }

    async destroy() {
        // Retire l'option du menu si jamais tu désactives le plugin
        if (window.acode) {
            window.acode.removeContextMenuItem("Demander à Socrate");
        }
    }
}

// Enregistrement final dans le système d'Acode
if (window.acode) {
    const socratePlugin = new SocratePlugin();
    window.acode.setPluginInit(socratePlugin.id, (baseUrl, $page, cache) => {
        socratePlugin.init(baseUrl, $page, cache);
    });
    window.acode.setPluginUnmount(socratePlugin.id, () => {
        socratePlugin.destroy();
    });
}