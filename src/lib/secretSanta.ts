interface Exclusion {
  giver: string;
  receiver: string;
}

interface Assignment {
  giver: string;
  receiver: string;
}

export function generateSecretSanta(
  participants: string[],
  exclusions: Exclusion[]
): Assignment[] | null {
  if (participants.length < 2) {
    return null;
  }

  // Create exclusion map for quick lookup
  const exclusionMap = new Map<string, Set<string>>();
  participants.forEach((p) => exclusionMap.set(p, new Set()));
  exclusions.forEach((e) => {
    exclusionMap.get(e.giver)?.add(e.receiver);
  });

  // Try to generate valid assignments using backtracking
  const maxAttempts = 1000;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = tryGenerate(participants, exclusionMap);
    if (result) {
      return result;
    }
  }

  return null;
}

function tryGenerate(
  participants: string[],
  exclusionMap: Map<string, Set<string>>
): Assignment[] | null {
  const givers = [...participants];
  const receivers = [...participants];
  const assignments: Assignment[] = [];

  // Shuffle both arrays
  shuffleArray(givers);
  shuffleArray(receivers);

  for (const giver of givers) {
    // Find a valid receiver
    const validReceivers = receivers.filter(
      (r) => r !== giver && !exclusionMap.get(giver)?.has(r)
    );

    if (validReceivers.length === 0) {
      return null;
    }

    // Pick a random valid receiver
    const receiver = validReceivers[Math.floor(Math.random() * validReceivers.length)];
    assignments.push({ giver, receiver });
    
    // Remove the receiver from available list
    const idx = receivers.indexOf(receiver);
    receivers.splice(idx, 1);
  }

  return assignments;
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
