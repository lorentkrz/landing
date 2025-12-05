import { computeRegion } from "../src/utils/map";
import type { Venue } from "../src/types";

describe("computeRegion", () => {
  it("returns Kosovo center when empty", () => {
    const region = computeRegion([]);
    expect(region.latitude).toBeCloseTo(42.6629, 3);
    expect(region.longitude).toBeCloseTo(21.1655, 3);
    expect(region.latitudeDelta).toBeGreaterThan(1);
  });

  it("averages coordinates", () => {
    const venues: Venue[] = [
      { id: "1", name: "A", type: "Bar", latitude: 40, longitude: 10 } as Venue,
      { id: "2", name: "B", type: "Bar", latitude: 50, longitude: 20 } as Venue,
    ];
    const region = computeRegion(venues);
    expect(region.latitude).toBeCloseTo(45);
    expect(region.longitude).toBeCloseTo(15);
    expect(region.latitudeDelta).toBeLessThan(1);
  });
});
