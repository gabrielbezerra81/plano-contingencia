import { usePlanData } from "context/PlanData/planDataContext";
import produce from "immer";
import React, { useCallback, useState, useMemo } from "react";
import { Button, Form } from "react-bootstrap";

import AttributeListing from "shared/components/AttributeListing/AttributeListing";
import Input from "shared/components/Input/Input";
import formatUserAddress from "shared/utils/format/formatUserAddress";
import { Person, Address, UserDocument } from "types/Plan";
import ModalCloseButton from "../ModalCloseButton/ModalCloseButton";

import { Modal, Container } from "./styles";

interface Props {
  show: boolean;
  setShow: (...data: any) => any;
  setShowAddToGroupModal?: (...data: any) => any;
  addPersonOnly?: boolean;
}

const emptyPerson: Person = {
  id: "",
  status: 0,
  name: "",
  surname: "",
  role: "",
  phones: [],
  emails: [],
  birthDate: "",
  gender: "male",
  addresses: [],
  documents: [],
};

const emptyAddress: Address = {
  id: "",
  cep: "",
  city: "",
  state: "",
  street: "",
  neighbor: "",
  number: "",
  complement: "",
  refPoint: "",
  identification: "",
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
  addPersonOnly = false,
}) => {
  const { addNewUser, addUserToWorkGroup } = usePlanData();

  const [user, setUser] = useState<Person>({
    id: "",
    status: 0,
    name: "",
    surname: "",
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
  >("nenhuma");

  const [currentAddress, setCurrentAddress] = useState<Address>({
    id: "123",
    cep: "",
    city: "",
    state: "",
    street: "",
    neighbor: "",
    number: "",
    complement: "",
    refPoint: "",
  });
  const [currentDocument, setCurrentDocument] = useState<UserDocument>({
    type: "",
    number: "",
    emitter: "",
  });
  const [phonePriority, setPhonePriority] = useState(0);

  const [validatedAddress, setValidatedAddress] = useState(false);
  const [validatedPhone, setValidatedPhone] = useState(false);
  const [validatedEmail, setValidatedEmail] = useState(false);

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
            (phoneItem) => phoneItem.priority === 1
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
    ]
  );

  const handleEditCurrentAddress = useCallback(
    (e) => {
      const { name, value } = e.target;

      const updatedAddress = produce(currentAddress, (draft) => {
        Object.assign(draft, { [name]: value });
      });

      setCurrentAddress(updatedAddress);
    },
    [currentAddress]
  );

  const handleEditCurrentDocument = useCallback(
    (e) => {
      const { name, value } = e.target;

      const updatedDocument = produce(currentDocument, (draft) => {
        draft[name as keyof UserDocument] = value;
      });

      setCurrentDocument(updatedDocument);
    },
    [currentDocument]
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
    [user]
  );

  const handleAddUser = useCallback(async () => {
    const person = await addNewUser(user);

    if (person) {
      if (!addPersonOnly) {
        await addUserToWorkGroup({ ...person, permission });
      }
      setShow(false);
      if (setShowAddToGroupModal) {
        setShowAddToGroupModal(false);
      }
    } //
    else {
      alert(
        "Erro ao cadastrar pessoa, verifique seus dados e tente novamente!"
      );
    }
  }, [
    setShow,
    addNewUser,
    user,
    addUserToWorkGroup,
    permission,
    setShowAddToGroupModal,
    addPersonOnly,
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

  const onExit = useCallback(() => {
    setShow(false);
    setValidatedAddress(false);
    setValidatedPhone(false);
    setValidatedEmail(false);
  }, [setShow]);

  const handlePriorityChange = useCallback(
    (index: number) => {
      if (user.phones.length === 1 && user.phones[index].priority === 1) {
        return;
      }

      const updatedUser = produce(user, (draft) => {
        const phone = draft.phones[index];

        if (phone.priority === 1) {
          phone.priority = 0;
        } //
        else {
          phone.priority = 1;
          draft.phones.forEach((phoneItem, phoneIndex) => {
            if (phoneIndex !== index) {
              phoneItem.priority = 0;
            }
          });
        }
      });

      setUser(updatedUser);
    },
    [user]
  );

  const handleSubmitForm = useCallback(
    (event, setValidated) => {
      const form = event.currentTarget;
      const { name } = form;

      event.preventDefault();

      if (form.checkValidity() === false) {
        event.stopPropagation();
      } //
      else {
        setValidated(false);
        handleEditUser({
          target: {
            name,
            value: "",
          },
        });

        return;
      }

      setValidated(true);
    },
    [handleEditUser]
  );

  const hasAnyMainNumber = useMemo(() => {
    return user.phones.some((phone) => phone.priority === 1);
  }, [user]);

  return (
    <Modal
      backdropClassName="addUserModalWrapper"
      show={show}
      centered
      onHide={onExit}
      onExit={handleCleanOnExit}
    >
      <ModalCloseButton setShow={onExit} />
      <Container>
        <div className="borderedContainer userDataContainer">
          <label>Dados</label>
          <div className="nameInputsRow">
            <Input
              name="name"
              size="small"
              borderBottomOnly
              labelOnInput="Nome: "
              value={user.name}
              onChange={handleEditUser}
            />

            <Input
              name="surname"
              size="small"
              borderBottomOnly
              labelOnInput="Sobrenome: "
              value={user.surname}
              onChange={handleEditUser}
            />
          </div>

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

              <Form
                name="phones"
                noValidate
                validated={validatedPhone}
                onSubmit={(e) => handleSubmitForm(e, setValidatedPhone)}
              >
                <div className="phoneTypeRadio">
                  <Form.Check type="radio">
                    <Form.Check.Label>Celular</Form.Check.Label>
                    <Form.Check.Input
                      onChange={() => setPhoneType("celular")}
                      name="phoneTypeRadio"
                      type="radio"
                      checked={phoneType === "celular"}
                    />
                  </Form.Check>

                  <Form.Check type="radio">
                    <Form.Check.Label>Fixo</Form.Check.Label>
                    <Form.Check.Input
                      onChange={() => setPhoneType("fixo")}
                      name="phoneTypeRadio"
                      type="radio"
                      checked={phoneType === "fixo"}
                    />
                  </Form.Check>
                </div>
                <Input
                  containerClass="phoneInput"
                  size="small"
                  borderBottomOnly
                  placeholder="(xx) xxxxx-xxxx"
                  value={currentPhone}
                  onChange={(e) => setCurrentPhone(e.target.value)}
                  masked
                  maskProps={{ mask: "(99) 99999-9999" }}
                  required
                  isValidated={validatedPhone}
                />

                <Input
                  size="small"
                  borderBottomOnly
                  placeholder="Observação"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                />

                {!hasAnyMainNumber && !user.phones.length && (
                  <Form.Check
                    required
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
                )}

                <Button type="submit" size="sm" className="darkBlueButton">
                  Incluir
                </Button>
              </Form>
              <AttributeListing
                title="Telefones cadastrados"
                items={user.phones}
                name="phones"
                onRemove={handleRemoveItemOfList}
                renderText={(phoneItem: any) => phoneItem.phone}
                size="small"
                children={(index: number) => (
                  <Form.Check
                    type="checkbox"
                    style={{ marginLeft: 12 }}
                    checked={user.phones[index].priority === 1}
                    label="Principal"
                    onChange={() => handlePriorityChange(index)}
                  />
                )}
              />
            </section>

            <section>
              <h5>E-mail</h5>
              <Form
                name="emails"
                noValidate
                validated={validatedEmail}
                onSubmit={(e) => handleSubmitForm(e, setValidatedEmail)}
              >
                <Input
                  size="small"
                  borderBottomOnly
                  placeholder="Digite e-mail para contato"
                  value={currentEmail}
                  onChange={(e) => setCurrentEmail(e.target.value)}
                  required
                  isValidated={validatedEmail}
                />
                <Button type="submit" size="sm" className="darkBlueButton">
                  Incluir
                </Button>
              </Form>

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

            <Form
              noValidate
              validated={validatedAddress}
              onSubmit={(e) => handleSubmitForm(e, setValidatedAddress)}
              name="addresses"
            >
              <div className="separatedInputRow">
                <Input
                  size="small"
                  borderBottomOnly
                  placeholder="CEP"
                  name="cep"
                  value={currentAddress.cep}
                  onChange={handleEditCurrentAddress}
                  masked
                  maskProps={{
                    mask: "99999-999 ",
                  }}
                  required
                  isValidated={validatedAddress}
                />

                <Input
                  size="small"
                  borderBottomOnly
                  placeholder="Cidade"
                  name="city"
                  value={currentAddress.city}
                  onChange={handleEditCurrentAddress}
                  required
                  isValidated={validatedAddress}
                />

                <Input
                  size="small"
                  borderBottomOnly
                  placeholder="Estado"
                  name="state"
                  value={currentAddress.state}
                  onChange={handleEditCurrentAddress}
                  required
                  isValidated={validatedAddress}
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
                  required
                  isValidated={validatedAddress}
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
                  type="submit"
                >
                  Incluir
                </Button>
              </div>
            </Form>
            <AttributeListing
              title="Endereços cadastrados"
              items={user.addresses}
              name="addresses"
              onRemove={handleRemoveItemOfList}
              renderText={(addressItem: Address) =>
                formatUserAddress(addressItem)
              }
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
