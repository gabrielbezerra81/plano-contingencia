import api from "api/config";
import React, { useEffect, useState } from "react";
import formatRiskLocation from "shared/utils/format/formatRiskLocation";
import mapEnderecoToAddress from "shared/utils/typesMapping/address/mapEnderecoToAddress";
import { Plano } from "types/ModelsAPI";

import { Container } from "./styled";

const ListPlans: React.FC = () => {
  const [plans, setPlans] = useState<Plano[]>([]);

  useEffect(() => {
    api
      .get("planos")
      .then((response) => {
        setPlans(response.data);
        // console.log(response.data);
        // setPlans([response.data[151]]);
      })
      .catch(console.log);
  }, []);

  console.log(plans);

  return (
    <Container>
      {plans.map((plan) => (
        <>
          <h5>{plan.titulo}</h5>
          {!!plan.locaisDeRisco &&
            plan.locaisDeRisco.map((local) => {
              const location = mapEnderecoToAddress(local);

              return (
                <>
                  <span>{formatRiskLocation(location)}</span>
                  <br />
                </>
              );
            })}
        </>
      ))}
    </Container>
  );
};

/**
 Geologo (Deslizamento de encosta)
 Pode ser uma tabela simples com as seguintes colunas: 
 Titulo
 Endereços
 Cobrades
 */

export default ListPlans;
