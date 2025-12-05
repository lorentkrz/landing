import type { Story } from "../types";

export const isStoryLive = (story: Story, nowTs: number = Date.now()): boolean => {
  return new Date(story.expiresAt).getTime() > nowTs;
};

export const filterLiveStories = (stories: Story[], nowTs: number = Date.now()): Story[] =>
  stories.filter((story) => isStoryLive(story, nowTs));
