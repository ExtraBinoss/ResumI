export const faqEn = {
  title: "A few questions, answered.",
  items: {
    what: {
      question: "What is ResumI?",
      answer:
        "ResumI is a local-first resume editor with visual and text workspaces. Start with a template, edit your content and layout, and export your resume. A CLI also lets coding agents work with the same document format.",
    },
    privacy: {
      question: "Where are my resumes saved?",
      answer:
        "Your projects are saved in this browser’s local storage, using IndexedDB. They are not automatically synced across devices. Export a JSON backup to keep a copy you can reopen; clearing browser data can remove locally saved projects.",
    },
    agent: {
      question: "Do I need an AI agent or an account?",
      answer:
        "You can use the editor without an account or an AI agent. If you use a coding agent, the ResumI CLI works with local JSON files; import the result into the editor. Your agent’s own service and privacy terms still apply.",
    },
    source: {
      question: "Can I edit React or HTML resume source?",
      answer:
        "Yes. Write HTML or React/TSX with the CLI, then open its JSON in the app. The editor converts it into editable text, images and shapes. You can export the current design as HTML or React/TSX.",
    },
    pdf: {
      question: "How do PDF exports work?",
      answer:
        "In the app, Export PDF opens a print preview; choose Save as PDF in your browser. Native documents can include pages of different sizes. The CLI can also render PDFs locally and inspect their extracted text. Always review your exported PDF before sending it.",
    },
    languages: {
      question: "Does changing the interface language translate my CV?",
      answer:
        "No. The English or French interface is separate from your CV’s language and content. Switching the interface does not rewrite your resume. Manage CV languages from the project menu in the editor.",
    },
  },
};
export const faqFr: typeof faqEn = {
  title: "Quelques réponses à vos questions.",
  items: {
    what: {
      question: "Qu’est-ce que ResumI ?",
      answer:
        "ResumI est un éditeur de CV local avec des espaces de travail visuel et texte. Partez d’un modèle, modifiez le contenu et la mise en page, puis exportez votre CV. Une CLI permet aussi aux agents de programmation de travailler avec le même format de document.",
    },
    privacy: {
      question: "Où mes CV sont-ils enregistrés ?",
      answer:
        "Vos projets sont enregistrés localement dans ce navigateur, avec IndexedDB. Ils ne sont pas synchronisés automatiquement entre appareils. Exportez une sauvegarde JSON pour conserver une copie que vous pourrez rouvrir : effacer les données du navigateur peut supprimer vos projets locaux.",
    },
    agent: {
      question: "Faut-il un agent IA ou un compte ?",
      answer:
        "Vous pouvez utiliser l’éditeur sans compte ni agent IA. Si vous utilisez un agent de programmation, la CLI ResumI travaille sur des fichiers JSON locaux ; importez ensuite le résultat dans l’éditeur. Les conditions et règles de confidentialité de votre agent restent applicables.",
    },
    source: {
      question: "Puis-je modifier le code React ou HTML de mon CV ?",
      answer:
        "Oui. Créez un CV en HTML ou React/TSX avec la CLI, puis ouvrez son JSON dans l’application. Le CV devient du texte, des images et des formes modifiables. Vous pouvez exporter la mise en page actuelle en HTML ou React/TSX.",
    },
    pdf: {
      question: "Comment fonctionne l’export PDF ?",
      answer:
        "Dans l’application, Exporter en PDF ouvre un aperçu avant impression ; choisissez Enregistrer au format PDF dans votre navigateur. Les documents natifs peuvent contenir des pages de tailles différentes. La CLI peut aussi produire des PDF localement et examiner leur texte extrait. Relisez toujours votre PDF avant de l’envoyer.",
    },
    languages: {
      question: "Changer la langue de l’interface traduit-il mon CV ?",
      answer:
        "Non. L’interface en français ou en anglais est indépendante de la langue et du contenu de votre CV. Changer l’interface ne réécrit pas votre document. Gérez les langues du CV depuis le menu du projet dans l’éditeur.",
    },
  },
};
