import React from 'react';
import {
    IonCard, IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonItem,
    IonLabel,
    IonTitle
} from '@ionic/react';
// import {logoBitcoin} from 'ionicons/icons';
import {checkmarkCircleOutline} from 'ionicons/icons';
import {closeCircleOutline} from 'ionicons/icons';
import { CarProps } from './CarProps';

import '../theme/variables.css';

interface CarPropsExt extends CarProps {
  onEdit: (id?: string) => void;
}

const Car: React.FC<CarPropsExt> = ({ id, model, price, available, onEdit }) => {
  return (
      <>
      <IonCard onClick={() => onEdit(id)}>
          <IonCardHeader>
              <IonCardTitle>{model}</IonCardTitle>
              <IonCardSubtitle>Price: ${price}</IonCardSubtitle>
              <IonCardSubtitle>
                  Available: {available ?
                  <IonIcon icon={checkmarkCircleOutline}/>
                  :
                  <IonIcon icon={closeCircleOutline}/> }
              </IonCardSubtitle>
          </IonCardHeader>
      </IonCard>
      </>
    // <IonCard onClick={() => onEdit(id)}>
    //   <IonLabel>Model: {model}, Price: ${price}, Available: {available ? "true" : "false"}</IonLabel>
    // </IonCard>
  );
};

export default Car;
