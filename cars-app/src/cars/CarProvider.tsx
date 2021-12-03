import React, { useCallback, useContext, useEffect, useReducer, useState } from "react";
import { CarProps } from "./CarProps";
import PropTypes from 'prop-types';
import { getCars, createCar, editCar, createWebSocket, syncData } from "./CarApi";
import { getLogger } from '../core';
import { AuthContext } from "../auth";
import { Plugins } from "@capacitor/core";

const log = getLogger('CarProvider');
const { Storage } = Plugins;

export type saveCarFunction = (item : any) => Promise<any>;

export interface CarsState {
    cars? : CarProps[],
    fetching: boolean,
    fetchingError? : Error | null,
    saving: boolean,
    savingError? : Error | null,
    saveCar? : saveCarFunction,
    connectedNetwork?: boolean,
    setSavedOffline?: Function,
    savedOffline?: boolean
};

interface ActionProps {
    type: string,
    payload? : any
};

const initialState: CarsState = {
    fetching: false,
    saving: false
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const reducer: (state: CarsState, action: ActionProps) => CarsState = 
(state, {type, payload}) => {
    switch(type) {
        case FETCH_ITEMS_STARTED:
            return {...state, fetching: true, fetchingError: null};
        case FETCH_ITEMS_SUCCEEDED:
            return {...state, cars: payload.cars, fetching: false};
        case FETCH_ITEMS_FAILED:
            return {...state, cars: payload.cars, fetching: false};
        case SAVE_ITEM_STARTED:
            return {...state, savingError: null, saving: true};
        case SAVE_ITEM_SUCCEEDED:
            const cars = [...(state.cars || [])]
            const item = payload.item;            
            const index = cars.findIndex(it => it._id === item._id);
            if (index === -1) {
                cars.splice(0, 0, item);
            } else {
                cars[index] = item;
            }
            return {...state, cars: cars, saving: false};
        case SAVE_ITEM_FAILED:
            return {...state, savingError: payload.error, saving: false};
        default:
            return state;
    }
};

export const CarContext = React.createContext<CarsState>(initialState);

interface CarProviderProps {
    children: PropTypes.ReactNodeLike
}

const {Network} = Plugins;

export const CarProvider: React.FC<CarProviderProps> = ({children}) => {
    const { token } = useContext(AuthContext);

    const [connectedNetworkStatus, setConnectedNetworkStatus] = useState<boolean>(false);
    Network.getStatus().then(status => setConnectedNetworkStatus(status.connected));
    const [savedOffline, setSavedOffline] = useState<boolean>(false);
    useEffect(networkEffect, [token, setConnectedNetworkStatus]);

    const [state, dispatch] = useReducer(reducer, initialState);
    const { cars, fetching, fetchingError, saving, savingError } = state;
    useEffect(getCarsEffect, [token]);
    useEffect(ws, [token])
    const saveCar = useCallback<saveCarFunction>(saveCarCallback, [token]);
    const value  = {
        cars, 
        fetching, 
        fetchingError, 
        saving, 
        savingError, 
        saveCar: saveCar, 
        connectedNetworkStatus, 
        savedOffline, 
        setSavedOffline 
    };
    return (
        <CarContext.Provider value={value}>
        {children}
        </CarContext.Provider>
    );

    function networkEffect() {
        console.log("network effect");
        let canceled = false;
        Network.addListener('networkStatusChange', async (status) => {
            if (canceled) return;
            const connected = status.connected;
            if (connected) {
                alert("SYNC data");
                await syncData(token);
            }
            setConnectedNetworkStatus(status.connected);
        });
        return () => {
            canceled = true;
        }
    }

    function getCarsEffect() {
        let canceled = false;
        fetchCars();
        return () => {
            canceled = true;
        }

        async function fetchCars() {
            let canceled = false;
            fetchCars();
            return () => {
                canceled = true;
            }

            async function fetchCars() {
                if (!token?.trim()) return;
                if (!navigator?.onLine) {
                    alert("LE IAU OFFLINE DIN STORAGE")
                    let storageKeys = Storage.keys();
                    const cars = await storageKeys.then(async function (storageKeys) {
                        const saved = [];
                        for (let i = 0; i < storageKeys.keys.length; i++) {
                            if (storageKeys.keys[i] !== "token") {
                                const car = await Storage.get({key : storageKeys.keys[i]});
                                if (car.value != null)
                                    var parsedCar = JSON.parse(car.value);
                                saved.push(parsedCar);
                            }
                        }
                        return saved;
                    });
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {cars: cars}});
                } else {
                    try {
                        log('fetchCars started');
                        dispatch({type: FETCH_ITEMS_STARTED});
                        const cars = await getCars(token);
                        log('fetchCars successful');
                        if (!canceled) {
                            dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {cars: cars}})
                        }
                    } catch (error) {
                        let storageKeys = Storage.keys();
                        const cars = await storageKeys.then(async function (storageKeys) {
                            const saved = [];
                            for (let i = 0; i < storageKeys.keys.length; i++) {
                                if (storageKeys.keys[i] !== "token") {
                                    const car = await Storage.get({key : storageKeys.keys[i]});
                                    if (car.value != null)
                                        var parsedCar = JSON.parse(car.value);
                                    saved.push(parsedCar);
                                }
                            }
                            return saved;
                        });
                        dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {cars: cars}});
                    }
                }
                
            }
        }
    }


    async function saveCarCallback(item: CarProps) {
        try {
            if (navigator.onLine) {
                log('saveCar started');
                dispatch({ type: SAVE_ITEM_STARTED });
                const updatedCar = await (item._id ? editCar(token, item) : createCar(token, item))
                log('saveCar successful');
                dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: updatedCar}});
            }
            
            else {
                alert('saveCar offline');
                log('saveCar failed');
                item._id = (item._id == undefined) ? ('_' + Math.random().toString(36).substr(2, 9)) : item._id;
                await Storage.set({
                    key: item._id!,
                    value: JSON.stringify({
                      _id: item._id,
                      model: item.model,
                      price: item.price,
                      available: item.available
                      })
                  });
                dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item : item}});
                setSavedOffline(true);
            }
        }
        catch(error) {
            log('saveCar failed');
            await Storage.set({
                key: String(item._id),
                value: JSON.stringify(item)
            })
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item : item}});
        }
    }

    function ws() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
          closeWebSocket = createWebSocket(token, message => {
            if (canceled) {
              return;
            }
            const { type, payload: item } = message;
            log(`ws message, item ${type}`);
            if (type === 'created' || type === 'updated') {
              dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { item } });
            }
          });
        }
        return () => {
          log('wsEffect - disconnecting');
          canceled = true;
          closeWebSocket?.();
        }
    }
}
