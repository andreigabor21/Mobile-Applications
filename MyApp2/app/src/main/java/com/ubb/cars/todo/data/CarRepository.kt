package com.ubb.cars.todo.data

import android.util.Log
import com.ubb.cars.core.TAG
import com.ubb.cars.core.Result
import com.ubb.cars.todo.data.remote.CarApi

object CarRepository {
    private var cachedCars: MutableList<Car>? = null;

    suspend fun loadAll(): Result<List<Car>> {
        if (cachedCars != null) {
            Log.v(TAG, "loadAll - return cached cars")
            return Result.Success(cachedCars as List<Car>);
        }
        try {
            Log.v(TAG, "loadAll - started")
            val cars = CarApi.service.find()
            Log.v(TAG, "loadAll - succeeded")
            cachedCars = mutableListOf()
            cachedCars?.addAll(cars)
            return Result.Success(cachedCars as List<Car>)
        } catch (e: Exception) {
            Log.w(TAG, "loadAll - failed", e)
            return Result.Error(e)
        }
    }

    suspend fun load(carId: String): Result<Car> {
        val car = cachedCars?.find { it._id == carId }
        if (car != null) {
            Log.v(TAG, "load - return cached car")
            return Result.Success(car)
        }
        try {
            Log.v(TAG, "load - started")
            val carRead = CarApi.service.read(carId)
            Log.v(TAG, "load - succeeded")
            return Result.Success(carRead)
        } catch (e: Exception) {
            Log.w(TAG, "load - failed", e)
            return Result.Error(e)
        }
    }

    suspend fun save(car: Car): Result<Car> {
        try {
            Log.v(TAG, "save - started")
            val createdCar = CarApi.service.create(car)
            Log.v(TAG, "save - succeeded")
            cachedCars?.add(createdCar)
            return Result.Success(createdCar)
        } catch (e: Exception) {
            Log.w(TAG, "save - failed", e)
            return Result.Error(e)
        }
    }

    suspend fun update(car: Car): Result<Car> {
        try {
            Log.v(TAG, "update - started")
            val updatedCar = CarApi.service.update(car._id, car)
            val index = cachedCars?.indexOfFirst { it._id == car._id }
            if (index != null) {
                cachedCars?.set(index, updatedCar)
            }
            Log.v(TAG, "update - succeeded")
            return Result.Success(updatedCar)
        } catch (e: Exception) {
            Log.v(TAG, "update - failed")
            return Result.Error(e)
        }
    }
}