import { IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle, IonIcon, IonLabel } from "@ionic/react";
import { checkmarkCircleOutline, closeCircleOutline } from "ionicons/icons";
import React from "react";
import {CarProps} from "./CarProps";

interface CarPropsExtended extends CarProps {
    onEdit: (_id? : string) => void;
}

// const Car: React.FC<CarPropsExtended> = ({_id, title, genre, startedReading, finishedReading, onEdit}) => {
//     return (
//         <IonCar onClick={ () => onEdit(_id) }>
//             <IonLabel>{_id}</IonLabel>
//             <IonLabel>{title}</IonLabel>
//             <IonLabel>{genre}</IonLabel>
//             <IonLabel>{startedReading}</IonLabel>
//             <IonLabel>{finishedReading.toString()}</IonLabel>
//         </IonCar>
//     )
// };

const Car: React.FC<CarPropsExtended> = ({ _id, model, price, available, onEdit }) => {
  return (
      <>
      <IonCard onClick={() => onEdit(_id)}>
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
  );
};


export default Car;