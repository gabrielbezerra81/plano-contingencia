import React, { useState } from "react";

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

const RightSideMenu: React.FC = () => {
  const { isOpenRightSideMenu, changeRightSideMenuVisibility } = useSystem();

  const [filterText, setFilterText] = useState("");

  return (
    <Container isOpen={isOpenRightSideMenu}>
      <header>
        <button onClick={changeRightSideMenuVisibility}>
          <BsFillCaretRightFill size={18} color="#FFF" />
          {isOpenRightSideMenu && <h6>RECURSOS</h6>}
        </button>
      </header>

      <main>
        <aside>
          <button>
            <img src={peopleIcon} alt="PESSOAL" />
            <span>PESSOAL</span>
          </button>

          <button>
            <img src={vehiclesIcon} alt="VEÍCULOS E MAQUINÁRIOS" />
            <span>VEÍCULOS E MAQUINÁRIOS</span>
          </button>

          <button>
            <img src={materialsIcon} alt="MATERIAIS" />
            <span>MATERIAIS</span>
          </button>

          <button>
            <img src={foodIcon} alt="ALIMENTAÇÃO" />
            <span>ALIMENTAÇÃO</span>
          </button>

          <button>
            <img src={homeIcon} alt="ABRIGO" />
            <span>ABRIGO</span>
          </button>
        </aside>

        <div className="rightMenuContent">
          <Input
            placeholder="Filtro"
            borderBottomOnly
            value={filterText}
            rightIcon={<GrSearch />}
            onChange={(e) => {
              setFilterText(e.target.value);
            }}
          />
        </div>
      </main>
    </Container>
  );
};

export default RightSideMenu;
