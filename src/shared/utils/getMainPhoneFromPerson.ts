import { Person } from "types/Plan";

export default function getMainPhoneFromPerson(person: Person) {
  const mainPhone = person.phones.find((phoneItem) => phoneItem.priority === 1);

  if (mainPhone) {
    return mainPhone.phone;
  } //
  else if (person.phones.length > 0) {
    return person.phones[0].phone;
  }
  return "";
}
