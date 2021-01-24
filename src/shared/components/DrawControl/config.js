import L from "leaflet";

L.drawLocal.draw.toolbar.actions = {
  title: "Cancelar desenho",
  text: "Cancelar",
};

L.drawLocal.draw.toolbar.finish = {
  title: "Finalizar desenho",
  text: "Finalizar",
};

L.drawLocal.draw.toolbar.undo = {
  title: "Deletar último ponto desenhado",
  text: "Deletar último ponto",
};

L.drawLocal.draw.toolbar.buttons = {
  polyline: "Desenhar linhas",
  polygon: "Desenhar polígono",
  rectangle: "Desenhar retângulo",
  circle: "Desenhar círculo",
  circlemarker: "Desenhar marcador",
};

L.drawLocal.draw.handlers.circle = {
  tooltip: {
    start: "Clique e arraste para desenhar o círculo.",
  },
  radius: "Raio",
};

L.drawLocal.draw.handlers.circlemarker = {
  tooltip: {
    start: "Clique no mapa para colocar o marcador.",
  },
};

L.drawLocal.draw.handlers.polygon = {
  tooltip: {
    start: "Clique para começar a desenhar.",
    cont: "Clique para continuar desenhando.",
    end: "Clique no primeiro ponto para fechar o polígono.",
  },
};

L.drawLocal.draw.handlers.polyline = {
  error: "", //<strong>Error:</strong> shape edges cannot cross!
  tooltip: {
    start: "Clique para começar a desenhar a linha.",
    cont: "Clique para continuar desenhando a linha.",
    end: "Clique no último ponto para finalizar.",
  },
};

L.drawLocal.draw.handlers.rectangle = {
  tooltip: {
    start: "Clique e arraste para desenhar o retângulo.",
  },
};

L.drawLocal.draw.handlers.simpleshape = {
  tooltip: {
    end: "Solte o mouse para terminar de desenhar.",
  },
};

L.drawLocal.edit = {
  toolbar: {
    actions: {
      save: {
        title: "Salvar alterações",
        text: "Salvar",
      },
      cancel: {
        title: "Cancelar edição",
        text: "Cancelar",
      },
      clearAll: {
        title: "Apagar todos os desenhos",
        text: "Apagar todos",
      },
    },
    buttons: {
      edit: "Editar desenhos",
      editDisabled: "Sem desenhos para editar",
      remove: "Deletar desenhos",
      removeDisabled: "Sem desenhos para deletar",
    },
  },
  handlers: {
    edit: {
      tooltip: {
        text: "Arraste os pontos para editar os desenhos.",
        subtext: "Clique em cancelar para desfazer as alterações.",
      },
    },
    remove: {
      tooltip: {
        text: "Clique em um desenho para removê-lo.",
      },
    },
  },
};
