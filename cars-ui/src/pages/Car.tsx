import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { CarProps } from './CarProps';

interface ItemPropsExt extends CarProps {
  onEdit: (id?: string) => void;
}

const Car: React.FC<ItemPropsExt> = ({ id, company, model, dateAdded, isNew }) => {
  return (
    <IonItem>
        <IonLabel>{company} {model} - was added on {dateAdded} and it is {isNew ? "" : "not"} new</IonLabel>
    </IonItem>
  );
};

export default Car;
