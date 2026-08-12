import { Notificacao } from "@/types/notificacao";
import { formatarData } from '@/lib/utils';
import CategoriaNotificacaoStyle from './notificacao/CategoriaNotificacaoStyle';

const NotificacaoCard = ({ notificacao }: { notificacao: Notificacao }) => {
    return (
        <div className="flex items-center gap-4 p-5 bg-white rounded-lg card-shadow">
            <CategoriaNotificacaoStyle categoria={notificacao.categoria} />
            
            <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-dark-grey">
                        {notificacao.titulo}
                    </h4>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                        {formatarData(notificacao.data_envio)}
                    </span>
                </div>
                <p className="text-sm font-medium text-dark-grey leading-relaxed">
                    {notificacao.texto}
                </p>
            </div>
        </div>
    );
};

export default NotificacaoCard;