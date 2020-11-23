import React, { useState } from "react";
import { Form } from "react-bootstrap";

import { Container } from "./styles";

const StepOne = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Container>
      <Form.Control
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        placeholder="Título"
      />
      <Form.Control
        placeholder="Descrição"
        as="textarea"
        value={description}
        onChange={(e) => {
          setDescription(e.target.value);
        }}
        rows={8}
      />
    </Container>
  );
};

export default StepOne;
