import type { RetailNodeId, RetailTrainingState } from "./retailTypes";
import {
  validateAnnualBilateral,
  validateCustomerContracts,
  validateMonthlyAuctions,
  validateRetailPackage
} from "./retailValidation";

export function getRetailNodeValidationErrors(
  nodeId: RetailNodeId,
  state: RetailTrainingState,
  allErrors: string[]
) {
  if (nodeId === "marketBrief") return [];
  if (nodeId === "customerLoad") return validateCustomerContracts(state).errors;
  if (nodeId === "retailPackage") return validateRetailPackage(state).errors;
  if (nodeId === "annualBilateral") return validateAnnualBilateral(state).errors;
  if (nodeId === "monthlyAuction") return validateMonthlyAuctions(state).errors;
  return allErrors;
}
