import { usePlanData } from "context/PlanData/planDataContext";
import produce from "immer";
import React, { useCallback, useState } from "react";
import { Button, Form } from "react-bootstrap";

import AttributeListing from "shared/components/AttributeListing/AttributeListing";
import Input from "shared/components/Input/Input";
import { Person, UserAddress, UserDocument } from "types/Plan";

import { Modal, Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
  setShowAddToGroupModal: (...data: any) => any;
}

const emptyPerson: Person = {
  id: "",
  status: 0,
  name: "",
  role: "",
  phones: [],
  emails: [],
  birthDate: "",
  gender: "male",
  addresses: [],
  documents: [],
};

const emptyAddress: UserAddress = {
  id: "",
  cep: "",
  city: "",
  state: "",
  street: "",
  neighbor: "",
  number: "",
  complement: "",
};

const emptyDocument: UserDocument = {
  type: "",
  number: "",
  emitter: "",
};

const AddUserModal: React.FC<Props> = ({
  show,
  setShow,
  setShowAddToGroupModal,
}) => {
  const { addNewUser, addUserToWorkGroup } = usePlanData();

  const [user, setUser] = useState<Person>({
    id: "",
    status: 0,
    name: "",
    role: "",
    phones: [],
    emails: [],
    birthDate: "",
    gender: "male",
    addresses: [],
    documents: [],
  });

  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");
  const [obs, setObs] = useState("");
  const [phoneType, setPhoneType] = useState<"celular" | "fixo">("celular");

  const [permission, setPermission] = useState<
    "editor" | "visualizar" | "nenhuma"
  >("editor");

  const [currentAddress, setCurrentAddress] = useState<UserAddress>({
    id: "123",
    cep: "",
    city: "",
    state: "",
    street: "",
    neighbor: "",
    number: "",
    complement: "",
  });
  const [currentDocument, setCurrentDocument] = useState<UserDocument>({
    type: "",
    number: "",
    emitter: "",
  });
  const [phonePriority, setPhonePriority] = useState(0);

  const handleEditUser = useCallback(
    (e) => {
      const { name, value } = e.target;

      const updatedUser = produce(user, (draft) => {
        const attr: keyof Person = name;

        if (attr === "emails") {
          draft.emails.push(currentEmail);
          setCurrentEmail("");
        } //
        else if (attr === "phones") {
          const alreadyHasMainPhone = draft.phones.some(
            (phoneItem) => phoneItem.priority === 1,
          );

          if (phonePriority === 1 && alreadyHasMainPhone) {
            draft.phones.forEach((phoneItem) => {
              phoneItem.priority = 0;
            });
          }

          draft.phones.push({
            phone: currentPhone,
            obs,
            type: phoneType,
            priority: phonePriority,
          });
          setCurrentPhone("");
          setObs("");
          setPhonePriority(0);
        } //
        else if (attr === "addresses") {
          draft.addresses.push(currentAddress);
          setCurrentAddress({ ...emptyAddress });
        } //
        else if (attr === "documents") {
          draft.documents.push({ ...currentDocument });
          setCurrentDocument({ ...emptyDocument });
        } //
        else {
          Object.assign(draft, { [name]: value });
        }
      });

      setUser(updatedUser);
    },
    [
      user,
      currentPhone,
      obs,
      phoneType,
      currentEmail,
      currentAddress,
      currentDocument,
      phonePriority,
    ],
  );

  const handleEditCurrentAddress = useCallback(
    (e) => {
      const { name, value } = e.target;

      const updatedAddress = produce(currentAddress, (draft) => {
        Object.assign(draft, { [name]: value });
      });

      setCurrentAddress(updatedAddress);
    },
    [currentAddress],
  );

  const handleEditCurrentDocument = useCallback(
    (e) => {
      const { name, value } = e.target;

      const updatedDocument = produce(currentDocument, (draft) => {
        draft[name as keyof UserDocument] = value;
      });

      setCurrentDocument(updatedDocument);
    },
    [currentDocument],
  );

  const handleRemoveItemOfList = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, index: number) => {
      const { name } = e.currentTarget;

      const updatedUser = produce(user, (draft) => {
        const attr = name as keyof Person;

        if (attr === "emails") {
          draft.emails.splice(index, 1);
        } //
        else if (attr === "phones") {
          draft.phones.splice(index, 1);
        } //
        else if (attr === "documents") {
          draft.documents.splice(index, 1);
        } //
        else if (attr === "addresses") {
          draft.addresses.splice(index, 1);
        }
      });

      setUser(updatedUser);
    },
    [user],
  );

  const handleAddUser = useCallback(() => {
    addNewUser(user);
    addUserToWorkGroup({ ...user, permission });
    setShow(false);
    setShowAddToGroupModal(false);
  }, [
    setShow,
    addNewUser,
    user,
    addUserToWorkGroup,
    permission,
    setShowAddToGroupModal,
  ]);

  const handleCleanOnExit = useCallback(() => {
    const clearedUser = produce(user, (draft) => {
      Object.assign(draft, emptyPerson);
    });

    setCurrentEmail("");
    setCurrentPhone("");
    setObs("");
    setCurrentAddress({ ...emptyAddress });
    setCurrentDocument({ ...emptyDocument });
    setPhonePriority(0);

    setUser(clearedUser);
  }, [user]);

  return (
    <Modal
      backdropClassName="addUserModalWrapper"
      show={show}
      centered
      onHide={() => setShow(false)}
      onExit={handleCleanOnExit}
    >
      <Container>
        <div className="borderedContainer userDataContainer">
          <label>Dados</label>
          <Input
            name="name"
            size="small"
            borderBottomOnly
            labelOnInput="Nome: "
            value={user.name}
            onChange={handleEditUser}
          />

          <div className="inputRowGroup">
            <Input
              name="role"
              size="small"
              borderBottomOnly
              labelOnInput="Função: "
              value={user.role}
              onChange={handleEditUser}
            />
            <Input
              name="permissions"
              as="select"
              size="small"
              borderBottomOnly
              labelOnInput="Permissão: "
              value={permission}
              onChange={(e) => setPermission(e.target.value as any)}
            >
              <option value="editor">Editor</option>
              <option value="visualizar">Visualizar</option>
              <option value="nenhuma">Nenhuma</option>
            </Input>
          </div>

          <div>
            <section>
              <h5>Telefone(s)</h5>

              <div className="phoneTypeRadio">
                <Form.Check type="radio">
                  <Form.Check.Label>Celular</Form.Check.Label>
                  <Form.Check.Input
                    onChange={() => setPhoneType("celular")}
                    name="phoneTypeRadio"
                    type="radio"
                  />
                </Form.Check>

                <Form.Check type="radio">
                  <Form.Check.Label>Fixo</Form.Check.Label>
                  <Form.Check.Input
                    onChange={() => setPhoneType("fixo")}
                    name="phoneTypeRadio"
                    type="radio"
                  />
                </Form.Check>
              </div>
              <Input
                size="small"
                borderBottomOnly
                placeholder="(xx) xxxxx-xxxx"
                value={currentPhone}
                onChange={(e) => setCurrentPhone(e.target.value)}
                masked
                maskProps={{ mask: "(99) 99999-9999" }}
              />

              <Input
                size="small"
                borderBottomOnly
                placeholder="Observação"
                value={obs}
                onChange={(e) => setObs(e.target.value)}
              />

              <Form.Check
                type="checkbox"
                checked={phonePriority === 1}
                label="Principal"
                onChange={() => {
                  setPhonePriority((oldValue) => {
                    if (oldValue === 1) {
                      return 0;
                    }
                    return 1;
                  });
                }}
              />

              <Button
                onClick={handleEditUser}
                name="phones"
                size="sm"
                className="darkBlueButton"
              >
                Incluir
              </Button>

              <AttributeListing
                title="Telefones cadastrados"
                items={user.phones}
                name="phones"
                onRemove={handleRemoveItemOfList}
                renderText={(phoneItem: any) => phoneItem.phone}
                size="small"
              />
            </section>

            <section>
              <h5>E-mail</h5>
              <Input
                size="small"
                borderBottomOnly
                placeholder="Digite e-mail para contato"
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
              />
              <Button
                onClick={handleEditUser}
                name="emails"
                size="sm"
                className="darkBlueButton"
              >
                Incluir
              </Button>

              <AttributeListing
                title="E-mails cadastrados"
                items={user.emails}
                name="emails"
                onRemove={handleRemoveItemOfList}
                renderText={(email: string) => email}
                size="small"
              />
            </section>
          </div>
        </div>

        <Button className="darkBlueButton" onClick={handleAddUser}>
          Cadastrar
        </Button>

        <div className="extraInfoContainer">
          <h5>INFORMAÇÕES COMPLEMENTARES</h5>

          <div className="borderedContainer">
            <label>Dados Pessoais</label>

            <div className="separatedInputRow">
              <Input
                size="small"
                borderBottomOnly
                placeholder="Data de nascimento"
                name="birthDate"
                value={user.birthDate}
                onChange={handleEditUser}
                masked
                maskProps={{ mask: "99/99/9999" }}
              />
              <Input
                size="small"
                as="select"
                borderBottomOnly
                name="gender"
                value={user.gender}
                onChange={handleEditUser}
              >
                <option>Masculino</option>
                <option>Feminino</option>
              </Input>
            </div>
          </div>

          <div className="borderedContainer">
            <label>Endereço</label>

            <div className="separatedInputRow">
              <Input
                size="small"
                borderBottomOnly
                placeholder="CEP"
                name="cep"
                value={currentAddress.cep}
                onChange={handleEditCurrentAddress}
                masked
                maskProps={{ mask: "99999-999" }}
              />

              <Input
                size="small"
                borderBottomOnly
                placeholder="Cidade"
                name="city"
                value={currentAddress.city}
                onChange={handleEditCurrentAddress}
              />

              <Input
                size="small"
                borderBottomOnly
                placeholder="Estado"
                name="state"
                value={currentAddress.state}
                onChange={handleEditCurrentAddress}
              />
            </div>

            <div className="separatedInputRow">
              <Input
                size="small"
                borderBottomOnly
                placeholder="Logradouro"
                name="street"
                value={currentAddress.street}
                onChange={handleEditCurrentAddress}
              />
            </div>

            <div className="separatedInputRow">
              <Input
                size="small"
                borderBottomOnly
                placeholder="Bairro"
                name="neighbor"
                value={currentAddress.neighbor}
                onChange={handleEditCurrentAddress}
              />
              <Input
                size="small"
                borderBottomOnly
                placeholder="Nº"
                name="number"
                value={currentAddress.number}
                onChange={handleEditCurrentAddress}
              />
              <Input
                size="small"
                borderBottomOnly
                placeholder="Complemento"
                name="complement"
                value={currentAddress.complement}
                onChange={handleEditCurrentAddress}
              />
              <Button
                size="sm"
                className="darkBlueButton"
                name="addresses"
                onClick={handleEditUser}
              >
                Incluir
              </Button>
            </div>

            <AttributeListing
              title="Endereços cadastrados"
              items={user.addresses}
              name="addresses"
              onRemove={handleRemoveItemOfList}
              renderText={(addressItem: UserAddress) => {
                return `${addressItem.street}, ${addressItem.number}, ${addressItem.city}, ${addressItem.state}.`;
              }}
              size="small"
            />
          </div>

          <div className="borderedContainer documentsContainer">
            <label>Documentos</label>

            <div className="separatedInputRow">
              <Input
                size="small"
                borderBottomOnly
                placeholder="Tipo"
                name="type"
                value={currentDocument.type}
                onChange={handleEditCurrentDocument}
              />
              <Input
                size="small"
                borderBottomOnly
                placeholder="Nº"
                name="number"
                value={currentDocument.number}
                onChange={handleEditCurrentDocument}
              />
              <Input
                size="small"
                borderBottomOnly
                placeholder="Emissor"
                name="emitter"
                value={currentDocument.emitter}
                onChange={handleEditCurrentDocument}
              />
            </div>

            <Button
              size="sm"
              className="darkBlueButton"
              name="documents"
              onClick={handleEditUser}
            >
              Incluir
            </Button>

            <AttributeListing
              title="Documentos cadastrados"
              items={user.documents}
              name="documents"
              onRemove={handleRemoveItemOfList}
              renderText={(documentItem: UserDocument) => {
                return `${documentItem.type} ${documentItem.number}`;
              }}
              size="small"
            />
          </div>

          <Button onClick={handleAddUser} className="darkBlueButton">
            Cadastrar
          </Button>
        </div>
      </Container>
    </Modal>
  );
};

export default AddUserModal;
