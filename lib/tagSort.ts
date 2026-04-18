import type { Dog } from "../types";

/**
 * Match hint that describes why two dogs are a good match.
 * Priority: exact spot > location type > same district > personality overlap
 */
export interface MatchHint {
  type: "spot" | "location_type" | "district" | "personality";
  label: string;
  priority: number; // higher = better match
}

/**
 * Get the best match hint between two dogs.
 */
export function getMatchHint(candidate: Dog, myDog: Dog): MatchHint | null {
  // 1. Exact walking spot match (highest priority)
  const mySpots = myDog.walking_spots ?? [];
  const candidateSpots = candidate.walking_spots ?? [];
  const commonSpots = mySpots.filter((s) => candidateSpots.includes(s));
  if (commonSpots.length > 0) {
    return {
      type: "spot",
      label: `你們都常去${commonSpots[0]}`,
      priority: 100 + commonSpots.length,
    };
  }

  // 2. Same walking location type (e.g. both like 公園)
  const myLocs = myDog.walking_locations ?? [];
  const candidateLocs = candidate.walking_locations ?? [];
  const commonLocs = myLocs.filter((l) => candidateLocs.includes(l));
  if (commonLocs.length > 0) {
    return {
      type: "location_type",
      label: `你們都喜歡去${commonLocs[0]}遛狗`,
      priority: 50 + commonLocs.length,
    };
  }

  // 3. Same district
  if (
    myDog.district &&
    candidate.district &&
    myDog.district === candidate.district &&
    myDog.city === candidate.city
  ) {
    return {
      type: "district",
      label: `你們都住在${candidate.district}`,
      priority: 30,
    };
  }

  // 4. Personality overlap
  const myTags = new Set(myDog.personality ?? []);
  const commonTraits = (candidate.personality ?? []).filter((t) => myTags.has(t));
  if (commonTraits.length > 0) {
    return {
      type: "personality",
      label: `你們有 ${commonTraits.length} 個共同特質`,
      priority: 10 + commonTraits.length,
    };
  }

  return null;
}

/**
 * Calculate a composite match score for sorting.
 * Higher score = better match = shown first.
 */
export function getMatchScore(candidate: Dog, myDog: Dog): number {
  let score = 0;

  // Exact spot matches (30 pts each)
  const mySpots = myDog.walking_spots ?? [];
  const candidateSpots = candidate.walking_spots ?? [];
  const spotOverlap = mySpots.filter((s) => candidateSpots.includes(s)).length;
  score += spotOverlap * 30;

  // Location type matches (10 pts each)
  const myLocs = myDog.walking_locations ?? [];
  const candidateLocs = candidate.walking_locations ?? [];
  const locOverlap = myLocs.filter((l) => candidateLocs.includes(l)).length;
  score += locOverlap * 10;

  // Same district (8 pts)
  if (
    myDog.district &&
    candidate.district &&
    myDog.district === candidate.district &&
    myDog.city === candidate.city
  ) {
    score += 8;
  }

  // Same city (3 pts)
  if (myDog.city && candidate.city && myDog.city === candidate.city) {
    score += 3;
  }

  // Personality overlap (5 pts each)
  const myTags = new Set(myDog.personality ?? []);
  const traitOverlap = (candidate.personality ?? []).filter((t) => myTags.has(t)).length;
  score += traitOverlap * 5;

  return score;
}

/**
 * Sort candidates by composite match score (descending).
 */
export function sortCandidates(candidates: Dog[], myDog: Dog): Dog[] {
  return [...candidates].sort((a, b) => {
    return getMatchScore(b, myDog) - getMatchScore(a, myDog);
  });
}

// Keep backwards-compatible exports
export function countTagOverlap(candidateTags: string[], myTags: string[]): number {
  const myTagSet = new Set(myTags);
  return candidateTags.filter((tag) => myTagSet.has(tag)).length;
}

export function sortByTagOverlap(candidates: Dog[], myTags: string[]): Dog[] {
  if (myTags.length === 0) return candidates;
  const myTagSet = new Set(myTags);
  return [...candidates].sort((a, b) => {
    const overlapA = a.personality.filter((tag) => myTagSet.has(tag)).length;
    const overlapB = b.personality.filter((tag) => myTagSet.has(tag)).length;
    return overlapB - overlapA;
  });
}
