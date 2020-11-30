import { Membro } from "types/ModelsAPI";
import { Member } from "types/Plan";

export default function mapMembroToLocalMember(membro: Membro): Member {
  return {
    name: membro.nome,
    permission: membro.permissao as any,
    personId: membro.pessoaId,
    phone: membro.telefone,
    role: membro.funcao_atribuicao,
    status: membro.aceite ? 1 : 0,
    id: membro.id,
  };
}
