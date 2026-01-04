type CustomDimension = {
  name: string;
  value: string;
};

type Dimensions = {
  length: string;
  width: string;
  height: string;
};

export function parseDimensionString(dimensionStr: string | null): {
  dimensions: Dimensions;
  customDimensions: CustomDimension[];
  customizationBullets: string[];
} {
  if (!dimensionStr) {
    return {
      dimensions: { length: "", width: "", height: "" },
      customDimensions: [],
      customizationBullets: [],
    };
  }

  const dimensions: Dimensions = { length: "", width: "", height: "" };
  const customDimensions: CustomDimension[] = [];
  const bullets: string[] = [];

  // Split by comma and parse each dimension
  const parts = dimensionStr.split(",").map((s) => s.trim());

  for (const part of parts) {
    // Pattern: "Height 29CM" or "Diameter 33CM"
    const match = part.match(/^([A-Za-z\s]+?)\s+([\d.]+)\s*([A-Z]+)$/i);

    if (match) {
      const [, name, value, unit] = match;
      const normalizedName = name.trim().toLowerCase();
      const valueWithUnit = `${value}${unit}`;

      // Map to standard dimensions
      if (normalizedName === "height") {
        dimensions.height = valueWithUnit;
      } else if (normalizedName === "width") {
        dimensions.width = valueWithUnit;
      } else if (normalizedName === "length") {
        dimensions.length = valueWithUnit;
      } else {
        // Add as custom dimension
        customDimensions.push({
          name: name.trim(),
          value: valueWithUnit,
        });
      }

      // Also add as bullet point for customizations
      bullets.push(`${name.trim()}: ${valueWithUnit}`);
    } else {
      // If parsing fails, add the whole part as a bullet
      bullets.push(part);
    }
  }

  return { dimensions, customDimensions, customizationBullets: bullets };
}
