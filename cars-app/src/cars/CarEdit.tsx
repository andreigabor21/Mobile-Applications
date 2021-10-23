import React, {useContext, useEffect, useState} from 'react';
import {
    IonButton,
    IonButtons, IonCheckbox,
    IonContent,
    IonHeader,
    IonInput, IonItem, IonItemDivider, IonLabel,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import {getLogger} from '../core';
import {CarContext} from './CarProvider';
import {RouteComponentProps} from 'react-router';
import {CarProps} from './CarProps';

const log = getLogger('CarEdit');

interface CarEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const CarEdit: React.FC<CarEditProps> = ({history, match}) => {
    const {cars, saving, savingError, saveCar} = useContext(CarContext);
    const [model, setModel] = useState('');
    const [price, setPrice] = useState(0);
    const [available, setAvailable] = useState(false);
    const [car, setCar] = useState<CarProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const car = cars?.find(it => it.id === routeId);
        setCar(car);
        if (car) {
            setModel(car.model);
            setPrice(car.price);
            setAvailable(car.available);
        }
    }, [match.params.id, cars]);
    const handleSave = () => {
        const editedCar = car ? {...car, model, price, available} : {model, price, available};
        saveCar && saveCar(editedCar).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel slot="start">Model: </IonLabel>
                    <IonInput value={model} onIonChange={e => setModel(e.detail.value || '')}/>
                </IonItem>
                <IonItemDivider/>
                <IonItem>
                    <IonLabel slot="start">Price($): </IonLabel>
                <IonInput value={price} onIonChange={e => setPrice(+(e.detail.value ?? 0))}/>
                </IonItem>
                <IonItemDivider/>
                <IonItem>
                    <IonLabel slot="start">Is Available</IonLabel>
                    <IonCheckbox slot="end" checked={available} onIonChange={e => setAvailable(e.detail.checked)}/>
                </IonItem>
                <IonLoading isOpen={saving}/>
                {savingError && (
                    <div>{savingError.message || 'Failed to save car'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default CarEdit;
