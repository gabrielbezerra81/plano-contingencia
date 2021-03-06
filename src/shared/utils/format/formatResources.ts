import { Resource } from "types/Plan";
import formatResourceAddress from "./formatResourceAddress";

export default function formatResources(resources: Resource[]) {
  const formatted = resources.map((resourceItem) => {
    const { address } = resourceItem;

    const formattedAddress = address ? formatResourceAddress(address) : "";

    let value2;

    if (resourceItem.type === "dinheiro" && resourceItem.value2) {
      value2 = "R$ " + resourceItem.value2;
    }

    return {
      ...resourceItem,
      formattedAddress,
      formattedValue2: value2 ? value2 : undefined,
    };
  });

  return formatted;
}
