import axios from 'axios';
import { getLogger } from '../core';
import { CarProps } from './CarProps';

const log = getLogger('itemApi');

const baseUrl = 'localhost:3000';
const carUrl = `http://${baseUrl}/car`;

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  log(`${fnName} - started`);
  return promise
    .then(res => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getItems: () => Promise<CarProps[]> = () => {
  return withLogs(axios.get(carUrl, config), 'getCars');
}

export const createCar: (item: CarProps) => Promise<CarProps[]> = item => {
  return withLogs(axios.post(carUrl, item, config), 'createItem');
}

export const updateCar: (item: CarProps) => Promise<CarProps[]> = meal => {
  return withLogs(axios.put(`${carUrl}/${meal.id}`, meal, config), 'updateCar');
}

interface MessageData {
  event: string;
  payload: {
    car: CarProps;
  };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`)
  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
