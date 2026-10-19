import { describe, it, expect } from "vitest";
import { normalizarPlaca } from "@/lib/utils/placa";

describe("normalizarPlaca", () => {
  it("'abc 12d', 'ABC-12D' y 'ABC12D' normalizan a la misma placa (F1-02)", () => {
    expect(normalizarPlaca("abc 12d")).toBe("ABC12D");
    expect(normalizarPlaca("ABC-12D")).toBe("ABC12D");
    expect(normalizarPlaca("ABC12D")).toBe("ABC12D");
  });

  it("quita espacios y guiones intercalados, no solo en los extremos", () => {
    expect(normalizarPlaca(" a b c - 1 2 3 ")).toBe("ABC123");
  });

  it("deja vacío lo que ya está vacío o solo tiene separadores", () => {
    expect(normalizarPlaca("")).toBe("");
    expect(normalizarPlaca("  --  ")).toBe("");
  });
});
