import type { AdaxPageId, AdaxTrainingMode } from "../types";

export interface AdaxRouteState {
  page: AdaxPageId;
  mode: AdaxTrainingMode | null;
  role?: "retailer";
}

const activeParticipantRole = "retailer" as const;

export const participantPages: AdaxPageId[] = ["role", "strategy", "settlement", "review"];

export function shouldReplaceMergedProductPath(pathname: string) {
  return pathname === "/guide";
}

export function shouldReplaceMissingRetailParticipant(
  page: AdaxPageId,
  mode: AdaxTrainingMode | null,
  participant: string | null
) {
  return Boolean(mode && participantPages.includes(page) && participant !== activeParticipantRole);
}

export function routeFromLocation(location: Pick<Location, "pathname" | "search"> | null = typeof window !== "undefined" ? window.location : null): AdaxRouteState {
  if (!location) return { page: "home", mode: null };

  const path = location.pathname;
  const params = new URLSearchParams(location.search);
  const modeParam = params.get("mode");
  const participantParam = params.get("participant");
  const routeMode: AdaxTrainingMode | null =
    modeParam === "execution" || modeParam === "review" ? modeParam : null;
  const routeRole: "retailer" | undefined = participantParam === activeParticipantRole ? activeParticipantRole : undefined;

  if (path === "/start") return { page: "start", mode: null };
  if (path === "/scenarios") return { page: routeMode ? "scenario" : "home", mode: routeMode };
  if (path === "/participants") return { page: routeMode ? "role" : "home", mode: routeMode, role: routeRole };
  if (path === "/workspace") return { page: routeMode ? "strategy" : "home", mode: routeMode, role: routeRole };
  if (path === "/result") return { page: "settlement", mode: "execution", role: routeRole };
  if (path === "/report") return { page: "review", mode: "execution", role: routeRole };
  if (path === "/records") return { page: "records", mode: null };
  if (path === "/about" || shouldReplaceMergedProductPath(path)) return { page: "about", mode: null };
  return { page: "home", mode: null };
}

export function pathForPage(page: AdaxPageId, mode: AdaxTrainingMode | null, selectedRole = "retailer") {
  const activeRole = selectedRole === activeParticipantRole ? selectedRole : activeParticipantRole;

  if (page === "start") return "/start";
  if (page === "scenario") return mode ? `/scenarios?mode=${mode}` : "/";
  if (page === "role") return mode ? `/participants?mode=${mode}&participant=${activeRole}` : "/";
  if (page === "strategy") return mode ? `/workspace?mode=${mode}&scenario=SCN-A-STD-001&participant=${activeRole}` : "/";
  if (page === "settlement") return `/result?mode=execution&scenario=SCN-A-STD-001&participant=${activeRole}`;
  if (page === "review") return `/report?mode=execution&scenario=SCN-A-STD-001&participant=${activeRole}`;
  if (page === "records") return "/records";
  if (page === "about" || page === "guide") return "/about";
  return "/";
}
