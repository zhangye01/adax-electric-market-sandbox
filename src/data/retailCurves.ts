import type {
  AnnualContractCurveType,
  MonthlyContractCurveType,
  RetailCustomerSegment,
  RetailHourlyCurve,
  RetailTypicalMonth,
  RetailTypicalDay
} from "../domain/retailTypes";

export const retailCustomerLoadCurves: Record<RetailCustomerSegment, RetailHourlyCurve> = {
  industrialStable: [
    3.2, 3.1, 3.1, 3.1, 3.2, 3.4, 4.0, 4.5, 4.8, 5.0, 5.0, 5.0,
    5.0, 5.0, 5.0, 4.9, 4.8, 4.6, 4.2, 3.9, 3.6, 3.4, 3.3, 3.2
  ],
  commercialPeak: [
    1.8, 1.6, 1.5, 1.5, 1.7, 2.2, 3.2, 4.3, 5.2, 5.8, 6.0, 6.1,
    5.9, 5.8, 5.9, 6.2, 6.5, 6.7, 6.4, 5.8, 4.8, 3.6, 2.7, 2.1
  ],
  volatileLoad: [
    2.4, 2.1, 2.0, 2.2, 2.5, 3.0, 5.0, 6.0, 4.2, 3.6, 4.0, 5.2,
    4.1, 3.8, 5.6, 6.3, 5.1, 6.8, 7.0, 5.7, 4.4, 3.4, 2.8, 2.1
  ]
};

export const annualContractCurves: Record<AnnualContractCurveType, RetailHourlyCurve> = {
  flat: [
    4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17,
    4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17, 4.17
  ],
  industrial: [
    3.0, 2.9, 2.9, 2.9, 3.0, 3.3, 4.1, 4.7, 5.1, 5.3, 5.3, 5.3,
    5.3, 5.2, 5.2, 5.1, 4.9, 4.7, 4.2, 3.9, 3.6, 3.4, 3.2, 3.0
  ]
};

export const monthlyContractCurves: Record<MonthlyContractCurveType, Record<RetailTypicalMonth, RetailHourlyCurve>> = {
  flat: {
    march: annualContractCurves.flat,
    july: annualContractCurves.flat,
    december: annualContractCurves.flat
  },
  typicalMonth: {
    march: [
      2.7, 2.5, 2.4, 2.4, 2.6, 3.1, 4.0, 4.7, 5.1, 5.3, 5.5, 5.6,
      5.4, 5.2, 5.1, 5.2, 5.3, 5.4, 5.0, 4.4, 3.8, 3.3, 2.9, 2.6
    ],
    july: [
      2.2, 2.0, 1.9, 1.9, 2.1, 2.7, 3.8, 4.9, 5.7, 6.1, 6.3, 6.4,
      6.5, 6.7, 6.9, 7.0, 6.8, 6.5, 5.9, 5.1, 4.2, 3.3, 2.7, 2.4
    ],
    december: [
      2.8, 2.6, 2.5, 2.5, 2.7, 3.2, 4.1, 4.9, 5.2, 5.0, 4.8, 4.7,
      4.6, 4.7, 4.9, 5.3, 5.9, 6.6, 6.9, 6.6, 5.6, 4.4, 3.5, 2.9
    ]
  }
};

export const typicalDaySpotPriceCurves: Record<RetailTypicalDay, readonly number[]> = {
  marchLowPrice: [
    330, 320, 310, 305, 300, 310, 330, 350, 360, 320, 280, 240,
    220, 230, 260, 300, 340, 370, 390, 380, 360, 350, 340, 335
  ],
  julyHighPrice: [
    390, 380, 370, 365, 370, 390, 430, 470, 510, 540, 560, 580,
    610, 650, 700, 760, 740, 710, 680, 620, 560, 500, 450, 410
  ],
  decemberEveningPeak: [
    380, 370, 360, 355, 360, 380, 420, 460, 480, 470, 450, 440,
    430, 440, 460, 500, 560, 640, 700, 680, 610, 520, 450, 400
  ]
};
