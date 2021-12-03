import { IonButton, IonButtons, IonCheckbox, IonContent, IonDatetime, IonHeader, IonInput, IonItem, IonItemDivider, IonLabel, IonLoading, IonPage, IonSelect, IonSelectOption, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { CarContext } from './CarProvider';
import { getLogger } from '../core';
import { CarProps } from './CarProps';
import moment from 'moment';

const log = getLogger('CarEdit');


interface CarEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const CarEdit: React.FC<CarEditProps> = ({history, match}) => {
  const {cars, saving, savingError, saveCar} = useContext(CarContext);
  const [model, setModel] = useState('');
  const [price, setPrice] = useState(0);
  const [available, setAvailable] = useState(false);
  const [car, setCar] = useState<CarProps>();
  useEffect(() => {
      log('useEffect');
      const routeId = match.params.id || '';
      const car = cars?.find(it => it._id === routeId);
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

// const CarEdit: React.FC<CarEditProps> = ({history, match}) => {
//     const {cars, saving, savingError, saveCar } = useContext(CarContext);
//     const [model, setModel] = useState('');
//     const [genre, setGenre] = useState('');
//     const [startedReading, setstartedReading] = useState('');
//     const [finishedReading, setfinishedReading] = useState(false);
//     const [item, setCar] = useState<CarProps>();

//     useEffect(() => {
//         log('useEffect');
//         const routeId = match.params.id || '';
//         const item = cars?.find(it => it._id === routeId);
//         setCar(item);
//         if (item) {
//             setModel(item.title);
//             setGenre(item.genre);
//             setstartedReading(item.startedReading);
//             setfinishedReading(item.finishedReading);
//         }
//     }, [match.params.id, cars]);

//     const handleSave = () => {
//         log('entered handleSave');
//         const editedCar = item ? {...item, title: model, genre, startedReading, finishedReading } : { title: model, genre, startedReading, finishedReading };
//         console.log(editedCar);
//         saveCar && saveCar(editedCar).then(() => {history.goBack()});
//     };

//      return (
//      <IonPage>
//         <IonHeader>
//             <IonToolbar>
//                 <IonTitle>Edit car</IonTitle>
//                 <IonButtons slot="end">
//                     <IonButton onClick={handleSave}>Save</IonButton>
//                 </IonButtons>
//             </IonToolbar>
//         </IonHeader>
//         <IonContent>
//             <IonCar>
//                 <IonLabel>ID:  </IonLabel>
//                 <IonInput hidden={item === undefined}  placeholder="id" value={match.params.id} readonly/>
//             </IonCar>
//             <IonCar>
//                 <IonLabel>Title:  </IonLabel>
//                 <IonInput placeholder="title" value={model} onIonChange={e => setModel(e.detail.value || '')}/>
//             </IonCar>
//             <IonCar>
//                 <IonLabel>Genre:  </IonLabel>
//                 <IonSelect value={genre} onIonChange={e => setGenre(e.detail.value)}>
//                     <IonSelectOption value="war">war</IonSelectOption>
//                     <IonSelectOption value="crime">crime</IonSelectOption>
//                     <IonSelectOption value="drama">drama</IonSelectOption>
//                     <IonSelectOption value="romance">romance</IonSelectOption>
//                     <IonSelectOption value="thriller">thriller</IonSelectOption>
//                     <IonSelectOption value="comedy">comedy</IonSelectOption>
//                     <IonSelectOption value="fantasy">fantasy</IonSelectOption>
//                 </IonSelect>
                
//             </IonCar>
//             <IonCar>
//                 <IonLabel>Started Reading: </IonLabel>
//                 <IonDatetime displayFormat="DD MMM YYYY" pickerFormat="DD MMM YYYY" value={startedReading} onBlur={e => setstartedReading((moment(e.target.value).format('DD MMM YYYY')) || moment(new Date()).format('DD MMM YYYY'))}/>
//             </IonCar>
//             <IonCar>
//                 <IonLabel>Finished Reading: </IonLabel>
//                 <IonToggle checked={finishedReading} onIonChange={e => setfinishedReading(e.detail.checked)}/>
//             </IonCar>
//             <IonLoading isOpen={saving}/>
//             {savingError && (
//                 <div>{savingError?.message || 'Failed to save car'}</div>
//             )}
//         </IonContent>
//      </IonPage>
//     );
// };


export default CarEdit;