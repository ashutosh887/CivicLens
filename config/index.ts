const config = {
  appName: "CivicLens",
  appDescription: "Bringing clarity to public services for everyone.",
  landing: {
    hero: {
      title: "CivicLens",
      tagline: "Bringing clarity to public services for everyone.",
      subheading:
        "Ask natural questions about public schemes, rights, or benefits and get clear, actionable answers in plain language.",
      searchPlaceholder: "Ask about any public service…",
      primaryCta: "Start understanding",
      secondaryCta: "View examples",
      exampleLabel: "Try questions like",
      examples: [
        "Am I eligible for this welfare scheme?",
        "What documents do I need for this pension application?",
        "How do I appeal a rejected benefit claim?"
      ]
    },
    footer: {
      links: [
        { label: "Disclaimer", href: "/disclaimer" },
        { label: "Privacy", href: "/privacy" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" }
      ],
      disclaimer:
        "CivicLens does not provide legal advice. For binding interpretations, consult official authorities or legal professionals."
    }
  }
};
  
  export default config;
  