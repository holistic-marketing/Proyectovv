/** Holistic Clerk appearance (sign-in / sign-up). */
export const holisticClerkAppearance = {
  layout: {
    logoPlacement: "none" as const,
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
    showOptionalFields: false,
  },
  variables: {
    colorPrimary: "#242522",
    colorBackground: "#ffffff",
    colorText: "#242522",
    colorTextSecondary: "#676961",
    colorInputBackground: "#ffffff",
    colorInputText: "#242522",
    colorNeutral: "#242522",
    colorDanger: "#b42318",
    colorSuccess: "#1f5c40",
    borderRadius: "12px",
    fontFamily: "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
    fontFamilyButtons: "var(--font-jakarta), ui-sans-serif, system-ui, sans-serif",
    fontSize: "0.9375rem",
  },
  elements: {
    rootBox: { width: "100%" },
    // Tarjeta con borde, como ImpoERP.
    cardBox: {
      width: "100%",
      boxShadow: "0 1px 2px rgb(36 37 34 / 0.04), 0 12px 32px -18px rgb(36 37 34 / 0.18)",
      border: "1px solid #e4e5df",
      borderRadius: "16px",
      overflow: "hidden",
    },
    card: {
      boxShadow: "none",
      border: "none",
      borderRadius: "0",
      backgroundColor: "#ffffff",
      padding: "28px 28px 24px",
    },
    headerTitle: {
      fontFamily: "var(--font-jakarta), sans-serif",
      fontWeight: "800",
      fontSize: "1.4rem",
      lineHeight: "1.2",
      letterSpacing: "-0.02em",
      color: "#242522",
    },
    headerSubtitle: {
      color: "#676961",
      fontSize: "0.9rem",
      lineHeight: "1.55",
    },
    formFieldLabel: {
      color: "#242522",
      fontWeight: "600",
      fontSize: "0.8125rem",
    },
    formFieldInput: {
      borderRadius: "12px",
      minHeight: "46px",
      borderColor: "#d8dbd3",
      backgroundColor: "#ffffff",
      boxShadow: "none",
      fontSize: "0.95rem",
      "&:focus": {
        borderColor: "#b94708",
        boxShadow: "0 0 0 3px rgb(185 71 8 / 0.12)",
      },
    },
    formButtonPrimary: {
      backgroundColor: "#242522",
      color: "#ffffff",
      fontWeight: "700",
      borderRadius: "12px",
      minHeight: "46px",
      textTransform: "none",
      boxShadow: "none",
      fontSize: "0.95rem",
      "&:hover": {
        backgroundColor: "#3a3c36",
      },
      "&:disabled": { opacity: "0.55" },
      "&:focus-visible": { outline: "2px solid #b94708", outlineOffset: "3px" },
    },
    formButtonPrimaryIcon: {
      display: "none",
    },
    // Pie gris de la tarjeta («¿No tienes cuenta?»), como ImpoERP.
    footer: {
      background: "#f6f6f3",
      boxShadow: "none",
      borderTop: "1px solid #ecede8",
    },
    footerActionLink: {
      color: "#b94708",
      fontWeight: "700",
    },
    formFieldAction: { color: "#b94708" },
    socialButtonsBlockButton: {
      borderRadius: "12px",
      minHeight: "46px",
      borderColor: "#d8dbd3",
      backgroundColor: "#ffffff",
      boxShadow: "none",
    },
    otpCodeFieldInput: {
      borderRadius: "12px",
      minHeight: "46px",
      borderColor: "#d8dbd3",
      boxShadow: "none",
    },
  },
};
