import React, { useCallback, useMemo, useState } from "react";

import { BsFillCaretRightFill } from "react-icons/bs";
import { GrSearch } from "react-icons/gr";
import { useSystem } from "context/System/systemContext";

import peopleIcon from "assets/images/pessoas.png";
import vehiclesIcon from "assets/images/veiculos.png";
import materialsIcon from "assets/images/materiais.png";
import foodIcon from "assets/images/alimentacao.png";
import homeIcon from "assets/images/abrigo.png";
import selectedHomeIcon from "assets/images/abrigoSelecionado.png";

import { Container } from "./styles";
import Input from "shared/components/Input/Input";
import { Button } from "react-bootstrap";
import { usePlanData } from "context/PlanData/planDataContext";
import { ResourceType } from "types/Plan";
import CreateResourceModal from "shared/components/CreateResourceModal/CreateResourceModal";
import AddToGroupModal from "shared/components/AddToGroupModal/AddToGroupModal";

const RightSideMenu: React.FC = () => {
  const { planData } = usePlanData();

  const { isOpenRightSideMenu, changeRightSideMenuVisibility } = useSystem();

  const [filterText, setFilterText] = useState("");

  const [activeItem, setActiveItem] = useState<ResourceType | null>(null);

  const [showCreateResourceModal, setShowCreateResourceModal] = useState(false);
  const [showAddToGroupModal, setShowAddToGroupModal] = useState(false);

  const openAddToGroupModal = useCallback(() => {
    setShowAddToGroupModal(true);
  }, []);

  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const { name } = e.currentTarget;

      setActiveItem(name as ResourceType);
    },
    [],
  );

  const activeChild = useMemo(() => {
    switch (activeItem) {
      case "pessoa":
        return 1;
      case "veiculo":
        return 2;
      case "material":
        return 3;
      case "alimentacao":
        return 4;
      case "abrigo":
        return 5;
      default:
        return -1;
    }
  }, [activeItem]);

  const handleCreateResource = useCallback(() => {
    setShowCreateResourceModal(true);
  }, []);

  const handleListResource = useCallback(() => {}, []);

  return (
    <>
      <Container activeItemNumber={activeChild} isOpen={isOpenRightSideMenu}>
        <header>
          <button onClick={changeRightSideMenuVisibility}>
            <BsFillCaretRightFill size={18} color="#FFF" />
            {isOpenRightSideMenu && <h6>RECURSOS</h6>}
          </button>
        </header>

        <div className="main">
          <aside>
            <button onClick={openAddToGroupModal}>
              <img src={peopleIcon} alt="PESSOAL" />
              <span>PESSOAL</span>
            </button>

            <button name="veiculo" onClick={handleItemClick}>
              <img src={vehiclesIcon} alt="VEÍCULOS E MAQUINÁRIOS" />
              <span>VEÍCULOS E MAQUINÁRIOS</span>
            </button>

            <button name="material" onClick={handleItemClick}>
              <img src={materialsIcon} alt="MATERIAIS" />
              <span>MATERIAIS</span>
            </button>

            <button name="alimentacao" onClick={handleItemClick}>
              <img src={foodIcon} alt="ALIMENTAÇÃO" />
              <span>ALIMENTAÇÃO</span>
            </button>

            <button name="abrigo" onClick={handleItemClick}>
              <img
                src={activeItem === "abrigo" ? selectedHomeIcon : homeIcon}
                alt="ABRIGO"
              />
              <span>ABRIGO</span>
            </button>
          </aside>

          <div className="rightMenuContent">
            <div className="resourceCrudButtonsRow">
              <Button onClick={handleCreateResource}>Cadastrar</Button>
              <Button onClick={handleListResource}>Listar</Button>
            </div>

            <Input
              containerClass="filterInput"
              placeholder="Filtro"
              borderBottomOnly
              value={filterText}
              rightIcon={<GrSearch />}
              onChange={(e) => {
                setFilterText(e.target.value);
              }}
            />

            {planData.resources.map((resource, index) => {
              if (resource.type === activeItem) {
                return (
                  <div key={index} className="resourceItemList">
                    <h6>{resource.value1}</h6>
                    <h6>
                      {resource.responsibles.length
                        ? `${resource.responsibles[0].name} ${resource.responsibles[0].phone}`
                        : ""}
                    </h6>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </Container>
      {!!activeItem && (
        <CreateResourceModal
          show={showCreateResourceModal}
          setShow={setShowCreateResourceModal}
          type={activeItem}
        />
      )}
      <AddToGroupModal
        show={showAddToGroupModal}
        setShow={setShowAddToGroupModal}
      />
    </>
  );
};

export default RightSideMenu;
