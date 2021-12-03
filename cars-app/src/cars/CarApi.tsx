import axios from 'axios';
import { authConfig, getLogger, withLogs } from '../core';
import { CarProps } from './CarProps';
import { Plugins} from '@capacitor/core';

const log = getLogger('itemApi');
const { Storage } = Plugins;

const url = 'localhost:3000';
const baseUrl = `http://${url}/api/car`;


interface MessageData {
  type: string;
  payload: CarProps;
}

const different = (car1: any, car2: any) => {
    if (car1.model === car2.model && car1.price === car2.price && car1.available === car2.available)
      return false;
    return true;
}

export const syncData: (token: string) => Promise<CarProps[]> = async token => {
  try {
    const { keys } = await Storage.keys();
    var result = axios.get(`${baseUrl}`, authConfig(token));
    result.then(async result => {
      keys.forEach(async i => {
        if (i !== 'token') {
          const carOnServer = result.data.find((each: { _id: string; }) => each._id === i);
          const carLocal = await Storage.get({key: i});

          // alert('CAR ON SERVER: ' + JSON.stringify(carOnServer));
          // alert('CAR LOCALLY: ' + carLocal.value!);

          if (carOnServer !== undefined && different(carOnServer, JSON.parse(carLocal.value!))) {  // actualizare
            // alert('UPDATE ' + carLocal.value);
            axios.put(`${baseUrl}/${i}`, JSON.parse(carLocal.value!), authConfig(token));
          } else if (carOnServer === undefined){  // creare
            // alert('CREATE' + carLocal.value!);
            axios.post(`${baseUrl}`, JSON.parse(carLocal.value!), authConfig(token));
          }
        }
        })
    }).catch(err => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        console.log('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
  })
    return withLogs(result, 'syncCars');
  } catch (error) {
    throw error;
  }    
}

export const getCars: (token: string) => Promise<CarProps[]> = token => {  
  try {
    var result = axios.get(`${baseUrl}`, authConfig(token));
    result.then(async result => {
      for (const each of result.data) {
          await Storage.set({
            key: each._id!,
            value: JSON.stringify({
              _id: each._id,
              model: each.model,
              price: each.price,
              available: each.available
            })
          });
      }
    }).catch(err => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        console.log('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
  })
    return withLogs(result, 'getCars');
  } catch (error) {
    throw error;
  }    
}

export const createCar: (token: string, car: CarProps) => Promise<CarProps[]> = (token, car) => {
    //return withLogs(axios.post(`${baseUrl}/car`, car, authConfig(token)), 'createCar');
    var result = axios.post(`${baseUrl}`, car, authConfig(token));
    result.then(async result => {
      var one = result.data;
      await Storage.set({
        key: one._id!,
        value: JSON.stringify({
          _id: one._id,
          model: one.model,
          price: one.price,
          available: one.available
          })
      });
    }).catch(err => {
      if (err.response) {
        console.log('client received an error response (5xx, 4xx)');
      } else if (err.request) {
        alert('client never received a response, or request never left');
      } else {
        console.log('anything else');
      }
  });
    return withLogs(result, 'createCar');
}

export const editCar: (token: string, car: CarProps) => Promise<CarProps[]> = (token, car) => {
    //return withLogs(axios.put(`${baseUrl}/car/${car._id}`, car, authConfig(token)), 'updateCar');
    var result = axios.put(`${baseUrl}/car/${car._id}`, car, authConfig(token));
    result.then(async result => {
      var one = result.data;
      await Storage.set({
        key: one._id!,
        value: JSON.stringify({
          _id: one._id,
          model: one.model,
          price: one.price,
          available: one.available
          })
      }).catch(err => {
        if (err.response) {
          alert('client received an error response (5xx, 4xx)');
        } else if (err.request) {
          alert('client never received a response, or request never left');
        } else {
          alert('anything else');
        }
    })
    });
    return withLogs(result, 'updateCar');
}

export const createWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${url}`);
    ws.onopen = () => {
      log('web socket onopen');
      ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = function (event) {
      console.log(event);
      log('web socket onclose');
    };
    ws.onerror = error => {
      log('web socket onerror', error);
      ws.close();
    };
    ws.onmessage = messageEvent => {
      log('web socket onmessage');
      onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
      ws.close();
    }
  }