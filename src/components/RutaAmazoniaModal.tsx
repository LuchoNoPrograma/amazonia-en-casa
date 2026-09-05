import { useDialog } from './useDialog';
import { PRODUCTS, COMMUNITIES } from '../data/products';
import { X, MapPin, ArrowRight } from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; onSelectCommunityFilter: (community: string) => void }
export function RutaAmazoniaModal({ isOpen, onClose, onSelectCommunityFilter }: Props) {
  const ref = useDialog(isOpen, onClose);
  if (!isOpen) return null;
  return <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="origin-title" tabIndex={-1} className="dialog-backdrop">
    <div className="info-panel">
      <header className="panel-header"><h2 id="origin-title">Orígenes del catálogo</h2><button id="close-ruta-btn" className="icon-button" onClick={onClose} aria-label="Cerrar orígenes"><X size={22}/></button></header>
      <div className="panel-body"><p className="muted">Explora el catálogo por el lugar de origen indicado en cada producto.</p>
        <div className="origin-list">{COMMUNITIES.slice(1).map(community => {
          const products = PRODUCTS.filter(product => product.originCommunity === community);
          return <button key={community} onClick={() => { onSelectCommunityFilter(community); onClose(); }}>
            <MapPin size={22}/><span><strong>{community.split(',')[0]}</strong><small>{products.length} productos · {products.slice(0, 2).map(p => p.name).join(', ')}</small></span><ArrowRight size={20}/>
          </button>;
        })}</div>
      </div>
    </div>
  </div>;
}
