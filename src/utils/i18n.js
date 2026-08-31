export const formatI18nText = (Template, Parameters = {}) =>
  String(Template || "").replace(/\{([A-Za-z0-9_]+)\}/g, (Placeholder, ParameterName) =>
    Object.prototype.hasOwnProperty.call(Parameters, ParameterName)
      ? String(Parameters[ParameterName] ?? "")
      : Placeholder,
  );
