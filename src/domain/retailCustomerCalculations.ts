import { retailCustomerLoadCurves } from "../data/retailCurves";
import type { CustomerMixResult, RetailTrainingState } from "./retailTypes";
import { normalizeCurve, round } from "./retailCalculationUtils";

export function calculateAnnualServiceMwh(state: RetailTrainingState) {
  return round(
    (state.customerContracts.industrialStableMwh ?? 0) +
      (state.customerContracts.commercialPeakMwh ?? 0) +
      (state.customerContracts.volatileLoadMwh ?? 0),
    2
  );
}

export function calculateCustomerMix(state: RetailTrainingState): CustomerMixResult {
  const total = calculateAnnualServiceMwh(state);
  if (total <= 0) {
    return { industrialShare: 0, commercialShare: 0, volatileShare: 0 };
  }
  return {
    industrialShare: round((state.customerContracts.industrialStableMwh ?? 0) / total, 4),
    commercialShare: round((state.customerContracts.commercialPeakMwh ?? 0) / total, 4),
    volatileShare: round((state.customerContracts.volatileLoadMwh ?? 0) / total, 4)
  };
}

export function calculateCombinedCustomerCurve(state: RetailTrainingState) {
  const annualServiceMwh = calculateAnnualServiceMwh(state);
  if (annualServiceMwh <= 0) return normalizeCurve(retailCustomerLoadCurves.industrialStable).map((value) => round(value * 100, 4));

  const industrial = normalizeCurve(retailCustomerLoadCurves.industrialStable);
  const commercial = normalizeCurve(retailCustomerLoadCurves.commercialPeak);
  const volatile = normalizeCurve(retailCustomerLoadCurves.volatileLoad);
  const industrialMwh = state.customerContracts.industrialStableMwh ?? 0;
  const commercialMwh = state.customerContracts.commercialPeakMwh ?? 0;
  const volatileMwh = state.customerContracts.volatileLoadMwh ?? 0;

  return industrial.map((_, hour) =>
    round(
      ((industrialMwh * industrial[hour] + commercialMwh * commercial[hour] + volatileMwh * volatile[hour]) /
        annualServiceMwh) *
        100,
      4
    )
  );
}
