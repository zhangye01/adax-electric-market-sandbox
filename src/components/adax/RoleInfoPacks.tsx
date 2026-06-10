import { Badge } from "../Badge";
import { retailMarketData } from "../../data/retailMarketData";
import { formatEnergy } from "../../utils/formatters";

export function RetailerInfoPack() {
  const customerPools = Object.values(retailMarketData.customerPools);

  return (
    <div className="role-customer-pack">
      {customerPools.map((customer) => (
        <div key={customer.id} className="role-customer-card">
          <Badge tone="green">{customer.name}</Badge>
          <p>{customer.riskTag}</p>
          <strong>可签约上限 {formatEnergy(customer.maxContractMwh)}</strong>
        </div>
      ))}
    </div>
  );
}
