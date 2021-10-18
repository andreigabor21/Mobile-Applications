import React, {useContext} from 'react';
import {RouteComponentProps} from 'react-router';
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
import {add} from 'ionicons/icons';
import Car from './Car';
import {getLogger} from '../core';
import {CarContext} from "./CarProvider";

const log = getLogger('ItemList');

const CarList: React.FC<RouteComponentProps> = ({history}) => {
    const {cars, fetching, fetchingError} = useContext(CarContext);
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color={"medium"}>
                    <IonTitle size={"large"} className={"ion-text-center"}>Cars App</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items"/>
                {cars && (
                    <IonList>
                        {cars.map(({id, company, model, dateAdded, isNew}) =>
                            <Car key={id} company={company} model={model} dateAdded={dateAdded} isNew={isNew}
                                 onEdit={id => history.push(`/meal/${id}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/car')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default CarList;
