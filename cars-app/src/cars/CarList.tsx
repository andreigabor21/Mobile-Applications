import { IonChip, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonListHeader, IonLoading, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonToast, IonToolbar } from "@ionic/react";
import React, { useContext, useEffect, useState } from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { CarContext } from "./CarProvider";
import Car from "./Car";
import {add} from 'ionicons/icons';
import { AuthContext } from "../auth";
import { CarProps } from "./CarProps";
import { getLogger } from '../core';
import {Network} from '@capacitor/core';

const log = getLogger('CarList');

const offset = 10;

const CarList : React.FC<RouteComponentProps> = ({history}) => {
    const { logout } = useContext(AuthContext)
    const {cars, fetching, fetchingError} = useContext(CarContext);
    const [disableInfiniteScroll, setDisabledInfiniteScroll] = useState<boolean>(false);
    const [visibleCars, setVisibleCars] = useState<CarProps[] | undefined>([]);
    const [page, setPage] = useState(offset)
    const [filter, setFilter] = useState<boolean | undefined>(undefined);
    const [search, setSearch] = useState<string>("");
    const [status, setStatus] = useState<boolean>(true);

    const {savedOffline, setSavedOffline} = useContext(CarContext);

    Network.getStatus().then(status => setStatus(status.connected));

    Network.addListener('networkStatusChange', (status) => {
        setStatus(status.connected);
    })

    const toBeAvailable = ["Yes", "No"];

    useEffect(() => {
        if (cars?.length && cars?.length > 0) {
            setPage(offset);
            fetchData();
            console.log(cars);
        }
    }, [cars]);

    useEffect(() => {
        // if (cars && filter) {
          if (cars) {
            setVisibleCars(cars.filter(each => each.available === filter));
        }
    }, [filter]);

    useEffect(() => {
        if (search === "") {
            setVisibleCars(cars);
        }
        if (cars && search !== "") {
            setVisibleCars(cars.filter(each => each.model.startsWith(search)));
        }
    }, [search])

    function fetchData() {
        setVisibleCars(cars?.slice(0, page + offset));
        setPage(page + offset);
        if (cars && page > cars?.length) {
            setDisabledInfiniteScroll(true);
            setPage(cars.length);
        } else {
            setDisabledInfiniteScroll(false);
        }
    }

    async function searchNext($event: CustomEvent<void>) {
        fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }
    
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonItem>
                        <IonSelect style={{ width: '40%' }} value={filter} placeholder="Available?" onIonChange={(e) => setFilter(e.detail.value)}>
                            {toBeAvailable.map((each) => (
                                <IonSelectOption key={each} value={each === "Yes" ? true : false}>
                                        {each}
                                </IonSelectOption>
                            ))}
                        </IonSelect>
                        <IonSearchbar style={{ width: '50%' }} placeholder="Search by model" value={search} debounce={200} onIonChange={(e) => {
                            setSearch(e.detail.value!);
                        }}>
                        </IonSearchbar>
                        <IonChip>
                        <IonLabel color={status? "success" : "danger"}>{status? "Online" : "Offline"}</IonLabel>
                    </IonChip>
                    </IonItem>
                    
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="This might take a moment..."/>

                {
                    visibleCars &&(
                        
                        <IonList>
                            {Array.from(visibleCars)
                                .filter(each => {
                                    if (filter !== undefined)  
                                        return each.available === filter && each._id !== undefined;
                                    return each._id !== undefined;
                                })
                                .map(({_id, model, price, available}) => 
                                <Car key={_id} _id={_id} model={model} price={price} available={available}
                                 onEdit={_id => history.push(`/api/car/${_id}`)} />)}
                        </IonList>
                    )
                }

                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>

                {
                    fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch cars'}</div>
                    )
                }

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/api/car')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>

                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={handleLogout}>
                        LOGOUT
                    </IonFabButton>
                </IonFab>
                <IonToast
                    isOpen={savedOffline ? true : false}
                    message="Your changes will be visible on server when you get back online!"
                    duration={2000}/>
            </IonContent>
        </IonPage>
    );

    function handleLogout() {
        log("logout");
        logout?.();
    }
};


export default CarList;