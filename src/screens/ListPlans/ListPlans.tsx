import api from "api/config";
import { usePlanData } from "context/PlanData/planDataContext";
import React, { useEffect, useState } from "react";

import { Table } from "react-bootstrap";

import formatScenarioAddress from "shared/utils/format/formatScenarioAddress";
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
      })
      .catch(console.log);
  }, []);

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <th>Id</th>
            <th>Título</th>
            <th>Endereços</th>
            <th>Ameaças</th>
          </tr>
        </thead>
        <tbody>
          {plans.map((plan, index) => (
            <tr key={index}>
              <td>{plan.id}</td>
              <td>{plan.titulo}</td>
              <td>
                {plan.cenarios.map((cenario) => {
                  const endereco = plan.locaisDeRisco.find(
                    (endereco) => endereco.id === cenario.enderecoId
                  );

                  if (!endereco) {
                    return null;
                  }

                  const address = mapEnderecoToAddress(endereco);

                  const { fullAddress } = formatScenarioAddress(address);

                  return (
                    <>
                      {fullAddress}
                      <br />
                    </>
                  );
                })}
              </td>

              <td>
                {plan.cenarios.map((cenario) => (
                  <>
                    {cenario.ameaca.cobrade} - {cenario.ameaca.descricao}
                    <br />
                  </>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      {plans.map((plan) => (
        <div>
          {/* {!!plan.locaisDeRisco &&
            plan.locaisDeRisco.map((local) => {
              const location = mapEnderecoToAddress(local);

              return (
                <>
                  <span>{formatRiskLocation(location)}</span>
                  <br />
                </>
              );
            })} */}
        </div>
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
