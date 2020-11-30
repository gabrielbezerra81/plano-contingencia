import React, { useCallback, useMemo, useState } from "react";

import { BsFillCaretRightFill } from "react-icons/bs";
import { GrSearch } from "react-icons/gr";
import { useSystem } from "context/System/systemContext";

import peopleIcon from "assets/images/pessoas.png";
import vehiclesIcon from "assets/images/veiculos.png";
import materialsIcon from "assets/images/materiais.png";
import foodIcon from "assets/images/alimentacao.png";
import homeIcon from "assets/images/abrigo.png";

import { Container } from "./styles";
import Input from "shared/components/Input/Input";
import { Button } from "react-bootstrap";

type ItemKey = "pessoal" | "veiculos" | "materiais" | "alimentacao" | "abrigo";

const RightSideMenu: React.FC = () => {
  const { isOpenRightSideMenu, changeRightSideMenuVisibility } = useSystem();

  const [filterText, setFilterText] = useState("");

  const [activeItem, setActiveItem] = useState<ItemKey | null>(null);

  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const { name } = e.currentTarget;

      setActiveItem(name as ItemKey);
    },
    [],
  );

  const activeChild = useMemo(() => {
    switch (activeItem) {
      case "pessoal":
        return 1;
      case "veiculos":
        return 2;
      case "materiais":
        return 3;
      case "alimentacao":
        return 4;
      case "abrigo":
        return 5;
      default:
        return -1;
    }
  }, [activeItem]);

  const handleCreateResource = useCallback(() => {}, []);

  const handleListResource = useCallback(() => {}, []);

  return (
    <Container activeItemNumber={activeChild} isOpen={isOpenRightSideMenu}>
      <header>
        <button onClick={changeRightSideMenuVisibility}>
          <BsFillCaretRightFill size={18} color="#FFF" />
          {isOpenRightSideMenu && <h6>RECURSOS</h6>}
        </button>
      </header>

      <div className="main">
        <aside>
          <button name="pessoal" onClick={handleItemClick}>
            <img src={peopleIcon} alt="PESSOAL" />
            <span>PESSOAL</span>
          </button>

          <button name="veiculos" onClick={handleItemClick}>
            <img src={vehiclesIcon} alt="VEÍCULOS E MAQUINÁRIOS" />
            <span>VEÍCULOS E MAQUINÁRIOS</span>
          </button>

          <button name="materiais" onClick={handleItemClick}>
            <img src={materialsIcon} alt="MATERIAIS" />
            <span>MATERIAIS</span>
          </button>

          <button name="alimentacao" onClick={handleItemClick}>
            <img src={foodIcon} alt="ALIMENTAÇÃO" />
            <span>ALIMENTAÇÃO</span>
          </button>

          <button name="abrigo" onClick={handleItemClick}>
            <img src={homeIcon} alt="ABRIGO" />
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

          <div className="resourceItemList">
            <h6>Secretário do Meio Ambiente</h6>
            <h6>Michael (62) 92000-3498</h6>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default RightSideMenu;
