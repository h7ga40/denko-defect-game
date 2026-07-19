import { candidateDiagrams } from "./candidateDiagrams";

export type GameQueryOptions = {
  candidateNo?: number;
  seed?: string;
};

export function parseGameQueryOptions(search: string): GameQueryOptions {
  const params = new URLSearchParams(search);
  const candidateParam = params.get("candidate");
  const candidateNo = candidateParam === null ? undefined : Number(candidateParam);
  const seedParam = params.get("seed");

  return {
    candidateNo: Number.isInteger(candidateNo) && candidateDiagrams.some((candidate) => candidate.no === candidateNo)
      ? candidateNo
      : undefined,
    seed: seedParam === null || seedParam === "" ? undefined : seedParam,
  };
}
