import { filterLiveStories, isStoryLive } from "../src/utils/stories";
import type { Story } from "../src/types";

const baseStory = (overrides: Partial<Story> = {}): Story => ({
  id: "s1",
  userId: "u1",
  mediaUrl: "https://example.com/a.jpg",
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
  ...overrides,
});

describe("stories helpers", () => {
  it("identifies live vs expired", () => {
    const live = baseStory();
    const expired = baseStory({ expiresAt: new Date(Date.now() - 1000).toISOString() });
    expect(isStoryLive(live)).toBe(true);
    expect(isStoryLive(expired)).toBe(false);
  });

  it("filters only live stories", () => {
    const stories = [
      baseStory({ id: "1" }),
      baseStory({ id: "2", expiresAt: new Date(Date.now() - 5000).toISOString() }),
    ];
    const filtered = filterLiveStories(stories, Date.now());
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("1");
  });
});
