import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { CarProps } from './CarProps';
import {createCar, getItems, newWebSocket, updateCar} from './itemApi';

const log = getLogger('ItemProvider');

type SaveItemFn = (car: CarProps) => Promise<any>;

export interface CarsState {
  cars?: CarProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveItem?: SaveItemFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: CarsState = {
  fetching: false,
  saving: false,
};

const FETCH_CARS_STARTED = 'FETCH_CARS_STARTED';
const FETCH_CARS_SUCCEEDED = 'FETCH_CARS_SUCCEEDED';
const FETCH_CARS_FAILED = 'FETCH_CARS_FAILED';
const SAVE_CAR_STARTED = 'SAVE_CAR_STARTED';
const SAVE_CAR_SUCCEEDED = 'SAVE_CAR_SUCCEEDED';
const SAVE_CAR_FAILED = 'SAVE_CAR_FAILED';

const reducer: (state: CarsState, action: ActionProps) => CarsState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_CARS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_CARS_SUCCEEDED:
        return { ...state, cars: payload.cars, fetching: false };
      case FETCH_CARS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_CAR_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_CAR_SUCCEEDED:
        const cars = [...(state.cars || [])];
        const car = payload.car;
        const index = cars.findIndex(it => it.id === car.id);
        if (index === -1) {
          cars.splice(0, 0, car);
        } else {
          cars[index] = car;
        }
        return { ...state, cars: cars, saving: false };
      case SAVE_CAR_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const CarContext = React.createContext<CarsState>(initialState);

interface CarProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const CarProvider: React.FC<CarProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { cars, fetching, fetchingError, saving, savingError } = state;
  useEffect(getCarsEffect, []);
  useEffect(wsEffect, []);
  const saveCar = useCallback<SaveItemFn>(saveCarCallback, []);
  const value = { cars, fetching, fetchingError, saving, savingError, saveCar: saveCar };
  log('returns');
  return (
    <CarContext.Provider value={value}>
      {children}
    </CarContext.Provider>
  );

  function getCarsEffect() {
    let canceled = false;
    fetchCars();
    return () => {
      canceled = true;
    }

    async function fetchCars() {
      try {
        log('fetchItems started');
        dispatch({ type: FETCH_CARS_STARTED });
        const cars = await getItems();
        log('fetchItems succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_CARS_SUCCEEDED, payload: { cars: cars } });
        }
      } catch (error) {
        log('fetchItems failed');
        dispatch({ type: FETCH_CARS_FAILED, payload: { error } });
      }
    }
  }

  async function saveCarCallback(car: CarProps) {
    try {
      log('saveItem started');
      dispatch({ type: SAVE_CAR_STARTED });
      console.log(car.id);
      const savedCar = await (car.id ? updateCar(car) : createCar(car));
      log('saveItem succeeded');
      dispatch({ type: SAVE_CAR_SUCCEEDED, payload: { car: savedCar } });
    } catch (error) {
      dispatch({ type: SAVE_CAR_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    const closeWebSocket = newWebSocket(message => {
      if (canceled) {
        return;
      }
      const { event, payload: { car }} = message;
      // log(ws message, stock ${event});
      if (event === 'created' || event === 'updated') {
        dispatch({ type: SAVE_CAR_SUCCEEDED, payload: { car: car } });
      }
    });
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    }
  }
}
