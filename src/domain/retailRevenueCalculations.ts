import { retailMarketData } from "../data/retailMarketData";
import { calculateAnnualServiceMwh, calculateCombinedCustomerCurve } from "./retailCustomerCalculations";
import {
  normalizeCurve,
  RETAIL_TYPICAL_DAYS,
  round,
  sum
} from "./retailCalculationUtils";
import type { RetailMarketData, RetailPackageDefinition, RetailTrainingState } from "./retailTypes";

export function calculateRetailRevenue(
  state: RetailTrainingState,
  market: RetailMarketData = retailMarketData
) {
  const annualServiceMwh = calculateAnnualServiceMwh(state);
  const packageType = state.retailPackage.packageType;
  if (!packageType) return 0;

  const packageConfig = market.packages[packageType];
  const customerCurve = normalizeCurve(calculateCombinedCustomerCurve(state));

  if (packageConfig.id === "fixed") {
    return round(annualServiceMwh * packageConfig.fixedPrice, 2);
  }

  if (packageConfig.id === "tou") {
    return round(
      annualServiceMwh *
        sum(
          customerCurve.map((share, hour) => {
            const price = touPriceForHour(packageConfig, hour);
            return share * price;
          })
        ),
      2
    );
  }

  return round(
    annualServiceMwh *
      sum(
        customerCurve.map((share, hour) => {
          const representativeSpotPrice = calculateRepresentativeSpotPriceByHour(hour, market);
          return share * (representativeSpotPrice * packageConfig.spotFactor + packageConfig.serviceFee);
        })
      ),
    2
  );
}

function calculateRepresentativeSpotPriceByHour(hour: number, market: RetailMarketData) {
  const weighted = RETAIL_TYPICAL_DAYS.map((day) => {
    const dayData = market.typicalDays[day];
    return dayData.spotPrices[hour] * dayData.dayWeight;
  });
  return sum(weighted) / sum(RETAIL_TYPICAL_DAYS.map((day) => market.typicalDays[day].dayWeight));
}

function touPriceForHour(packageConfig: Extract<RetailPackageDefinition, { id: "tou" }>, hour: number) {
  if (hour >= 0 && hour <= 6) return packageConfig.valleyPrice;
  if (hour >= 17 && hour <= 21) return packageConfig.peakPrice;
  return packageConfig.flatPrice;
}
