import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import Car from './Car';
import { getLogger } from '../core';
import { CarContext } from './CarProvider';

const log = getLogger('CarList');

const CarList: React.FC<RouteComponentProps> = ({ history }) => {
  const { cars, fetching, fetchingError } = useContext(CarContext);
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle class="ion-text-center">Cars App</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching cars" />
        {cars && (
          <IonList>
            {cars.map(({ id, model, price, available}) =>
              <Car key={id} id={id} model={model} price={price} available={available}
                   onEdit={id => history.push(`/car/${id}`)} />)}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch cars'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/car')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default CarList;
