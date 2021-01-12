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
        response.data.splice(0, 153);
        setPlans(response.data);
      })
      .catch(console.log);
  }, []);

  return (
    <Container>
      {plans.map((plan) => (
        <>
          <h5>{plan.titulo}</h5>
          {plan.locaisDeRisco.map((local) => {
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
